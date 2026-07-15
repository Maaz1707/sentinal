/**
 * Pasquill-Gifford Gaussian plume dispersion model.
 *
 * Ground-level concentration downwind of a continuous elevated release:
 *
 *   C(x,y,0;H) = Q / (π · σy(x) · σz(x) · u) · exp(-y² / 2σy²) · exp(-H² / 2σz²)
 *
 * where Q is the source term, u the wind speed, H the effective release
 * height, and σy/σz the horizontal/vertical dispersion coefficients (Briggs
 * 1973 rural approximations, keyed by Pasquill stability class A-F). This is
 * the standard short-range atmospheric dispersion model used throughout
 * emergency-planning literature — simplified here (flat terrain, steady
 * wind) for a real-time training simulation rather than a regulatory
 * consequence-assessment tool.
 */

import type { LatLng } from "../data/gis";
import type { PlumeContour, PlumeFrame, PlumeSimulationInput, StabilityClass } from "./types";
import { destinationPoint, toPlumeFrame } from "./geo";

/** Briggs (1973) rural dispersion coefficients: sigma = a*x / (1 + b*x)^c, x in meters. */
const BRIGGS_SIGMA_Y: Record<StabilityClass, { a: number; b: number }> = {
  A: { a: 0.22, b: 0.0001 },
  B: { a: 0.16, b: 0.0001 },
  C: { a: 0.11, b: 0.0001 },
  D: { a: 0.08, b: 0.0001 },
  E: { a: 0.06, b: 0.0001 },
  F: { a: 0.04, b: 0.0001 },
};
const BRIGGS_SIGMA_Z: Record<StabilityClass, { a: number; b: number; c: number }> = {
  A: { a: 0.2, b: 0, c: 1 },
  B: { a: 0.12, b: 0, c: 1 },
  C: { a: 0.08, b: 0.0002, c: -0.5 },
  D: { a: 0.06, b: 0.0015, c: -0.5 },
  E: { a: 0.03, b: 0.0003, c: -1 },
  F: { a: 0.016, b: 0.0003, c: -1 },
};

function sigmaY(stability: StabilityClass, xMeters: number): number {
  const { a, b } = BRIGGS_SIGMA_Y[stability];
  return (a * xMeters) / Math.sqrt(1 + b * xMeters);
}

function sigmaZ(stability: StabilityClass, xMeters: number): number {
  const { a, b, c } = BRIGGS_SIGMA_Z[stability];
  return a * xMeters * (1 + b * xMeters) ** c;
}

/** Ground-level (z=0) concentration at downwind/crosswind offset (x,y), relative units. */
export function groundConcentration(input: PlumeSimulationInput, xMeters: number, yMeters: number): number {
  if (xMeters <= 1) return 0;
  const sy = Math.max(sigmaY(input.stabilityClass, xMeters), 0.5);
  const sz = Math.max(sigmaZ(input.stabilityClass, xMeters), 0.5);
  const u = Math.max(input.windSpeedMs, 0.5);

  const crosswind = Math.exp(-(yMeters ** 2) / (2 * sy ** 2));
  const vertical = Math.exp(-(input.releaseHeightM ** 2) / (2 * sz ** 2));
  const travelTimeS = xMeters / u;
  const decay = Math.exp(-input.decayConstantPerS * travelTimeS);

  const base = (input.sourceTermBqS * input.terrainFactor) / (Math.PI * sy * sz * u);
  return base * crosswind * vertical * decay;
}

/** Concentration at an arbitrary lat/lng, projecting into the plume's downwind frame. */
export function concentrationAtPoint(input: PlumeSimulationInput, source: LatLng, target: LatLng): number {
  const { x, y } = toPlumeFrame(source, target, input.windDirectionDeg);
  if (x <= 0) return 0; // upwind of the source — outside the plume
  return groundConcentration(input, x, y);
}

const CONTOUR_LEVELS: { level: PlumeContour["level"]; fraction: number }[] = [
  { level: "high", fraction: 0.35 },
  { level: "medium", fraction: 0.12 },
  { level: "low", fraction: 0.03 },
];

const DOWNWIND_STATIONS = 24;

function maxDownwindRangeMeters(input: PlumeSimulationInput): number {
  // Faster wind and more unstable classes carry the plume further before it
  // dilutes below the "low" contour threshold; scaled empirically for the map.
  const stabilityReach: Record<StabilityClass, number> = { A: 0.7, B: 0.85, C: 1, D: 1.2, E: 1.5, F: 1.9 };
  return Math.min(40_000, 4_000 + input.windSpeedMs * 1400 * stabilityReach[input.stabilityClass]);
}

/**
 * Builds the three concentration-band contour polygons (high/medium/low) as
 * a symmetric "fan" around the plume centerline: at each downwind station we
 * solve the Gaussian crosswind profile for the half-width where concentration
 * falls to a fixed fraction of the plume's peak, then rotate/translate that
 * shape onto the map using the current wind bearing.
 */
export function generatePlumeFrame(input: PlumeSimulationInput, source: LatLng): PlumeFrame {
  const maxRange = maxDownwindRangeMeters(input);
  const stations: number[] = [];
  for (let i = 1; i <= DOWNWIND_STATIONS; i++) {
    stations.push((i / DOWNWIND_STATIONS) * maxRange);
  }

  let peak = 0;
  const centerlineByStation = stations.map((x) => {
    const c = groundConcentration(input, x, 0);
    peak = Math.max(peak, c);
    return c;
  });
  if (peak <= 0) {
    return { timestamp: input.startTime, contours: [], peakConcentrationRel: 0 };
  }

  const contours: PlumeContour[] = CONTOUR_LEVELS.map(({ level, fraction }) => {
    const threshold = peak * fraction;
    const left: LatLng[] = [];
    const right: LatLng[] = [];

    stations.forEach((x, i) => {
      const centerline = centerlineByStation[i];
      if (centerline <= threshold) return; // plume has diluted below this band already
      const sy = Math.max(sigmaY(input.stabilityClass, x), 0.5);
      const halfWidth = sy * Math.sqrt(2 * Math.log(centerline / threshold));

      const centerPoint = destinationPoint(source, x, input.windDirectionDeg);
      const perpBearing = (input.windDirectionDeg + 90) % 360;
      left.push(destinationPoint(centerPoint, halfWidth, perpBearing));
      right.push(destinationPoint(centerPoint, halfWidth, (perpBearing + 180) % 360));
    });

    if (left.length < 2) return { level, polygon: [] };
    const polygon = [source, ...left, ...right.reverse()];
    return { level, polygon };
  }).filter((c) => c.polygon.length >= 3);

  return { timestamp: input.startTime, contours, peakConcentrationRel: peak };
}

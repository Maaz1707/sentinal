import { classificationRank } from "./classificationEngine";
import type { ClassificationState, PlantState, TrustState } from "./types";

/** Fixed division seed with a proximity bias — Rajshahi (nearest the plant) swings hardest. */
const REGION_SEED: { id: string; name: string; bias: number }[] = [
  { id: "d1", name: "Rajshahi", bias: -6 },
  { id: "d2", name: "Rangpur", bias: 4 },
  { id: "d3", name: "Khulna", bias: -2 },
  { id: "d4", name: "Dhaka", bias: -8 },
  { id: "d5", name: "Barishal", bias: 3 },
  { id: "d6", name: "Mymensingh", bias: 1 },
];

const HISTORY_LENGTH = 60;
/** Exponential-smoothing rate — trust drifts toward its target rather than jumping. */
const SMOOTHING = 0.08;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function sentimentFromTrust(trust: number): "positive" | "neutral" | "negative" {
  if (trust >= 75) return "positive";
  if (trust >= 55) return "neutral";
  return "negative";
}

export interface TrustInputs {
  classification: ClassificationState;
  plant: PlantState;
  sensorFaultActive: boolean;
  hasAlertedSinceDeclaration: boolean;
  /** Seconds between classification declaration and the first alert dispatched for it. */
  responseLagSec: number;
}

export interface TrustFactorBreakdown {
  plantStatusScore: number;
  severityScore: number;
  transparencyScore: number;
  responseSpeedScore: number;
  alertAccuracyScore: number;
}

export function computeTrustFactors(inputs: TrustInputs): TrustFactorBreakdown {
  const rank = classificationRank(inputs.classification.level);

  const plantStatusScore = clamp((inputs.plant.containmentIntegrityPct + inputs.plant.fuelConditionPct) / 2, 0, 100);
  const severityScore = clamp(100 - rank * 22, 10, 100);
  const transparencyScore = inputs.hasAlertedSinceDeclaration ? 90 : rank === 0 ? 100 : 30;
  const responseSpeedScore = rank === 0 ? 100 : clamp(100 - inputs.responseLagSec * 0.8, 10, 100);
  const alertAccuracyScore = inputs.sensorFaultActive ? 70 : 95;

  return { plantStatusScore, severityScore, transparencyScore, responseSpeedScore, alertAccuracyScore };
}

/**
 * Advances the national + regional Public Trust Index for one tick.
 * `stepTrust` is a pure smoothing function — the store owns `prev` and feeds
 * the result back in next tick, so trust moves gradually toward whatever the
 * five weighted factors currently justify rather than snapping.
 */
export function stepTrust(prev: TrustState, inputs: TrustInputs): TrustState {
  const factors = computeTrustFactors(inputs);
  const target = clamp(
    factors.plantStatusScore * 0.25 +
      factors.severityScore * 0.2 +
      factors.transparencyScore * 0.2 +
      factors.responseSpeedScore * 0.15 +
      factors.alertAccuracyScore * 0.2,
    5,
    98,
  );

  const national = prev.national + (target - prev.national) * SMOOTHING;
  const history = [...prev.history, national].slice(-HISTORY_LENGTH);

  const regions = REGION_SEED.map((seed) => {
    const regionTarget = clamp(target + seed.bias, 5, 98);
    const prevTrust = prev.regions.find((r) => r.id === seed.id)?.trust ?? regionTarget;
    const trust = prevTrust + (regionTarget - prevTrust) * SMOOTHING;
    return { id: seed.id, name: seed.name, trust: Math.round(trust), sentiment: sentimentFromTrust(trust) };
  });

  const rank = classificationRank(inputs.classification.level);
  const misinformationClusters = Math.round(clamp(rank * 0.9 + (inputs.sensorFaultActive ? 1 : 0), 0, 9));

  return { national: Math.round(national), history, regions, misinformationClusters };
}

export const INITIAL_TRUST: TrustState = {
  national: 82,
  history: Array.from({ length: HISTORY_LENGTH }, () => 82),
  regions: REGION_SEED.map((seed) => ({
    id: seed.id,
    name: seed.name,
    trust: clamp(82 + seed.bias, 5, 98),
    sentiment: sentimentFromTrust(clamp(82 + seed.bias, 5, 98)),
  })),
  misinformationClusters: 0,
};

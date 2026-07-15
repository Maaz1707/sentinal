import { ROOPPUR_NPP, type PopulationCenter } from "../data/gis";
import { bearingDeg, haversineMeters } from "./geo";
import { concentrationAtPoint } from "./gaussianPlume";
import { DOSE_CONVERSION_FACTOR_MSV_PER_REL_HOUR, DOSE_PROJECTION_HOURS, DOSE_STATUS_THRESHOLDS, SHELTERING_ATTENUATION } from "./constants";
import type { DoseResult, PlumeSimulationInput, ProtectiveActionStatus } from "./types";

export function statusFromDose(projectedDoseMSv: number): ProtectiveActionStatus {
  if (projectedDoseMSv >= DOSE_STATUS_THRESHOLDS.criticalMSv) return "critical";
  if (projectedDoseMSv >= DOSE_STATUS_THRESHOLDS.evacuateMSv) return "evacuate";
  if (projectedDoseMSv >= DOSE_STATUS_THRESHOLDS.shelterMSv) return "shelter";
  if (projectedDoseMSv >= DOSE_STATUS_THRESHOLDS.monitorMSv) return "monitor";
  return "safe";
}

/**
 * Projected dose for a single population center. `isSheltering` reflects
 * whether a Shelter recommendation for this center was *approved* as of the
 * previous tick — a one-tick feedback lag that keeps the dose→decision→dose
 * loop acyclic while still letting protective actions measurably reduce
 * projected dose (see store.ts tick order).
 */
export function computeDose(
  center: PopulationCenter,
  plumeInput: PlumeSimulationInput | null,
  isSheltering: boolean,
): DoseResult {
  const distanceKm = haversineMeters(ROOPPUR_NPP.position, center.position) / 1000;
  const bearing = bearingDeg(ROOPPUR_NPP.position, center.position);

  const concentrationRel =
    plumeInput && plumeInput.sourceTermBqS > 0
      ? concentrationAtPoint(plumeInput, ROOPPUR_NPP.position, center.position)
      : 0;

  const integratedDoseMSv = concentrationRel * DOSE_CONVERSION_FACTOR_MSV_PER_REL_HOUR * DOSE_PROJECTION_HOURS;
  const effectiveDoseMSv = integratedDoseMSv * (isSheltering ? SHELTERING_ATTENUATION : 1);
  const projectedDoseMSv = effectiveDoseMSv;

  return {
    centerId: center.id,
    distanceKm,
    bearingDeg: bearing,
    concentrationRel,
    groundConcentrationRel: concentrationRel,
    integratedDoseMSv,
    effectiveDoseMSv,
    projectedDoseMSv,
    status: statusFromDose(projectedDoseMSv),
  };
}

export function computeDoseForAllCenters(
  centers: PopulationCenter[],
  plumeInput: PlumeSimulationInput | null,
  shelteringCenterIds: ReadonlySet<string>,
): Record<string, DoseResult> {
  const result: Record<string, DoseResult> = {};
  for (const center of centers) {
    result[center.id] = computeDose(center, plumeInput, shelteringCenterIds.has(center.id));
  }
  return result;
}

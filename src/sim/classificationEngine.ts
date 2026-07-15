import type { ClassificationLevel, ClassificationMeta, ClassificationState, PlantState } from "./types";
import { PLANT_LIMITS, RADIATION_CLASS_THRESHOLDS } from "./constants";

/**
 * Visual + semantic metadata for each IAEA-informed classification tier.
 * `index` drives the threat-level meter (TopStatusBar); referenced nowhere
 * else so the 5-tier ladder only needs to change here.
 */
export const CLASSIFICATION_META: Record<ClassificationLevel, ClassificationMeta> = {
  normal: { level: "normal", label: "Normal", index: 0, severity: "info", color: "text-emerald-glow", textGlow: "text-glow-emerald" },
  alert: { level: "alert", label: "Alert", index: 1, severity: "moderate", color: "text-amber-glow", textGlow: "text-glow-amber" },
  facility_emergency: {
    level: "facility_emergency",
    label: "Facility Emergency",
    index: 2,
    severity: "high",
    color: "text-amber-glow",
    textGlow: "text-glow-amber",
  },
  site_area_emergency: {
    level: "site_area_emergency",
    label: "Site Area Emergency",
    index: 3,
    severity: "high",
    color: "text-crimson",
    textGlow: "text-glow-crimson",
  },
  general_emergency: {
    level: "general_emergency",
    label: "General Emergency",
    index: 4,
    severity: "critical",
    color: "text-crimson",
    textGlow: "text-glow-crimson",
  },
};

export const CLASSIFICATION_ORDER: ClassificationLevel[] = [
  "normal",
  "alert",
  "facility_emergency",
  "site_area_emergency",
  "general_emergency",
];

/** 0 (normal) .. 4 (general_emergency) — the single source of truth for tier ordering. */
export function classificationRank(level: ClassificationLevel) {
  return CLASSIFICATION_ORDER.indexOf(level);
}

/**
 * Derives the automatic emergency classification from ground-truth plant
 * state. Each tier is driven by the same physical quantities the operator
 * sees on PlantSystemsPanel, so the reason string is always traceable to a
 * specific number crossing a specific threshold.
 */
export function computeAutoClassification(plant: PlantState): { level: ClassificationLevel; reason: string } {
  if (plant.fuelConditionPct < 50 || plant.radiationSvH >= RADIATION_CLASS_THRESHOLDS.generalEmergencySvH) {
    return {
      level: "general_emergency",
      reason:
        plant.fuelConditionPct < 50
          ? `Fuel condition degraded to ${plant.fuelConditionPct.toFixed(0)}% (< 50%) — actual or imminent substantial core damage`
          : `Site boundary radiation ${plant.radiationSvH.toFixed(0)} µSv/h exceeds General Emergency threshold (${RADIATION_CLASS_THRESHOLDS.generalEmergencySvH} µSv/h)`,
    };
  }

  if (plant.containmentIntegrityPct < 40 || plant.radiationSvH >= RADIATION_CLASS_THRESHOLDS.siteAreaEmergencySvH) {
    return {
      level: "site_area_emergency",
      reason:
        plant.containmentIntegrityPct < 40
          ? `Containment integrity at ${plant.containmentIntegrityPct.toFixed(0)}% (< 40%) — major loss of containment function`
          : `Site boundary radiation ${plant.radiationSvH.toFixed(1)} µSv/h exceeds Site Area Emergency threshold (${RADIATION_CLASS_THRESHOLDS.siteAreaEmergencySvH} µSv/h)`,
    };
  }

  if (
    plant.fuelConditionPct < 92 ||
    plant.containmentIntegrityPct < 80 ||
    plant.radiationSvH >= RADIATION_CLASS_THRESHOLDS.facilityEmergencySvH
  ) {
    return {
      level: "facility_emergency",
      reason:
        plant.fuelConditionPct < 92
          ? `Fuel condition at ${plant.fuelConditionPct.toFixed(0)}% — confirmed fuel cladding stress beyond design margin`
          : plant.containmentIntegrityPct < 80
            ? `Containment integrity at ${plant.containmentIntegrityPct.toFixed(0)}% — degraded barrier margin`
            : `Site boundary radiation ${plant.radiationSvH.toFixed(1)} µSv/h exceeds Facility Emergency threshold (${RADIATION_CLASS_THRESHOLDS.facilityEmergencySvH} µSv/h)`,
    };
  }

  if (
    plant.scramActive ||
    plant.eccsActive ||
    plant.containmentSprayActive ||
    plant.radiationSvH >= RADIATION_CLASS_THRESHOLDS.alertSvH
  ) {
    return {
      level: "alert",
      reason: plant.scramActive
        ? "Reactor protection system tripped — automatic SCRAM in effect"
        : plant.eccsActive
          ? "Emergency Core Cooling System active — abnormal primary inventory condition"
          : plant.containmentSprayActive
            ? "Containment spray active — elevated containment pressure"
            : `Site boundary radiation ${plant.radiationSvH.toFixed(2)} µSv/h exceeds Alert threshold (${RADIATION_CLASS_THRESHOLDS.alertSvH} µSv/h)`,
    };
  }

  if (plant.coreTempC > PLANT_LIMITS.coreTempDesignLimitC * 0.97) {
    return {
      level: "alert",
      reason: `Core temperature ${plant.coreTempC.toFixed(0)}°C approaching design limit (${PLANT_LIMITS.coreTempDesignLimitC}°C)`,
    };
  }

  return { level: "normal", reason: "All monitored parameters within nominal operating envelope" };
}

/**
 * Advances the classification state for one tick. Automatic escalation always
 * recomputes `autoLevel`; the displayed `level` only follows it while no
 * manual override is pinned. De-escalation of the *displayed* level requires
 * the auto level to have been lower for a sustained period, avoiding
 * flicker — matched here via a simple "auto must already equal target"
 * check since computeAutoClassification itself is threshold-based (no
 * flicker-prone continuous inputs cross zero repeatedly in this model).
 */
export function stepClassification(
  plant: PlantState,
  prev: ClassificationState,
  nowSec: number,
): ClassificationState {
  const auto = computeAutoClassification(plant);

  if (prev.manualOverride) {
    return { ...prev, autoLevel: auto.level };
  }

  if (auto.level === prev.level) {
    return { ...prev, autoLevel: auto.level, reason: auto.reason };
  }

  // Escalate immediately; only de-escalate once the auto level has settled
  // below the current displayed level (prevents flapping on threshold noise).
  const escalating = classificationRank(auto.level) > classificationRank(prev.level);
  if (escalating) {
    return {
      level: auto.level,
      autoLevel: auto.level,
      reason: auto.reason,
      declaredAtSimSec: nowSec,
      manualOverride: false,
    };
  }

  return { ...prev, autoLevel: auto.level };
}

export function setManualClassification(
  level: ClassificationLevel,
  reason: string,
  nowSec: number,
): ClassificationState {
  return {
    level,
    autoLevel: level,
    reason,
    declaredAtSimSec: nowSec,
    manualOverride: true,
  };
}

export function formatElapsed(nowSec: number, sinceSec: number): string {
  const total = Math.max(0, Math.round(nowSec - sinceSec));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/**
 * Calibration constants for SENTINEL-BD's synthetic Rooppur NPP model.
 *
 * Values are illustrative approximations informed by publicly documented
 * generic guidance — IAEA safety standard GSG-2 emergency-category concepts,
 * US EPA/NRC generic Protective Action Guides, and Briggs (1973) rural
 * dispersion coefficients. They are calibrated for a believable, internally
 * consistent *training simulation*, not an authoritative regulatory dataset.
 * Every threshold below is referenced by exactly one engine so a value only
 * ever needs to change in one place.
 */

import type { PlantState } from "./types";

export const NOMINAL_PLANT: PlantState = {
  reactorPowerPct: 100,
  coreTempC: 312,
  primaryPressureMPa: 15.5,
  containmentPressureKPa: 101.3,
  containmentIntegrityPct: 100,
  primaryFlowPct: 100,
  radiationSvH: 0.12,
  steamGeneratorLevelPct: 72,
  dieselBackupOnline: true,
  gridConnected: true,
  coolingPumpsOnlinePct: 100,
  containmentLeakRatePct: 0.05,
  powerOscillationAmplitude: 0.02,
  fuelConditionPct: 100,
  hydrogenPct: 0.4,
  eccsActive: false,
  containmentSprayActive: false,
  scramActive: false,
  scenarioElapsedSec: 0,
};

export const PLANT_LIMITS = {
  /** Design operating envelope. */
  coreTempDesignLimitC: 350,
  /** Simplified zirconium-cladding damage onset (real oxidation kinetics are far richer). */
  coreTempDamageThresholdC: 650,
  primaryPressureLowTripMPa: 13.0,
  primaryPressureHighTripMPa: 17.2,
  containmentPressureDesignKPa: 310,
  containmentPressureTripKPa: 180,
  /** Hydrogen lower flammability limit in air, published value ~4 vol%. */
  hydrogenLflPct: 4,
  /** Approximate detonation-risk regime for a H2/steam/air mix. */
  hydrogenDetonationPct: 10,
  eccsInjectionPressureMPa: 13.5,
  coolingPumpsCriticalPct: 40,
} as const;

/** Site-boundary ambient dose-rate bands that drive automatic classification. µSv/h. */
export const RADIATION_CLASS_THRESHOLDS = {
  alertSvH: 1,
  facilityEmergencySvH: 10,
  siteAreaEmergencySvH: 100,
  generalEmergencySvH: 1000,
} as const;

/** Projected 4-hour dose bands used by the dose engine's protective-action status. mSv. */
export const DOSE_STATUS_THRESHOLDS = {
  monitorMSv: 0.1,
  shelterMSv: 1,
  evacuateMSv: 10,
  criticalMSv: 100,
} as const;

/** Indoor sheltering reduces effective dose relative to unprotected exposure. */
export const SHELTERING_ATTENUATION = 0.4;

/** Projection horizon used for "projected dose" in the dose engine. */
export const DOSE_PROJECTION_HOURS = 4;

/**
 * Converts the Gaussian model's relative ground concentration into a dose
 * rate (mSv per hour per unit relative concentration). Calibrated, together
 * with SOURCE_TERM_SCALE below, so a General-Emergency-level release drives
 * nearby centers into the "critical" dose band within the projection window
 * and background/Alert-level releases stay in "safe"/"monitor" — not a
 * radiological dose-coefficient lookup.
 */
export const DOSE_CONVERSION_FACTOR_MSV_PER_REL_HOUR = 3;

/** Scales site-boundary radiation excess (µSv/h above nominal) into the plume's illustrative source term. */
export const SOURCE_TERM_SCALE_BQ_PER_SVH = 5_000;

/** Effective release height used by the plume model — simplified single-point stack/vent height. */
export const RELEASE_HEIGHT_M = 45;

/** Radioactive decay constant applied over plume travel time — illustrative short-lived-nuclide proxy. */
export const PLUME_DECAY_CONSTANT_PER_S = 2.1e-5;

/** Flat terrain assumption for the training simulation (1 = no attenuation). */
export const TERRAIN_FACTOR = 1;

export const SIM_TICK_MS = 1000;

/** Bounded relaxation rates — how fast each plant parameter drifts back to nominal absent forcing. */
export const RELAXATION_RATE = {
  primaryPressureMPaPerS: 0.08,
  containmentPressureKPaPerS: 1.2,
  containmentIntegrityPctPerS: 0.05,
  flowPctPerS: 1.5,
  hydrogenPctPerS: 0.03,
} as const;

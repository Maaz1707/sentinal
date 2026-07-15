import type { Severity } from "../types";
import type { LatLng } from "../data/gis";

// ---------------------------------------------------------------------------
// Plant physics
// ---------------------------------------------------------------------------

export type SensorFaultKind = "stuck" | "noisy" | "offline";

export type PlantSensorKey =
  | "coreTempC"
  | "primaryPressureMPa"
  | "containmentPressureKPa"
  | "radiationSvH"
  | "steamGeneratorLevelPct"
  | "primaryFlowPct";

/** Ground-truth physical state of the plant. Advanced once per tick by plantEngine. */
export interface PlantState {
  reactorPowerPct: number;
  coreTempC: number;
  primaryPressureMPa: number;
  containmentPressureKPa: number;
  containmentIntegrityPct: number;
  primaryFlowPct: number;
  radiationSvH: number;
  steamGeneratorLevelPct: number;
  dieselBackupOnline: boolean;
  gridConnected: boolean;
  coolingPumpsOnlinePct: number;
  containmentLeakRatePct: number;
  powerOscillationAmplitude: number;
  fuelConditionPct: number;
  hydrogenPct: number;
  eccsActive: boolean;
  containmentSprayActive: boolean;
  scramActive: boolean;
  /** Seconds since the current scenario forcing (if any) was applied. */
  scenarioElapsedSec: number;
}

export type ScenarioId =
  | "loss_of_coolant"
  | "steam_line_break"
  | "power_loss"
  | "cooling_pump_failure"
  | "hydrogen_buildup"
  | "sensor_failure";

export type ScenarioTriggerMode = "manual" | "automatic";

export interface ActiveScenario {
  id: ScenarioId;
  triggeredBy: ScenarioTriggerMode;
  startedAtSimSec: number;
}

/** Perturbation a running scenario applies on top of nominal plant physics. */
export interface PlantForcing {
  primaryPressureLossRateMPaPerS?: number;
  flowLossRateFractionPerS?: number;
  extraLeakRatePct?: number;
  gridConnectedOverride?: boolean;
  dieselBackupOverride?: boolean;
  coolingPumpsOnlinePctOverride?: number;
  steamGeneratorDrainRatePctPerS?: number;
  hydrogenGenerationRatePctPerS?: number;
  sensorFaults?: Partial<Record<PlantSensorKey, SensorFaultKind>>;
}

// ---------------------------------------------------------------------------
// Weather / dispersion
// ---------------------------------------------------------------------------

export type StabilityClass = "A" | "B" | "C" | "D" | "E" | "F";

export interface WeatherState {
  windDirectionDeg: number;
  windSpeedMs: number;
  stabilityClass: StabilityClass;
}

// ---------------------------------------------------------------------------
// Gaussian plume dispersion
// ---------------------------------------------------------------------------

export interface PlumeSimulationInput {
  windDirectionDeg: number;
  windSpeedMs: number;
  stabilityClass: StabilityClass;
  /** Effective release height above grade, meters (stack height + plume rise). */
  releaseHeightM: number;
  /** Relative source strength — illustrative Bq/s-equivalent, not a certified term. */
  sourceTermBqS: number;
  /** Radioactive decay constant (1/s) applied over plume travel time. */
  decayConstantPerS: number;
  /** Terrain/surface-roughness attenuation multiplier, 0-1 (1 = flat, unobstructed). */
  terrainFactor: number;
  startTime: number;
}

export type PlumeConcentrationLevel = "high" | "medium" | "low";

export interface PlumeContour {
  level: PlumeConcentrationLevel;
  /** Polygon ring, WGS84 lat/lng, matching the map's coordinate system. */
  polygon: LatLng[];
}

export interface PlumeFrame {
  timestamp: number;
  contours: PlumeContour[];
  /** Peak ground-level concentration anywhere in the plume, relative units. */
  peakConcentrationRel: number;
}

export interface PlumeSimulationState {
  active: boolean;
  frame: PlumeFrame | null;
  input: PlumeSimulationInput | null;
}

// ---------------------------------------------------------------------------
// IAEA emergency classification
// ---------------------------------------------------------------------------

export type ClassificationLevel =
  | "normal"
  | "alert"
  | "facility_emergency"
  | "site_area_emergency"
  | "general_emergency";

export interface ClassificationMeta {
  level: ClassificationLevel;
  label: string;
  index: number; // 0-4, drives the threat-level meter
  severity: Severity;
  color: string;
  textGlow: string;
}

export interface ClassificationState {
  level: ClassificationLevel;
  /** What the automatic system currently computes — shown even when overridden. */
  autoLevel: ClassificationLevel;
  reason: string;
  declaredAtSimSec: number;
  manualOverride: boolean;
}

// ---------------------------------------------------------------------------
// Dose engine
// ---------------------------------------------------------------------------

export type ProtectiveActionStatus = "safe" | "monitor" | "shelter" | "evacuate" | "critical";

export interface DoseResult {
  centerId: string;
  distanceKm: number;
  bearingDeg: number;
  concentrationRel: number;
  groundConcentrationRel: number;
  integratedDoseMSv: number;
  effectiveDoseMSv: number;
  projectedDoseMSv: number;
  status: ProtectiveActionStatus;
}

// ---------------------------------------------------------------------------
// Decision engine
// ---------------------------------------------------------------------------

export type RecommendationAction =
  | "shelter"
  | "evacuate"
  | "ki_distribution"
  | "food_restriction"
  | "road_closure"
  | "airspace_restriction"
  | "medical_response"
  | "international_notification";

export type RecommendationStatus = "pending" | "approved" | "overridden";

export interface RecommendationThreshold {
  label: string;
  value: number;
  unit: string;
}

export interface Recommendation {
  id: string;
  action: RecommendationAction;
  title: string;
  description: string;
  reason: string;
  threshold: RecommendationThreshold;
  currentValue: number;
  guideline: string;
  confidence: number;
  priority: number;
  impact: string;
  status: RecommendationStatus;
  triggeredAtSimSec: number;
}

// ---------------------------------------------------------------------------
// Route engine
// ---------------------------------------------------------------------------

export interface RouteGraphNode {
  id: string;
  name: string;
  position: [number, number];
}

export interface RouteGraphEdge {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  baseCapacityVehiclesPerHour: number;
  kind: "highway" | "road";
}

// ---------------------------------------------------------------------------
// Trust engine
// ---------------------------------------------------------------------------

export interface TrustState {
  national: number;
  history: number[];
  regions: { id: string; name: string; trust: number; sentiment: "positive" | "neutral" | "negative" }[];
  misinformationClusters: number;
}

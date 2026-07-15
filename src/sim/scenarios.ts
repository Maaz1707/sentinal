import type { PlantForcing, PlantState, ScenarioId } from "./types";

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  description: string;
  icon: string;
  /** Forcing applied to plantEngine.stepPlant while this scenario is active. */
  forcing(elapsedSec: number): PlantForcing;
}

/** Ramps a value in from 0 over `rampSec`, then holds steady. */
function ramp(elapsedSec: number, target: number, rampSec: number) {
  return target * Math.min(1, elapsedSec / rampSec);
}

export const SCENARIOS: Record<ScenarioId, ScenarioDefinition> = {
  loss_of_coolant: {
    id: "loss_of_coolant",
    label: "Loss of Coolant Accident",
    description: "Primary loop breach — rapid depressurization and inventory loss into containment.",
    icon: "Droplets",
    forcing: (t) => ({
      primaryPressureLossRateMPaPerS: ramp(t, 0.09, 20),
      flowLossRateFractionPerS: ramp(t, 0.02, 20),
      extraLeakRatePct: ramp(t, 3.5, 40),
    }),
  },
  steam_line_break: {
    id: "steam_line_break",
    label: "Steam Line Break",
    description: "Secondary-side steam line rupture — uncontrolled cooldown and steam generator drain.",
    icon: "Wind",
    forcing: (t) => ({
      steamGeneratorDrainRatePctPerS: ramp(t, 0.55, 15),
      extraLeakRatePct: ramp(t, 0.6, 30),
    }),
  },
  power_loss: {
    id: "power_loss",
    label: "Loss of Offsite Power",
    description: "Grid connection lost — plant falls back to emergency diesel generators.",
    icon: "Zap",
    forcing: () => ({
      gridConnectedOverride: false,
    }),
  },
  cooling_pump_failure: {
    id: "cooling_pump_failure",
    label: "Cooling Pump Failure",
    description: "Multiple primary coolant pumps trip off — forced circulation degrades sharply.",
    icon: "RefreshCcw",
    forcing: () => ({
      coolingPumpsOnlinePctOverride: 22,
    }),
  },
  hydrogen_buildup: {
    id: "hydrogen_buildup",
    label: "Hydrogen Build-up",
    description: "Elevated hydrogen generation in containment atmosphere — deflagration risk rising.",
    icon: "Flame",
    forcing: (t) => ({
      hydrogenGenerationRatePctPerS: ramp(t, 0.05, 25),
    }),
  },
  sensor_failure: {
    id: "sensor_failure",
    label: "Sensor Failure",
    description: "Radiation monitoring channel degraded — readings frozen pending redundant-channel crosscheck.",
    icon: "Signal",
    forcing: () => ({
      sensorFaults: { radiationSvH: "stuck" },
    }),
  },
};

export const SCENARIO_LIST = Object.values(SCENARIOS);

/** Ground-truth plant snapshot used to seed sensor-fault "stuck" values on trigger. */
export function captureSensorFaultBaseline(state: PlantState) {
  return {
    coreTempC: state.coreTempC,
    primaryPressureMPa: state.primaryPressureMPa,
    containmentPressureKPa: state.containmentPressureKPa,
    radiationSvH: state.radiationSvH,
    steamGeneratorLevelPct: state.steamGeneratorLevelPct,
    primaryFlowPct: state.primaryFlowPct,
  };
}

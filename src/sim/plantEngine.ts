import type { PlantForcing, PlantState } from "./types";
import { NOMINAL_PLANT, PLANT_LIMITS, RELAXATION_RATE } from "./constants";

// Radiation level (µSv/h) that, on its own, is severe enough to justify an
// automatic SCRAM even absent a thermal/pressure excursion.
const RADIATION_SCRAM_TRIP_SVH = 50;

export interface PlantStepResult {
  state: PlantState;
  /** Human-readable notices for auto-system activations that happened this tick — feeds the timeline. */
  events: string[];
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** First-order lag toward a target: reaches ~63% of the gap every `tau` seconds. */
function relax(current: number, target: number, tau: number, dt: number) {
  const alpha = 1 - Math.exp(-dt / Math.max(tau, 0.001));
  return current + (target - current) * alpha;
}

/**
 * Advances the plant by `dt` seconds of simulated time, applying nominal
 * physics plus any active scenario `forcing`. Every output feeds at least one
 * other parameter — this is the causal chain the rest of the platform reads:
 *
 *   pumps/grid -> primary flow -> cooling effectiveness -> core temp
 *   core temp -> primary pressure -> containment pressure -> containment integrity
 *   fuel condition + containment integrity -> radiation release
 *   core temp overshoot -> fuel damage -> hydrogen generation
 *   pressure/temp/radiation thresholds -> automatic SCRAM / ECCS / spray
 */
export function stepPlant(
  state: PlantState,
  dt: number,
  forcing: PlantForcing,
  nowSec: number,
): PlantStepResult {
  const events: string[] = [];
  const next: PlantState = { ...state };

  // 1. Electrical supply -> pump availability -----------------------------
  const gridConnected = forcing.gridConnectedOverride ?? state.gridConnected;
  const dieselBackupOnline = forcing.dieselBackupOverride ?? state.dieselBackupOnline;
  next.gridConnected = gridConnected;
  next.dieselBackupOnline = dieselBackupOnline;

  let pumpTarget: number;
  if (forcing.coolingPumpsOnlinePctOverride !== undefined) {
    pumpTarget = forcing.coolingPumpsOnlinePctOverride;
  } else if (!gridConnected && !dieselBackupOnline) {
    pumpTarget = 5; // station blackout — only passive/trickle cooling
  } else if (!gridConnected && dieselBackupOnline) {
    pumpTarget = 85; // running on emergency diesel generators
  } else {
    pumpTarget = 100;
  }
  next.coolingPumpsOnlinePct = clamp(relax(state.coolingPumpsOnlinePct, pumpTarget, 6, dt), 0, 100);

  // 2. Pump availability + direct inventory loss -> primary loop flow -----
  const flowLossFraction = forcing.flowLossRateFractionPerS ?? 0;
  let flow = relax(state.primaryFlowPct, next.coolingPumpsOnlinePct, RELAXATION_RATE.flowPctPerS, dt);
  flow -= flow * flowLossFraction * dt;
  next.primaryFlowPct = clamp(flow, 0, 100);

  // 3. Cooling effectiveness (flow + ECCS injection + SG availability) -----
  const sgPenalty = state.steamGeneratorLevelPct < 30 ? (30 - state.steamGeneratorLevelPct) * 0.6 : 0;
  const coolingEffectivenessPct = clamp(
    next.primaryFlowPct + (state.eccsActive ? 25 : 0) - sgPenalty,
    2,
    130,
  );

  // 4. Reactor power (nominal, oscillating, or decay-heat curve post-SCRAM)
  const oscillationAmplitude = clamp(
    state.powerOscillationAmplitude + (state.scramActive ? -0.01 : 0.002) * dt,
    0.01,
    0.2,
  );
  next.powerOscillationAmplitude = oscillationAmplitude;

  let powerTarget: number;
  if (state.scramActive) {
    // Simplified decay-heat fraction — real decay heat is ~6-7% of rated power
    // at shutdown, falling roughly as a negative power law over time.
    const tSinceTrip = Math.max(1, state.scenarioElapsedSec);
    powerTarget = clamp(7 * (tSinceTrip / 10) ** -0.2, 1.5, 8);
  } else {
    powerTarget = 100;
  }
  const oscillation = Math.sin(nowSec * 0.15) * oscillationAmplitude * 100 * (state.scramActive ? 0.1 : 1);
  next.reactorPowerPct = clamp(relax(state.reactorPowerPct, powerTarget, 5, dt) + oscillation * dt * 0.1, 0, 112);

  // 5. Core temperature: scales with power, inversely with cooling --------
  const coolingRatio = Math.max(coolingEffectivenessPct / 100, 0.05);
  const targetCoreTemp = clamp(
    (NOMINAL_PLANT.coreTempC * next.reactorPowerPct) / 100 / coolingRatio,
    250,
    1200,
  );
  const tempTau = coolingRatio < 0.5 ? 10 : 22;
  next.coreTempC = relax(state.coreTempC, targetCoreTemp, tempTau, dt);

  // 6. Primary pressure: coupled to core temp, punched down by LOCA forcing
  const pressureTargetFromTemp = clamp(15.5 + (next.coreTempC - 312) * 0.02, 5, 19);
  let pressure = relax(state.primaryPressureMPa, pressureTargetFromTemp, RELAXATION_RATE.primaryPressureMPaPerS, dt);
  const pressureLossRate = forcing.primaryPressureLossRateMPaPerS ?? 0;
  pressure -= pressureLossRate * dt;
  if (state.eccsActive) pressure += 0.05 * dt; // makeup injection partially restores inventory
  next.primaryPressureMPa = clamp(pressure, 0, 20);

  // Automatic ECCS activation — ties pressure directly to an emergency system.
  next.eccsActive = state.eccsActive || next.primaryPressureMPa < PLANT_LIMITS.eccsInjectionPressureMPa;
  if (!state.eccsActive && next.eccsActive) {
    events.push("Emergency Core Cooling System auto-activated: primary pressure below injection setpoint");
  }

  // 7. Containment pressure: rises from released primary inventory --------
  const pressureDeficit = Math.max(0, 15.5 - next.primaryPressureMPa);
  const extraLeak = forcing.extraLeakRatePct ?? 0;
  next.containmentLeakRatePct = clamp(NOMINAL_PLANT.containmentLeakRatePct + extraLeak, 0, 100);
  const containmentTarget = clamp(101.3 + pressureDeficit * 35 + extraLeak * 8, 101.3, 500);
  let containmentPressure = relax(
    state.containmentPressureKPa,
    containmentTarget,
    RELAXATION_RATE.containmentPressureKPaPerS,
    dt,
  );
  if (state.containmentSprayActive) containmentPressure -= 4 * dt;
  next.containmentPressureKPa = clamp(containmentPressure, 100, 600);

  // Automatic containment spray activation.
  next.containmentSprayActive =
    state.containmentSprayActive || next.containmentPressureKPa > PLANT_LIMITS.containmentPressureTripKPa;
  if (!state.containmentSprayActive && next.containmentSprayActive) {
    events.push("Containment spray system auto-activated: containment pressure exceeded trip setpoint");
  }

  // 8. Containment integrity degrades under sustained overstress ----------
  const overstressFraction = clamp(
    (next.containmentPressureKPa - PLANT_LIMITS.containmentPressureTripKPa) /
      (PLANT_LIMITS.containmentPressureDesignKPa - PLANT_LIMITS.containmentPressureTripKPa),
    0,
    3,
  );
  let integrity = state.containmentIntegrityPct;
  if (overstressFraction > 0) {
    integrity -= overstressFraction * 1.4 * dt;
  } else {
    integrity += RELAXATION_RATE.containmentIntegrityPctPerS * dt * (state.containmentSprayActive ? 1.5 : 1);
  }
  next.containmentIntegrityPct = clamp(integrity, 0, 100);

  // 9. Fuel condition: irreversible damage once cladding threshold exceeded
  const tempOvershoot = Math.max(0, next.coreTempC - PLANT_LIMITS.coreTempDamageThresholdC);
  const fuelDegradeRate = tempOvershoot * 0.018 * (next.eccsActive ? 0.15 : 1);
  next.fuelConditionPct = clamp(state.fuelConditionPct - fuelDegradeRate * dt, 0, 100);

  // 10. Hydrogen generation: proxy for zirconium-steam reaction ------------
  const h2Gen = tempOvershoot * 0.01 + (forcing.hydrogenGenerationRatePctPerS ?? 0);
  const h2SprayDamping = next.containmentSprayActive ? 0.7 : 1;
  let hydrogen = state.hydrogenPct + h2Gen * h2SprayDamping * dt;
  if (h2Gen === 0 && hydrogen > NOMINAL_PLANT.hydrogenPct) {
    hydrogen -= RELAXATION_RATE.hydrogenPctPerS * dt;
  }
  next.hydrogenPct = clamp(hydrogen, 0, 30);

  // 11. Steam generator level ------------------------------------------------
  const sgDrain = forcing.steamGeneratorDrainRatePctPerS ?? 0;
  let sgLevel = relax(state.steamGeneratorLevelPct, NOMINAL_PLANT.steamGeneratorLevelPct, 20, dt);
  sgLevel -= sgDrain * dt;
  next.steamGeneratorLevelPct = clamp(sgLevel, 0, 100);

  // 12. Radiation release: fuel damage + containment pathway ----------------
  const sourceTerm = (100 - next.fuelConditionPct) / 100;
  const pathwayFactor = (100 - next.containmentIntegrityPct) / 100 + next.containmentLeakRatePct / 20;
  const radiationTarget =
    NOMINAL_PLANT.radiationSvH + sourceTerm * (1 + pathwayFactor * 25) * 60;
  next.radiationSvH = clamp(relax(state.radiationSvH, radiationTarget, 8, dt), 0.05, 5000);

  // 13. Automatic SCRAM — trips on temp, pressure, or radiation excursions --
  const shouldScram =
    state.scramActive ||
    next.coreTempC > PLANT_LIMITS.coreTempDesignLimitC ||
    next.primaryPressureMPa > PLANT_LIMITS.primaryPressureHighTripMPa ||
    next.primaryPressureMPa < PLANT_LIMITS.primaryPressureLowTripMPa ||
    next.radiationSvH > RADIATION_SCRAM_TRIP_SVH;
  if (!state.scramActive && shouldScram) {
    events.push("Automatic SCRAM initiated: reactor protection system tripped control rod insertion");
  }
  next.scramActive = shouldScram;

  next.scenarioElapsedSec = state.scenarioElapsedSec + dt;

  return { state: next, events };
}

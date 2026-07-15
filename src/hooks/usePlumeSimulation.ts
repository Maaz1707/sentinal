import { useMemo } from "react";
import { ROOPPUR_NPP } from "../data/gis";
import { generatePlumeFrame } from "../sim/gaussianPlume";
import type {
  PlumeConcentrationLevel,
  PlumeContour,
  PlumeFrame,
  PlumeSimulationInput,
  PlumeSimulationState,
  StabilityClass,
} from "../sim/types";

export type { StabilityClass, PlumeSimulationInput, PlumeConcentrationLevel, PlumeContour, PlumeFrame, PlumeSimulationState };

/**
 * Thin reactive wrapper around the Gaussian plume engine (`sim/gaussianPlume`).
 * The simulation store recomputes `PlumeSimulationInput` every tick from live
 * wind + source-term state; this hook just memoizes the (cheap but non-trivial)
 * contour generation so GisMap/PlumeLayer don't recompute on unrelated
 * re-renders. Passing `null` (no active release) yields an inert state —
 * this is also what every consumer sees before the store starts ticking.
 */
export function usePlumeSimulation(input: PlumeSimulationInput | null = null): PlumeSimulationState {
  return useMemo<PlumeSimulationState>(() => {
    if (!input || input.sourceTermBqS <= 0) {
      return { active: false, frame: null, input };
    }
    const frame = generatePlumeFrame(input, ROOPPUR_NPP.position);
    return { active: frame.contours.length > 0, frame, input };
  }, [input]);
}

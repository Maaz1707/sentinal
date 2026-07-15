import { Polygon } from "react-leaflet";
import type { PlumeSimulationState } from "../../hooks/usePlumeSimulation";

const LEVEL_COLOR: Record<string, string> = {
  high: "#fb3a4b",
  medium: "#f59e0b",
  low: "#d7f900",
};

/**
 * Renders dispersion contours once `usePlumeSimulation` produces a real frame.
 * Until the model is wired in, `state.active` is always false and this layer
 * mounts nothing — it exists so the map's layer stack and toggle already have
 * a slot for the plume overlay.
 */
export function PlumeLayer({ state }: { state: PlumeSimulationState }) {
  if (!state.active || !state.frame) return null;

  return (
    <>
      {state.frame.contours.map((contour, i) => (
        <Polygon
          key={`${contour.level}-${i}`}
          positions={contour.polygon}
          pathOptions={{
            color: LEVEL_COLOR[contour.level],
            weight: 1,
            fillColor: LEVEL_COLOR[contour.level],
            fillOpacity: contour.level === "high" ? 0.35 : contour.level === "medium" ? 0.22 : 0.12,
          }}
        />
      ))}
    </>
  );
}

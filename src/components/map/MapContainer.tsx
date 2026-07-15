import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { Icon } from "../ui/Icon";
import { Badge } from "../ui/Badge";
import { GisMap, type MapLayerKey, type SelectedFeature } from "./GisMap";
import { ROOPPUR_NPP, PAZ_RADIUS_M, UPZ_RADIUS_M } from "../../data/gis";
import { cn } from "../../lib/cn";
import type { PlumeSimulationInput } from "../../sim/types";

const LAYERS: { key: MapLayerKey; label: string; icon: string; disabled?: boolean }[] = [
  { key: "zones", label: "Zones", icon: "Radiation" },
  { key: "population", label: "Population", icon: "Users" },
  { key: "infrastructure", label: "Infrastructure", icon: "Hospital" },
  { key: "routes", label: "Routes", icon: "Route" },
  { key: "plume", label: "Plume", icon: "Wind", disabled: true },
];

const FEATURE_ICON: Record<SelectedFeature["kind"], string> = {
  reactor: "Radiation",
  population: "Users",
  hospital: "Hospital",
  emergency: "Siren",
  shelter: "Tent",
};

function coordString(lat: number, lng: number) {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}

function FeatureDetails({ feature }: { feature: SelectedFeature }) {
  switch (feature.kind) {
    case "reactor":
      return (
        <div className="space-y-1.5 font-mono text-[10px] text-ink-400">
          <div className="flex justify-between">
            <span>Configuration</span>
            <span className="text-ink-100">{ROOPPUR_NPP.unit}</span>
          </div>
          <div className="flex justify-between">
            <span>PAZ radius</span>
            <span className="text-crimson">{(PAZ_RADIUS_M / 1000).toFixed(0)} km</span>
          </div>
          <div className="flex justify-between">
            <span>UPZ radius</span>
            <span className="text-amber-glow">{(UPZ_RADIUS_M / 1000).toFixed(0)} km</span>
          </div>
          <div className="flex justify-between">
            <span>Coordinates</span>
            <span className="text-ink-100">{coordString(...ROOPPUR_NPP.position)}</span>
          </div>
        </div>
      );
    case "population":
      return (
        <div className="space-y-1.5 font-mono text-[10px] text-ink-400">
          <div className="flex justify-between">
            <span>Type</span>
            <span className="text-ink-100 capitalize">{feature.data.kind}</span>
          </div>
          <div className="flex justify-between">
            <span>Population</span>
            <span className="text-ink-100">{feature.data.population.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Coordinates</span>
            <span className="text-ink-100">{coordString(...feature.data.position)}</span>
          </div>
        </div>
      );
    case "shelter":
      return (
        <div className="space-y-1.5 font-mono text-[10px] text-ink-400">
          <div className="flex justify-between">
            <span>Type</span>
            <span className="text-ink-100">Shelter</span>
          </div>
          <div className="flex justify-between">
            <span>Capacity</span>
            <span className="text-ink-100">{feature.data.capacity.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Coordinates</span>
            <span className="text-ink-100">{coordString(...feature.data.position)}</span>
          </div>
        </div>
      );
    case "hospital":
    case "emergency":
      return (
        <div className="space-y-1.5 font-mono text-[10px] text-ink-400">
          <div className="flex justify-between">
            <span>Type</span>
            <span className="text-ink-100">{feature.kind === "hospital" ? "Hospital" : "Emergency Center"}</span>
          </div>
          <div className="flex justify-between">
            <span>Coordinates</span>
            <span className="text-ink-100">{coordString(...feature.data.position)}</span>
          </div>
        </div>
      );
  }
}

function featureName(feature: SelectedFeature) {
  return feature.kind === "reactor" ? ROOPPUR_NPP.name : feature.data.name;
}

interface MapContainerProps {
  plumeInput?: PlumeSimulationInput | null;
}

export function MapContainer({ plumeInput = null }: MapContainerProps) {
  const [layers, setLayers] = useState<Record<MapLayerKey, boolean>>({
    zones: true,
    population: true,
    infrastructure: true,
    routes: true,
    plume: false,
  });
  const [selected, setSelected] = useState<SelectedFeature>({ kind: "reactor" });

  const toggle = (key: MapLayerKey, disabled?: boolean) => {
    if (disabled) return;
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  };

  return (
    <GlassPanel
      title="National Situation Map"
      subtitle="GIS Engine · Rooppur NPP Sector · EPSG:4326"
      icon="Map"
      accent="cyan"
      live
      noPadding
      className="h-full"
      actions={
        <div className="hidden items-center gap-1 md:flex">
          {LAYERS.map((l) => (
            <button
              key={l.key}
              onClick={() => toggle(l.key, l.disabled)}
              type="button"
              aria-pressed={layers[l.key]}
              aria-disabled={l.disabled}
              title={l.disabled ? "Plume dispersion model not yet active" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[9.5px] uppercase tracking-wide transition-colors",
                l.disabled
                  ? "cursor-not-allowed border-line text-ink-700"
                  : layers[l.key]
                    ? "border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow"
                    : "border-line text-ink-500 hover:text-ink-300",
              )}
            >
              <Icon name={l.icon} size={11} />
              {l.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="relative h-full min-h-105 w-full overflow-hidden bg-abyss">
        <GisMap layers={layers} plumeInput={plumeInput} onSelect={setSelected} />

        <div className="pointer-events-none absolute right-3 top-3 z-1000 flex h-9 w-9 items-center justify-center rounded-full border border-line-strong bg-void/60 backdrop-blur">
          <Icon name="Navigation" size={14} className="text-ink-300" />
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={featureName(selected)}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel absolute right-3 top-16 z-1000 w-56 rounded-lg p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-cyan-glow">
                  <Icon name={FEATURE_ICON[selected.kind]} size={13} />
                </span>
                <p className="min-w-0 truncate font-display text-[12px] font-semibold text-ink-100">
                  {featureName(selected)}
                </p>
              </div>
              <FeatureDetails feature={selected} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute bottom-3 right-3 z-1000">
          <Badge status="neutral" dot={false}>
            No live tiles · offline sector plot
          </Badge>
        </div>
      </div>
    </GlassPanel>
  );
}

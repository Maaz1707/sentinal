import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import { ICONS } from "../ui/iconMap";

function iconSvg(name: string, size: number) {
  const Cmp = ICONS[name];
  return renderToStaticMarkup(createElement(Cmp, { size, strokeWidth: 2.25 }));
}

export type FacilityKind = "hospital" | "emergency" | "shelter";

const FACILITY_STYLE: Record<FacilityKind, { icon: string; ring: string; fg: string }> = {
  hospital: { icon: "Hospital", ring: "border-emerald-glow/70", fg: "text-emerald-glow" },
  emergency: { icon: "Siren", ring: "border-amber-glow/70", fg: "text-amber-glow" },
  shelter: { icon: "Tent", ring: "border-violet-glow/70", fg: "text-violet-glow" },
};

/** Static facility marker (hospital / emergency center / shelter) with a mount-stagger delay. */
export function facilityDivIcon(kind: FacilityKind, delayMs = 0) {
  const style = FACILITY_STYLE[kind];
  const html = `
    <div class="map-marker-pop" style="animation-delay:${delayMs}ms">
      <span class="flex h-6 w-6 items-center justify-center rounded-md border bg-elevated/95 ${style.ring} ${style.fg}">
        ${iconSvg(style.icon, 12)}
      </span>
    </div>`;
  return L.divIcon({
    html,
    className: "sentinel-div-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

/** The reactor marker: pulsing crimson core at the plant site. */
export function reactorDivIcon() {
  const html = `
    <div class="relative flex items-center justify-center" style="width:56px;height:56px;">
      <span class="absolute h-12 w-12 rounded-full bg-crimson/25 animate-ping"></span>
      <span class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-crimson bg-void text-crimson shadow-[0_0_20px_rgba(251,58,75,0.65)]">
        ${iconSvg("Radiation", 16)}
      </span>
    </div>`;
  return L.divIcon({
    html,
    className: "sentinel-div-icon",
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  });
}

/** Population marker, sized on a log scale so a 3k village and a 450k city both read sensibly. */
export function populationDivIcon(population: number, delayMs = 0) {
  const size = Math.max(8, Math.min(22, 6 + Math.log10(population + 1) * 4));
  const html = `
    <div class="map-marker-pop" style="animation-delay:${delayMs}ms">
      <span class="relative flex items-center justify-center rounded-full" style="width:${size}px;height:${size}px;">
        <span class="absolute inset-0 rounded-full bg-cyan-glow/25 animate-pulse-slow"></span>
        <span class="relative h-1.5 w-1.5 rounded-full bg-cyan-glow"></span>
      </span>
    </div>`;
  return L.divIcon({
    html,
    className: "sentinel-div-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

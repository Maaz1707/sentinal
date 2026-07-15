import { useEffect } from "react";
import { MapContainer as LeafletMap, Circle, Marker, Polyline, Tooltip, ScaleControl, useMap } from "react-leaflet";
import {
  ROOPPUR_NPP,
  PAZ_RADIUS_M,
  UPZ_RADIUS_M,
  RIVER_PADMA,
  ROADS,
  POPULATION_CENTERS,
  HOSPITALS,
  EMERGENCY_CENTERS,
  SHELTERS,
  type LatLng,
  type PopulationCenter,
  type FacilityPoint,
  type Shelter,
} from "../../data/gis";
import { facilityDivIcon, populationDivIcon, reactorDivIcon } from "./mapIcons";
import { usePlumeSimulation } from "../../hooks/usePlumeSimulation";
import { PlumeLayer } from "./PlumeLayer";
import type { PlumeSimulationInput } from "../../sim/types";

export type MapLayerKey = "zones" | "population" | "infrastructure" | "routes" | "plume";

export type SelectedFeature =
  | { kind: "reactor" }
  | { kind: "population"; data: PopulationCenter }
  | { kind: "hospital"; data: FacilityPoint }
  | { kind: "emergency"; data: FacilityPoint }
  | { kind: "shelter"; data: Shelter };

interface GisMapProps {
  layers: Record<MapLayerKey, boolean>;
  plumeInput?: PlumeSimulationInput | null;
  onSelect: (feature: SelectedFeature) => void;
}

const START_ZOOM = 9;
const TARGET_ZOOM = 12.3;
const START_CENTER: LatLng = [24.42, 88.78];
const SECTOR_BOUNDS: [LatLng, LatLng] = [
  [23.35, 87.9],
  [25.15, 90.05],
];

/** Cinematic "acquiring sector" zoom-in from a wide establishing view down to the plant. */
function EntranceFlight() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => {
      map.flyTo(ROOPPUR_NPP.position, TARGET_ZOOM, { duration: 2.4, easeLinearity: 0.15 });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function GisMap({ layers, plumeInput = null, onSelect }: GisMapProps) {
  const plume = usePlumeSimulation(plumeInput);

  return (
    <LeafletMap
      center={START_CENTER}
      zoom={START_ZOOM}
      minZoom={8}
      maxZoom={16}
      scrollWheelZoom
      attributionControl={false}
      maxBounds={SECTOR_BOUNDS}
      maxBoundsViscosity={0.6}
      className="h-full w-full"
    >
      <EntranceFlight />
      <ScaleControl position="bottomleft" imperial={false} />

      {layers.routes && (
        <>
          <Polyline positions={RIVER_PADMA} pathOptions={{ color: "#22d3ee", weight: 7, opacity: 0.14, lineCap: "round" }} />
          <Polyline positions={RIVER_PADMA} pathOptions={{ color: "#22d3ee", weight: 2.5, opacity: 0.6, lineCap: "round" }}>
            <Tooltip sticky className="font-mono! text-[10px]!">
              Padma River
            </Tooltip>
          </Polyline>

          {ROADS.map((road) => (
            <Polyline
              key={road.id}
              positions={road.path}
              pathOptions={{
                color: road.kind === "highway" ? "#aab4c4" : "#6b7688",
                weight: road.kind === "highway" ? 2.5 : 1.5,
                opacity: 0.7,
                dashArray: road.kind === "highway" ? undefined : "4 5",
              }}
            >
              <Tooltip sticky className="font-mono! text-[10px]!">
                {road.name}
              </Tooltip>
            </Polyline>
          ))}
        </>
      )}

      {layers.zones && (
        <>
          <Circle
            center={ROOPPUR_NPP.position}
            radius={UPZ_RADIUS_M}
            pathOptions={{ color: "#f59e0b", weight: 1.5, fillColor: "#f59e0b", fillOpacity: 0.03, dashArray: "6 6", className: "upz-ring" }}
          />
          <Circle
            center={ROOPPUR_NPP.position}
            radius={PAZ_RADIUS_M}
            pathOptions={{ color: "#fb3a4b", weight: 1.5, fillColor: "#fb3a4b", fillOpacity: 0.07, className: "paz-ring" }}
          />
        </>
      )}

      <PlumeLayer state={plume} />

      {layers.population &&
        POPULATION_CENTERS.map((p, i) => (
          <Marker
            key={p.id}
            position={p.position}
            icon={populationDivIcon(p.population, i * 50)}
            eventHandlers={{ click: () => onSelect({ kind: "population", data: p }) }}
          >
            <Tooltip direction="top" offset={[0, -4]} className="font-mono! text-[10px]!">
              {p.name} · {p.population.toLocaleString()}
            </Tooltip>
          </Marker>
        ))}

      {layers.infrastructure && (
        <>
          {HOSPITALS.map((h, i) => (
            <Marker
              key={h.id}
              position={h.position}
              icon={facilityDivIcon("hospital", i * 50)}
              eventHandlers={{ click: () => onSelect({ kind: "hospital", data: h }) }}
            >
              <Tooltip className="font-mono! text-[10px]!">{h.name}</Tooltip>
            </Marker>
          ))}
          {EMERGENCY_CENTERS.map((e, i) => (
            <Marker
              key={e.id}
              position={e.position}
              icon={facilityDivIcon("emergency", i * 50)}
              eventHandlers={{ click: () => onSelect({ kind: "emergency", data: e }) }}
            >
              <Tooltip className="font-mono! text-[10px]!">{e.name}</Tooltip>
            </Marker>
          ))}
          {SHELTERS.map((s, i) => (
            <Marker
              key={s.id}
              position={s.position}
              icon={facilityDivIcon("shelter", i * 50)}
              eventHandlers={{ click: () => onSelect({ kind: "shelter", data: s }) }}
            >
              <Tooltip className="font-mono! text-[10px]!">
                {s.name} · cap {s.capacity.toLocaleString()}
              </Tooltip>
            </Marker>
          ))}
        </>
      )}

      <Marker
        position={ROOPPUR_NPP.position}
        icon={reactorDivIcon()}
        zIndexOffset={1000}
        eventHandlers={{ click: () => onSelect({ kind: "reactor" }) }}
      >
        <Tooltip
          direction="top"
          offset={[0, -26]}
          permanent
          className="font-display! text-[10px]! font-semibold! uppercase! tracking-wider!"
        >
          Rooppur NPP
        </Tooltip>
      </Marker>
    </LeafletMap>
  );
}

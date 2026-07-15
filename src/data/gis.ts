/**
 * Hardcoded GIS dataset for the Rooppur NPP sector.
 *
 * Coordinates are WGS84 (EPSG:4326) and approximate real-world locations in
 * Ishwardi Upazila (Pabna District, Bangladesh) closely enough for a tactical
 * training simulation. Nothing here is fetched at runtime — no geocoding, no
 * tile, no population APIs. All positions, radii, and labels are static data.
 */

export type LatLng = [number, number];

export const ROOPPUR_NPP = {
  name: "Rooppur Nuclear Power Plant",
  unit: "Unit 1 & 2",
  position: [24.0758, 89.0422] as LatLng,
};

/** Precautionary Action Zone — immediate, precautionary evacuation radius. */
export const PAZ_RADIUS_M = 5_000;
/** Urgent Protective Action Zone — sheltering / KI prophylaxis planning radius. */
export const UPZ_RADIUS_M = 16_000;

/**
 * Simplified representative course of the Padma River as it passes the plant
 * site — stylized for the map, not a surveyed hydrological trace.
 */
export const RIVER_PADMA: LatLng[] = [
  [24.222, 88.902],
  [24.176, 88.958],
  [24.131, 89.001],
  [24.096, 89.032],
  [24.0758, 89.0422],
  [24.048, 89.077],
  [24.011, 89.115],
  [23.96, 89.163],
  [23.905, 89.212],
  [23.847, 89.268],
  [23.79, 89.33],
];

export type RoadKind = "highway" | "road";

export interface RoadSegment {
  id: string;
  name: string;
  kind: RoadKind;
  path: LatLng[];
}

export const ROADS: RoadSegment[] = [
  {
    id: "road-plant-access",
    name: "Plant Access Road",
    kind: "road",
    path: [
      [24.0758, 89.0422],
      [24.098, 89.055],
      [24.1353, 89.0839],
    ],
  },
  {
    id: "hwy-ishwardi-rajshahi",
    name: "N6 · Ishwardi–Rajshahi Highway",
    kind: "highway",
    path: [
      [24.1353, 89.0839],
      [24.25, 88.87],
      [24.3745, 88.6042],
    ],
  },
  {
    id: "road-ishwardi-pabna",
    name: "Ishwardi–Pabna Road",
    kind: "road",
    path: [
      [24.1353, 89.0839],
      [24.06, 89.16],
      [24.0064, 89.2372],
    ],
  },
  {
    id: "road-ishwardi-kushtia",
    name: "Ishwardi–Kushtia Road",
    kind: "road",
    path: [
      [24.1353, 89.0839],
      [24.02, 89.05],
      [23.9013, 89.1206],
    ],
  },
  {
    id: "road-pabna-kushtia",
    name: "Pabna–Kushtia Road",
    kind: "road",
    path: [
      [24.0064, 89.2372],
      [23.95, 89.18],
      [23.9013, 89.1206],
    ],
  },
];

export type SettlementKind = "city" | "town" | "village";

export interface PopulationCenter {
  id: string;
  name: string;
  position: LatLng;
  population: number;
  kind: SettlementKind;
}

export const POPULATION_CENTERS: PopulationCenter[] = [
  { id: "pop-ruppur", name: "Ruppur Village", position: [24.081, 89.05], population: 2800, kind: "village" },
  { id: "pop-mulgram", name: "Mulgram", position: [24.062, 89.028], population: 3200, kind: "village" },
  { id: "pop-lakshmikunda", name: "Lakshmikunda", position: [24.093, 89.061], population: 5400, kind: "village" },
  { id: "pop-attaikula", name: "Attaikula", position: [24.048, 89.06], population: 4100, kind: "village" },
  { id: "pop-ishwardi", name: "Ishwardi Town", position: [24.1353, 89.0839], population: 68000, kind: "town" },
  { id: "pop-pabna", name: "Pabna Sadar", position: [24.0064, 89.2372], population: 142000, kind: "town" },
  { id: "pop-kushtia", name: "Kushtia", position: [23.9013, 89.1206], population: 88000, kind: "town" },
  { id: "pop-rajshahi", name: "Rajshahi City", position: [24.3745, 88.6042], population: 450000, kind: "city" },
];

export interface FacilityPoint {
  id: string;
  name: string;
  position: LatLng;
}

export const HOSPITALS: FacilityPoint[] = [
  { id: "hosp-ishwardi", name: "Ishwardi Upazila Health Complex", position: [24.133, 89.085] },
  { id: "hosp-pabna", name: "Pabna General Hospital (250-bed)", position: [24.0022, 89.2378] },
  { id: "hosp-kushtia", name: "Kushtia General Hospital", position: [23.9089, 89.1231] },
  { id: "hosp-rajshahi", name: "Rajshahi Medical College Hospital", position: [24.373, 88.6041] },
];

export const EMERGENCY_CENTERS: FacilityPoint[] = [
  { id: "ec-onsite", name: "Rooppur On-Site Emergency Control Center", position: [24.0745, 89.044] },
  { id: "ec-ishwardi-fire", name: "Ishwardi Fire Service & Civil Defence", position: [24.131, 89.079] },
  { id: "ec-pabna-eoc", name: "Pabna District Emergency Operations Centre", position: [24.0, 89.236] },
  { id: "ec-baera", name: "BAERA Radiological Field Office", position: [24.117, 89.075] },
];

export interface Shelter extends FacilityPoint {
  capacity: number;
}

export const SHELTERS: Shelter[] = [
  { id: "shl-ishwardi-college", name: "Ishwardi Government College Shelter", position: [24.13, 89.07], capacity: 3500 },
  { id: "shl-lakshmikunda", name: "Lakshmikunda Union Shelter", position: [24.09, 89.06], capacity: 900 },
  { id: "shl-mulgram", name: "Mulgram Community Shelter", position: [24.058, 89.032], capacity: 600 },
  { id: "shl-pabna-zilla", name: "Pabna Zilla School Shelter", position: [24.005, 89.24], capacity: 4200 },
  { id: "shl-kushtia-stadium", name: "Kushtia Stadium Shelter", position: [23.905, 89.125], capacity: 5000 },
  { id: "shl-rajshahi-staging", name: "Rajshahi Staging Ground", position: [24.374, 88.604], capacity: 8000 },
];

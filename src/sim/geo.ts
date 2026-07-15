import type { LatLng } from "../data/gis";

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

/** Great-circle distance between two WGS84 points, in meters. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Initial compass bearing (degrees, 0=north/90=east) from a toward b. */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Destination point given an origin, distance (m) and bearing (deg) — spherical law. */
export function destinationPoint(origin: LatLng, distanceMeters: number, bearing: number): LatLng {
  const [lat1, lon1] = origin.map(toRad) as [number, number];
  const brng = toRad(bearing);
  const angularDist = distanceMeters / EARTH_RADIUS_M;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDist) + Math.cos(lat1) * Math.sin(angularDist) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(angularDist) * Math.cos(lat1),
      Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2),
    );

  return [toDeg(lat2), ((toDeg(lon2) + 540) % 360) - 180];
}

/** Smallest signed angular difference (deg), in (-180, 180]. */
export function angleDiffDeg(a: number, b: number): number {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Projects a target point into downwind/crosswind plume coordinates (meters):
 * x = distance along the wind axis (positive = downwind of source),
 * y = perpendicular offset from the plume centerline.
 */
export function toPlumeFrame(source: LatLng, target: LatLng, windDirectionDeg: number): { x: number; y: number } {
  const distance = haversineMeters(source, target);
  const bearingToTarget = bearingDeg(source, target);
  // Wind direction is "blowing toward" — the plume travels along that bearing.
  const relativeAngle = toRad(angleDiffDeg(windDirectionDeg, bearingToTarget));
  const x = distance * Math.cos(relativeAngle);
  const y = distance * Math.sin(relativeAngle);
  return { x, y };
}

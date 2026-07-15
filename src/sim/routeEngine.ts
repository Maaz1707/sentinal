/**
 * Weighted-graph evacuation routing over the hardcoded GIS road network.
 * Builds an undirected graph from `ROADS` (gis.ts) plus short synthetic
 * "spur" edges connecting each hospital/shelter to its nearest road node,
 * then runs Dijkstra twice per corridor: once minimizing pure travel time
 * (fastest) and once minimizing time *plus* a heavy radiation-dose penalty
 * (safest) — the difference between the two paths is what the map calls a
 * "reroute".
 */
import { HOSPITALS, POPULATION_CENTERS, ROADS, ROOPPUR_NPP, SHELTERS, type LatLng } from "../data/gis";
import { haversineMeters } from "./geo";
import { concentrationAtPoint } from "./gaussianPlume";
import { statusFromDose } from "./doseEngine";
import type { PlumeSimulationInput, RouteGraphEdge, RouteGraphNode } from "./types";
import type { RouteDatum } from "../types";

const HIGHWAY_SPEED_KMH = 80;
const ROAD_SPEED_KMH = 40;
const SPUR_SPEED_KMH = 30;
const HIGHWAY_CAPACITY_VPH = 1200;
const ROAD_CAPACITY_VPH = 450;
const SPUR_CAPACITY_VPH = 250;
const RADIATION_PENALTY_HOURS_PER_MSV = 0.75;

interface Graph {
  nodes: Map<string, RouteGraphNode>;
  edges: Map<string, RouteGraphEdge>;
  adjacency: Map<string, string[]>; // nodeId -> edgeIds
}

function pathLengthKm(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += haversineMeters(path[i - 1], path[i]) / 1000;
  return total;
}

function addEdge(graph: Graph, edge: RouteGraphEdge) {
  graph.edges.set(edge.id, edge);
  graph.adjacency.get(edge.from)?.push(edge.id);
  graph.adjacency.get(edge.to)?.push(edge.id);
}

function ensureNode(graph: Graph, id: string, name: string, position: LatLng) {
  if (!graph.nodes.has(id)) {
    graph.nodes.set(id, { id, name, position });
    graph.adjacency.set(id, []);
  }
}

function nearestNode(graph: Graph, position: LatLng, excludeIds: Set<string>): string {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const [id, node] of graph.nodes) {
    if (excludeIds.has(id)) continue;
    const d = haversineMeters(position, node.position);
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best!;
}

let cachedGraph: Graph | null = null;

/** The road network is static (hardcoded GIS data), so the graph is built once and memoized. */
function buildGraph(): Graph {
  if (cachedGraph) return cachedGraph;

  const graph: Graph = { nodes: new Map(), edges: new Map(), adjacency: new Map() };

  ensureNode(graph, "plant", ROOPPUR_NPP.name, ROOPPUR_NPP.position);
  for (const c of POPULATION_CENTERS) ensureNode(graph, c.id, c.name, c.position);

  for (const road of ROADS) {
    const fromId = nearestNode(graph, road.path[0], new Set());
    const toId = nearestNode(graph, road.path[road.path.length - 1], new Set());
    if (!fromId || !toId || fromId === toId) continue;
    addEdge(graph, {
      id: road.id,
      from: fromId,
      to: toId,
      distanceKm: pathLengthKm(road.path),
      baseCapacityVehiclesPerHour: road.kind === "highway" ? HIGHWAY_CAPACITY_VPH : ROAD_CAPACITY_VPH,
      kind: road.kind,
    });
  }

  const spurTargets = [...HOSPITALS, ...SHELTERS];
  const roadNodeIds = new Set(graph.nodes.keys());
  for (const target of spurTargets) {
    ensureNode(graph, target.id, target.name, target.position);
    const nearest = nearestNode(graph, target.position, new Set([target.id]));
    if (!nearest || !roadNodeIds.has(nearest)) continue;
    addEdge(graph, {
      id: `spur-${target.id}`,
      from: target.id,
      to: nearest,
      distanceKm: haversineMeters(target.position, graph.nodes.get(nearest)!.position) / 1000,
      baseCapacityVehiclesPerHour: SPUR_CAPACITY_VPH,
      kind: "road",
    });
  }

  cachedGraph = graph;
  return graph;
}

interface EdgeCost {
  timeHours: number;
  radiationPenaltyHours: number;
  blocked: boolean;
}

function edgeCost(edge: RouteGraphEdge, plumeInput: PlumeSimulationInput | null): EdgeCost {
  const speedKmh = edge.id.startsWith("spur-") ? SPUR_SPEED_KMH : edge.kind === "highway" ? HIGHWAY_SPEED_KMH : ROAD_SPEED_KMH;
  const timeHours = edge.distanceKm / speedKmh;

  if (!plumeInput || plumeInput.sourceTermBqS <= 0) {
    return { timeHours, radiationPenaltyHours: 0, blocked: false };
  }

  const from = cachedGraph!.nodes.get(edge.from)!.position;
  const to = cachedGraph!.nodes.get(edge.to)!.position;
  const midpoint: LatLng = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const samples = [from, midpoint, to];
  let maxDoseMSv = 0;
  for (const point of samples) {
    const c = concentrationAtPoint(plumeInput, ROOPPUR_NPP.position, point);
    const doseMSv = c * 3 * 4; // matches doseEngine's conversion (concentration -> mSv/4h)
    maxDoseMSv = Math.max(maxDoseMSv, doseMSv);
  }
  const status = statusFromDose(maxDoseMSv);
  return {
    timeHours,
    radiationPenaltyHours: maxDoseMSv * RADIATION_PENALTY_HOURS_PER_MSV,
    blocked: status === "critical",
  };
}

function dijkstra(
  graph: Graph,
  startId: string,
  endId: string,
  weightOf: (edge: RouteGraphEdge, cost: EdgeCost) => number,
  costs: Map<string, EdgeCost>,
): { nodeIds: string[]; edgeIds: string[] } | null {
  const dist = new Map<string, number>([[startId, 0]]);
  const prevNode = new Map<string, string>();
  const prevEdge = new Map<string, string>();
  const visited = new Set<string>();
  const queue = new Set(graph.nodes.keys());

  while (queue.size > 0) {
    let current: string | null = null;
    let currentDist = Infinity;
    for (const id of queue) {
      const d = dist.get(id) ?? Infinity;
      if (d < currentDist) {
        currentDist = d;
        current = id;
      }
    }
    if (current === null || currentDist === Infinity) break;
    queue.delete(current);
    visited.add(current);
    if (current === endId) break;

    for (const edgeId of graph.adjacency.get(current) ?? []) {
      const edge = graph.edges.get(edgeId)!;
      const cost = costs.get(edgeId)!;
      if (cost.blocked) continue;
      const neighbor = edge.from === current ? edge.to : edge.from;
      if (visited.has(neighbor)) continue;
      const weight = weightOf(edge, cost);
      const candidate = currentDist + weight;
      if (candidate < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, candidate);
        prevNode.set(neighbor, current);
        prevEdge.set(neighbor, edgeId);
      }
    }
  }

  if (!prevNode.has(endId) && startId !== endId) return null;

  const nodeIds: string[] = [endId];
  const edgeIds: string[] = [];
  let cursor = endId;
  while (cursor !== startId) {
    const edgeId = prevEdge.get(cursor);
    const prev = prevNode.get(cursor);
    if (!edgeId || !prev) return null;
    edgeIds.unshift(edgeId);
    nodeIds.unshift(prev);
    cursor = prev;
  }
  return { nodeIds, edgeIds };
}

export interface RouteRequest {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
}

export const ROUTE_REQUESTS: RouteRequest[] = [
  { id: "rt1", name: "Corridor Alpha", fromNodeId: "plant", toNodeId: "shl-ishwardi-college" },
  { id: "rt2", name: "Corridor Bravo", fromNodeId: "pop-ishwardi", toNodeId: "shl-rajshahi-staging" },
  { id: "rt3", name: "Corridor Charlie", fromNodeId: "pop-pabna", toNodeId: "shl-kushtia-stadium" },
  { id: "rt4", name: "Corridor Delta", fromNodeId: "pop-ishwardi", toNodeId: "hosp-kushtia" },
  { id: "rt5", name: "Corridor Echo", fromNodeId: "pop-pabna", toNodeId: "hosp-rajshahi" },
];

/**
 * Computes the live route set. `evacuationProgressPct` (0-100, tracked by the
 * store) drives how much of a corridor's origin population is currently in
 * transit, which in turn drives displayed vehicle count and capacity load.
 */
export function computeRoutes(plumeInput: PlumeSimulationInput | null, evacuationProgressPct: number): RouteDatum[] {
  const graph = buildGraph();
  const costs = new Map<string, EdgeCost>();
  for (const [id, edge] of graph.edges) costs.set(id, edgeCost(edge, plumeInput));

  return ROUTE_REQUESTS.map((req) => {
    const fastest = dijkstra(graph, req.fromNodeId, req.toNodeId, (_edge, cost) => cost.timeHours, costs);
    const safest = dijkstra(
      graph,
      req.fromNodeId,
      req.toNodeId,
      (_edge, cost) => cost.timeHours + cost.radiationPenaltyHours,
      costs,
    );

    const fromName = graph.nodes.get(req.fromNodeId)?.name ?? req.fromNodeId;
    const toName = graph.nodes.get(req.toNodeId)?.name ?? req.toNodeId;

    if (!safest) {
      return {
        id: req.id,
        name: req.name,
        from: fromName,
        to: toName,
        status: "blocked",
        etaMinutes: 0,
        capacityUsed: 100,
        vehicles: 0,
        distanceKm: 0,
      } satisfies RouteDatum;
    }

    const distanceKm = safest.edgeIds.reduce((sum, id) => sum + graph.edges.get(id)!.distanceKm, 0);
    const timeHours = safest.edgeIds.reduce((sum, id) => sum + costs.get(id)!.timeHours, 0);
    const bottleneckCapacity = Math.min(...safest.edgeIds.map((id) => graph.edges.get(id)!.baseCapacityVehiclesPerHour));

    const originPopulation = POPULATION_CENTERS.find((c) => c.id === req.fromNodeId)?.population ?? 4000;
    const vehiclesInTransit = Math.round((originPopulation / 40) * (evacuationProgressPct / 100));
    const capacityUsed = Math.min(100, Math.round((vehiclesInTransit / bottleneckCapacity) * 100));

    const reroutedForPlume = fastest ? fastest.edgeIds.join("|") !== safest.edgeIds.join("|") : false;
    const status: RouteDatum["status"] =
      capacityUsed >= 90 ? "congested" : reroutedForPlume ? "rerouted" : "optimal";

    return {
      id: req.id,
      name: req.name,
      from: fromName,
      to: toName,
      status,
      etaMinutes: Math.max(1, Math.round(timeHours * 60)),
      capacityUsed,
      vehicles: vehiclesInTransit,
      distanceKm: Math.round(distanceKm * 10) / 10,
      fastestEtaMinutes: fastest
        ? Math.max(1, Math.round(fastest.edgeIds.reduce((sum, id) => sum + costs.get(id)!.timeHours, 0) * 60))
        : undefined,
      reroutedForPlume,
    } satisfies RouteDatum;
  });
}

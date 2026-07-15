import { PAZ_RADIUS_M, POPULATION_CENTERS, ROADS, ROOPPUR_NPP, type RoadSegment } from "../data/gis";
import { classificationRank } from "./classificationEngine";
import { haversineMeters } from "./geo";
import { concentrationAtPoint } from "./gaussianPlume";
import { statusFromDose } from "./doseEngine";
import type {
  ClassificationState,
  DoseResult,
  PlumeSimulationInput,
  Recommendation,
  RecommendationAction,
  RecommendationStatus,
} from "./types";

function clampPct(v: number) {
  return Math.min(99, Math.max(1, Math.round(v)));
}

export interface DecisionContext {
  classification: ClassificationState;
  doseByCenter: Record<string, DoseResult>;
  plumeInput: PlumeSimulationInput | null;
  hospitalLoadPct: number;
  nowSec: number;
}

type Candidate = Omit<Recommendation, "status" | "triggeredAtSimSec">;

const ACTION_META: Record<RecommendationAction, { title: string; guideline: string }> = {
  shelter: { title: "Advise sheltering-in-place", guideline: "IAEA GSG-2 generic sheltering OIL (illustrative)" },
  evacuate: { title: "Order evacuation of affected centers", guideline: "IAEA GSG-2 generic evacuation OIL (illustrative)" },
  ki_distribution: { title: "Distribute stable iodine (KI)", guideline: "Generic KI predistribution criterion, PAZ-wide (illustrative)" },
  food_restriction: { title: "Restrict local food & water distribution", guideline: "Generic ingestion-pathway precaution (illustrative)" },
  road_closure: { title: "Close affected road corridor", guideline: "Route-level dose-avoidance policy" },
  airspace_restriction: { title: "Restrict airspace over exclusion sector", guideline: "Generic aviation NOTAM practice for declared site emergencies" },
  medical_response: { title: "Surge regional medical response", guideline: "Mass-casualty / triage capacity planning" },
  international_notification: {
    title: "Notify IAEA & neighboring states",
    guideline: "Convention on Early Notification of a Nuclear Accident (illustrative)",
  },
};

function worstCenters(doseByCenter: Record<string, DoseResult>, minRank: number) {
  const order = ["safe", "monitor", "shelter", "evacuate", "critical"];
  return Object.values(doseByCenter)
    .filter((d) => order.indexOf(d.status) >= minRank)
    .sort((a, b) => b.projectedDoseMSv - a.projectedDoseMSv);
}

function centerName(id: string) {
  return POPULATION_CENTERS.find((c) => c.id === id)?.name ?? id;
}
function centerPopulation(id: string) {
  return POPULATION_CENTERS.find((c) => c.id === id)?.population ?? 0;
}

function roadMaxDoseStatus(road: RoadSegment, plumeInput: PlumeSimulationInput | null): { max: number; status: string } {
  if (!plumeInput || plumeInput.sourceTermBqS <= 0) return { max: 0, status: "safe" };
  let max = 0;
  for (const point of road.path) {
    const c = concentrationAtPoint(plumeInput, ROOPPUR_NPP.position, point);
    max = Math.max(max, c);
  }
  const doseMSv = max * 3 * 4; // same conversion as doseEngine, kept local to avoid a circular import of constants-derived helpers
  return { max: doseMSv, status: statusFromDose(doseMSv) };
}

function buildCandidates(ctx: DecisionContext): Candidate[] {
  const { classification, doseByCenter, hospitalLoadPct } = ctx;
  const rank = classificationRank(classification.level);
  const candidates: Candidate[] = [];

  const shelterBand = worstCenters(doseByCenter, 2); // shelter, evacuate, critical
  if (shelterBand.length > 0) {
    const worst = shelterBand[0];
    const population = shelterBand.reduce((sum, d) => sum + centerPopulation(d.centerId), 0);
    candidates.push({
      id: "rec-shelter",
      action: "shelter",
      title: ACTION_META.shelter.title,
      description: `${shelterBand.length} population center(s) — led by ${centerName(worst.centerId)} (${worst.distanceKm.toFixed(1)} km) — project a dose above the sheltering threshold.`,
      reason: `${centerName(worst.centerId)} projected dose ${worst.projectedDoseMSv.toFixed(2)} mSv/4h exceeds sheltering threshold`,
      threshold: { label: "Projected dose", value: 1, unit: "mSv/4h" },
      currentValue: worst.projectedDoseMSv,
      guideline: ACTION_META.shelter.guideline,
      confidence: clampPct(55 + worst.projectedDoseMSv * 2),
      priority: clampPct(50 + worst.projectedDoseMSv),
      impact: `${population.toLocaleString()} people advised to shelter`,
    });
  }

  const evacBand = worstCenters(doseByCenter, 3); // evacuate, critical
  if (evacBand.length > 0) {
    const worst = evacBand[0];
    const population = evacBand.reduce((sum, d) => sum + centerPopulation(d.centerId), 0);
    candidates.push({
      id: "rec-evacuate",
      action: "evacuate",
      title: ACTION_META.evacuate.title,
      description: `${evacBand.length} population center(s) — led by ${centerName(worst.centerId)} (${worst.distanceKm.toFixed(1)} km) — project a dose above the evacuation threshold.`,
      reason: `${centerName(worst.centerId)} projected dose ${worst.projectedDoseMSv.toFixed(1)} mSv/4h exceeds evacuation threshold`,
      threshold: { label: "Projected dose", value: 10, unit: "mSv/4h" },
      currentValue: worst.projectedDoseMSv,
      guideline: ACTION_META.evacuate.guideline,
      confidence: clampPct(60 + worst.projectedDoseMSv),
      priority: clampPct(70 + worst.projectedDoseMSv),
      impact: `${population.toLocaleString()} people in evacuation order`,
    });
  }

  const pazCenters = POPULATION_CENTERS.filter(
    (c) => haversineMeters(ROOPPUR_NPP.position, c.position) <= PAZ_RADIUS_M,
  );
  const pazDoses = pazCenters.map((c) => doseByCenter[c.id]).filter((d): d is DoseResult => Boolean(d));
  const pazMaxDose = Math.max(0, ...pazDoses.map((d) => d.projectedDoseMSv));
  if (rank >= classificationRank("site_area_emergency") || pazMaxDose >= 0.1) {
    const population = pazCenters.reduce((sum, c) => sum + c.population, 0);
    candidates.push({
      id: "rec-ki",
      action: "ki_distribution",
      title: ACTION_META.ki_distribution.title,
      description: `Precautionary Action Zone (${(PAZ_RADIUS_M / 1000).toFixed(0)} km) population should receive stable iodine ahead of potential inhalation exposure.`,
      reason:
        rank >= classificationRank("site_area_emergency")
          ? `Classification at ${classification.level.replace(/_/g, " ")} — PAZ-wide KI predistribution indicated`
          : `PAZ projected dose ${pazMaxDose.toFixed(2)} mSv/4h — precautionary predistribution indicated`,
      threshold: { label: "PAZ projected dose", value: 0.1, unit: "mSv/4h" },
      currentValue: pazMaxDose,
      guideline: ACTION_META.ki_distribution.guideline,
      confidence: clampPct(50 + pazMaxDose * 5 + rank * 8),
      priority: clampPct(55 + rank * 10),
      impact: `${population.toLocaleString()} people within PAZ`,
    });
  }

  if (rank >= classificationRank("site_area_emergency")) {
    candidates.push({
      id: "rec-food",
      action: "food_restriction",
      title: ACTION_META.food_restriction.title,
      description: "Hold local produce, milk, and open-water sources pending deposition survey results.",
      reason: `Classification at ${classification.level.replace(/_/g, " ")} — ingestion pathway precaution warranted`,
      threshold: { label: "Classification tier", value: classificationRank("site_area_emergency"), unit: "tier" },
      currentValue: rank,
      guideline: ACTION_META.food_restriction.guideline,
      confidence: clampPct(50 + rank * 12),
      priority: clampPct(40 + rank * 10),
      impact: "Agricultural hold order within UPZ sector",
    });

    candidates.push({
      id: "rec-airspace",
      action: "airspace_restriction",
      title: ACTION_META.airspace_restriction.title,
      description: "Restrict non-essential aviation over the exclusion sector to avoid plume ingestion and support rotary-wing response.",
      reason: `Classification at ${classification.level.replace(/_/g, " ")} — airspace restriction warranted`,
      threshold: { label: "Classification tier", value: classificationRank("site_area_emergency"), unit: "tier" },
      currentValue: rank,
      guideline: ACTION_META.airspace_restriction.guideline,
      confidence: clampPct(60 + rank * 10),
      priority: clampPct(35 + rank * 8),
      impact: "No-fly zone declared over UPZ sector",
    });

    candidates.push({
      id: "rec-intl",
      action: "international_notification",
      title: ACTION_META.international_notification.title,
      description: "Formally notify the IAEA and neighboring states per early-notification treaty obligations.",
      reason: `Classification at ${classification.level.replace(/_/g, " ")} — international notification threshold met`,
      threshold: { label: "Classification tier", value: classificationRank("site_area_emergency"), unit: "tier" },
      currentValue: rank,
      guideline: ACTION_META.international_notification.guideline,
      confidence: clampPct(70 + rank * 8),
      priority: clampPct(60 + rank * 8),
      impact: "IAEA + bordering states notified",
    });
  }

  if (hospitalLoadPct > 60 || evacBand.length > 0) {
    candidates.push({
      id: "rec-medical",
      action: "medical_response",
      title: ACTION_META.medical_response.title,
      description: "Surge additional medical, decontamination, and triage capacity toward the affected sector.",
      reason:
        hospitalLoadPct > 60
          ? `Regional hospital load at ${hospitalLoadPct.toFixed(0)}% capacity`
          : `${evacBand.length} population center(s) under evacuation order`,
      threshold: { label: "Hospital load", value: 60, unit: "%" },
      currentValue: hospitalLoadPct,
      guideline: ACTION_META.medical_response.guideline,
      confidence: clampPct(50 + hospitalLoadPct / 2),
      priority: clampPct(45 + hospitalLoadPct / 2),
      impact: "Regional hospitals placed on surge protocol",
    });
  }

  for (const road of ROADS) {
    const { max, status } = roadMaxDoseStatus(road, ctx.plumeInput);
    if (status === "evacuate" || status === "critical") {
      candidates.push({
        id: `rec-road-${road.id}`,
        action: "road_closure",
        title: `${ACTION_META.road_closure.title}: ${road.name}`,
        description: `${road.name} passes through a projected dose zone above the evacuation threshold — reroute evacuation traffic.`,
        reason: `Corridor dose ${max.toFixed(1)} mSv/4h exceeds evacuation threshold`,
        threshold: { label: "Corridor dose", value: 10, unit: "mSv/4h" },
        currentValue: max,
        guideline: ACTION_META.road_closure.guideline,
        confidence: clampPct(60 + max),
        priority: clampPct(65 + max),
        impact: `${road.name} closed to evacuation traffic`,
      });
    }
  }

  return candidates.sort((a, b) => b.priority - a.priority);
}

/**
 * Recomputes the live recommendation set and folds in operator-set status
 * (`approved`/`overridden`) from the previous tick, keyed by recommendation
 * id. A recommendation whose rule no longer fires is dropped; one whose rule
 * still fires keeps its prior status and original trigger timestamp.
 */
export function computeRecommendations(ctx: DecisionContext, previous: Recommendation[]): Recommendation[] {
  const previousById = new Map(previous.map((r) => [r.id, r]));
  return buildCandidates(ctx).map((candidate) => {
    const prior = previousById.get(candidate.id);
    const status: RecommendationStatus = prior?.status ?? "pending";
    const triggeredAtSimSec = prior?.triggeredAtSimSec ?? ctx.nowSec;
    return { ...candidate, status, triggeredAtSimSec };
  });
}

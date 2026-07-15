import { useEffect, useMemo, useState } from "react";
import { POPULATION_CENTERS } from "../data/gis";
import { buildClassificationAlerts, buildRecommendationAlerts } from "../sim/alertEngine";
import { setManualClassification, stepClassification } from "../sim/classificationEngine";
import { computeDoseForAllCenters } from "../sim/doseEngine";
import { computeRecommendations } from "../sim/decisionEngine";
import { NOMINAL_PLANT, PLUME_DECAY_CONSTANT_PER_S, RELEASE_HEIGHT_M, SIM_TICK_MS, SOURCE_TERM_SCALE_BQ_PER_SVH, TERRAIN_FACTOR } from "../sim/constants";
import { SCENARIOS } from "../sim/scenarios";
import { createTimelineEvent, pushTimelineEvents, formatSimClock } from "../sim/timelineEngine";
import { computeRoutes } from "../sim/routeEngine";
import { deriveStatCards, type StatHistories } from "../sim/statCards";
import { stepPlant } from "../sim/plantEngine";
import { INITIAL_TRUST, stepTrust } from "../sim/trustEngine";
import type { AlertItem, RouteDatum, TimelineEvent, TrustRegion } from "../types";
import type { ClassificationState, PlantState, PlumeSimulationInput, Recommendation, ScenarioId, TrustState } from "../sim/types";

export type DemoPhase =
    | "normal-operation"
    | "wind-change"
    | "scenario-selection"
    | "emergency-declaration"
    | "plant-escalation"
    | "plume-expansion"
    | "protective-decisions"
    | "route-optimization"
    | "public-alerts"
    | "trust-portal"
    | "timeline-growth";

type DemoSnapshot = {
    phase: DemoPhase;
    phaseLabel: string;
    simSec: number;
    plant: PlantState;
    classification: ClassificationState;
    trust: TrustState;
    alerts: AlertItem[];
    timeline: TimelineEvent[];
    recommendations: Recommendation[];
    routeData: RouteDatum[];
    routeProgress: number;
    plumeInput: PlumeSimulationInput | null;
    statCards: ReturnType<typeof deriveStatCards>["cards"];
    trustRegions: TrustRegion[];
};

const PHASES: { atSec: number; phase: DemoPhase; label: string }[] = [
    { atSec: 0, phase: "normal-operation", label: "Normal Operation" },
    { atSec: 12, phase: "wind-change", label: "Wind Change" },
    { atSec: 22, phase: "scenario-selection", label: "Scenario Selection" },
    { atSec: 34, phase: "emergency-declaration", label: "Emergency Declaration" },
    { atSec: 48, phase: "plant-escalation", label: "Plant Escalation" },
    { atSec: 60, phase: "plume-expansion", label: "Plume Expansion" },
    { atSec: 72, phase: "protective-decisions", label: "Protective Decisions" },
    { atSec: 84, phase: "route-optimization", label: "Route Optimization" },
    { atSec: 96, phase: "public-alerts", label: "Public Alerts" },
    { atSec: 108, phase: "trust-portal", label: "Trust Portal Transition" },
    { atSec: 120, phase: "timeline-growth", label: "Timeline Growth" },
];

const INITIAL_CLASSIFICATION: ClassificationState = {
    level: "normal",
    autoLevel: "normal",
    reason: "All monitored parameters within nominal operating envelope",
    declaredAtSimSec: 0,
    manualOverride: false,
};

const INITIAL_ROUTE_PROGRESS = 18;
const INITIAL_WIND = { windDirectionDeg: 188, windSpeedMs: 4.2, stabilityClass: "D" as const };

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function phaseForSec(simSec: number) {
    let current = PHASES[0];
    for (const phase of PHASES) {
        if (simSec >= phase.atSec) current = phase;
    }
    return current;
}

function windForSec(simSec: number) {
    if (simSec < 12) return INITIAL_WIND;
    if (simSec < 24) return { windDirectionDeg: 214, windSpeedMs: 6.8, stabilityClass: "C" as const };
    if (simSec < 60) return { windDirectionDeg: 228, windSpeedMs: 8.4, stabilityClass: "D" as const };
    return { windDirectionDeg: 242, windSpeedMs: 10.2, stabilityClass: "E" as const };
}

function plumeInputFor(plant: PlantState, wind: ReturnType<typeof windForSec>, simSec: number): PlumeSimulationInput | null {
    const release = Math.max(0, (plant.radiationSvH - 0.12) * SOURCE_TERM_SCALE_BQ_PER_SVH);
    if (release <= 0.1) return null;
    return {
        windDirectionDeg: wind.windDirectionDeg,
        windSpeedMs: wind.windSpeedMs,
        stabilityClass: wind.stabilityClass,
        releaseHeightM: RELEASE_HEIGHT_M,
        sourceTermBqS: release,
        decayConstantPerS: PLUME_DECAY_CONSTANT_PER_S,
        terrainFactor: TERRAIN_FACTOR,
        startTime: simSec,
    };
}

function createDemoSnapshot(simSec: number, selectedScenario: ScenarioId): DemoSnapshot {
    const currentSec = Math.max(0, Math.floor(simSec));
    let plant = NOMINAL_PLANT;
    let classification = INITIAL_CLASSIFICATION;
    let trust = INITIAL_TRUST;
    let alerts: AlertItem[] = [];
    let timeline: TimelineEvent[] = [
        createTimelineEvent({
            nowSec: 0,
            category: "operator",
            title: "Demo mode armed",
            description: "SENTINEL-BD submission walkthrough initialized.",
            severity: "info",
            icon: "PlayCircle",
            actor: "Demo Orchestrator",
        }),
    ];
    let recommendations: Recommendation[] = [];
    let routeProgress = INITIAL_ROUTE_PROGRESS;
    let plumeInput: PlumeSimulationInput | null = null;
    let histories: StatHistories = {};
    let previousPhase = PHASES[0].phase;

    for (let sec = 1; sec <= currentSec; sec += 1) {
        const phase = phaseForSec(sec);
        const phaseId = phase.phase;
        const wind = windForSec(sec);
        const forcing = sec < 22 ? {} : SCENARIOS[selectedScenario].forcing(sec - 22);

        const plantStep = stepPlant(plant, 1, forcing, sec);
        plant = plantStep.state;

        if (sec === 30 && !classification.manualOverride) {
            classification = setManualClassification(
                "facility_emergency",
                "Operator declared Facility Emergency during the demo sequence.",
                sec,
            );
        } else {
            classification = stepClassification(plant, classification, sec);
        }

        plumeInput = plumeInputFor(plant, wind, sec >= 20 ? sec : 0);
        const doseByCenter = plumeInput ? computeDoseForAllCenters(POPULATION_CENTERS, plumeInput, new Set()) : {};

        const nextRecommendations = computeRecommendations(
            {
                classification,
                doseByCenter,
                plumeInput,
                hospitalLoadPct: clamp(34 + sec * 0.8, 34, 92),
                nowSec: sec,
            },
            recommendations,
        );

        const phaseChanged = phaseId !== previousPhase;
        if (phaseChanged) {
            timeline = pushTimelineEvents(timeline, [
                createTimelineEvent({
                    nowSec: sec,
                    category: "scenario",
                    title: phase.label,
                    description: `Demo transitioned to ${phase.label.toLowerCase()}.`,
                    severity: phaseId === "normal-operation" ? "info" : phaseId === "wind-change" ? "low" : "moderate",
                    icon: "Clock",
                    actor: "Demo Orchestrator",
                }),
            ]);
            previousPhase = phaseId;
        }

        if (plantStep.events.length > 0) {
            timeline = pushTimelineEvents(
                timeline,
                plantStep.events.map((event) =>
                    createTimelineEvent({
                        nowSec: sec,
                        category: "plant",
                        title: event,
                        description: event,
                        severity: "high",
                        icon: "Zap",
                        actor: "Reactor Protection",
                    }),
                ),
            );
        }

        if (classification.level !== classification.autoLevel && sec >= 30) {
            timeline = pushTimelineEvents(timeline, [
                createTimelineEvent({
                    nowSec: sec,
                    category: "classification",
                    title: `Classification ${classification.level.replace(/_/g, " ")}`,
                    description: classification.reason,
                    severity: classification.level === "general_emergency" ? "critical" : "high",
                    icon: "ShieldAlert",
                    actor: "National Control",
                }),
            ]);
        }

        if (nextRecommendations.length > recommendations.length) {
            const newest = nextRecommendations[0];
            timeline = pushTimelineEvents(timeline, [
                createTimelineEvent({
                    nowSec: sec,
                    category: "decision",
                    title: newest.title,
                    description: newest.description,
                    severity: newest.action === "evacuate" ? "critical" : "high",
                    icon: "BrainCircuit",
                    actor: "Decision Engine",
                }),
            ]);
            alerts = [
                ...buildRecommendationAlerts(newest.action, formatSimClock(sec)),
                ...alerts,
            ].slice(0, 24);
        }

        if (classification.manualOverride && sec === 30) {
            alerts = [
                ...buildClassificationAlerts(classification.level, classification.reason, formatSimClock(sec)),
                ...alerts,
            ].slice(0, 24);
        }

        const trustInputs = {
            classification,
            plant,
            sensorFaultActive: plantStep.events.some((event) => event.toLowerCase().includes("sensor")),
            hasAlertedSinceDeclaration: alerts.length > 0,
            responseLagSec: Math.max(0, sec - 30),
        };
        trust = stepTrust(trust, trustInputs);

        routeProgress = clamp(INITIAL_ROUTE_PROGRESS + sec * 0.48, 0, 100);
        recommendations = nextRecommendations;

        const approvedShelters = new Set(
            recommendations
                .filter((recommendation) => recommendation.action === "shelter" && sec >= 72)
                .slice(0, 2)
                .map((recommendation) => recommendation.id),
        );
        void approvedShelters;

        const statCardsInput = deriveStatCards(
            {
                coreTempC: plant.coreTempC,
                radiationSvH: plant.radiationSvH,
                populationAtRiskCount: Math.round(160000 + sec * 1500),
                sheltersOperational: Math.round(clamp(39 + sec * 0.05, 39, 52)),
                sheltersTotal: 52,
                responseUnitsDeployed: Math.round(120 + sec * 2.2),
                evacuationProgressPct: routeProgress,
                trustIndex: trust.national,
                commsUptimePct: clamp(99.3 - (sec > 90 ? 0.5 : 0), 96.5, 99.4),
            },
            histories,
        );
        histories = statCardsInput.histories;
    }

    const finalWind = windForSec(currentSec);
    plumeInput = plumeInputFor(plant, finalWind, currentSec);

    const routeData = computeRoutes(plumeInput, routeProgress);
    const statCards = deriveStatCards(
        {
            coreTempC: plant.coreTempC,
            radiationSvH: plant.radiationSvH,
            populationAtRiskCount: Math.round(160000 + currentSec * 1500),
            sheltersOperational: Math.round(clamp(39 + currentSec * 0.05, 39, 52)),
            sheltersTotal: 52,
            responseUnitsDeployed: Math.round(120 + currentSec * 2.2),
            evacuationProgressPct: routeProgress,
            trustIndex: trust.national,
            commsUptimePct: clamp(99.3 - (currentSec > 90 ? 0.5 : 0), 96.5, 99.4),
        },
        histories,
    ).cards;

    return {
        phase: phaseForSec(currentSec).phase,
        phaseLabel: phaseForSec(currentSec).label,
        simSec: currentSec,
        plant,
        classification,
        trust,
        alerts,
        timeline,
        recommendations,
        routeData,
        routeProgress,
        plumeInput,
        statCards,
        trustRegions: trust.regions,
    };
}

export function useDemoSimulation() {
    const [running, setRunning] = useState(false);
    const [paused, setPaused] = useState(false);
    const [simSec, setSimSec] = useState(0);
    const [scenario, setScenario] = useState<ScenarioId>("loss_of_coolant");

    useEffect(() => {
        if (!running || paused) return;
        const id = window.setInterval(() => {
            setSimSec((current) => Math.min(142, current + SIM_TICK_MS / 1000));
        }, SIM_TICK_MS);
        return () => window.clearInterval(id);
    }, [running, paused]);

    const snapshot = useMemo(() => createDemoSnapshot(simSec, scenario), [scenario, simSec]);

    const start = () => {
        setScenario("loss_of_coolant");
        setSimSec(0);
        setPaused(false);
        setRunning(true);
    };

    const pause = () => setPaused(true);
    const resume = () => setPaused(false);
    const restart = () => {
        setSimSec(0);
        setPaused(false);
        setRunning(true);
    };

    return {
        running,
        paused,
        start,
        pause,
        resume,
        restart,
        simSec: snapshot.simSec,
        phase: snapshot.phase,
        phaseLabel: snapshot.phaseLabel,
        plant: snapshot.plant,
        classification: snapshot.classification,
        trust: snapshot.trust,
        alerts: snapshot.alerts,
        timeline: snapshot.timeline,
        recommendations: snapshot.recommendations,
        routeData: snapshot.routeData,
        routeProgress: snapshot.routeProgress,
        plumeInput: snapshot.plumeInput,
        statCards: snapshot.statCards,
        trustRegions: snapshot.trustRegions,
    };
}
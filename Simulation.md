# Simulation

## Pipeline

The demo uses a pure simulation pipeline in `src/sim/`.

1. `plantEngine.ts` advances the physical plant state.
2. `classificationEngine.ts` maps plant state to emergency level.
3. `doseEngine.ts` estimates dose by population center.
4. `decisionEngine.ts` derives protective recommendations.
5. `routeEngine.ts` computes evacuation corridors against plume exposure.
6. `alertEngine.ts` converts state changes into public-facing alerts.
7. `trustEngine.ts` smooths public trust and misinformation sentiment.
8. `statCards.ts` formats the overview metrics.
9. `timelineEngine.ts` appends readable event history.

## Demo Phases

The scripted demo presents these beats in order:

1. Normal Operation
2. Wind Change
3. Scenario Selection
4. Emergency Declaration
5. Plant Escalation
6. Plume Expansion
7. Protective Decisions
8. Route Optimization
9. Public Alerts
10. Trust Portal Transition
11. Timeline Growth

## Inputs

The demo snapshot derives from:

- plant telemetry
- wind speed and direction
- active scenario forcing
- plume release strength
- emergency classification state
- route evacuation progress
- trust and alert history

## Output Surfaces

- Overview cards show reactor, radiation, evacuation, and trust trends.
- The map displays the sector, plume, and location markers.
- The decision panel shows active protective actions.
- The route panel shows rerouting and congestion.
- The alert feed mirrors the broadcast log.
- The trust panel shows sentiment drift.
- The timeline records the incident story.

## Error Handling

The simulation uses safe fallbacks when inputs are missing or inactive:

- plume generation stays inert when the source term is zero
- route computation falls back to non-plume paths when needed
- the UI falls back to baseline mock data when demo mode is not running

## Limits

The model is intentionally synthetic and tuned for plausibility, not authoritative safety analysis.
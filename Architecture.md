# Architecture

## Overview

SENTINEL-BD is organized as a single-page control dashboard. The app shell lives in `src/App.tsx` and coordinates the layout, navigation, and demo mode.

The main design principle is one live snapshot flowing into multiple presentation panels. The simulation is computed once per tick and the results are fanned out into the map, route optimizer, decision panel, alerts, timeline, trust panel, and overview cards.

## Folder Structure

- `src/components/` - UI panels, layout, and reusable atoms
- `src/data/` - static GIS points, fallback content, and baseline constants
- `src/hooks/` - reactive hooks, including the demo simulation hook
- `src/sim/` - pure simulation engines and scoring logic
- `src/types/` - shared UI and data model types
- `public/` - static assets for deployment

## Runtime Flow

1. `useDemoSimulation()` owns the demo clock and derived snapshot.
2. The hook advances plant state, classification, dose, routes, trust, and alerts from the same tick.
3. `App` passes those values into the dashboard panels as props.
4. `MapContainer` forwards plume input into `GisMap`, which forwards it into the plume layer.
5. Each panel renders from live data with static fallback values when demo mode is idle.

## Important Boundaries

- `src/sim/` is pure and side-effect free.
- `src/components/` is presentational and should not own core simulation logic.
- `src/hooks/useDemoSimulation.ts` is the only place that orchestrates the scripted demo.

## Performance Notes

- The map is the heaviest part of the UI.
- The plume layer should only receive new input when the demo clock changes.
- Overview cards and timeline rows use short histories to keep rerender cost low.

## Accessibility Notes

- Buttons and interactive controls should keep explicit labels.
- Motion should remain readable under reduced-motion preferences.
- Panels that update live should expose their state clearly to assistive tech.
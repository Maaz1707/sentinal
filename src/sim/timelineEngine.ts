import type { Severity, TimelineCategory, TimelineEvent } from "../types";

const MAX_TIMELINE_LENGTH = 60;

let timelineSequence = 0;

/** Formats simulation seconds as a 24h HH:MM:SS clock, matching the console's readouts. */
export function formatSimClock(nowSec: number): string {
  const total = Math.max(0, Math.round(nowSec)) % 86_400;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export interface TimelineEventInput {
  nowSec: number;
  category: TimelineCategory;
  title: string;
  description: string;
  severity: Severity;
  icon: string;
  actor: string;
}

export function createTimelineEvent(input: TimelineEventInput): TimelineEvent {
  timelineSequence += 1;
  return {
    id: `evt-${timelineSequence}`,
    time: formatSimClock(input.nowSec),
    title: input.title,
    description: input.description,
    severity: input.severity,
    icon: input.icon,
    actor: input.actor,
    category: input.category,
  };
}

/** Prepends a new event (newest-first, matching EmergencyTimeline's rendering order) and caps history length. */
export function pushTimelineEvents(timeline: TimelineEvent[], events: TimelineEvent[]): TimelineEvent[] {
  if (events.length === 0) return timeline;
  return [...events.slice().reverse(), ...timeline].slice(0, MAX_TIMELINE_LENGTH);
}

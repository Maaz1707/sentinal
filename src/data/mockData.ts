import type {
  AlertItem,
  DecisionOption,
  NavItem,
  ReasoningStep,
  RouteDatum,
  StatCardDatum,
  TimelineEvent,
  TrustRegion,
} from "../types";

export const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "map", label: "Situation Map", icon: "Map" },
  { id: "decision", label: "Decision Engine", icon: "BrainCircuit" },
  { id: "timeline", label: "Timeline", icon: "History" },
  { id: "alerts", label: "Alert Feed", icon: "Siren", badge: 6 },
  { id: "routes", label: "Route Optimizer", icon: "Route" },
  { id: "trust", label: "Public Trust", icon: "Users" },
  { id: "assets", label: "Field Assets", icon: "Truck" },
  { id: "comms", label: "Comms Relay", icon: "RadioTower" },
  { id: "settings", label: "System Config", icon: "Settings" },
  { id: "design-system", label: "Design System", icon: "Palette" },
];

export const STAT_CARDS: StatCardDatum[] = [
  {
    id: "core-temp",
    label: "Reactor Core Temp",
    value: "312.4",
    unit: "°C",
    delta: 1.8,
    deltaLabel: "vs 10m avg",
    trend: [301, 303, 305, 304, 308, 310, 312.4],
    severity: "high",
    icon: "Thermometer",
    footnote: "Unit 1 · Rooppur NPP",
  },
  {
    id: "radiation",
    label: "Ambient Radiation",
    value: "0.34",
    unit: "µSv/h",
    delta: -2.1,
    deltaLabel: "vs baseline",
    trend: [0.4, 0.38, 0.37, 0.36, 0.35, 0.35, 0.34],
    severity: "low",
    icon: "Radiation",
    footnote: "Perimeter sensor grid · 24 nodes",
  },
  {
    id: "population",
    label: "Population at Risk",
    value: "184,200",
    delta: 6.4,
    deltaLabel: "expanding radius",
    trend: [140, 152, 160, 168, 172, 179, 184.2],
    severity: "critical",
    icon: "Users",
    footnote: "12km precautionary zone",
  },
  {
    id: "shelters",
    label: "Shelters Operational",
    value: "47",
    unit: "/ 52",
    delta: 3,
    deltaLabel: "opened last hour",
    trend: [30, 34, 38, 41, 43, 45, 47],
    severity: "moderate",
    icon: "Home",
    footnote: "Capacity utilization 68%",
  },
  {
    id: "units",
    label: "Response Units Deployed",
    value: "231",
    delta: 18,
    deltaLabel: "since T+0",
    trend: [120, 150, 170, 190, 205, 220, 231],
    severity: "info",
    icon: "Truck",
    footnote: "Medical · Hazmat · Police · Army",
  },
  {
    id: "evac",
    label: "Evacuation Progress",
    value: "62.8",
    unit: "%",
    delta: 9.2,
    deltaLabel: "last 30 min",
    trend: [12, 24, 35, 44, 51, 57, 62.8],
    severity: "moderate",
    icon: "Route",
    footnote: "Zone A–C · ETA completion 02:14:00",
  },
  {
    id: "trust",
    label: "Public Trust Index",
    value: "71",
    unit: "/ 100",
    delta: -4.3,
    deltaLabel: "sentiment dip",
    trend: [82, 80, 78, 76, 74, 72, 71],
    severity: "moderate",
    icon: "ShieldCheck",
    footnote: "National sentiment aggregate",
  },
  {
    id: "comms",
    label: "Comms Network Uptime",
    value: "99.2",
    unit: "%",
    delta: 0.1,
    deltaLabel: "stable",
    trend: [98.8, 98.9, 99.0, 99.1, 99.1, 99.2, 99.2],
    severity: "low",
    icon: "RadioTower",
    footnote: "SIM + satellite fallback active",
  },
];

export const DECISION_OPTIONS: DecisionOption[] = [
  {
    id: "opt-1",
    title: "Expand evacuation radius to 20km",
    description: "Wind-shift model projects plume drift toward Ishwardi within 90 minutes. Pre-emptive expansion reduces exposure risk by an estimated 34%.",
    confidence: 91,
    riskScore: 22,
    impact: "+96,000 people relocated",
    recommended: true,
  },
  {
    id: "opt-2",
    title: "Hold current 15km perimeter",
    description: "Maintain existing exclusion ring pending confirmed core stabilization telemetry from Unit 1 control room.",
    confidence: 64,
    riskScore: 58,
    impact: "No additional displacement",
  },
  {
    id: "opt-3",
    title: "Issue national broadcast alert (EAS)",
    description: "Trigger Emergency Alert System across 4 divisions with shelter-in-place guidance for zones outside evac radius.",
    confidence: 88,
    riskScore: 12,
    impact: "31M devices reached",
  },
];

export const REASONING_STEPS: ReasoningStep[] = [
  { id: "r1", text: "Ingesting core telemetry stream — pressure delta +4.2% over 6 min window", weight: 0.82 },
  { id: "r2", text: "Cross-referencing meteorological model — surface wind vector 214° at 18km/h", weight: 0.74 },
  { id: "r3", text: "Population density raster overlay computed for 12–24km band", weight: 0.9 },
  { id: "r4", text: "Historical precedent match: Fukushima Daiichi Day 1 evacuation curve (r=0.87)", weight: 0.68 },
  { id: "r5", text: "Route capacity simulation across 6 corridors — 2 flagged near saturation", weight: 0.71 },
  { id: "r6", text: "Confidence-weighted recommendation synthesized", weight: 0.91 },
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { id: "t1", time: "02:14:08", title: "Anomalous pressure reading — Unit 1", description: "Primary coolant loop pressure exceeded nominal threshold by 3.1%.", severity: "moderate", icon: "AlertTriangle", actor: "SCADA Monitor", category: "plant" },
  { id: "t2", time: "02:16:41", title: "Automatic SCRAM initiated", description: "Reactor protection system triggered control rod insertion sequence.", severity: "high", icon: "Zap", actor: "Reactor Protection System", category: "plant" },
  { id: "t3", time: "02:19:55", title: "National Control declares Site Emergency", description: "Emergency classification escalated per IAEA INES protocol.", severity: "high", icon: "ShieldAlert", actor: "NPCB Duty Officer", category: "classification" },
  { id: "t4", time: "02:24:12", title: "12km exclusion ring authorized", description: "Precautionary evacuation order issued for Ishwardi Upazila.", severity: "critical", icon: "Siren", actor: "Emergency Ops Director", category: "decision" },
  { id: "t5", time: "02:31:30", title: "SENTINEL-BD decision engine engaged", description: "AI advisory system activated to model evacuation and containment options.", severity: "info", icon: "BrainCircuit", actor: "SENTINEL-BD", category: "decision" },
  { id: "t6", time: "02:47:03", title: "First public alert dispatched", description: "SMS + EAS broadcast reached 4.2M subscribers across Rajshahi division.", severity: "moderate", icon: "MessageSquareWarning", actor: "Public Alert System", category: "alert" },
  { id: "t7", time: "03:02:19", title: "International advisory notified", description: "IAEA and neighboring national authorities notified per treaty obligation.", severity: "info", icon: "Globe2", actor: "Foreign Affairs Liaison", category: "operator" },
];

export const TRUST_REGIONS: TrustRegion[] = [
  { id: "d1", name: "Rajshahi", trust: 74, sentiment: "neutral" },
  { id: "d2", name: "Rangpur", trust: 81, sentiment: "positive" },
  { id: "d3", name: "Khulna", trust: 68, sentiment: "neutral" },
  { id: "d4", name: "Dhaka", trust: 63, sentiment: "negative" },
  { id: "d5", name: "Barishal", trust: 77, sentiment: "positive" },
  { id: "d6", name: "Mymensingh", trust: 70, sentiment: "neutral" },
];

export const ALERTS: AlertItem[] = [
  { id: "a1", time: "03:11:02", title: "Evacuation radius expanded", message: "Precautionary zone increased from 15km to 20km. Ishwardi and surrounding unions instructed to evacuate immediately.", severity: "critical", channel: "EAS + SMS", region: "Ishwardi", acknowledged: false },
  { id: "a2", time: "03:04:47", title: "Shelter capacity warning", message: "Pabna Govt. College shelter at 92% capacity. Overflow routed to Ishwardi Polytechnic.", severity: "high", channel: "Ops Radio", region: "Pabna", acknowledged: false },
  { id: "a3", time: "02:58:15", title: "Wind vector update", message: "Surface wind shifted to 214°, plume model re-run. Updated projection available.", severity: "moderate", channel: "Internal", region: "Meteorological", acknowledged: true },
  { id: "a4", time: "02:51:30", title: "Misinformation spike detected", message: "Unverified claims of 'meltdown' trending on regional social channels. Fact-check bulletin queued.", severity: "high", channel: "Social Monitor", region: "National", acknowledged: false },
  { id: "a5", time: "02:47:03", title: "Public alert dispatched", message: "SMS + EAS broadcast reached 4.2M subscribers across Rajshahi division.", severity: "moderate", channel: "EAS + SMS", region: "Rajshahi", acknowledged: true },
  { id: "a6", time: "02:24:12", title: "Exclusion ring authorized", message: "12km precautionary evacuation order issued for Ishwardi Upazila.", severity: "critical", channel: "Ops Directive", region: "Ishwardi", acknowledged: true },
  { id: "a7", time: "02:19:55", title: "Site Emergency declared", message: "Emergency classification escalated per IAEA INES protocol level 4.", severity: "high", channel: "Internal", region: "Rooppur NPP", acknowledged: true },
];

export const ROUTES: RouteDatum[] = [
  { id: "rt1", name: "Corridor Alpha", from: "Ishwardi", to: "Rajshahi Staging", status: "congested", etaMinutes: 58, capacityUsed: 88, vehicles: 342, distanceKm: 42 },
  { id: "rt2", name: "Corridor Bravo", from: "Pabna Sadar", to: "Kushtia Shelter Hub", status: "optimal", etaMinutes: 34, capacityUsed: 54, vehicles: 210, distanceKm: 31 },
  { id: "rt3", name: "Corridor Charlie", from: "Ishwardi", to: "Natore Relief Camp", status: "rerouted", etaMinutes: 71, capacityUsed: 63, vehicles: 178, distanceKm: 55 },
  { id: "rt4", name: "Corridor Delta", from: "Bheramara", to: "Kushtia Shelter Hub", status: "blocked", etaMinutes: 0, capacityUsed: 100, vehicles: 96, distanceKm: 19 },
  { id: "rt5", name: "Corridor Echo", from: "Pabna Sadar", to: "Sirajganj Overflow", status: "optimal", etaMinutes: 41, capacityUsed: 39, vehicles: 124, distanceKm: 37 },
];

export const OPERATOR = {
  name: "Lt. Col. Fahim Rahman",
  role: "Duty Emergency Director",
  station: "National Emergency Operations Centre, Dhaka",
  shift: "Alpha Shift · 00:00–08:00",
};

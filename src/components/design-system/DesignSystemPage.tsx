import type { ReactNode } from "react";
import { GlassPanel } from "../ui/GlassPanel";
import { Icon } from "../ui/Icon";
import { ICONS } from "../ui/iconMap";
import { Badge } from "../ui/Badge";
import { SeverityBadge } from "../ui/SeverityBadge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Spinner, RadarSpinner } from "../ui/Spinner";
import { Skeleton, SkeletonCard } from "../ui/Skeleton";
import { ProgressBar } from "../ui/ProgressBar";
import { RadialGauge } from "../ui/RadialGauge";
import { Sparkline } from "../ui/Sparkline";
import { MiniBarChart } from "../ui/MiniBarChart";
import { STATUS, type Status } from "../../data/status";
import type { Severity } from "../../types";
import { cn } from "../../lib/cn";

const STATUSES: Status[] = ["success", "warning", "critical", "radiation", "info", "neutral"];
const SEVERITIES: Severity[] = ["critical", "high", "moderate", "low", "info"];

const SURFACES = [
  { name: "Void", varName: "--color-void", note: "App background" },
  { name: "Abyss", varName: "--color-abyss", note: "Recessed wells" },
  { name: "Panel", varName: "--color-panel", note: "Glass panel fill" },
  { name: "Elevated", varName: "--color-elevated", note: "Solid panel fill" },
];

const ACCENTS = [
  { name: "Cyan", glow: "--color-cyan-glow", dim: "--color-cyan-dim", role: "Primary / informational" },
  { name: "Amber", glow: "--color-amber-glow", dim: "--color-amber-dim", role: "Warning" },
  { name: "Crimson", glow: "--color-crimson", dim: "--color-crimson-dim", role: "Critical" },
  { name: "Emerald", glow: "--color-emerald-glow", dim: "--color-emerald-dim", role: "Success / nominal" },
  { name: "Violet", glow: "--color-violet-glow", dim: "--color-violet-dim", role: "Advisory" },
  { name: "Radiation", glow: "--color-radiation-glow", dim: "--color-radiation-dim", role: "Ionizing hazard" },
];

const INK_SCALE = [
  { name: "Ink 100", varName: "--color-ink-100", note: "Primary text" },
  { name: "Ink 300", varName: "--color-ink-300", note: "Secondary text" },
  { name: "Ink 500", varName: "--color-ink-500", note: "Muted / labels" },
  { name: "Ink 700", varName: "--color-ink-700", note: "Disabled / hairline" },
];

const TYPE_SPECIMENS = [
  { cls: "text-micro", token: "--text-micro", size: "9px", use: "Micro readouts" },
  { cls: "text-2xs", token: "--text-2xs", size: "10.5px", use: "Eyebrows, timestamps" },
  { cls: "text-xs", token: "--text-xs", size: "11.5px", use: "Meta labels" },
  { cls: "text-sm", token: "--text-sm", size: "13px", use: "Body copy" },
  { cls: "text-base", token: "--text-base", size: "14.5px", use: "Emphasized body" },
  { cls: "text-lg", token: "--text-lg", size: "18px", use: "Section titles" },
  { cls: "text-xl", token: "--text-xl", size: "22px", use: "Panel headlines" },
  { cls: "text-2xl", token: "--text-2xl", size: "28px", use: "Stat values" },
  { cls: "text-3xl", token: "--text-3xl", size: "36px", use: "Hero metrics" },
];

const SPACING_SCALE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32];

const ANIMATIONS = [
  { name: "rise-in", token: "--animate-rise", use: "Panel & card mount" },
  { name: "pulse-glow", token: "--animate-pulse-slow", use: "Live indicators" },
  { name: "blink", token: "--animate-blink", use: "Critical alerts" },
  { name: "scan", token: "--animate-scan", use: "Scanning overlays" },
  { name: "radar-sweep", token: "--animate-radar", use: "Radar / loading" },
  { name: "shimmer", token: "--animate-shimmer", use: "Skeleton loading" },
  { name: "marquee", token: "--animate-marquee", use: "Ticker text" },
  { name: "grid-pan", token: "--animate-grid-pan", use: "Ambient background" },
];

function SectionHeader({ index, title, description }: { index: string; title: string; description?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-ink-500">{index}</span>
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-ink-100">{title}</h2>
      </div>
      {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-300">{description}</p>}
    </div>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 border-b border-line pb-8 last:border-0">
      {children}
    </section>
  );
}

function Swatch({ label, sub, style }: { label: string; sub: string; style: React.CSSProperties }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] p-3">
      <div className="h-10 w-10 shrink-0 rounded-lg border border-line-strong" style={style} />
      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-ink-100">{label}</p>
        <p className="truncate font-mono text-[10px] text-ink-500">{sub}</p>
      </div>
    </div>
  );
}

function ColorsSection() {
  return (
    <Section id="colors">
      <SectionHeader
        index="01"
        title="Colors"
        description="Base surfaces build the tactical dark canvas; accent colors carry meaning and are never purely decorative."
      />

      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">Surfaces</p>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SURFACES.map((s) => (
          <Swatch key={s.name} label={s.name} sub={s.note} style={{ background: `var(${s.varName})` }} />
        ))}
      </div>

      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">
        Status &amp; Emergency Accents
      </p>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ACCENTS.map((a) => (
          <div key={a.name} className="rounded-lg border border-line bg-white/[0.02] p-3">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 shrink-0 rounded-lg border border-line-strong"
                style={{ background: `var(${a.glow})` }}
              />
              <div
                className="h-8 w-8 shrink-0 rounded-lg border border-line-strong"
                style={{ background: `var(${a.dim})` }}
              />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-ink-100">{a.name}</p>
                <p className="truncate font-mono text-[10px] text-ink-500">{a.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">Ink (text) scale</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INK_SCALE.map((s) => (
          <Swatch key={s.name} label={s.name} sub={s.note} style={{ background: `var(${s.varName})` }} />
        ))}
      </div>
    </Section>
  );
}

function TypographySection() {
  return (
    <Section id="typography">
      <SectionHeader
        index="02"
        title="Typography"
        description="Chakra Petch for display/headings, Inter for body copy, JetBrains Mono for data readouts, labels and timestamps."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-white/[0.02] p-4">
          <p className="font-display text-xl text-ink-100">Aa Display</p>
          <p className="mt-1 font-mono text-[10px] text-ink-500">font-display · Chakra Petch</p>
        </div>
        <div className="rounded-lg border border-line bg-white/[0.02] p-4">
          <p className="font-sans text-xl text-ink-100">Aa Sans</p>
          <p className="mt-1 font-mono text-[10px] text-ink-500">font-sans · Inter</p>
        </div>
        <div className="rounded-lg border border-line bg-white/[0.02] p-4">
          <p className="font-mono text-xl text-ink-100">Aa Mono</p>
          <p className="mt-1 font-mono text-[10px] text-ink-500">font-mono · JetBrains Mono</p>
        </div>
      </div>

      <div className="divide-y divide-line rounded-lg border border-line">
        {TYPE_SPECIMENS.map((t) => (
          <div key={t.cls} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
            <span className={cn("font-display text-ink-100", t.cls)}>{t.use}</span>
            <span className="font-mono text-[10px] text-ink-500">
              {t.cls} · {t.token} · {t.size}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SpacingSection() {
  return (
    <Section id="spacing">
      <SectionHeader
        index="03"
        title="Spacing"
        description="4px base unit (Tailwind's default scale). Use multiples of 1 for tight control chrome, 4 for card padding, 6-8 for section gaps."
      />
      <div className="space-y-2 rounded-lg border border-line bg-white/[0.02] p-4">
        {SPACING_SCALE.map((n) => (
          <div key={n} className="flex items-center gap-3">
            <span className="w-14 shrink-0 font-mono text-[10px] text-ink-500">
              {n} · {n * 4}px
            </span>
            <div className="h-2.5 rounded-sm bg-cyan-glow/60" style={{ width: n * 4 }} />
          </div>
        ))}
      </div>
    </Section>
  );
}

function IconsSection() {
  const names = Object.keys(ICONS);
  return (
    <Section id="icons">
      <SectionHeader
        index="04"
        title="Icons"
        description={`Lucide icon set (${names.length} registered). Reference by name through the Icon component — never import lucide icons directly in feature code.`}
      />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {names.map((name) => (
          <div
            key={name}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-3 text-ink-300"
            title={name}
          >
            <Icon name={name} size={17} strokeWidth={2} />
            <span className="w-full truncate text-center font-mono text-[8.5px] text-ink-500">{name}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AnimationsSection() {
  return (
    <Section id="animations">
      <SectionHeader
        index="05"
        title="Animations"
        description="Ambient loop animations signal a live, monitored system. Entrance motion uses the --ease-out timing function across all panels and cards."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ANIMATIONS.map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-2 rounded-lg border border-line bg-white/[0.02] p-4">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-cyan-glow/30 text-cyan-glow">
              {a.name === "rise-in" && <span className="h-3 w-3 rounded-full bg-current animate-rise" />}
              {a.name === "pulse-glow" && <span className="h-3 w-3 rounded-full bg-current animate-pulse-slow" />}
              {a.name === "blink" && <span className="h-3 w-3 rounded-full bg-current animate-blink" />}
              {a.name === "scan" && (
                <span className="absolute inset-x-0 h-px bg-current animate-scan" />
              )}
              {a.name === "radar-sweep" && (
                <span
                  className="h-full w-full origin-center animate-radar bg-gradient-to-t from-current to-transparent opacity-50"
                  style={{ clipPath: "polygon(50% 50%, 50% 0, 100% 0)" }}
                />
              )}
              {a.name === "shimmer" && <div className="skeleton-shimmer h-full w-full" />}
              {a.name === "marquee" && <Icon name="ArrowRight" size={16} className="animate-marquee" />}
              {a.name === "grid-pan" && <div className="grid-overlay h-full w-full animate-grid-pan" />}
            </div>
            <p className="text-[11px] font-medium text-ink-100">{a.name}</p>
            <p className="text-center font-mono text-[9px] text-ink-500">{a.use}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ButtonsSection() {
  return (
    <Section id="buttons">
      <SectionHeader
        index="06"
        title="Buttons"
        description="Primary for the single most important action per view, secondary/outline/ghost for supporting actions, danger/success for irreversible or confirming operations."
      />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon="ShieldCheck">Primary</Button>
          <Button variant="secondary" icon="Route">Secondary</Button>
          <Button variant="outline" icon="Settings">Outline</Button>
          <Button variant="ghost" icon="Search">Ghost</Button>
          <Button variant="danger" icon="Siren">Danger</Button>
          <Button variant="success" icon="CheckCircle2">Success</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" icon="Zap">Small</Button>
          <Button size="md" icon="Zap">Medium</Button>
          <Button size="lg" icon="Zap">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled icon="Lock">Disabled</Button>
        </div>
      </div>
    </Section>
  );
}

function CardsSection() {
  return (
    <Section id="cards">
      <SectionHeader
        index="07"
        title="Cards"
        description="Cards are lightweight surfaces for list rows and tiles. Panels (below) are for titled, self-contained sections."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card status="info">
          <p className="text-[12.5px] font-medium text-ink-100">Static card</p>
          <p className="mt-1 text-[11px] text-ink-500">Default surface, informational accent.</p>
        </Card>
        <Card status="critical" interactive>
          <p className="text-[12.5px] font-medium text-ink-100">Interactive card</p>
          <p className="mt-1 text-[11px] text-ink-500">Hover-lifts; critical accent bar.</p>
        </Card>
        <Card status="success" solid onClick={() => {}}>
          <p className="text-[12.5px] font-medium text-ink-100">Clickable card</p>
          <p className="mt-1 text-[11px] text-ink-500">Solid fill, keyboard-focusable button role.</p>
        </Card>
      </div>
    </Section>
  );
}

function PanelsSection() {
  return (
    <Section id="panels">
      <SectionHeader
        index="08"
        title="Panels"
        description="GlassPanel is the primary container for titled sections: header, optional live badge, corner brackets, top accent line."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassPanel title="Reactor Status" subtitle="Unit 1 · Rooppur" icon="Thermometer" accent="amber" live>
          <p className="text-[12px] text-ink-300">Panel body content renders here, padded by default.</p>
        </GlassPanel>
        <GlassPanel title="Evacuation" subtitle="Zone A–C" icon="Route" accent="emerald">
          <ProgressBar value={62.8} colorClass="bg-emerald-glow" />
        </GlassPanel>
        <GlassPanel title="Radiological" subtitle="Site perimeter" icon="Radiation" accent="crimson" noPadding>
          <div className="p-4 text-[12px] text-ink-300">noPadding lets content control its own inset.</div>
        </GlassPanel>
      </div>
    </Section>
  );
}

function BadgesSection() {
  return (
    <Section id="badges">
      <SectionHeader
        index="09"
        title="Badges"
        description="SeverityBadge grades incident severity; the generic Badge communicates system/operational status."
      />
      <div className="space-y-4">
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">Severity</p>
          <div className="flex flex-wrap gap-2">
            {SEVERITIES.map((s) => (
              <SeverityBadge key={s} severity={s} pulse={s === "critical"} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Badge key={s} status={s} pulse={s === "critical" || s === "radiation"}>
                {STATUS[s].label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function ChartsSection() {
  return (
    <Section id="charts">
      <SectionHeader
        index="10"
        title="Charts"
        description="Minimal, dependency-free SVG readouts styled to match panel chrome: gauges for single KPIs, sparklines for trend, bars for comparison."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-line bg-white/[0.02] p-4">
          <RadialGauge value={73} colorClass="text-cyan-glow" label="Capacity" sublabel="Shelter network" />
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-lg border border-line bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Sparkline</p>
          <Sparkline data={[301, 303, 305, 304, 308, 310, 312.4]} colorClass="text-amber-glow" width={140} height={40} />
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-lg border border-line bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Mini bar chart</p>
          <MiniBarChart data={[4, 8, 6, 12, 9, 14, 7]} colorClass="text-violet-glow" height={56} />
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-lg border border-line bg-white/[0.02] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Progress bars</p>
          <ProgressBar value={82} colorClass="bg-emerald-glow" />
          <ProgressBar value={47} colorClass="bg-amber-glow" striped />
          <ProgressBar value={18} colorClass="bg-crimson" />
        </div>
      </div>
    </Section>
  );
}

function LoadingSection() {
  return (
    <Section id="loading">
      <SectionHeader
        index="11"
        title="Loading States"
        description="Spinner for inline/button waits, RadarSpinner for full-panel async loads, Skeleton for content that will pop in once fetched."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-line bg-white/[0.02] p-6">
          <div className="flex items-center gap-4 text-cyan-glow">
            <Spinner size={20} />
            <Spinner size={28} className="text-amber-glow" />
            <Spinner size={36} className="text-crimson" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Spinner</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-line bg-white/[0.02] p-6">
          <RadarSpinner size={64} colorClass="text-cyan-glow" label="Acquiring signal" />
        </div>
        <div className="rounded-lg border border-line bg-white/[0.02] p-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">Skeleton</p>
          <div className="space-y-2">
            <Skeleton height={10} width="70%" />
            <Skeleton height={10} width="45%" />
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SkeletonCard />
      </div>
    </Section>
  );
}

function HoverTransitionsSection() {
  return (
    <Section id="hover">
      <SectionHeader
        index="12"
        title="Hover Effects & Transitions"
        description="Interactive surfaces lift 2px and firm up their border on hover; motion tokens keep timing consistent across the app."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="hover-lift interactive-surface flex h-24 items-center justify-center rounded-lg border border-line bg-white/[0.02] text-[11px] text-ink-300">
          .hover-lift
        </div>
        <div className="flex h-24 items-center justify-center rounded-lg border border-line bg-white/[0.02] text-[11px] text-ink-300 transition-transform duration-[var(--duration-md)] ease-[var(--ease-out)] hover:scale-105">
          scale-105 · duration-md
        </div>
        <div className="focus-ring flex h-24 items-center justify-center rounded-lg border border-line bg-white/[0.02] text-[11px] text-ink-300" tabIndex={0}>
          Tab to see .focus-ring
        </div>
      </div>
    </Section>
  );
}

export function DesignSystemPage() {
  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 p-4 md:p-5">
      <header className="rounded-xl border border-line bg-white/[0.02] p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-glow">SENTINEL-BD</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-100">Design System</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-300">
          A single tactical visual language for a nuclear/radiological emergency command console:
          dark, high-contrast surfaces; mono readouts for data; a restrained accent palette where
          color always encodes meaning. Every component below is the actual reusable primitive
          used across the dashboard, not a mockup.
        </p>
      </header>

      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <IconsSection />
      <AnimationsSection />
      <ButtonsSection />
      <CardsSection />
      <PanelsSection />
      <BadgesSection />
      <ChartsSection />
      <LoadingSection />
      <HoverTransitionsSection />
    </div>
  );
}

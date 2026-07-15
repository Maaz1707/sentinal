import { useState } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "../ui/GlassPanel";
import { Icon } from "../ui/Icon";
import { ProgressBar } from "../ui/ProgressBar";
import { DECISION_OPTIONS, REASONING_STEPS } from "../../data/mockData";
import { cn } from "../../lib/cn";
import type { Recommendation } from "../../sim/types";

interface DecisionEnginePanelProps {
  recommendations?: Recommendation[];
}

export function DecisionEnginePanel({ recommendations }: DecisionEnginePanelProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "overridden">("pending");
  const recommended = recommendations?.[0]
    ? {
      title: recommendations[0].title,
      description: recommendations[0].description,
      confidence: recommendations[0].confidence,
      riskScore: recommendations[0].priority,
      impact: recommendations[0].impact,
    }
    : DECISION_OPTIONS.find((o) => o.recommended)!;
  const alternatives = recommendations?.slice(1).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    confidence: item.confidence,
    riskScore: item.priority,
    impact: item.impact,
  })) ?? DECISION_OPTIONS.filter((o) => !o.recommended);

  return (
    <GlassPanel
      title="Emergency Decision Engine"
      subtitle="SENTINEL-BD Advisory Core · Model v4.2.1"
      icon="BrainCircuit"
      accent="violet"
      live
      className="h-full"
      bodyClassName="flex flex-col gap-4"
    >
      <div className="rounded-lg border border-violet-glow/30 bg-violet-glow/[0.06] p-3.5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-glow/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-violet-glow">
            <Icon name="BrainCircuit" size={11} />
            Recommended Action
          </span>
          <span className="font-mono text-[10px] text-ink-500">Confidence {recommended.confidence}%</span>
        </div>

        <p className="mt-2.5 font-display text-[13.5px] font-semibold leading-snug text-ink-100">
          {recommended.title}
        </p>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-400">{recommended.description}</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[9.5px] text-ink-500">
              <span>Confidence</span>
              <span className="text-violet-glow">{recommended.confidence}%</span>
            </div>
            <ProgressBar value={recommended.confidence} colorClass="bg-violet-glow" height={5} />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between font-mono text-[9.5px] text-ink-500">
              <span>Risk Score</span>
              <span className="text-amber-glow">{recommended.riskScore}/100</span>
            </div>
            <ProgressBar value={recommended.riskScore} colorClass="bg-amber-glow" height={5} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="font-mono text-[10.5px] text-ink-300">{recommended.impact}</span>
          {status === "pending" ? (
            <div className="flex gap-2">
              <button
                onClick={() => setStatus("overridden")}
                className="rounded-md border border-line px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-300 transition-colors hover:bg-white/5"
              >
                Override
              </button>
              <button
                onClick={() => setStatus("approved")}
                className="flex items-center gap-1.5 rounded-md bg-violet-glow px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-void transition-opacity hover:opacity-90"
              >
                <Icon name="Check" size={12} />
                Approve
              </button>
            </div>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
                status === "approved" ? "bg-emerald-glow/15 text-emerald-glow" : "bg-crimson/15 text-crimson",
              )}
            >
              <Icon name={status === "approved" ? "CheckCircle2" : "XCircle"} size={12} />
              {status === "approved" ? "Directive Approved" : "Directive Overridden"}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-500">Alternative Options</p>
        {alternatives.map((opt) => (
          <div key={opt.id} className="rounded-lg border border-line bg-white/[0.02] p-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11.5px] font-medium text-ink-200">{opt.title}</p>
              <span className="shrink-0 font-mono text-[9.5px] text-ink-500">{opt.confidence}% conf.</span>
            </div>
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-500">{opt.description}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-lg border border-line bg-black/20 p-3">
        <p className="mb-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest text-ink-500">
          <Icon name="GitBranch" size={11} />
          Reasoning Trace
        </p>
        <div className="space-y-2">
          {REASONING_STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="flex items-start gap-2 font-mono text-[10.5px] leading-relaxed text-ink-400"
            >
              <span className="mt-1 text-violet-glow">›</span>
              <span className="flex-1">{step.text}</span>
              <span className="shrink-0 text-ink-500">{Math.round(step.weight * 100)}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}

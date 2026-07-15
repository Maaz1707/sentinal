import { useRef, useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { TopStatusBar } from "./components/layout/TopStatusBar";
import { Footer } from "./components/layout/Footer";
import { DashboardCards } from "./components/dashboard/DashboardCards";
import { MapContainer } from "./components/map/MapContainer";
import { DecisionEnginePanel } from "./components/decision/DecisionEnginePanel";
import { EmergencyTimeline } from "./components/timeline/EmergencyTimeline";
import { PublicTrustPanel } from "./components/trust/PublicTrustPanel";
import { AlertFeed } from "./components/alerts/AlertFeed";
import { RouteOptimizerPanel } from "./components/routes/RouteOptimizerPanel";
import { DesignSystemPage } from "./components/design-system/DesignSystemPage";
import { useDemoSimulation } from "./hooks/useDemoSimulation";

function App() {
  const [activeId, setActiveId] = useState<string>("overview");
  const [view, setView] = useState<"dashboard" | "design-system">("dashboard");
  const sectionRefs = useRef<Partial<Record<string, HTMLDivElement | null>>>({});
  const demo = useDemoSimulation();

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (id === "design-system") {
      setView("design-system");
      return;
    }
    setView("dashboard");
    const target = sectionRefs.current[id];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-void text-ink-100">
      <TopStatusBar
        phaseLabel={demo.phaseLabel}
        simTime={demo.phase === "normal-operation" ? "00:00:00" : new Date(demo.simSec * 1000).toISOString().slice(11, 19)}
        running={demo.running}
        paused={demo.paused}
        onStart={demo.start}
        onPause={demo.pause}
        onResume={demo.resume}
        onRestart={demo.restart}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={activeId} onSelect={handleSelect} />

        <main className="grid-overlay relative flex-1 overflow-y-auto bg-void">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.05),transparent_60%)]" />

          {view === "design-system" ? (
            <div className="relative">
              <DesignSystemPage />
            </div>
          ) : (
            <div className="relative mx-auto flex max-w-[1800px] flex-col gap-4 p-4 md:p-5">
              <div ref={setRef("overview")} className="scroll-mt-4">
                <DashboardCards cards={demo.statCards} />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="flex flex-col gap-4 xl:col-span-8">
                  <div ref={setRef("map")} className="h-115 scroll-mt-4 lg:h-130">
                    <MapContainer plumeInput={demo.plumeInput} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div ref={setRef("routes")} className="h-130 scroll-mt-4">
                      <RouteOptimizerPanel routes={demo.routeData} />
                    </div>
                    <div ref={setRef("timeline")} className="h-130 scroll-mt-4">
                      <EmergencyTimeline events={demo.timeline} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 xl:col-span-4">
                  <div ref={setRef("decision")} className="scroll-mt-4">
                    <DecisionEnginePanel recommendations={demo.recommendations} />
                  </div>
                  <div ref={setRef("alerts")} className="h-120 scroll-mt-4">
                    <AlertFeed alerts={demo.alerts} />
                  </div>
                  <div ref={setRef("trust")} className="scroll-mt-4">
                    <PublicTrustPanel trust={demo.trust} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;

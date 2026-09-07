"use client";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GridScene } from "@/components/grid/GridScene";
import { IntelligencePanel } from "@/components/dashboard/IntelligencePanel";
import { NodeDetailPanel } from "@/components/dashboard/NodeDetailPanel";
import { Legend } from "@/components/dashboard/Legend";
import { WhatIfSimulator } from "@/components/dashboard/WhatIfSimulator";
import { useGridStore } from "@/store/gridStore";
import { api } from "@/lib/api";
import { getCustomGrid } from "@/lib/customGrid";
import { Map, Layers, Radio, ExternalLink } from "lucide-react";

export default function MapExplorerPage() {
  const [viewMode, setViewMode] = useState<"gis" | "3d">("gis");
  const [customDatasetName, setCustomDatasetName] = useState<string | null>(null);
  const [gisUrl] = useState("/gis/index.html");
  const { showNodeDetail, setGridState, setPrediction, setProcessing } = useGridStore();

  useEffect(() => {
    document.body.classList.add("dark-mode");
    return () => document.body.classList.remove("dark-mode");
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadGrid() {
      setProcessing(true, "grid_state");
      try {
        const customGrid = getCustomGrid();
        if (customGrid) {
          if (isMounted) {
            setGridState(customGrid);
            setPrediction(null);
            setCustomDatasetName(customGrid.grid_id.replace(/^custom-/, ""));
            setViewMode("gis");
          }
          return;
        }
        const state = await api.getGridState();
        if (isMounted) {
          setGridState(state);
          setPrediction(null);
        }
      } catch (e) {
        console.error("Failed to fetch grid state:", e);
      } finally {
        if (isMounted) setProcessing(false);
      }
    }
    loadGrid();
    return () => {
      isMounted = false;
    };
  }, [setGridState, setPrediction, setProcessing]);

  return (
    <>
      <Navbar variant="dark" />
      <main className="pt-16 h-screen w-screen flex flex-col bg-[#080c14] overflow-hidden text-slate-100">
        {/* Top Control Bar with Mode Switcher */}
        <div className="shrink-0 bg-[#0d1322] border-b border-slate-800 px-4 py-2 flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-emerald-400 font-bold">AI CORE: ONLINE</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-300 font-semibold">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>{customDatasetName ? `Custom dataset: ${customDatasetName}` : "National Grid Map Explorer & ML Digital Twin"}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher Tabs */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode("gis")}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === "gis"
                    ? "bg-cyan-600 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Live GIS Map (Port 8000)</span>
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-cyan-600 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ML Risk Analytics</span>
              </button>
            </div>

            {/* Direct Link to Standalone Backend GIS */}
            <a
              href="http://localhost:8000"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 transition"
              title="Open standalone GIS on port 8000"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Full Screen</span>
            </a>
          </div>
        </div>

        {/* Dynamic Display Area */}
        {viewMode === "gis" ? (
          <div className="flex-1 w-full h-full relative bg-[#080c14] overflow-hidden">
            <iframe
              src={gisUrl}
              className="w-full h-full border-0 absolute inset-0"
              title="GridSense Pro GIS SCADA Telemetry & GNN Resiliency Explorer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden relative">
            <div className="flex-1 relative">
              <GridScene />
              <Legend />
              <WhatIfSimulator />
            </div>
            <IntelligencePanel />
            {showNodeDetail && <NodeDetailPanel />}
          </div>
        )}
      </main>
    </>
  );
}

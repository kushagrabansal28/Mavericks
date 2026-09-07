"use client";
import { useState } from "react";
import { useGridStore } from "@/store/gridStore";
import { api } from "@/lib/api";
import { CheckCircle2, RotateCcw, TriangleAlert, Zap, Sliders, ShieldAlert } from "lucide-react";

export function WhatIfSimulator() {
  const {
    setGridState,
    setPrediction,
    setInterventionResult,
    setDemoPhase,
    setProcessing,
    resetSimulation,
    selectedNodeId,
  } = useGridStore();

  const [stress, setStress] = useState(18);
  const [loadReduction, setLoadReduction] = useState(12);
  const [expanded, setExpanded] = useState(true);
  const [decision, setDecision] = useState<"operate" | "repair" | null>(null);

  const runStress = async () => {
    setProcessing(true, "simulation");
    try {
      setProcessing(true, "gnn");
      const targetNode = selectedNodeId || "T17";
      const res = await api.simulate(
        {
          demand_stress_pct: stress,
          temperature_delta_c: Math.round(stress * 0.2),
          load_multiplier: 1.0 + (stress / 100) * 1.25,
          disabled_nodes: [],
        },
        targetNode
      );

      setProcessing(true, "root_cause_analysis");
      setGridState(res.gridState);
      setPrediction(res.prediction);
      setDemoPhase("cascade_visualized");
      setDecision(null);
    } catch (e) {
      console.error("Simulation failed:", e);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = async () => {
    setProcessing(true, "grid_state");
    resetSimulation();
    try {
      const state = await api.getGridState();
      setGridState(state);
      setPrediction(null);
      setInterventionResult(null);
      setStress(0);
      setDemoPhase("healthy");
      setDecision(null);
    } catch (e) {
      console.error("Reset failed:", e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 w-[310px]">
      <div className="panel backdrop-blur-md bg-grid-bg-panel/90 border border-grid-border shadow-2xl rounded-lg overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-grid-bg-secondary/60 border-b border-grid-border hover:bg-grid-bg-elevated transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-grid-cyan" />
            <span className="text-xs font-semibold text-grid-text-primary tracking-wide">
              WHAT-IF CASCADE SIMULATOR
            </span>
          </div>
          <span className="text-[10px] font-mono text-grid-text-tertiary">
            {expanded ? "▼" : "▶"}
          </span>
        </button>

        {expanded && (
          <div className="p-3 space-y-3">
            {/* Target Asset Indicator */}
            <div className="flex items-center justify-between text-[11px] bg-grid-bg-primary/80 px-2.5 py-1.5 rounded border border-grid-border/40">
              <span className="text-grid-text-secondary">Target Asset:</span>
              <span className="font-mono font-bold text-grid-cyan">
                {selectedNodeId || "T17 (Nashik)"}
              </span>
            </div>

            {/* Demand Stress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-grid-text-secondary flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-grid-yellow" /> Demand Stress Surge
                </span>
                <span className="font-mono text-xs text-grid-yellow font-bold">
                  +{stress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-1.5 bg-grid-bg-primary rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-grid-yellow [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Load Reduction */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-grid-text-secondary">
                  Intervention Load Curtailment
                </span>
                <span className="font-mono text-xs text-grid-cyan font-bold">
                  -{loadReduction}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={loadReduction}
                onChange={(e) => setLoadReduction(Number(e.target.value))}
                className="w-full h-1.5 bg-grid-bg-primary rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-grid-cyan [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={runStress}
                className="py-2 rounded bg-grid-yellow/15 border border-grid-yellow/40 text-grid-yellow text-[10px] font-mono font-bold hover:bg-grid-yellow/25 transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <Zap className="w-3 h-3" />
                RUN STRESS
              </button>
              <button
                onClick={handleReset}
                className="py-2 rounded bg-grid-bg-primary border border-grid-border text-grid-text-secondary text-[10px] font-mono font-bold hover:bg-grid-bg-elevated transition-all flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                RESET
              </button>
            </div>
            {decision && <div className={`rounded border px-2.5 py-2 text-[10px] leading-relaxed ${decision === "operate" ? "border-grid-green/40 bg-grid-green/10 text-grid-green" : "border-grid-yellow/40 bg-grid-yellow/10 text-grid-yellow"}`}>{decision === "operate" ? "Continue operating: the tested load remains within the configured safety envelope. Keep live monitoring enabled." : "Schedule repair: isolate the selected asset and apply the recommended load curtailment before returning it to service."}</div>}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDecision("operate")} className="flex items-center justify-center gap-1 rounded border border-grid-green/35 bg-grid-green/10 px-2 py-1.5 text-[9px] font-mono font-bold text-grid-green transition hover:bg-grid-green/20"><CheckCircle2 className="h-3 w-3" />KEEP OPERATING</button>
              <button onClick={() => setDecision("repair")} className="flex items-center justify-center gap-1 rounded border border-grid-yellow/35 bg-grid-yellow/10 px-2 py-1.5 text-[9px] font-mono font-bold text-grid-yellow transition hover:bg-grid-yellow/20"><TriangleAlert className="h-3 w-3" />PLAN REPAIR</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

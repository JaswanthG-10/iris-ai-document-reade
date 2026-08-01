import React from "react";
import { Network, ShieldCheck, Target, Cpu, Activity } from "lucide-react";
import { Card } from "./DesignSystem";

export const KnowledgeMeshCard: React.FC = () => {
  const conceptClusters = [
    { label: "Financial Audits", count: 42, color: "border-purple-500/30 text-purple-600 dark:text-purple-300 bg-purple-500/10" },
    { label: "Compliance & SLA", count: 28, color: "border-cyan-500/30 text-cyan-600 dark:text-cyan-300 bg-cyan-500/10" },
    { label: "Technical Specs", count: 35, color: "border-emerald-500/30 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10" },
    { label: "Contractual Terms", count: 19, color: "border-amber-500/30 text-amber-600 dark:text-amber-300 bg-amber-500/10" }
  ];

  return (
    <Card className="p-6 space-y-5 border-[#E7E9F3] dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Network className="w-4 h-4 text-[#06B6D4]" /> Iris Semantic Mesh & Grounding Analytics
          </h2>
          <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono mt-0.5">
            Vector concept clustering and retrieval precision metrics.
          </p>
        </div>

        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7F9F1] text-[#10B981] font-mono font-bold text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> 100% GROUNDED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Precision RAG Score Card */}
        <div className="p-4 rounded-2xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[#6B7085]">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[#10B981]" /> Retrieval Precision
            </span>
            <span className="text-[#10B981] font-bold text-[11px]">98.6%</span>
          </div>
          <div className="w-full bg-[#E7E9F3] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full w-[98.6%]" />
          </div>
          <p className="text-[10px] text-[#6B7085] dark:text-slate-400">
            Cosine Similarity Match Score against 1536-dim vector embeddings.
          </p>
        </div>

        {/* Hallucination Risk Score Card */}
        <div className="p-4 rounded-2xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[#6B7085]">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4]" /> Hallucination Rate
            </span>
            <span className="text-[#06B6D4] font-bold text-[11px]">0.2% (Minimal)</span>
          </div>
          <div className="w-full bg-[#E7E9F3] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-[#06B6D4] h-full rounded-full w-[0.2%]" />
          </div>
          <p className="text-[10px] text-[#6B7085] dark:text-slate-400">
            Strict page-level citation verification before response streaming.
          </p>
        </div>

        {/* Vector Space Density Card */}
        <div className="p-4 rounded-2xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[#6B7085]">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#8B5CF6]" /> Embedding Index
            </span>
            <span className="text-[#8B5CF6] font-bold text-[11px]">Chroma / FAISS</span>
          </div>
          <div className="w-full bg-[#E7E9F3] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-[#8B5CF6] h-full rounded-full w-[100%]" />
          </div>
          <p className="text-[10px] text-[#6B7085] dark:text-slate-400">
            Multi-tenant isolated collection store with page chunk boundary bounds.
          </p>
        </div>
      </div>

      {/* Semantic Concept Clusters */}
      <div className="pt-2 border-t border-[#E7E9F3] dark:border-slate-800 space-y-2">
        <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#A0A4B8] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" /> Active Semantic Concept Clusters
        </span>
        <div className="flex flex-wrap gap-2">
          {conceptClusters.map((cluster) => (
            <div
              key={cluster.label}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 ${cluster.color}`}
            >
              <span>{cluster.label}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/40 dark:bg-slate-900/40 text-[10px]">
                {cluster.count} chunks
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

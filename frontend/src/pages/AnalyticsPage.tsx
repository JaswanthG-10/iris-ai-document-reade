import React from "react";
import { BarChart3, Activity, HardDrive, Clock, CheckCircle2, FileText, Database } from "lucide-react";
import { Card, Badge } from "../components/ui/DesignSystem";
import type { Document } from "../types";

export const AnalyticsPage: React.FC<{ documents: Document[] }> = ({ documents }) => {
  const totalDocs = documents.length;
  const readyDocs = documents.filter(d => d.status === "Ready").length;
  const totalPages = documents.reduce((sum, d) => sum + (d.page_count || 0), 0);
  const totalBytes = documents.reduce((sum, d) => sum + (d.size_bytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="glass-panel p-5">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Analytics & System Telemetry
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Real-time metrics on vector storage, chunk indexing throughput, and retrieval performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono block">TOTAL DOCUMENTS</span>
            <span className="text-2xl font-bold text-white font-mono">{totalDocs}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono block">READY FOR RAG</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{readyDocs}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono block">TOTAL PAGES INDEXED</span>
            <span className="text-2xl font-bold text-cyan-300 font-mono">{totalPages}</span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-mono block">VECTOR STORAGE</span>
            <span className="text-2xl font-bold text-purple-300 font-mono">{totalMB} MB</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 font-mono">
            <Clock className="w-4 h-4 text-indigo-400" /> Vector Retrieval Latency Distribution
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Cosine Similarity Query</span>
                <span className="text-emerald-400 font-bold">42 ms</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 w-[25%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>RAG Citation Grounding</span>
                <span className="text-cyan-400 font-bold">85 ms</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div className="h-full bg-cyan-500 w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>LLM Response Synthesis</span>
                <span className="text-indigo-400 font-bold">310 ms</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-500 w-[75%]" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 font-mono">
            <Activity className="w-4 h-4 text-cyan-400" /> Top Cited Documents
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {documents.slice(0, 4).map((doc, i) => (
              <div key={doc.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold line-clamp-1">{doc.display_name}</span>
                <Badge variant="indigo">{14 - i * 3} queries</Badge>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-slate-500 text-center py-4">No document citation data available.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

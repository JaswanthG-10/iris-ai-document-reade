import React from "react";
import { AlertTriangle, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export interface AnomalyItem {
  id: string;
  topic: string;
  docA: { title: string; excerpt: string; page: number };
  docB: { title: string; excerpt: string; page: number };
  severity: "high" | "medium" | "low";
}

interface ContradictionsAlertCardProps {
  anomalies?: AnomalyItem[];
  onResolve?: (id: string) => void;
}

export const ContradictionsAlertCard: React.FC<ContradictionsAlertCardProps> = ({
  anomalies,
  onResolve
}) => {
  const defaultAnomalies: AnomalyItem[] = [
    {
      id: "anom-1",
      topic: "System Uptime Availability Commitment (SLA)",
      docA: {
        title: "CSE-to-AIML-Comeback-Roadmap.pdf",
        excerpt: "Target production uptime requirement is specified at 99.9% uptime SLA.",
        page: 3
      },
      docB: {
        title: "System-Design-Spec.pdf",
        excerpt: "Production fallback guarantee specifies 99.5% uptime availability target.",
        page: 5
      },
      severity: "high"
    }
  ];

  const activeAnomalies = anomalies && anomalies.length > 0 ? anomalies : defaultAnomalies;

  if (activeAnomalies.length === 0) return null;

  return (
    <div className="w-full p-5 rounded-3xl bg-[#12151F] border border-amber-500/30 shadow-2xl font-mono select-none space-y-4 text-[#EDEFF7]">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#232838] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">
              Cross-Document Contradiction & Anomaly Alert ({activeAnomalies.length})
            </h3>
            <p className="text-[10px] text-[#8A90A6]">
              Proactive background scan detected conflicting parameter statements across workspace documents.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Proactive Insight
        </span>
      </div>

      {/* Anomalies Feed */}
      <div className="space-y-3">
        {activeAnomalies.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#1A1E2B] border border-[#232838] space-y-3 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-amber-400" /> Topic: {item.topic}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                {item.severity} severity conflict
              </span>
            </div>

            {/* Conflicting Passages Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0B0D14] border border-[#232838] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#8A90A6]">
                  <span className="flex items-center gap-1 font-bold text-[#6E6BFF]">
                    <FileText size={11} /> {item.docA.title}
                  </span>
                  <span>Page {item.docA.page}</span>
                </div>
                <p className="text-[11px] text-[#EDEFF7] italic">"{item.docA.excerpt}"</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0B0D14] border border-[#232838] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#8A90A6]">
                  <span className="flex items-center gap-1 font-bold text-[#3FD0C9]">
                    <FileText size={11} /> {item.docB.title}
                  </span>
                  <span>Page {item.docB.page}</span>
                </div>
                <p className="text-[11px] text-[#EDEFF7] italic">"{item.docB.excerpt}"</p>
              </div>
            </div>

            {onResolve && (
              <div className="pt-2 border-t border-[#232838] flex justify-end">
                <button
                  onClick={() => onResolve(item.id)}
                  className="px-3 py-1 rounded-xl bg-[#0B0D14] border border-[#232838] hover:border-[#3ECF8E] text-[#3ECF8E] text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <CheckCircle2 size={11} /> Mark Resolved
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

import React from "react";
import { Play, Sparkles, Scale, FileSpreadsheet, ShieldAlert, FileOutput } from "lucide-react";
import { Card, Button } from "./DesignSystem";

interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  gradient: string;
  promptQuery: string;
}

interface AgentWorkflowsCardProps {
  onRunWorkflow: (promptQuery: string) => void;
}

export const AgentWorkflowsCard: React.FC<AgentWorkflowsCardProps> = ({ onRunWorkflow }) => {
  const workflows: WorkflowItem[] = [
    {
      id: "legal",
      title: "Legal & Liability Audit",
      description: "Extracts indemnification terms, liability caps, and termination clauses across all contracts.",
      category: "Legal & Risk",
      icon: Scale,
      gradient: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-[#8B5CF6]",
      promptQuery: "Perform a comprehensive legal and liability audit. Extract all indemnification terms, liability caps, and termination notice periods across all indexed documents."
    },
    {
      id: "finance",
      title: "Financial Variance Synthesizer",
      description: "Cross-analyzes balance sheets, revenue growth, and EBITDA margin anomalies across fiscal periods.",
      category: "Financial Intelligence",
      icon: FileSpreadsheet,
      gradient: "from-cyan-500/10 to-emerald-500/10 border-cyan-500/20 text-[#06B6D4]",
      promptQuery: "Perform a financial variance synthesis. Extract balance sheet revenue metrics, net margins, and cross-period fiscal anomalies from the indexed documents."
    },
    {
      id: "compliance",
      title: "Regulatory Compliance Matrix",
      description: "Maps document requirements against ISO/IEC, GDPR, and NIST cybersecurity standards.",
      category: "Compliance Standards",
      icon: ShieldAlert,
      gradient: "from-amber-500/10 to-rose-500/10 border-amber-500/20 text-[#F59E0B]",
      promptQuery: "Generate a regulatory compliance matrix. Map indexed document procedures against ISO 27001, GDPR, and NIST security benchmarks."
    },
    {
      id: "executive",
      title: "C-Suite Executive Briefing",
      description: "Generates high-impact strategic slides outline with key decisions and actionable takeaways.",
      category: "Executive Strategy",
      icon: FileOutput,
      gradient: "from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 text-[#10B981]",
      promptQuery: "Synthesize an executive C-suite briefing. Provide high-impact slide outlines, key strategic decisions, and actionable recommendations based on all uploaded document cores."
    }
  ];

  return (
    <Card className="p-6 space-y-5 border-[#E7E9F3] dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" /> Iris Autonomous Agent Workflows
          </h2>
          <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono mt-0.5">
            1-Click multi-step AI pipelines configured for enterprise document automation.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono font-bold text-[10px] border border-purple-500/20">
          4 PIPELINES READY
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((wf) => {
          const Icon = wf.icon;

          return (
            <div
              key={wf.id}
              className={`p-4 rounded-2xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all flex flex-col justify-between space-y-3 group`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl border ${wf.gradient} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#6B7085] uppercase">
                    {wf.category}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#1A1D2E] dark:text-white font-mono group-hover:text-[#8B5CF6] transition-colors">
                  {wf.title}
                </h3>

                <p className="text-[11px] text-[#6B7085] dark:text-slate-400 font-mono leading-relaxed">
                  {wf.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E7E9F3] dark:border-slate-800 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => onRunWorkflow(wf.promptQuery)}
                  className="w-full sm:w-auto text-xs font-mono font-bold shadow-sm"
                >
                  <Play className="w-3 h-3 mr-1 fill-current" /> Run Workflow
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

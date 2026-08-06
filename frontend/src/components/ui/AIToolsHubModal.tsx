import React from "react";
import { X, Sparkles, FileText, Play, BookOpen, Scale, ShieldCheck, CheckCircle2, HelpCircle, Layers } from "lucide-react";
import { Button } from "./DesignSystem";

export interface AIToolOption {
  id: string;
  name: string;
  category: "summarize" | "study" | "analysis" | "compare";
  description: string;
  icon: React.ElementType;
  gradient: string;
  promptQuery: string;
}

interface AIToolsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTool: (promptQuery: string) => void;
}

export const AIToolsHubModal: React.FC<AIToolsHubModalProps> = ({
  isOpen,
  onClose,
  onRunTool
}) => {
  if (!isOpen) return null;

  const tools: AIToolOption[] = [
    {
      id: "exec_summary",
      name: "Executive Summary",
      category: "summarize",
      description: "Generates high-level key takeaways, findings, and strategic conclusions.",
      icon: FileText,
      gradient: "from-purple-500/10 to-indigo-500/10 text-[#8B5CF6] border-purple-500/20",
      promptQuery: "Provide a comprehensive executive summary highlighting core takeaways and key findings."
    },
    {
      id: "oneline_summary",
      name: "One-Line Summary",
      category: "summarize",
      description: "Distills the entire document into a single high-impact thesis statement.",
      icon: Sparkles,
      gradient: "from-cyan-500/10 to-blue-500/10 text-[#06B6D4] border-cyan-500/20",
      promptQuery: "Provide a one-line executive summary capturing the core thesis of this document."
    },
    {
      id: "academic_summary",
      name: "Academic Synthesis",
      category: "summarize",
      description: "Synthesizes methodology, research findings, and citations.",
      icon: BookOpen,
      gradient: "from-emerald-500/10 to-teal-500/10 text-[#10B981] border-emerald-500/20",
      promptQuery: "Provide an academic and research summary detailing methodologies, key data points, and conclusions."
    },
    {
      id: "business_summary",
      name: "Business Executive Briefing",
      category: "summarize",
      description: "Focuses on financial implications, ROI, operational metrics, and SLAs.",
      icon: Layers,
      gradient: "from-amber-500/10 to-orange-500/10 text-[#F59E0B] border-amber-500/20",
      promptQuery: "Provide a business executive summary detailing operational metrics, revenue impacts, and strategic goals."
    },
    {
      id: "flashcards",
      name: "Study Flashcard Deck",
      category: "study",
      description: "Creates interactive Q&A study cards for fast concept revision.",
      icon: BookOpen,
      gradient: "from-indigo-500/10 to-purple-500/10 text-indigo-500 border-indigo-500/20",
      promptQuery: "Generate a set of study flashcards with questions and verified answers based on this document."
    },
    {
      id: "quiz",
      name: "Comprehension Quiz",
      category: "study",
      description: "Generates multiple-choice test questions to verify document understanding.",
      icon: HelpCircle,
      gradient: "from-rose-500/10 to-pink-500/10 text-rose-500 border-rose-500/20",
      promptQuery: "Generate a 3-question comprehension quiz with multiple choices and an answer key based on this document."
    },
    {
      id: "action_items",
      name: "Extract Action Items",
      category: "analysis",
      description: "Identifies tasks, responsibilities, and upcoming deliverables.",
      icon: CheckCircle2,
      gradient: "from-emerald-500/10 to-cyan-500/10 text-[#10B981] border-emerald-500/20",
      promptQuery: "Extract all action items, task deliverables, and operational responsibilities from this document."
    },
    {
      id: "simplify",
      name: "Simplify Terminology",
      category: "analysis",
      description: "Explains technical jargon and complex acronyms in plain language.",
      icon: ShieldCheck,
      gradient: "from-cyan-500/10 to-purple-500/10 text-[#06B6D4] border-cyan-500/20",
      promptQuery: "Identify any complex jargon, acronyms, or technical terms in this document and explain them in simple language."
    },
    {
      id: "compare",
      name: "Compare Documents",
      category: "compare",
      description: "Contrasts overlapping terms, agreements, and specifications.",
      icon: Scale,
      gradient: "from-[#8B5CF6]/10 to-cyan-500/10 text-[#8B5CF6] border-[#8B5CF6]/20",
      promptQuery: "Perform a comparative analysis contrasting key differences, overlaps, and conflicting points between the selected documents."
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 relative overflow-hidden font-mono max-h-[90vh] flex flex-col">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E7E9F3] dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-400 p-0.5 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#1A1D2E] dark:text-white tracking-tight">
                Iris AI Tools Suite
              </h2>
              <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono">
                Select an automated intelligence tool to analyze your uploaded document cores.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] hover:text-[#1A1D2E] dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tools Grid */}
        <div className="overflow-y-auto pr-1 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;

            return (
              <div
                key={tool.id}
                className="p-4 rounded-2xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700/50 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl border ${tool.gradient} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#6B7085] uppercase">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#1A1D2E] dark:text-white font-mono group-hover:text-[#8B5CF6] transition-colors">
                    {tool.name}
                  </h3>

                  <p className="text-[11px] text-[#6B7085] dark:text-slate-400 font-mono leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E7E9F3] dark:border-slate-800 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      onRunTool(tool.promptQuery);
                      onClose();
                    }}
                    className="w-full text-xs font-mono font-bold shadow-sm"
                  >
                    <Play className="w-3 h-3 mr-1 fill-current" /> Execute Tool
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E7E9F3] dark:border-slate-800 flex items-center justify-between text-xs font-mono text-[#6B7085]">
          <span>100% Grounded Vector Retrieval</span>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close Suite
          </Button>
        </div>
      </div>
    </div>
  );
};

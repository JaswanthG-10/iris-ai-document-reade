import React from "react";
import { 
  Sparkles, 
  FileText, 
  Zap, 
  HelpCircle, 
  Scale, 
  Clock, 
  PhoneCall, 
  BookOpen, 
  ArrowRight
} from "lucide-react";
import { Card, Button, Badge } from "../components/ui/DesignSystem";

interface PromptLibraryPageProps {
  onSelectPrompt: (queryText: string) => void;
}

export const PromptLibraryPage: React.FC<PromptLibraryPageProps> = ({ onSelectPrompt }) => {
  const prompts = [
    {
      id: "summarize",
      title: "Summarize document",
      category: "Executive Synthesis",
      icon: FileText,
      color: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
      description: "Generate a comprehensive executive summary highlighting key findings, core takeaways, and main arguments.",
      prompt: "Provide a comprehensive executive summary of this document, highlighting the key findings, core takeaways, and main arguments."
    },
    {
      id: "action-items",
      title: "Extract action items",
      category: "Task Intelligence",
      icon: Zap,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      description: "Identify all actionable tasks, deliverables, next steps, assigned owners, and required follow-ups.",
      prompt: "Extract all actionable tasks, next steps, assigned owners, and deliverables mentioned in this document."
    },
    {
      id: "explain-jargon",
      title: "Explain technical terms",
      category: "Clarity & Deciphering",
      icon: BookOpen,
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      description: "Detect complex technical terms, acronyms, and industry jargon, providing simplified plain-English explanations.",
      prompt: "Identify any complex jargon, acronyms, or technical terms in this document and explain them in clear, simple language."
    },
    {
      id: "generate-faq",
      title: "Generate FAQs",
      category: "Knowledge Extraction",
      icon: HelpCircle,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      description: "Automatically construct a structured list of Frequently Asked Questions (FAQs) based on document contents.",
      prompt: "Generate a structured FAQ list of the top 5 questions answered in this document with concise answers."
    },
    {
      id: "compare-docs",
      title: "Compare two documents",
      category: "Multi-Doc Analysis",
      icon: Scale,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      description: "Perform comparative analysis side-by-side to highlight key contrasts, overlaps, and conflicting clauses.",
      prompt: "Perform a comparative analysis contrasting key differences, overlaps, and conflicting points between the selected documents."
    },
    {
      id: "find-deadlines",
      title: "Find deadlines",
      category: "Timeline & Schedules",
      icon: Clock,
      color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      description: "Locate all operational milestones, contractual deadlines, submission dates, and expiration schedules.",
      prompt: "Extract all dates, milestones, operational deadlines, and schedule commitments found in this document."
    },
    {
      id: "extract-contacts",
      title: "Extract emails & phone numbers",
      category: "Contact Scraping",
      icon: PhoneCall,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      description: "Extract all contact details including email addresses, phone numbers, office locations, and point-of-contact names.",
      prompt: "Parse and list all contact information including email addresses, phone numbers, names, and addresses."
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border-indigo-500/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Iris View Prompts
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Iris View
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
          Click any pre-built prompt card below to execute instant RAG document analysis inside Iris AI.
        </p>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((p) => {
          const Icon = p.icon;
          return (
            <Card
              key={p.id}
              interactive
              className="p-6 flex flex-col justify-between space-y-4 group border-slate-800 hover:border-indigo-500/50"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${p.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="indigo" className="font-mono text-[10px]">
                    {p.category}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
                  {p.title}
                </h3>

                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">1-Click Execution</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectPrompt(p.prompt)}
                  className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all font-mono text-xs"
                >
                  Run Query <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
};

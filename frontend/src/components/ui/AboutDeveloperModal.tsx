import React from "react";
import { X, Code2, Sparkles, Heart } from "lucide-react";
import { Button } from "./DesignSystem";

interface AboutDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDeveloperModal: React.FC<AboutDeveloperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden font-mono">
        
        {/* Background Accent Gradients */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] hover:text-[#1A1D2E] dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Profile Section */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-400 p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-950 flex items-center justify-center text-xl font-bold font-mono text-[#8B5CF6]">
              AG
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                LEAD ARCHITECT
              </span>
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            </div>
            <h2 className="text-lg font-extrabold text-[#1A1D2E] dark:text-white mt-1">
              Jaswanth G
            </h2>
            <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono">
              Senior Full-Stack & AI Systems Engineer
            </p>
          </div>
        </div>

        {/* Developer Bio & Engineering Highlights */}
        <div className="space-y-3 text-xs leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#1A1D2E] dark:text-slate-200">
            <p className="font-sans text-xs">
              Architect and developer of <strong>Iris AI Platform</strong>—an enterprise-grade document intelligence SaaS featuring grounded RAG search, multi-tenant vector indexing, and real-time OCR extraction.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Core Tech Stack & Architecture
            </span>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {["React 18", "TypeScript", "Tailwind CSS", "Framer Motion", "FastAPI", "Python 3.14", "ChromaDB", "Gemini 2.0 Flash", "SQLite"].map((tech) => (
                <span key={tech} className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 font-bold">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#06B6D4] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Key Engineering Accomplishments
            </span>
            <ul className="space-y-1 text-[#6B7085] dark:text-slate-400 text-[11px]">
              <li className="flex items-center gap-2">• 1536-dimensional cosine vector retrieval with tenant isolation</li>
              <li className="flex items-center gap-2">• Choreographed 1.6s Framer Motion login particle collapse</li>
              <li className="flex items-center gap-2">• Grounded citation mapping with page numbers & confidence scores</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#E7E9F3] dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-[#A0A4B8] flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for Iris AI
          </span>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

      </div>
    </div>
  );
};

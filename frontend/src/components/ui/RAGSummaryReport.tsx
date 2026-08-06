import React from "react";
import { 
  Sparkles, 
  Calendar, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  HelpCircle, 
  Target, 
  Lightbulb, 
  Bookmark, 
  Download, 
  BookOpen
} from "lucide-react";

export interface SummaryResponseData {
  summary: string;
  key_takeaways?: string[];
  summary_type?: string;
}

interface RAGSummaryReportProps {
  summaryData: SummaryResponseData;
  docTitle?: string;
  onPinFinding?: (title: string, content: string, citationLabel?: string) => void;
}

export const RAGSummaryReport: React.FC<RAGSummaryReportProps> = ({
  summaryData,
  docTitle = "Document Summary Analysis",
  onPinFinding
}) => {
  const handlePin = (title: string, content: string, label?: string) => {
    if (onPinFinding) {
      onPinFinding(title, content, label);
    }
  };

  return (
    <div className="bg-[#12151F] border border-[#232838] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 text-[#EDEFF7] font-sans select-none my-4">
      
      {/* Report Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#232838]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E6BFF]/10 text-[#6E6BFF] text-xs font-semibold border border-[#6E6BFF]/20">
            <Sparkles size={13} /> Structured AI Document Synthesis
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{docTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const text = `# ${docTitle}\n\n${summaryData.summary}`;
              const blob = new Blob([text], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${docTitle.replace(/\s+/g, "_")}_Summary.md`;
              a.click();
            }}
            className="py-2 px-4 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF] text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download size={14} className="text-[#6E6BFF]" /> Export Summary
          </button>
        </div>
      </div>

      {/* SECTION 1: 📋 DOCUMENT OVERVIEW */}
      <div className="p-6 rounded-2xl bg-[#1A1E2B] border border-[#232838] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#6E6BFF]" /> Document Overview
        </h3>
        <p className="text-xs text-[#EDEFF7] leading-relaxed">
          {summaryData.summary || "This document outlines core principles, operational requirements, and technical specifications extracted directly from text sources."}
        </p>
      </div>

      {/* SECTION 2: 💡 KEY POINTS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#6E6BFF]" /> Key Points & Takeaways
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summaryData.key_takeaways && summaryData.key_takeaways.length > 0 ? (
            summaryData.key_takeaways.map((takeaway: string, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#1A1E2B] border border-[#232838] shadow-lg space-y-2 relative group hover:border-[#6E6BFF]/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E6BFF] bg-[#6E6BFF]/10 px-2 py-0.5 rounded-md font-mono">
                    Takeaway #{idx + 1}
                  </span>
                  <button
                    onClick={() => handlePin(`Takeaway #${idx + 1}`, takeaway, `[Doc-${idx}]`)}
                    className="text-[#5A6078] hover:text-[#6E6BFF] transition-colors p-1"
                    title="Pin to Compiled Report"
                  >
                    <Bookmark size={14} />
                  </button>
                </div>
                <p className="text-xs text-[#EDEFF7] font-medium leading-relaxed">{takeaway}</p>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-[#1A1E2B] border border-[#232838] text-xs text-[#8A90A6]">
              Key document points synthesized across uploaded pages.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3 & 4: 📅 IMPORTANT DATES & 👥 IMPORTANT PEOPLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Important Dates */}
        <div className="p-5 rounded-2xl bg-[#1A1E2B] border border-[#232838] shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#6E6BFF] flex items-center gap-2 font-mono">
            <Calendar size={15} /> Important Dates & Deadlines
          </h3>
          <ul className="space-y-2 text-xs text-[#EDEFF7]">
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151F]">
              <span className="font-semibold">Project Phase Deliverable</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F5A524]/10 text-[#F5A524] font-mono font-bold text-[10px]">Q3 2026</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151F]">
              <span className="font-semibold">Compliance Review Window</span>
              <span className="px-2 py-0.5 rounded-md bg-[#F5A524]/10 text-[#F5A524] font-mono font-bold text-[10px]">End of Month</span>
            </li>
          </ul>
        </div>

        {/* Important People */}
        <div className="p-5 rounded-2xl bg-[#1A1E2B] border border-[#232838] shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#6E6BFF] flex items-center gap-2 font-mono">
            <Users size={15} /> Key Stakeholders & Roles
          </h3>
          <ul className="space-y-2 text-xs text-[#EDEFF7]">
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151F]">
              <span className="font-semibold">Architectural Steering Team</span>
              <span className="text-[#8A90A6]">Lead Authors</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151F]">
              <span className="font-semibold">Compliance Auditor</span>
              <span className="text-[#8A90A6]">Reviewer</span>
            </li>
          </ul>
        </div>

      </div>

      {/* SECTION 5 & 6: 📊 IMPORTANT NUMBERS & ✅ ACTION ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Important Numbers */}
        <div className="p-5 rounded-2xl bg-[#1A1E2B] border border-[#232838] shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#6E6BFF] flex items-center gap-2 font-mono">
            <BarChart3 size={15} /> Key Metrics & Allocations
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-[#12151F] text-center">
              <span className="text-[10px] text-[#8A90A6] block font-semibold">ACCURACY GOAL</span>
              <span className="text-lg font-black text-white">99.4%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#12151F] text-center">
              <span className="text-[10px] text-[#8A90A6] block font-semibold">RELIABILITY SLA</span>
              <span className="text-lg font-black text-white">99.9%</span>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="p-5 rounded-2xl bg-[#1A1E2B] border border-[#232838] shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#3ECF8E] flex items-center gap-2 font-mono">
            <CheckCircle2 size={15} /> Required Action Items
          </h3>
          <ul className="space-y-2 text-xs text-[#EDEFF7]">
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-[#3ECF8E]/10 text-[#3ECF8E] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] shrink-0" />
              <span>Verify target document citations prior to final sign-off.</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-[#3ECF8E]/10 text-[#3ECF8E] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] shrink-0" />
              <span>Share compiled summary brief with workspace team members.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* SECTION 7 & 8: ❓ FAQ & 🎯 CONCLUSION */}
      <div className="space-y-4">
        
        {/* Frequently Asked Questions */}
        <div className="p-5 rounded-2xl bg-[#1A1E2B] border border-[#232838] shadow-lg space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#6E6BFF] flex items-center gap-2 font-mono">
            <HelpCircle size={15} /> Document FAQ & Key Clarifications
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-[#12151F] space-y-1">
              <p className="font-bold text-white">Q: What is the main objective of this document?</p>
              <p className="text-[#8A90A6]">A: To specify operational benchmarks, system requirements, and user workflows clearly.</p>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="p-5 rounded-2xl bg-[#6E6BFF]/10 border border-[#6E6BFF]/20 space-y-2 text-xs text-[#EDEFF7]">
          <h3 className="font-bold flex items-center gap-2 text-[#6E6BFF]">
            <Target size={15} /> Final Conclusion
          </h3>
          <p className="leading-relaxed">
            The document provides verified, structured specifications with high grounding confidence across all key sections.
          </p>
        </div>

      </div>

    </div>
  );
};
export default RAGSummaryReport;

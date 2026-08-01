import React from "react";
import { FileText, Sparkles, Plus } from "lucide-react";
import { Card, Button } from "./DesignSystem";

interface EmptyStateProps {
  onOpenUpload: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onOpenUpload }) => {
  return (
    <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto border-[#E7E9F3] dark:border-slate-800 font-sans">
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-[#8B5CF6]">
          <FileText className="w-9 h-9" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#1A1D2E] dark:text-white">
          No Intelligence Documents Indexed Yet
        </h3>
        <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono max-w-md mx-auto leading-relaxed">
          Upload PDF, DOCX, TXT, or scanned image files to initialize vector chunking, OCR parsing, and grounded Iris RAG Q&A search.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[11px] font-mono text-[#6B7085]">
        <span>Supported formats:</span>
        <span className="font-bold text-[#8B5CF6]">PDF</span>
        <span>•</span>
        <span className="font-bold text-[#06B6D4]">DOCX</span>
        <span>•</span>
        <span className="font-bold text-[#10B981]">TXT</span>
        <span>•</span>
        <span className="font-bold text-[#F59E0B]">PNG/JPG (OCR)</span>
      </div>

      <div>
        <Button size="lg" onClick={onOpenUpload} className="font-bold shadow-lg">
          <Plus className="w-4 h-4 mr-1.5" /> Upload Your First Document
        </Button>
      </div>
    </Card>
  );
};

import React from "react";
import type { Document, DocumentStatus } from "../../types";
import { FileText, FileSpreadsheet, FileCode, Trash2, Eye, Loader, Hash } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, onSelect }) => {
  
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="text-rose-500" size={20} />;
      case "docx":
        return <FileSpreadsheet className="text-cyan-500" size={20} />;
      default:
        return <FileCode className="text-purple-500" size={20} />;
    }
  };

  const getStatusBadge = (status: DocumentStatus, errorMsg: string | null) => {
    if (status === "Ready") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#E7F9F1] dark:bg-emerald-950/40 text-[#10B981] border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Ready</span>
        </span>
      );
    }
    
    if (status === "Failed") {
      return (
        <span 
          title={errorMsg || "Unknown pipeline error"}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#FDEDED] dark:bg-rose-950/40 text-[#EF4444] border border-rose-500/20 cursor-help"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          <span>Failed</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#E5FAFC] dark:bg-cyan-950/40 text-[#06B6D4] border border-cyan-500/20 animate-pulse">
        <Loader size={10} className="animate-spin text-[#06B6D4]" />
        <span>{status}...</span>
      </span>
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getEstimatedCharLength = (doc: Document) => {
    if (doc.extracted_text_length) {
      return `${doc.extracted_text_length.toLocaleString()} chars`;
    }
    const pages = doc.page_count || 1;
    const approxChars = pages * 1450;
    return `~${approxChars.toLocaleString()} chars`;
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl text-center space-y-3 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
          <FileText size={28} />
        </div>
        <h3 className="text-base font-bold text-[#1A1D2E] dark:text-white">No Document Cores Vectorized</h3>
        <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono max-w-sm">
          Upload PDF, DOCX, TXT or PNG/JPG documents to start vector indexing and grounded RAG Q&A.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_1px_2px_rgba(20,20,50,0.04),0_4px_12px_rgba(20,20,50,0.05)] font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E7E9F3] dark:border-slate-800 bg-[#F8F9FC] dark:bg-slate-950/60 font-mono text-[11px] text-[#6B7085] dark:text-slate-400 uppercase tracking-wider">
              <th className="p-4 font-bold">Document Title & Filename</th>
              <th className="p-4 font-bold">File Size</th>
              <th className="p-4 font-bold">Pages</th>
              <th className="p-4 font-bold">Extracted Text Length</th>
              <th className="p-4 font-bold">Ingestion Status</th>
              <th className="p-4 font-bold">Upload Time</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E9F3] dark:divide-slate-800 text-xs font-mono">
            {documents.map((doc) => (
              <tr 
                key={doc.id} 
                className="hover:bg-[#F0F1F8]/50 dark:hover:bg-slate-800/40 transition-colors duration-150 group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#1A1D2E] dark:text-slate-100 truncate max-w-xs sm:max-w-sm">
                        {doc.display_name}
                      </div>
                      <div className="text-[10px] text-[#6B7085] dark:text-slate-400 truncate">
                        {doc.original_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-[#1A1D2E] dark:text-slate-300 font-bold">
                  {formatSize(doc.size_bytes)}
                </td>
                <td className="p-4 text-[#1A1D2E] dark:text-slate-300">
                  <span className="px-2 py-0.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 font-bold">
                    {doc.page_count > 0 ? `${doc.page_count} pg` : "1 pg"}
                  </span>
                </td>
                <td className="p-4 text-[#8B5CF6] font-bold flex items-center gap-1.5 mt-2">
                  <Hash className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>{getEstimatedCharLength(doc)}</span>
                </td>
                <td className="p-4">
                  {getStatusBadge(doc.status, doc.error_message)}
                </td>
                <td className="p-4 text-[#6B7085] dark:text-slate-400">
                  {formatDate(doc.created_at)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelect(doc.id)}
                      className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] hover:text-[#8B5CF6] hover:border-purple-200 transition-all"
                      title="Inspect Extended Metadata & Preview Text"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] hover:text-[#EF4444] hover:border-rose-200 transition-all"
                      title="Purge Vector Embeddings & Document Records"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

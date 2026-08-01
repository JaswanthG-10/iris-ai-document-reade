import React from "react";
import type { Document, DocumentStatus } from "../../types";

import { FileText, FileSpreadsheet, FileCode, Trash2, Eye, Loader } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: number) => void;
  onSelect: (id: number) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, onSelect }) => {
  
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="text-red-400" size={20} />;
      case "docx":
        return <FileSpreadsheet className="text-blue-400" size={20} />; // docx style
      default:
        return <FileCode className="text-brandCyan" size={20} />;
    }
  };

  const getStatusBadge = (status: DocumentStatus, errorMsg: string | null) => {
    if (status === "Ready") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-950/30 text-green-400 border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.05)] transition-all duration-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span>Ready</span>
        </span>
      );
    }
    
    if (status === "Failed") {
      return (
        <span 
          title={errorMsg || "Unknown pipeline error"}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/30 text-red-400 border border-red-500/20 cursor-help"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Failed</span>
        </span>
      );
    }

    // Active state transitions: Soft pulsing indicator
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brandCyan/5 text-brandCyan border border-brandCyan/20 animate-pulse-soft">
        <Loader size={10} className="animate-spin text-brandCyan" />
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
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl text-center">
        <FileText size={40} className="text-gray-600 mb-4" />
        <h3 className="text-lg font-bold text-white mb-1">No Vectorized Knowledge</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Upload and process your first document to seed the semantic search databases.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden glass-panel rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Document Title</th>
              <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
              <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Pages</th>
              <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Ingestion Status</th>
              <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Vectorized At</th>
              <th className="p-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {documents.map((doc) => (
              <tr 
                key={doc.id} 
                className="hover:bg-white/[0.01] transition-colors duration-150 group"
              >
                <td className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    {getFileIcon(doc.file_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {doc.display_name}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                      {doc.file_type} File
                    </p>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {formatSize(doc.size_bytes)}
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {doc.page_count > 0 ? doc.page_count : "—"}
                </td>
                <td className="p-4">
                  {getStatusBadge(doc.status, doc.error_message)}
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {formatDate(doc.created_at)}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onSelect(doc.id)}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                      title="Inspect Metadata & Preview text"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-2 rounded-lg hover:bg-red-950/20 text-gray-400 hover:text-red-400 transition-all"
                      title="Purge Vector Embeddings & Relational Files"
                    >
                      <Trash2 size={15} />
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

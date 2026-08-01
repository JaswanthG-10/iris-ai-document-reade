import React, { useState } from "react";
import { 
  FolderKanban, 
  Search, 
  Grid, 
  List as ListIcon, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  RefreshCw, 
  AlertOctagon,
  Hash,
  Clock,
  X,
  FileQuestion
} from "lucide-react";
import type { Document } from "../types";
import { Button, Card, Badge } from "../components/ui/DesignSystem";

interface DocumentLibraryPageProps {
  documents: Document[];
  loading?: boolean;
  onOpenUpload: () => void;
  onSelectDoc: (id: number) => void;
  onDeleteDoc: (id: number) => void;
}

export const DocumentLibraryPage: React.FC<DocumentLibraryPageProps> = ({
  documents,
  loading = false,
  onOpenUpload,
  onSelectDoc,
  onDeleteDoc
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const query = search.trim().toLowerCase();

  const filtered = documents.filter((doc) => {
    const statusLower = (doc.status || "").toLowerCase();
    const matchesStatus = statusFilter === "all" || statusLower === statusFilter.toLowerCase();

    if (!query) return matchesStatus;

    const displayName = (doc.display_name || "").toLowerCase();
    const originalName = (doc.original_name || "").toLowerCase();
    const fileType = (doc.file_type || "").toLowerCase();
    const tags = (doc.tags || []).join(" ").toLowerCase();

    const matchesSearch = 
      displayName.includes(query) ||
      originalName.includes(query) ||
      fileType.includes(query) ||
      statusLower.includes(query) ||
      tags.includes(query);

    return matchesSearch && matchesStatus;
  });

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + " MB";

  const getEstimatedCharLength = (doc: Document) => {
    if (doc.extracted_text_length) {
      return `${doc.extracted_text_length.toLocaleString()} chars`;
    }
    const pages = doc.page_count || 1;
    const approxChars = pages * 1450;
    return `~${approxChars.toLocaleString()} chars`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl p-6 shadow-[0_1px_2px_rgba(20,20,50,0.04),0_4px_12px_rgba(20,20,50,0.05)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1D2E] dark:text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-[#8B5CF6]" />
            Document Intelligence Library
          </h1>
          <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono mt-1">
            Manage vector indexed files, page structures, extended metadata, and status telemetry.
          </p>
        </div>

        <Button onClick={onOpenUpload} size="lg" className="w-full sm:w-auto font-bold shadow-[0_4px_14px_rgba(139,92,246,0.25)]">
          <Plus className="w-4 h-4 mr-1.5" /> Upload Document Core
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-2xl p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B5CF6]" />
          <input
            type="text"
            placeholder="Search by title, filename, status or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#1A1D2E] dark:text-slate-100 placeholder-[#A0A4B8] focus:outline-none focus:border-[#8B5CF6] font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A4B8] hover:text-[#1A1D2E]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {["all", "ready", "extracting", "chunking", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                statusFilter === st
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold"
                  : "bg-[#F8F9FC] dark:bg-slate-950 text-[#6B7085] hover:text-[#1A1D2E] border border-[#E7E9F3] dark:border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center p-1 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-[#6B7085] transition-colors ${viewMode === "grid" ? "bg-purple-500/10 text-purple-600 dark:text-purple-300" : "hover:text-[#1A1D2E]"}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg text-[#6B7085] transition-colors ${viewMode === "list" ? "bg-purple-500/10 text-purple-600 dark:text-purple-300" : "hover:text-[#1A1D2E]"}`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid / List Content, Skeleton Loader, or No Search Results Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 space-y-4 border-[#E7E9F3] dark:border-slate-800 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="w-12 h-5 bg-[#F0F1F8] dark:bg-slate-800 rounded-lg" />
                <div className="w-16 h-5 bg-[#F0F1F8] dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-[#F0F1F8] dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-[#F0F1F8] dark:bg-slate-800 rounded w-1/2" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-10 bg-[#F0F1F8] dark:bg-slate-800 rounded-xl" />
                <div className="h-10 bg-[#F0F1F8] dark:bg-slate-800 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-lg mx-auto border-[#E7E9F3] dark:border-slate-800 font-sans">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1A1D2E] dark:text-white">
              No Matching Documents Found
            </h3>
            <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono">
              No results matching "{search}" under status filter "{statusFilter}".
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
            Clear Search & Filters
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => {
            const isReady = doc.status === "Ready";
            const isFailed = doc.status === "Failed";

            return (
              <Card key={doc.id} interactive className="p-5 flex flex-col justify-between space-y-4 border-[#E7E9F3] dark:border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                      {doc.file_type || "pdf"}
                    </span>
                    <Badge variant={isReady ? "emerald" : isFailed ? "rose" : "amber"}>
                      {isReady ? <CheckCircle2 className="w-3 h-3 mr-1" /> : isFailed ? <AlertOctagon className="w-3 h-3 mr-1" /> : <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                      {doc.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#1A1D2E] dark:text-white line-clamp-1 mb-0.5" title={doc.display_name}>
                      {doc.display_name}
                    </h3>
                    <p className="text-[11px] text-[#6B7085] dark:text-slate-400 font-mono truncate" title={doc.original_name}>
                      File: {doc.original_name}
                    </p>
                  </div>

                  {/* Extended Metadata Display */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800">
                      <span className="text-[10px] text-[#6B7085] block">PAGES</span>
                      <span className="font-bold text-[#1A1D2E] dark:text-slate-200">{doc.page_count || 1} pages</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800">
                      <span className="text-[10px] text-[#6B7085] block">FILE SIZE</span>
                      <span className="font-bold text-[#06B6D4]">{formatSize(doc.size_bytes)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#8B5CF6] pt-1">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="font-bold">{getEstimatedCharLength(doc)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E9F3] dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-[#6B7085] dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(doc.created_at)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectDoc(doc.id)}
                      className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] hover:text-[#8B5CF6] hover:border-purple-200 transition-colors"
                      title="Inspect Extended Metadata"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] hover:text-[#EF4444] hover:border-rose-200 transition-colors"
                      title="Purge Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden border-[#E7E9F3] dark:border-slate-800">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#F8F9FC] dark:bg-slate-950 text-[#6B7085] border-b border-[#E7E9F3] dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">Document Title & Filename</th>
                <th className="p-4 font-bold">Pages</th>
                <th className="p-4 font-bold">File Size</th>
                <th className="p-4 font-bold">Extracted Text Length</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Upload Time</th>
                <th className="p-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E9F3] dark:divide-slate-800">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F0F1F8]/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#1A1D2E] dark:text-slate-100">{doc.display_name}</div>
                    <div className="text-[10px] text-[#6B7085]">{doc.original_name}</div>
                  </td>
                  <td className="p-4 text-[#1A1D2E] dark:text-slate-300 font-bold">{doc.page_count || 1} pg</td>
                  <td className="p-4 text-[#06B6D4] font-bold">{formatSize(doc.size_bytes)}</td>
                  <td className="p-4 text-[#8B5CF6] font-bold">{getEstimatedCharLength(doc)}</td>
                  <td className="p-4">
                    <Badge variant={doc.status === "Ready" ? "emerald" : doc.status === "Failed" ? "rose" : "amber"}>
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-[#6B7085]">{formatDate(doc.created_at)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => onSelectDoc(doc.id)} className="p-1.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F3] text-[#6B7085] hover:text-[#8B5CF6]">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteDoc(doc.id)} className="p-1.5 rounded-lg bg-[#F8F9FC] border border-[#E7E9F3] text-[#6B7085] hover:text-[#EF4444]">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

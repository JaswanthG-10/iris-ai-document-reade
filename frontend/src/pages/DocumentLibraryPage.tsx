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
  AlertOctagon
} from "lucide-react";
import type { Document } from "../types";
import { Button, Card, Badge } from "../components/ui/DesignSystem";

interface DocumentLibraryPageProps {
  documents: Document[];
  loading: boolean;
  onOpenUpload: () => void;
  onSelectDoc: (id: number) => void;
  onDeleteDoc: (id: number) => void;
}

export const DocumentLibraryPage: React.FC<DocumentLibraryPageProps> = ({
  documents,
  loading,
  onOpenUpload,
  onSelectDoc,
  onDeleteDoc
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = documents.filter((doc) => {
    const matchesSearch = doc.display_name.toLowerCase().includes(search.toLowerCase()) ||
                          doc.original_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            Document Library
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Manage your vector indexed files, status telemetry, and page chunks.
          </p>
        </div>

        <Button onClick={onOpenUpload} className="w-full sm:w-auto font-bold shadow-lg">
          <Plus className="w-4 h-4 mr-1" /> Upload Document
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-panel p-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents by name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {["all", "ready", "extracting", "chunking", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-xl capitalize transition-all ${
                statusFilter === st
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 font-bold"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-slate-400 transition-colors ${viewMode === "grid" ? "bg-indigo-600/30 text-indigo-300" : "hover:text-slate-200"}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg text-slate-400 transition-colors ${viewMode === "list" ? "bg-indigo-600/30 text-indigo-300" : "hover:text-slate-200"}`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => {
            const isReady = doc.status === "Ready";
            const isFailed = doc.status === "Failed";

            return (
              <Card key={doc.id} interactive className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {doc.file_type || "pdf"}
                    </span>
                    <Badge variant={isReady ? "emerald" : isFailed ? "rose" : "amber"}>
                      {isReady ? <CheckCircle2 className="w-3 h-3 mr-1" /> : isFailed ? <AlertOctagon className="w-3 h-3 mr-1" /> : <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                      {doc.status}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 line-clamp-1 mb-1" title={doc.display_name}>
                    {doc.display_name}
                  </h3>

                  <p className="text-xs text-slate-400 font-mono">
                    {doc.page_count || 0} pages • {formatSize(doc.size_bytes)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectDoc(doc.id)}
                      className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition-colors"
                      title="Inspect Document Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Document</th>
                <th className="p-4">Pages</th>
                <th className="p-4">Size</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-900/50">
                  <td className="p-4 font-bold text-slate-200">{doc.display_name}</td>
                  <td className="p-4 text-slate-400">{doc.page_count || 0}</td>
                  <td className="p-4 text-slate-400">{formatSize(doc.size_bytes)}</td>
                  <td className="p-4">
                    <Badge variant={doc.status === "Ready" ? "emerald" : doc.status === "Failed" ? "rose" : "amber"}>
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => onSelectDoc(doc.id)}
                      className="px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-300 hover:bg-rose-600/30"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {filtered.length === 0 && !loading && (
        <Card className="p-12 text-center text-slate-400 font-mono">
          No documents found matching your filter criteria.
        </Card>
      )}
    </div>
  );
};

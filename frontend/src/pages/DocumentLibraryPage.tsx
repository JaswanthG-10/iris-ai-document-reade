import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Upload, 
  Trash2, 
  Grid, 
  List, 
  Star, 
  MoreVertical, 
  Download, 
  ArrowUpDown,
  BookOpen
} from "lucide-react";
import type { Document } from "../types";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredDocs = documents
    .filter((doc) =>
      doc.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.display_name.localeCompare(b.display_name);
      if (sortBy === "size") return (b.size_bytes || 0) - (a.size_bytes || 0);
      return b.id - a.id;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6 font-sans select-none text-[#EDEFF7]">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12151F] border border-[#232838] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Document Library
          </h1>
          <p className="text-xs text-[#8A90A6]">
            Manage your uploaded files, trigger AI document summaries, and launch chat analysis.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="py-3 px-6 rounded-2xl cta-indigo-btn font-bold text-xs flex items-center gap-2 shadow-lg"
        >
          <Upload size={16} /> Upload New Document
        </button>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#12151F] border border-[#232838] shadow-lg">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-[#5A6078]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full bg-[#0B0D14] border border-[#232838] rounded-2xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-[#6E6BFF]"
          />
        </div>

        {/* Sort & Grid/List Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8A90A6]">
            <ArrowUpDown size={14} />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0B0D14] border border-[#232838] rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
            >
              <option value="date">Upload Date</option>
              <option value="name">File Name</option>
              <option value="size">File Size</option>
            </select>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-[#0B0D14] border border-[#232838]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" ? "bg-[#1A1E2B] text-[#6E6BFF] shadow-sm" : "text-[#5A6078]"
              }`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list" ? "bg-[#1A1E2B] text-[#6E6BFF] shadow-sm" : "text-[#5A6078]"
              }`}
            >
              <List size={15} />
            </button>
          </div>

        </div>
      </div>

      {/* Grid or List View */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#8A90A6]">Loading library documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#232838] rounded-3xl bg-[#12151F] space-y-3">
          <FileText className="w-10 h-10 text-[#5A6078] mx-auto" />
          <p className="text-sm font-bold text-white">No documents found</p>
          <p className="text-xs text-[#8A90A6]">Upload a document to get started.</p>
        </div>
      ) : viewMode === "grid" ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const isFav = favorites.includes(doc.id);

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className="p-6 rounded-3xl bg-[#12151F] border border-[#232838] hover:border-[#6E6BFF]/50 transition-all cursor-pointer space-y-4 shadow-lg relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#6E6BFF]/10 text-[#6E6BFF]">
                    <FileText size={22} />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => toggleFavorite(doc.id, e)}
                      className="p-1.5 text-[#5A6078] hover:text-[#F5A524] transition-colors"
                    >
                      <Star size={16} className={isFav ? "text-[#F5A524] fill-[#F5A524]" : ""} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === doc.id ? null : doc.id);
                      }}
                      className="p-1.5 text-[#5A6078] hover:text-white transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#6E6BFF] transition-colors truncate" title={doc.display_name}>
                    {doc.display_name}
                  </h3>
                  <p className="text-xs text-[#8A90A6] mt-1">
                    {doc.page_count || 1} {doc.page_count === 1 ? "Page" : "Pages"} • {(doc.size_bytes ? doc.size_bytes / 1024 : 120).toFixed(0)} KB
                  </p>
                </div>

                <div className="pt-3 border-t border-[#232838] flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/20">
                    {doc.status}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDoc(doc.id);
                    }}
                    className="text-xs font-semibold text-[#6E6BFF] hover:underline"
                  >
                    Open Document
                  </button>
                </div>

                {/* Dropdown Action Menu */}
                {activeMenuId === doc.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-4 top-14 bg-[#1A1E2B] border border-[#232838] rounded-2xl shadow-2xl p-2 z-20 w-44 text-xs font-semibold space-y-1"
                  >
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onSelectDoc(doc.id);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#12151F] flex items-center gap-2 text-white"
                    >
                      <BookOpen size={14} className="text-[#6E6BFF]" /> Open Analysis
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        alert(`Downloading ${doc.display_name}...`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#12151F] flex items-center gap-2 text-white"
                    >
                      <Download size={14} className="text-[#3ECF8E]" /> Download File
                    </button>
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onDeleteDoc(doc.id);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete Document
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (

        /* LIST VIEW */
        <div className="bg-[#12151F] border border-[#232838] rounded-3xl overflow-hidden shadow-lg">
          <div className="divide-y divide-[#232838]">
            {filteredDocs.map((doc) => {
              const isFav = favorites.includes(doc.id);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="p-4 hover:bg-[#1A1E2B] transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <button onClick={(e) => toggleFavorite(doc.id, e)} className="text-[#5A6078] hover:text-[#F5A524]">
                      <Star size={15} className={isFav ? "text-[#F5A524] fill-[#F5A524]" : ""} />
                    </button>
                    <FileText size={18} className="text-[#6E6BFF] shrink-0" />
                    <span className="font-bold text-white truncate" title={doc.display_name}>
                      {doc.display_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <span className="text-[#8A90A6]">
                      {doc.page_count || 1} Pages • {(doc.size_bytes ? doc.size_bytes / 1024 : 120).toFixed(0)} KB
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3ECF8E]/10 text-[#3ECF8E]">
                      {doc.status}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc.id);
                      }}
                      className="text-[#5A6078] hover:text-red-400 p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
export default DocumentLibraryPage;

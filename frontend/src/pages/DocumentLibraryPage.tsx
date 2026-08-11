import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  Upload, 
  Trash2, 
  Grid, 
  List, 
  Star, 
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
  const [sortBy] = useState<"name" | "date" | "size">("date");
  const [favorites, setFavorites] = useState<number[]>([]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto p-6 font-sans select-none text-[#EDEFF7] relative z-10"
    >
      {/* Header Bar */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12151F]/90 backdrop-blur-xl border border-[#232838] shadow-2xl"
      >
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Document Intelligence Library
          </h1>
          <p className="text-xs text-[#8A90A6]">
            Manage your uploaded files, trigger AI document summaries, and launch chat analysis.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onOpenUpload}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#6E6BFF] to-[#3FD0C9] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20"
        >
          <Upload size={16} /> Upload New Document
        </motion.button>
      </motion.div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#12151F]/90 backdrop-blur-xl border border-[#232838] shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6BFF]" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1E2B] border border-[#232838] focus:border-[#6E6BFF] text-xs rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-[#8A90A6] focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center bg-[#1A1E2B] border border-[#232838] rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "grid" ? "bg-[#6E6BFF] text-white" : "text-[#8A90A6] hover:text-white"
              }`}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "list" ? "bg-[#6E6BFF] text-white" : "text-[#8A90A6] hover:text-white"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Document Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#12151F] border border-[#232838] animate-pulse p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800" />
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 rounded-3xl bg-[#12151F]/80 border border-[#232838] text-center space-y-4 max-w-md mx-auto my-8"
        >
          <div className="w-16 h-16 rounded-3xl bg-[#6E6BFF]/10 text-[#6E6BFF] border border-[#6E6BFF]/20 flex items-center justify-center mx-auto">
            <BookOpen size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No documents match your query</h3>
            <p className="text-xs text-[#8A90A6]">Try adjusting your search terms or upload a new file.</p>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-[#6E6BFF] text-white text-xs font-bold shadow-lg hover:bg-[#5855FF] transition-all"
          >
            Upload Document
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-3"
          }
        >
          {filteredDocs.map((doc) => {
            const isFav = favorites.includes(doc.id);
            return (
              <motion.div
                key={doc.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectDoc(doc.id)}
                className={`p-6 rounded-2xl bg-[#12151F]/90 backdrop-blur-xl border border-[#232838] hover:border-[#6E6BFF]/40 shadow-xl cursor-pointer relative group transition-all ${
                  viewMode === "list" ? "flex items-center justify-between" : "space-y-4"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#6E6BFF]/10 text-[#6E6BFF] border border-[#6E6BFF]/20 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white truncate max-w-[200px]" title={doc.display_name}>
                        {doc.display_name}
                      </h3>
                      <p className="text-[11px] text-[#8A90A6] uppercase font-mono">
                        {doc.file_type} • {(doc.size_bytes / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(doc.id, e)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isFav ? "text-amber-400" : "text-[#5A6078] hover:text-white"
                    }`}
                  >
                    <Star size={16} fill={isFav ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#232838]/60">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                    doc.status === "Ready"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {doc.status}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDoc(doc.id);
                    }}
                    className="p-1.5 text-[#5A6078] hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Purge Document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

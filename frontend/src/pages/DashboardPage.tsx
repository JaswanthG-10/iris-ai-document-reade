import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { docApi, chatApi } from "../services/api";
import type { Document, Conversation } from "../types";
import { UploadModal } from "../components/documents/UploadModal";
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  HardDrive, 
  FileCheck, 
  ArrowRight,
  TrendingUp
} from "lucide-react";

interface DashboardPageProps {
  onSelectDoc?: (id: number) => void;
  onNavigateToLibrary?: () => void;
  onNavigateTab?: (tab: string, query?: string) => void;
  onUploadSuccess?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectDoc,
  onNavigateToLibrary,
  onNavigateTab,
  onUploadSuccess
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [docsData, convsData] = await Promise.all([
        docApi.list(),
        chatApi.listConversations()
      ]);
      setDocuments(docsData);
      setConversations(convsData);
    } catch (err) {
      console.error("Failed loading dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const readyDocs = documents.filter((d) => d.status === "Ready");
  const recentDocs = documents.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto p-6 font-sans select-none text-[#EDEFF7] relative z-10"
    >
      {/* 1. WELCOME HERO BANNER */}
      <motion.div
        variants={itemVariants}
        className="p-8 rounded-3xl bg-[#12151F]/90 backdrop-blur-xl border border-[#232838] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group"
      >
        {/* Animated Glow Core */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 w-96 h-96 rounded-full bg-gradient-to-br from-[#6E6BFF]/20 via-[#3FD0C9]/10 to-transparent blur-3xl pointer-events-none"
        />

        <div className="space-y-3 max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6E6BFF]/10 text-[#6E6BFF] text-xs font-semibold border border-[#6E6BFF]/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Document Workspace
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-[#6E6BFF] via-[#3FD0C9] to-white bg-clip-text text-transparent">{user?.name || "Architect"}</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#8A90A6] leading-relaxed">
            Upload your documents and let AI help you understand them instantly. Ask questions, generate summaries, and find key insights across your files.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setUploadOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6E6BFF] to-[#3FD0C9] text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-lg shadow-indigo-500/25 shrink-0 hover:shadow-indigo-500/40 transition-all relative z-10"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </motion.button>
      </motion.div>

      {/* 2. STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Indexed Documents", val: documents.length, icon: FileText, color: "#6E6BFF" },
          { label: "Ready Knowledge Base", val: readyDocs.length, icon: FileCheck, color: "#3FD0C9" },
          { label: "Active AI Chat Threads", val: conversations.length, icon: MessageSquare, color: "#A855F7" },
          { label: "Knowledge Core Storage", val: `${(documents.reduce((acc, d) => acc + d.size_bytes, 0) / (1024 * 1024)).toFixed(1)} MB`, icon: HardDrive, color: "#3B82F6" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="p-6 rounded-2xl bg-[#12151F]/90 backdrop-blur-xl border border-[#232838] hover:border-[#6E6BFF]/40 shadow-xl space-y-3 relative group overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8A90A6]">{stat.label}</span>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center p-2 rounded-lg"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-black text-white tracking-tight">{stat.val}</p>
                <span className="text-[11px] font-mono text-[#3FD0C9] flex items-center gap-0.5">
                  <TrendingUp size={11} /> +100%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. RECENT DOCUMENTS & QUICK PROMPTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Documents */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6E6BFF]" /> Recent Documents
            </h2>
            {onNavigateToLibrary && (
              <button
                onClick={onNavigateToLibrary}
                className="text-xs font-semibold text-[#6E6BFF] hover:underline flex items-center gap-1"
              >
                View Library <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentDocs.length === 0 ? (
              <div className="sm:col-span-2 p-8 rounded-2xl bg-[#12151F]/80 border border-[#232838] text-center space-y-3">
                <FileText className="w-8 h-8 text-[#5A6078] mx-auto animate-bounce" />
                <p className="text-sm font-semibold text-[#8A90A6]">No documents uploaded yet</p>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#6E6BFF]/10 text-[#6E6BFF] border border-[#6E6BFF]/30 text-xs font-bold hover:bg-[#6E6BFF]/20 transition-all"
                >
                  Upload First PDF
                </button>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectDoc && onSelectDoc(doc.id)}
                  className="p-5 rounded-2xl bg-[#12151F]/90 backdrop-blur-xl border border-[#232838] hover:border-[#6E6BFF]/40 shadow-lg cursor-pointer space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#6E6BFF]/10 text-[#6E6BFF] flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      doc.status === "Ready"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{doc.display_name}</h3>
                    <p className="text-[11px] text-[#8A90A6]">{doc.file_type.toUpperCase()} • {(doc.size_bytes / 1024).toFixed(0)} KB</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Right Column: AI Views & Quick Tool Actions */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-[#3FD0C9]" /> AI Tool Launchpad
          </h2>

          <div className="p-6 rounded-3xl bg-[#12151F]/90 backdrop-blur-xl border border-[#232838] shadow-xl space-y-4">
            <p className="text-xs text-[#8A90A6]">Instantly trigger document analysis pipelines:</p>

            {[
              { label: "Executive Summary", query: "Summarize this document and present an executive summary.", icon: "📋" },
              { label: "Key Action Items", query: "Extract all key action items, tasks, and responsibilities.", icon: "📋" },
              { label: "Study Flashcards", query: "Generate interactive study flashcards from the text.", icon: "📇" },
              { label: "Comprehension Quiz", query: "Create a 5-question comprehension quiz with answer keys.", icon: "🧪" }
            ].map((tool, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigateTab && onNavigateTab("chat", tool.query)}
                className="w-full p-3 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF]/40 text-left flex items-center justify-between text-xs font-semibold text-[#EDEFF7] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span>{tool.icon}</span>
                  <span>{tool.label}</span>
                </div>
                <ArrowRight size={13} className="text-[#6E6BFF]" />
              </motion.button>
            ))}
          </div>
        </motion.div>

      </div>

      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={() => {
            fetchDashboardData();
            if (onUploadSuccess) onUploadSuccess();
            setUploadOpen(false);
          }}
        />
      )}
    </motion.div>
  );
};

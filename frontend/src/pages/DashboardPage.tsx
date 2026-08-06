import React, { useState, useEffect } from "react";
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
  Star, 
  HardDrive, 
  FileCheck, 
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";

interface DashboardPageProps {
  onSelectDoc?: (id: number) => void;
  onNavigateToLibrary?: () => void;
  onNavigateTab?: (tab: string, query?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectDoc,
  onNavigateToLibrary,
  onNavigateTab
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
  const favoriteDocs = documents.slice(0, 2);
  const recentConvs = conversations.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 font-sans select-none text-[#EDEFF7]">
      
      {/* 1. WELCOME HERO BANNER */}
      <div className="p-8 rounded-3xl bg-[#12151F] border border-[#232838] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Background Ambient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#6E6BFF]/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E6BFF]/10 text-[#6E6BFF] text-xs font-semibold border border-[#6E6BFF]/20">
            <Sparkles className="w-3.5 h-3.5" /> AI Document Workspace
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="text-[#6E6BFF]">{user?.name || "Architect"}</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#8A90A6] leading-relaxed">
            Upload your documents and let AI help you understand them instantly. Ask questions, generate summaries, and find key insights across your files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10">
          <button
            onClick={() => setUploadOpen(true)}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl cta-indigo-btn text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <Upload size={16} /> Upload Document
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("chat")}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageSquare size={16} className="text-[#6E6BFF]" /> Open Chat Console
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#12151F] border border-[#232838] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A90A6]">Total Documents</span>
            <div className="p-2 rounded-xl bg-[#6E6BFF]/10 text-[#6E6BFF]">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{documents.length}</p>
          <p className="text-[11px] text-[#8A90A6]">{readyDocs.length} Ready for AI search</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151F] border border-[#232838] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A90A6]">Today's Processing</span>
            <div className="p-2 rounded-xl bg-[#3ECF8E]/10 text-[#3ECF8E]">
              <FileCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{readyDocs.length}</p>
          <p className="text-[11px] text-[#3ECF8E] font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> 100% Success Rate
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151F] border border-[#232838] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A90A6]">Recent Chat Threads</span>
            <div className="p-2 rounded-xl bg-[#3FD0C9]/10 text-[#3FD0C9]">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{conversations.length}</p>
          <p className="text-[11px] text-[#8A90A6]">Active AI conversations</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151F] border border-[#232838] shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A90A6]">Storage Usage</span>
            <div className="p-2 rounded-xl bg-[#F5A524]/10 text-[#F5A524]">
              <HardDrive size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white">14.2 MB</p>
          <p className="text-[11px] text-[#8A90A6]">250 MB Free Plan limit</p>
        </div>
      </div>

      {/* 3. RECENT DOCUMENTS & QUICK UPLOADER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Documents Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#6E6BFF]" /> Recent Documents
            </h2>
            {onNavigateToLibrary && (
              <button
                onClick={onNavigateToLibrary}
                className="text-xs font-bold text-[#6E6BFF] hover:underline flex items-center gap-1"
              >
                View All Library <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentDocs.length === 0 ? (
              <div className="col-span-2 p-8 text-center border border-dashed border-[#232838] rounded-3xl space-y-2 bg-[#12151F]">
                <FileText className="w-8 h-8 text-[#5A6078] mx-auto" />
                <p className="text-xs font-bold text-white">No documents uploaded yet</p>
                <p className="text-xs text-[#8A90A6]">Upload your first file to generate AI summaries and answer questions.</p>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc && onSelectDoc(doc.id)}
                  className="p-5 rounded-3xl bg-[#12151F] border border-[#232838] hover:border-[#6E6BFF]/50 transition-all cursor-pointer space-y-3 shadow-lg group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-[#6E6BFF]/10 text-[#6E6BFF]">
                      <FileText size={18} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3ECF8E]/10 text-[#3ECF8E] border border-[#3ECF8E]/20">
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#6E6BFF] transition-colors truncate" title={doc.display_name}>
                      {doc.display_name}
                    </h3>
                    <p className="text-[11px] text-[#8A90A6] mt-0.5">
                      {doc.page_count || 1} {doc.page_count === 1 ? "Page" : "Pages"} • {(doc.size_bytes ? doc.size_bytes / 1024 : 120).toFixed(0)} KB
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#232838] flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateTab) onNavigateTab("chat", `Summarize ${doc.display_name}`);
                      }}
                      className="text-[11px] font-semibold text-[#6E6BFF] hover:underline"
                    >
                      Generate Summary
                    </button>
                    <span className="text-[10px] text-[#5A6078] flex items-center gap-1">
                      <Clock size={10} /> Recently added
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Upload & Favorite Documents Column (1 Col) */}
        <div className="space-y-6">
          
          {/* Quick Drag & Drop Upload Zone */}
          <div className="p-6 rounded-3xl bg-[#12151F] border border-[#232838] shadow-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#6E6BFF]/10 text-[#6E6BFF] flex items-center justify-center mx-auto">
              <Upload size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Quick Upload</h3>
              <p className="text-xs text-[#8A90A6]">Drag & drop PDF or Word file to start AI analysis.</p>
            </div>

            <button
              onClick={() => setUploadOpen(true)}
              className="w-full py-2.5 px-4 rounded-2xl cta-indigo-btn text-white font-bold text-xs shadow-md"
            >
              Choose File
            </button>
          </div>

          {/* Favorite Pinned Documents */}
          <div className="p-6 rounded-3xl bg-[#12151F] border border-[#232838] shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-[#5A6078] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Star size={13} className="text-[#F5A524] fill-[#F5A524]" /> Favorite Documents
            </h3>

            <div className="space-y-2">
              {favoriteDocs.length === 0 ? (
                <p className="text-xs text-[#8A90A6]">No pinned favorites.</p>
              ) : (
                favoriteDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoc && onSelectDoc(doc.id)}
                    className="p-3 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF]/50 transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-[#6E6BFF] shrink-0" />
                      <span className="truncate font-semibold text-white" title={doc.display_name}>
                        {doc.display_name}
                      </span>
                    </div>
                    <Star size={12} className="text-[#F5A524] fill-[#F5A524] shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 4. RECENT CHATS & AI INSIGHTS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Chats Feed */}
        <div className="p-6 rounded-3xl bg-[#12151F] border border-[#232838] shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-[#6E6BFF]" /> Recent AI Chats
            </h3>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("chat")}
                className="text-xs font-bold text-[#6E6BFF] hover:underline"
              >
                Go to Chat Console
              </button>
            )}
          </div>

          <div className="space-y-2">
            {recentConvs.length === 0 ? (
              <p className="text-xs text-[#8A90A6]">No chat conversations started yet.</p>
            ) : (
              recentConvs.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onNavigateTab && onNavigateTab("chat")}
                  className="p-3.5 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF]/50 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <MessageSquare size={14} className="text-[#6E6BFF] shrink-0" />
                    <span className="font-semibold text-white truncate">{conv.title}</span>
                  </div>
                  <span className="text-[10px] text-[#5A6078] shrink-0">Active Thread</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Recent Activity Log */}
        <div className="p-6 rounded-3xl bg-[#12151F] border border-[#232838] shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity size={16} className="text-[#3ECF8E]" /> Recent AI Activity
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#1A1E2B] border border-[#232838]">
              <div className="w-2 h-2 rounded-full bg-[#3ECF8E] mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-white">Document Ingestion Completed</p>
                <p className="text-[11px] text-[#8A90A6]">CSE-to-AIML-Comeback-Roadmap.pdf processed with 100% text accuracy.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#1A1E2B] border border-[#232838]">
              <div className="w-2 h-2 rounded-full bg-[#6E6BFF] mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-white">Executive Summary Generated</p>
                <p className="text-[11px] text-[#8A90A6]">AI generated structured section breakdown for System-Design-Spec.pdf.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={() => {
            fetchDashboardData();
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;

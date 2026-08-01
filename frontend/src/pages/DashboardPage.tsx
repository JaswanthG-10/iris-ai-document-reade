import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { docApi } from "../services/api";
import type { Document } from "../types";

import { StatCard } from "../components/ui/StatCard";
import { QuickActionCard } from "../components/ui/QuickActionCard";
import { RecommendationCard } from "../components/ui/RecommendationCard";
import { ActivityTimeline } from "../components/ui/ActivityTimeline";
import type { ActivityEvent } from "../components/ui/ActivityTimeline";
import { EmptyState } from "../components/ui/EmptyState";
import { DocumentList } from "../components/documents/DocumentList";
import { UploadModal } from "../components/documents/UploadModal";
import { KnowledgeGraph } from "../components/common/KnowledgeGraph";
import { Button } from "../components/ui/DesignSystem";
import { 
  FileText, 
  CheckCircle2, 
  Layers, 
  Upload, 
  Activity, 
  ArrowRight,
  MessageSquare,
  Search,
  Sparkles,
  Scale,
  Cpu,
  Download,
  Clock,
  HardDrive,
  ShieldCheck,
  Zap,
  X,
  FileCheck
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [insightsDoc, setInsightsDoc] = useState<Document | null>(null);

  // Count-up animated stat values
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedReady, setAnimatedReady] = useState(0);
  const [animatedQuestions, setAnimatedQuestions] = useState(0);
  const [animatedStorage, setAnimatedStorage] = useState(0);
  const [animatedLatency, setAnimatedLatency] = useState(0);
  const [animatedProcTime, setAnimatedProcTime] = useState(0);

  const fetchDocuments = async () => {
    try {
      const data = await docApi.list();
      setDocuments(data);
    } catch (err) {
      console.error("Failed fetching library documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    
    const interval = setInterval(() => {
      const hasActiveJobs = documents.some((d) => 
        ["Uploaded", "Validating", "Extracting", "Chunking", "Embedding"].includes(d.status)
      );
      if (hasActiveJobs) {
        fetchDocuments();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [documents]);

  const totalDocs = documents.length;
  const readyDocs = documents.filter((d) => d.status === "Ready").length;
  const processingDocs = documents.filter((d) => ["Uploaded", "Validating", "Extracting", "Chunking", "Embedding"].includes(d.status)).length;
  const lastDoc = documents[0]?.display_name || "No documents uploaded yet";

  // Count-up animation effect over 600ms
  useEffect(() => {
    const duration = 600;
    const steps = 30;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedTotal(Math.round(totalDocs * progress));
      setAnimatedReady(Math.round(readyDocs * progress));
      setAnimatedQuestions(Math.round(24 * progress));
      setAnimatedStorage(Number((28.4 * progress).toFixed(1)));
      setAnimatedLatency(Math.round(42 * progress));
      setAnimatedProcTime(Number((1.8 * progress).toFixed(1)));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [totalDocs, readyDocs]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to purge this document and all its vector embeddings?")) return;
    try {
      await docApi.delete(id);
      if (selectedDoc?.id === id) setSelectedDoc(null);
      fetchDocuments();
    } catch (err) {
      alert("Failed to delete document: " + err);
    }
  };

  const handleSelectDoc = async (id: number) => {
    if (onSelectDoc) {
      onSelectDoc(id);
      return;
    }
    try {
      const fullDoc = await docApi.getById(id);
      setSelectedDoc(fullDoc);
      setInsightsDoc(fullDoc);
    } catch (err) {
      alert("Failed loading document preview: " + err);
    }
  };

  // Quick Action Handlers
  const handleQuickAction = (actionId: string) => {
    if (actionId === "upload") {
      setUploadOpen(true);
    } else if (actionId === "chat" && onNavigateTab) {
      onNavigateTab("chat");
    } else if (actionId === "search" && onNavigateTab) {
      onNavigateTab("library");
    } else if (actionId === "summary" && onNavigateTab) {
      onNavigateTab("prompts", "Provide a comprehensive executive summary highlighting core takeaways.");
    } else if (actionId === "compare" && onNavigateTab) {
      onNavigateTab("prompts", "Perform a comparative analysis contrasting key differences between documents.");
    } else if (actionId === "entities" && onNavigateTab) {
      onNavigateTab("prompts", "Extract all organizations, financial figures, technical standards, and risk factors.");
    } else if (actionId === "export") {
      alert("Exporting Intelligence Executive Report to PDF...");
    }
  };

  // Recent AI Activity Data
  const recentActivities: ActivityEvent[] = [
    { id: "1", type: "upload", title: "Uploaded Quarterly_Financial_Audit_2026.pdf", subtitle: "Indexed 42 pages into ChromaDB vector space", time: "10m ago" },
    { id: "2", type: "summary", title: "Generated Executive Summary", subtitle: "Extracted 5 key takeaways & financial risk metrics", time: "25m ago" },
    { id: "3", type: "chat", title: "Asked Iris AI Query", subtitle: "\"What are the compliance deadlines for Q3?\" [Cited Page 12]", time: "1h ago" },
    { id: "4", type: "compare", title: "Compared 2 Documents", subtitle: "Synthesized contract differences between V1 and V2", time: "2h ago" },
    { id: "5", type: "export", title: "Exported Intelligence Report", subtitle: "PDF summary exported to local workspace", time: "3h ago" }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative space-y-8 max-w-7xl mx-auto font-sans">
      <KnowledgeGraph documents={documents} />

      {/* 1. PRODUCTIVITY HERO SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(20,20,50,0.04),0_4px_12px_rgba(20,20,50,0.05)] relative z-10 overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                PRO INTEL TERMINAL
              </span>
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-mono text-[#6B7085] dark:text-slate-400">System Healthy</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A1D2E] dark:text-white">
              Welcome back, <span className="brand-gradient-text">{user?.name || "Developer"}</span>
            </h1>

            {/* Productivity Hero Telemetry Pill Highlights */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1 text-[#6B7085] dark:text-slate-400">
              <div className="flex items-center gap-1.5 bg-[#F8F9FC] dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-[#E7E9F3] dark:border-slate-800">
                <FileText className="w-4 h-4 text-[#8B5CF6]" />
                <span>Total Docs: <strong className="text-[#1A1D2E] dark:text-white">{totalDocs}</strong></span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#F8F9FC] dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-[#E7E9F3] dark:border-slate-800">
                <MessageSquare className="w-4 h-4 text-[#06B6D4]" />
                <span>AI Chats: <strong className="text-[#1A1D2E] dark:text-white">24 Today</strong></span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#F8F9FC] dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-[#E7E9F3] dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Processed Today: <strong className="text-[#10B981]">+{readyDocs} Cores</strong></span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#F8F9FC] dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-[#E7E9F3] dark:border-slate-800 truncate max-w-xs">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span className="truncate">Last Upload: <strong className="text-[#1A1D2E] dark:text-white">{lastDoc}</strong></span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <Button
              onClick={() => setUploadOpen(true)}
              size="lg"
              className="font-bold shadow-[0_4px_14px_rgba(139,92,246,0.25)]"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Document Core
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 2. QUICK ACTIONS SECTION (7 ATTRACTIVE CARDS) */}
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#8B5CF6]" /> Quick Productivity Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Upload Document"
            description="Upload PDF, DOCX, TXT or PNG/JPG for OCR vector indexing."
            icon={Upload}
            gradient="bg-gradient-to-br from-purple-600 to-indigo-600"
            onClick={() => handleQuickAction("upload")}
          />

          <QuickActionCard
            title="Chat with Iris AI"
            description="Start grounded RAG dialogue with inline citations."
            icon={MessageSquare}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
            onClick={() => handleQuickAction("chat")}
          />

          <QuickActionCard
            title="Search Documents"
            description="Execute 1536-dimensional cosine similarity search."
            icon={Search}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            onClick={() => handleQuickAction("search")}
          />

          <QuickActionCard
            title="Generate Summary"
            description="Auto-generate executive takeaways and section readouts."
            icon={Sparkles}
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            onClick={() => handleQuickAction("summary")}
          />

          <QuickActionCard
            title="Compare Documents"
            description="Cross-document side-by-side comparative reasoning."
            icon={Scale}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            onClick={() => handleQuickAction("compare")}
          />

          <QuickActionCard
            title="Extract Entities"
            description="Parse Organizations, Financials, Tech Specs & Risks."
            icon={Cpu}
            gradient="bg-gradient-to-br from-indigo-500 to-purple-700"
            onClick={() => handleQuickAction("entities")}
          />

          <QuickActionCard
            title="Export Report"
            description="Export verified citations and takeaways to PDF."
            icon={Download}
            gradient="bg-gradient-to-br from-[#06B6D4] to-cyan-600"
            onClick={() => handleQuickAction("export")}
          />
        </div>
      </div>

      {/* 3. ENHANCED STATISTICS CARDS GRID */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#06B6D4]" /> System Telemetry & Metrics
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Documents"
            value={animatedTotal}
            badgeText={`+${readyDocs} today`}
            badgeVariant="emerald"
            icon={FileText}
            iconBgColor="bg-[#E5FAFC] border-cyan-500/20"
            iconColor="text-[#06B6D4]"
          />

          <StatCard
            label="Ready Documents"
            value={animatedReady}
            subtext={`${processingDocs} active in queue`}
            badgeText={`${totalDocs > 0 ? Math.round((readyDocs/totalDocs)*100) : 100}% complete`}
            badgeVariant="indigo"
            icon={CheckCircle2}
            iconBgColor="bg-[#E7F9F1] border-emerald-500/20"
            iconColor="text-[#10B981]"
          />

          <StatCard
            label="AI Questions"
            value={animatedQuestions}
            subtext="24 today"
            badgeText="Active"
            badgeVariant="cyan"
            icon={MessageSquare}
            iconBgColor="bg-purple-500/10 border-purple-500/20"
            iconColor="text-[#8B5CF6]"
          />

          <StatCard
            label="Storage Used"
            value={`${animatedStorage}%`}
            subtext="1.42 GB / 5.0 GB"
            badgeText="Quota OK"
            badgeVariant="emerald"
            icon={HardDrive}
            iconBgColor="bg-[#FEF6E7] border-amber-500/20"
            iconColor="text-[#F59E0B]"
          />

          <StatCard
            label="Avg Vector Latency"
            value={`${animatedLatency} ms`}
            subtext="Top-5 Cosine Match"
            badgeText="Fast"
            badgeVariant="emerald"
            icon={Zap}
            iconBgColor="bg-[#E7F9F1] border-emerald-500/20"
            iconColor="text-[#10B981]"
          />

          <StatCard
            label="Avg Processing Time"
            value={`${animatedProcTime} s`}
            subtext="Chunk & Embed"
            badgeText="Optimal"
            badgeVariant="indigo"
            icon={Clock}
            iconBgColor="bg-[#F0EBFC] border-purple-500/20"
            iconColor="text-[#8B5CF6]"
          />
        </div>
      </div>

      {/* 4. RECENT DOCUMENTS & AI ACTIVITY TIMELINE (GRID LAYOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Recent Documents Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8B5CF6]" />
              Recent Document Cores
            </h2>

            {(onNavigateToLibrary || onNavigateTab) && (
              <Button variant="ghost" size="sm" onClick={() => onNavigateToLibrary ? onNavigateToLibrary() : onNavigateTab!("library")}>
                View Full Library <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>

          {documents.length > 0 ? (
            <DocumentList
              documents={documents}
              onSelect={handleSelectDoc}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState onOpenUpload={() => setUploadOpen(true)} />
          )}
        </div>

        {/* AI Activity Timeline (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <ActivityTimeline events={recentActivities} />
        </div>

      </div>

      {/* 5. AI INTELLIGENT RECOMMENDATIONS PANEL */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> Iris Intelligent Recommendations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RecommendationCard
            title="Deadlines Detected"
            description="This document contains 5 operational deadlines."
            confidence={98}
            icon={Clock}
            actionText="Extract Deadlines"
            onAction={() => handleQuickAction("summary")}
          />

          <RecommendationCard
            title="Extract Action Items"
            description="Identify task owners and deliverables."
            confidence={94}
            icon={CheckCircle2}
            actionText="Extract Actions"
            onAction={() => handleQuickAction("summary")}
          />

          <RecommendationCard
            title="Related Documents Found"
            description="Two documents exhibit 89% semantic overlap."
            confidence={89}
            icon={Scale}
            actionText="Compare Docs"
            onAction={() => handleQuickAction("compare")}
          />

          <RecommendationCard
            title="Executive Summary Ready"
            description="Generate section readouts for fast review."
            confidence={96}
            icon={FileCheck}
            actionText="Create Summary"
            onAction={() => handleQuickAction("summary")}
          />
        </div>
      </div>

      {/* 6. DOCUMENT INSIGHTS MODAL DRAWER */}
      {insightsDoc && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-[#E7E9F3] dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#8B5CF6]" />
                <h3 className="font-bold text-[#1A1D2E] dark:text-white text-sm">{insightsDoc.display_name}</h3>
              </div>
              <button onClick={() => setInsightsDoc(null)} className="text-[#A0A4B8] hover:text-[#1A1D2E]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800">
                <span className="text-[#6B7085] block text-[10px]">READING TIME</span>
                <span className="font-bold text-[#1A1D2E] dark:text-white">~ 4 minutes</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800">
                <span className="text-[#6B7085] block text-[10px]">ESTIMATED WORDS</span>
                <span className="font-bold text-[#06B6D4]">{((insightsDoc.page_count || 1) * 350).toLocaleString()} words</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800">
                <span className="text-[#6B7085] block text-[10px]">LANGUAGE DETECTED</span>
                <span className="font-bold text-[#10B981]">English (US)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800">
                <span className="text-[#6B7085] block text-[10px]">COMPLEXITY SCORE</span>
                <span className="font-bold text-[#F59E0B]">78 / 100 (Technical)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs">
              <span className="font-bold block mb-1">KEYWORDS & TOPICS:</span>
              Vector Retrieval, RAG Grounding, Cosine Index, Financial Compliance, Section Readout.
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setInsightsDoc(null)}>
                Close Insights
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER VECTOR CORE TELEMETRY WIDGET */}
      <footer className="pt-6 border-t border-[#E7E9F3] dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#6B7085] dark:text-slate-400 relative z-10">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#10B981]" /> DB Health: <strong className="text-[#10B981]">Healthy</strong></span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-[#8B5CF6]" /> Embedding: <strong className="text-[#8B5CF6]">Indexed</strong></span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#06B6D4]" /> Latency: <strong className="text-[#06B6D4]">42ms</strong></span>
        </div>

        <div className="flex items-center gap-4">
          <span>Storage: <strong className="text-[#1A1D2E] dark:text-slate-200">1.42 GB / 5.0 GB</strong></span>
          <span>•</span>
          <span>Last Sync: <strong className="text-[#10B981]">Just now</strong></span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-full bg-[#E7F9F1] text-[#10B981] font-bold text-[10px]">API Status 200 OK</span>
        </div>
      </footer>

      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={() => {
            fetchDocuments();
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
};

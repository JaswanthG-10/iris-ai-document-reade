import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { docApi } from "../services/api";
import type { Document } from "../types";

import { StatCard } from "../components/ui/StatCard";
import { QuickActionCard } from "../components/ui/QuickActionCard";
import { RecommendationCard } from "../components/ui/RecommendationCard";
import { AgentWorkflowsCard } from "../components/ui/AgentWorkflowsCard";
import { KnowledgeGraph } from "../components/common/KnowledgeGraph";
import { UploadModal } from "../components/documents/UploadModal";
import { Button, Card } from "../components/ui/DesignSystem";
import { 
  FileText, 
  CheckCircle2, 
  Upload, 
  MessageSquare, 
  Search,
  Sparkles,
  Scale,
  Clock,
  HardDrive,
  Zap,
  X,
  FileCheck,
  FileOutput,
  Network
} from "lucide-react";

interface DashboardPageProps {
  onSelectDoc?: (id: number) => void;
  onNavigateToLibrary?: () => void;
  onNavigateTab?: (tab: string, query?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [insightsDoc, setInsightsDoc] = useState<Document | null>(null);

  // Animated stat counters
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedReady, setAnimatedReady] = useState(0);
  const [animatedQuestions, setAnimatedQuestions] = useState(0);
  const [animatedStorage, setAnimatedStorage] = useState(0);
  const [animatedLatency, setAnimatedLatency] = useState(0);

  const fetchDocuments = async () => {
    try {
      const data = await docApi.list();
      setDocuments(data);
    } catch (err) {
      console.error("Failed loading dashboard documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const totalDocs = documents.length;
  const readyDocs = documents.filter((d) => d.status === "Ready").length;
  const processingDocs = documents.filter((d) => ["Extracting", "Chunking", "Embedding"].includes(d.status)).length;
  const lastDoc = documents[0];

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
      setAnimatedQuestions(Math.round(148 * progress));
      setAnimatedStorage(Number((28.4 * progress).toFixed(1)));
      setAnimatedLatency(Math.round(42 * progress));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [totalDocs, readyDocs]);

  // Quick Action Handlers
  const handleQuickAction = (actionId: string) => {
    if (actionId === "upload") {
      setUploadOpen(true);
    } else if (actionId === "chat" && onNavigateTab) {
      onNavigateTab("chat");
    } else if (actionId === "search" && onNavigateTab) {
      onNavigateTab("library");
    } else if (actionId === "summary" && onNavigateTab) {
      onNavigateTab("chat", "Provide a comprehensive executive summary highlighting core takeaways and key findings.");
    } else if (actionId === "compare" && onNavigateTab) {
      onNavigateTab("chat", "Perform a comparative analysis contrasting key differences between documents.");
    } else if (actionId === "entities" && onNavigateTab) {
      onNavigateTab("chat", "Extract all organizations, financial figures, technical standards, and risk factors.");
    } else if (actionId === "export" && onNavigateTab) {
      onNavigateTab("chat", "Export a verified intelligence report summarizing all indexed document takeaways.");
    }
  };

  const handleRunWorkflow = (promptQuery: string) => {
    if (onNavigateTab) {
      onNavigateTab("chat", promptQuery);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* 1. PRODUCTIVITY HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(20,20,50,0.04),0_4px_12px_rgba(20,20,50,0.05)] overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8B5CF6] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" /> ENTERPRISE DOCUMENT INTELLIGENCE HUB
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D2E] dark:text-white tracking-tight">
              Welcome back, <span className="brand-gradient-text">{user?.name || "Architect"}</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#6B7085] dark:text-slate-400 font-mono leading-relaxed">
              Iris AI has indexed <strong className="text-[#1A1D2E] dark:text-slate-200">{totalDocs} document cores</strong>. High-confidence RAG search, autonomous workflows, and page-level grounding are active.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Button
              size="lg"
              onClick={() => setUploadOpen(true)}
              className="w-full sm:w-auto font-bold shadow-[0_4px_14px_rgba(139,92,246,0.25)]"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Document Core
            </Button>
            
            {onNavigateTab && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigateTab("chat")}
                className="w-full sm:w-auto font-mono text-xs font-bold"
              >
                <MessageSquare className="w-4 h-4 mr-2 text-[#8B5CF6]" /> Launch Iris Chat
              </Button>
            )}
          </div>
        </div>

        {/* Hero Context Summary Strip */}
        <div className="mt-6 pt-6 border-t border-[#E7E9F3] dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[#A0A4B8] dark:text-slate-500 block text-[10px] uppercase font-bold">ACTIVE COLLECTION</span>
            <span className="font-bold text-[#1A1D2E] dark:text-slate-200">{readyDocs} / {totalDocs} Files Ready</span>
          </div>
          <div>
            <span className="text-[#A0A4B8] dark:text-slate-500 block text-[10px] uppercase font-bold">IN QUEUE</span>
            <span className="font-bold text-[#8B5CF6]">{processingDocs} Processing</span>
          </div>
          <div>
            <span className="text-[#A0A4B8] dark:text-slate-500 block text-[10px] uppercase font-bold">LAST INDEXED</span>
            <span className="font-bold text-[#06B6D4] truncate block" title={lastDoc?.display_name || "None"}>
              {lastDoc ? lastDoc.display_name : "No uploads yet"}
            </span>
          </div>
          <div>
            <span className="text-[#A0A4B8] dark:text-slate-500 block text-[10px] uppercase font-bold">RAG ENGINE</span>
            <span className="font-bold text-[#10B981]">Gemini 2.0 Flash</span>
          </div>
        </div>
      </motion.div>

      {/* 2. QUICK PRODUCTIVITY ACTIONS (GRID OF 7 CARDS) */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#8B5CF6]" /> Quick Productivity Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Upload Document"
            description="Index PDF, DOCX, TXT into vector space"
            icon={Upload}
            gradient="from-purple-600 to-indigo-600"
            onClick={() => handleQuickAction("upload")}
          />
          <QuickActionCard
            title="Chat with Iris AI"
            description="Ask grounded questions across documents"
            icon={MessageSquare}
            gradient="from-cyan-500 to-blue-600"
            onClick={() => handleQuickAction("chat")}
          />
          <QuickActionCard
            title="Search Documents"
            description="Filter by title, page count, size or status"
            icon={Search}
            gradient="from-indigo-500 to-purple-600"
            onClick={() => handleQuickAction("search")}
          />
          <QuickActionCard
            title="Generate Summary"
            description="Synthesize key takeaways & section readouts"
            icon={FileCheck}
            gradient="from-[#10B981] to-emerald-600"
            onClick={() => handleQuickAction("summary")}
          />
          <QuickActionCard
            title="Compare Documents"
            description="Contrast contract terms & specs"
            icon={Scale}
            gradient="from-amber-500 to-orange-600"
            onClick={() => handleQuickAction("compare")}
          />
          <QuickActionCard
            title="Extract Entities"
            description="Find dates, organizations & financials"
            icon={Sparkles}
            gradient="from-purple-500 to-pink-600"
            onClick={() => handleQuickAction("entities")}
          />
          <QuickActionCard
            title="Export Report"
            description="Download formatted executive intelligence brief"
            icon={FileOutput}
            gradient="from-blue-600 to-cyan-500"
            onClick={() => handleQuickAction("export")}
          />
        </div>
      </div>

      {/* 3. COUNT-UP SYSTEM STATS CARDS */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#06B6D4]" /> System Performance Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Documents"
            value={animatedTotal}
            subtext="Indexed in ChromaDB"
            badgeText="+12% this week"
            badgeVariant="emerald"
            icon={FileText}
            iconBgColor="bg-[#F0EBFC] border-purple-500/20"
            iconColor="text-[#8B5CF6]"
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
        </div>
      </div>

      {/* 4. AUTONOMOUS AI AGENT WORKFLOWS HUB */}
      <div className="relative z-10">
        <AgentWorkflowsCard onRunWorkflow={handleRunWorkflow} />
      </div>

      {/* 5. INTERACTIVE DOCUMENT KNOWLEDGE GRAPH */}
      <div className="relative z-10">
        <Card className="p-6 space-y-4 border-[#E7E9F3] dark:border-slate-800 font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#1A1D2E] dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Network className="w-4 h-4 text-[#8B5CF6]" /> Iris Interactive Knowledge Graph
              </h2>
              <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono mt-0.5">
                Real-time 2D vector topology mapping indexed document nodes, chunks, and semantic links.
              </p>
            </div>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono font-bold text-[10px] border border-purple-500/20">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> LIVE GRAPH ENGINE
            </span>
          </div>

          <div className="w-full h-80 rounded-2xl bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 overflow-hidden relative shadow-inner">
            <KnowledgeGraph documents={documents} />
          </div>
        </Card>
      </div>

      {/* 6. AI INTELLIGENT RECOMMENDATIONS PANEL */}
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

      {/* 7. DOCUMENT INSIGHTS MODAL DRAWER */}
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

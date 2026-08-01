import React, { useState } from "react";
import { 
  FileText, 
  Layers, 
  Send, 
  Bot, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw, 
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Document, Message } from "../types";
import { Button, Badge } from "../components/ui/DesignSystem";

interface DocumentDetailsPageProps {
  document: Document;
  onBack: () => void;
}

export const DocumentDetailsPage: React.FC<DocumentDetailsPageProps> = ({
  document,
  onBack
}) => {
  const [activePage, setActivePage] = useState(1);
  const [queryInput, setQueryInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      conversation_id: 1,
      role: "assistant",
      content: `Scoped RAG session active for **${document.display_name}**. Ask questions specifically regarding this document's vector chunks.`,
      model_name: "Claude 3.5 Sonnet",
      created_at: new Date().toISOString()
    }
  ]);
  const [isQuerying, setIsQuerying] = useState(false);

  const processingStages = [
    { stage: "Uploaded", done: true },
    { stage: "Validating", done: true },
    { stage: "Extracting", done: ["Extracting", "Chunking", "Embedding", "Ready"].includes(document.status) },
    { stage: "Chunking", done: ["Chunking", "Embedding", "Ready"].includes(document.status) },
    { stage: "Embedding", done: ["Embedding", "Ready"].includes(document.status) },
    { stage: "Ready", done: document.status === "Ready" }
  ];

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || isQuerying) return;

    const userMsg: Message = {
      id: Date.now(),
      conversation_id: 1,
      role: "user",
      content: queryInput,
      model_name: null,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput("");
    setIsQuerying(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        conversation_id: 1,
        role: "assistant",
        content: `Based on **${document.display_name}** (Page ${activePage}): According to the extracted text passages, the operational telemetry and vector embedding density confirm 98.4% compliance with NEXUS platform specs. [Citation: Page ${activePage}]`,
        model_name: "Claude 3.5 Sonnet",
        created_at: new Date().toISOString(),
        sources: [
          {
            id: 101,
            message_id: Date.now() + 1,
            document_id: document.id,
            chunk_id: 1,
            page_number: activePage,
            relevance_score: 0.98,
            supporting_excerpt: `Operational parameters for ${document.display_name} exhibit sub-second latency and zero off-target cleavage.`,
            document_name: document.display_name
          }
        ]
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsQuerying(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-[1600px] mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between glass-panel p-3.5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Library
          </Button>
          <div className="h-4 w-px bg-slate-800" />
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            {document.display_name}
          </h2>
        </div>

        <Badge variant={document.status === "Ready" ? "emerald" : "amber"}>
          {document.status}
        </Badge>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        <div className="lg:col-span-3 glass-panel p-4 flex flex-col justify-between overflow-y-auto space-y-4 font-mono text-xs">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Document Metadata
            </h3>

            <div className="space-y-2.5 text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">FILE NAME:</span>
                <span className="font-semibold text-slate-200">{document.original_name}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">FILE TYPE:</span>
                <span className="font-semibold text-cyan-400 uppercase">{document.file_type || "pdf"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PAGE COUNT:</span>
                <span className="font-semibold text-slate-200">{document.page_count || 1} pages</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">FILE SIZE:</span>
                <span className="font-semibold text-slate-200">{(document.size_bytes / (1024*1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Processing Timeline
            </h3>

            <div className="space-y-2">
              {processingStages.map((ps, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-[11px]">
                  <span className={ps.done ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {ps.stage}
                  </span>
                  {ps.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 glass-panel p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" /> Document Page Canvas
            </span>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-400">Page {activePage} of {document.page_count || 1}</span>
              <button
                onClick={() => setActivePage((p) => Math.min(document.page_count || 1, p + 1))}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-950 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto space-y-4">
            <div className="text-indigo-400 font-bold border-b border-slate-800 pb-2 flex justify-between">
              <span>PAGE {activePage} SECTION READOUT</span>
              <span className="text-[10px] text-emerald-400">GROUNDING VERIFIED</span>
            </div>

            <p>
              This section contains extracted text passages for <strong className="text-white">{document.display_name}</strong>. Paragraphs are embedded into dense 1536-dimensional vector space for high-precision retrieval.
            </p>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200">
              <span className="text-[10px] text-indigo-400 font-bold block mb-1">CITED PASSAGE HIGHLIGHT:</span>
              "Operational parameters exhibit sub-second latency and complete compliance with DocuMind AI security standards."
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 glass-panel p-4 flex flex-col justify-between overflow-hidden">
          <div className="border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" /> Scoped AI Chat Assistant
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono">
            {messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div key={msg.id} className={`p-3.5 rounded-2xl ${isAi ? "bg-slate-900 border border-slate-800 text-slate-200" : "bg-indigo-600 text-white font-medium ml-auto max-w-[85%]"}`}>
                  <p>{msg.content}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendQuery} className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Ask about ${document.display_name}...`}
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <Button type="submit" size="sm" isLoading={isQuerying}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

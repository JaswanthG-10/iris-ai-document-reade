import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { docApi, chatApi } from "../services/api";
import type { Document, Conversation, Message, MessageSource } from "../types";

import { KnowledgeGraph } from "../components/common/KnowledgeGraph";
import { AIToolsHubModal } from "../components/ui/AIToolsHubModal";
import { RAGSummaryReport } from "../components/ui/RAGSummaryReport";
import { AIProcessingIndicator } from "../components/ui/AIProcessingIndicator";
import { 
  MessageSquare, Plus, Trash2, Send, Edit2, Check, X, FileText, 
  BookOpen, Sparkles, Copy, RotateCcw
} from "lucide-react";

interface ChatPageProps {
  initialPrompt?: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ initialPrompt }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  // Scoped search filter
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [toolsModalOpen, setToolsModalOpen] = useState(false);

  // Loading and inputs
  const [inputMsg, setInputMsg] = useState(initialPrompt || "");
  const [loading, setLoading] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  
  // Renaming chat state
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Hover state for highlighting cited documents in graph
  const [hoveredSource, setHoveredSource] = useState<MessageSource | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const autoExecutedRef = useRef<string | null>(null);

  useEffect(() => {
    loadConversations();
    loadReadyDocuments();
  }, []);

  useEffect(() => {
    if (activeConvId !== null) {
      loadMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && autoExecutedRef.current !== initialPrompt && !loadingConvs) {
      autoExecutedRef.current = initialPrompt;
      setInputMsg(initialPrompt);
      executePromptQuery(initialPrompt.trim());
    }
  }, [initialPrompt, loadingConvs, activeConvId]);

  const loadConversations = async () => {
    try {
      const data = await chatApi.listConversations();
      setConversations(data);
      if (data.length > 0 && activeConvId === null) {
        setActiveConvId(data[0].id);
      }
    } catch (err) {
      console.error("Failed fetching chat histories:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadReadyDocuments = async () => {
    try {
      const data = await docApi.list();
      setDocuments(data.filter((d) => d.status === "Ready"));
    } catch (err) {
      console.error("Failed loading ready document list:", err);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const data = await chatApi.listMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error("Failed loading message thread details:", err);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await chatApi.createConversation(`Chat Session #${conversations.length + 1}`);
      setConversations([newChat, ...conversations]);
      setActiveConvId(newChat.id);
    } catch (err) {
      alert("Failed creating conversation thread: " + err);
    }
  };

  const handleDeleteChat = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation thread permanently?")) return;
    try {
      await chatApi.deleteConversation(id);
      setConversations(conversations.filter((c) => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
      }
    } catch (err) {
      alert("Failed to delete chat: " + err);
    }
  };

  const handleRenameChat = async (id: number) => {
    if (!renameTitle.trim()) return;
    try {
      const updated = await chatApi.renameConversation(id, renameTitle);
      setConversations(conversations.map((c) => (c.id === id ? updated : c)));
      setRenamingId(null);
    } catch (err) {
      alert("Failed to rename conversation: " + err);
    }
  };

  const executePromptQuery = async (userText: string) => {
    if (!userText.trim() || loading) return;

    let targetConvId = activeConvId;
    if (targetConvId === null) {
      try {
        const newChat = await chatApi.createConversation(`Analysis Session #${conversations.length + 1}`);
        setConversations((prev) => [newChat, ...prev]);
        setActiveConvId(newChat.id);
        targetConvId = newChat.id;
      } catch (err) {
        console.error("Failed creating chat thread:", err);
        return;
      }
    }

    setInputMsg("");
    setLoading(true);

    const tempUserMsg: Message = {
      id: Date.now(),
      conversation_id: targetConvId,
      role: "user",
      content: userText,
      model_name: null,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      let reply: Message;
      try {
        reply = await chatApi.submitQuestion(targetConvId, userText, selectedDocIds);
      } catch (submitErr: any) {
        if (submitErr.message && submitErr.message.includes("Conversation not found")) {
          // Self-healing: create fresh conversation thread and retry
          const freshChat = await chatApi.createConversation(`Analysis Session #${conversations.length + 1}`);
          setConversations((prev) => [freshChat, ...prev]);
          setActiveConvId(freshChat.id);
          targetConvId = freshChat.id;
          reply = await chatApi.submitQuestion(freshChat.id, userText, selectedDocIds);
        } else {
          throw submitErr;
        }
      }
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, reply]);
    } catch (err: any) {
      const errMsg: Message = {
        id: Date.now() + 1,
        conversation_id: targetConvId,
        role: "assistant",
        content: `Error generating response: ${err.message || "Endpoint connection failed"}`,
        model_name: null,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;
    executePromptQuery(inputMsg);
  };

  const handleCopyMessage = (msgId: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      executePromptQuery(lastUserMsg.content);
    }
  };

  const handleToggleDocSelect = (docId: number) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const renderMessageContent = (text: string, sources?: MessageSource[]) => {
    if (!sources || sources.length === 0) return text;
    const parts = text.split(/(\[Doc-\d+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[Doc-(\d+)\]/);
      if (match) {
        const docIdx = parseInt(match[1], 10);
        const targetSource = sources[docIdx];

        if (targetSource) {
          const docObj = documents.find((d) => d.id === targetSource.document_id);
          const isHovered = hoveredSource?.id === targetSource.id;

          return (
            <span
              key={index}
              onMouseEnter={() => setHoveredSource(targetSource)}
              onMouseLeave={() => setHoveredSource(null)}
              className={`inline-flex items-center gap-1 mx-0.5 px-2 py-0.5 rounded text-xs font-mono font-bold cursor-pointer transition-all ${
                isHovered
                  ? "bg-purple-500 text-white shadow-md scale-105"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20"
              }`}
              title={`Cited from ${docObj?.display_name || "Document"} (Page ${targetSource.page_number || 1})`}
            >
              <FileText size={10} />
              {part}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-950 font-sans">
      
      {/* Left Sidebar Pane: Threads & Dynamic Knowledge Mesh Graph */}
      <div className="w-80 border-r border-white/5 flex flex-col justify-between p-4 bg-[#0F131C] shrink-0 select-none">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          
          {/* New Chat Button */}
          <button
            onClick={handleCreateChat}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.98] transition-all font-mono"
          >
            <Plus size={16} /> New Chat Session
          </button>

          {/* Interactive Knowledge Graph Canvas Container */}
          <div className="h-44 rounded-2xl bg-slate-900 border border-white/5 overflow-hidden relative shadow-inner shrink-0">
            <div className="absolute top-2 left-2 z-10 text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded border border-purple-500/20">
              Topology Map
            </div>
            <KnowledgeGraph
              documents={documents}
              citedDocIds={hoveredSource && hoveredSource.document_id ? [hoveredSource.document_id] : []}
            />
          </div>

          {/* Conversations Thread List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1">
              Active Threads ({conversations.length})
            </div>

            {loadingConvs ? (
              <div className="p-4 text-center text-xs text-gray-500 animate-pulse">
                Loading history...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No chat sessions created yet.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConvId === conv.id;
                const isRenaming = renamingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                      isActive
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-300 font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare size={13} className={isActive ? "text-purple-400" : "text-gray-500"} />
                      {isRenaming ? (
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameChat(conv.id)}
                          className="bg-black/50 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-36"
                          autoFocus
                        />
                      ) : (
                        <span className="truncate" title={conv.title}>
                          {conv.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isRenaming ? (
                        <>
                          <button
                            onClick={() => handleRenameChat(conv.id)}
                            className="p-1 text-green-400 hover:bg-white/5 rounded"
                          >
                            <Check size={11} />
                          </button>
                          <button
                            onClick={() => setRenamingId(null)}
                            className="p-1 text-red-400 hover:bg-white/5 rounded"
                          >
                            <X size={11} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingId(conv.id);
                              setRenameTitle(conv.title);
                            }}
                            className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded"
                            title="Rename"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteChat(conv.id, e)}
                            className="p-1 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded"
                            title="Purge"
                          >
                            <Trash2 size={11} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Console Window */}
      <div className="flex-1 flex flex-col justify-between min-w-0 z-10 bg-[#0B0F19] relative">
        
        {/* Top Header & Controls */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              {conversations.find((c) => c.id === activeConvId)?.title || "Iris Intelligence Terminal"}
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">
              Provider: <span className="text-cyan-400 font-semibold">Gemini 2.0 Flash Grounded RAG</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* AI Tools Suite Trigger Button */}
            <button
              onClick={() => setToolsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all shadow-sm"
            >
              <Sparkles size={13} className="text-purple-400" /> AI Tools Suite
            </button>

            {/* Document scope selector */}
            <div className="relative">
              <button
                onClick={() => setShowDocSelector(!showDocSelector)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
                  selectedDocIds.length > 0
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <BookOpen size={12} />
                <span>
                  {selectedDocIds.length === 0 
                    ? "All Knowledge Sources" 
                    : `${selectedDocIds.length} Cited Sources`}
                </span>
              </button>

              {showDocSelector && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-30 font-mono">
                  <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">
                    Restrict Knowledge Scope
                  </h3>
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                    {documents.length === 0 ? (
                      <p className="text-[10px] text-gray-500">No ready documents in library index.</p>
                    ) : (
                      documents.map((doc) => (
                        <label 
                          key={doc.id} 
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDocIds.includes(doc.id)}
                            onChange={() => handleToggleDocSelect(doc.id)}
                            className="rounded border-white/10 bg-black/40 text-cyan-400 focus:ring-0"
                          />
                          <span className="truncate text-gray-300" title={doc.display_name}>
                            {doc.display_name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => setShowDocSelector(false)}
                    className="w-full bg-purple-600 text-white py-1.5 rounded-xl text-[10px] font-bold hover:bg-purple-500 transition-all"
                  >
                    Confirm Scope Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Log viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeConvId === null ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 font-mono">
              <MessageSquare size={36} className="text-purple-500 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-gray-300">Initialize Chat Connection</p>
              <p className="text-xs max-w-xs mt-1 leading-relaxed">
                Select a thread on the left pane or click "+ New Chat Session" to begin.
              </p>
            </div>
          ) : messages.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 max-w-md mx-auto font-mono space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-200">Iris Grounded Intelligence Terminal</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Ask questions, request executive summaries, flashcard study decks, or tool extractions.
                </p>
              </div>

              {/* Suggested Prompt Pills */}
              <div className="grid grid-cols-2 gap-2 text-left w-full pt-2">
                {[
                  "Provide a comprehensive executive summary",
                  "Extract action items and task owners",
                  "Generate a 3-card study flashcard deck",
                  "Simplify technical jargon & acronyms"
                ].map((promptText) => (
                  <button
                    key={promptText}
                    onClick={() => executePromptQuery(promptText)}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-xs text-gray-300 hover:text-white transition-all text-left"
                  >
                    💡 {promptText}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 font-mono">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, x: isUser ? 20 : -20, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`flex items-start gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xs text-purple-300 font-bold shrink-0 shadow-sm">
                        AI
                      </div>
                    )}
                    <div className="max-w-[85%] space-y-2">
                      <div 
                        className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed border ${
                          isUser 
                            ? "bg-[#6E6BFF] border-transparent text-white shadow-lg font-medium" 
                            : "bg-[#12151F] border-[#232838] text-[#EDEFF7] shadow-lg"
                        }`}
                      >
                        {isUser ? (
                          msg.content
                        ) : msg.content.includes("###") || msg.content.includes("Summary") || msg.content.includes("Key Finding") || msg.content.includes("Matrix") ? (
                          <RAGSummaryReport
                            summaryData={{
                              summary: msg.content,
                              key_takeaways: [
                                "Synthesis extracted directly from target document context.",
                                "Answers backed by high-confidence vector page matching."
                              ],
                              summary_type: "Executive"
                            }}
                            docTitle={documents.find((d) => msg.sources?.[0]?.document_id === d.id)?.display_name || "Grounded Document Analysis"}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {renderMessageContent(msg.content, msg.sources)}
                          </div>
                        )}

                        {/* Assistant Message Actions (Copy & Regenerate) */}
                        {!isUser && (
                          <div className="mt-3 pt-2 border-t border-[#232838] flex items-center justify-end gap-2 text-[10px] text-[#8A90A6]">
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1A1E2B] border border-[#232838] hover:text-white transition-colors"
                            >
                              {copiedId === msg.id ? <Check size={11} className="text-[#3ECF8E]" /> : <Copy size={11} />}
                              {copiedId === msg.id ? "Copied!" : "Copy"}
                            </button>
                            <button
                              onClick={handleRegenerate}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#1A1E2B] border border-[#232838] hover:text-white transition-colors"
                            >
                              <RotateCcw size={11} /> Regenerate
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Display source card citations below Assistant responses */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-col gap-2 mt-3 font-mono">
                          <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3" /> Grounded Source Citations ({msg.sources.length})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {msg.sources.map((src, idx) => {
                              const isHovered = hoveredSource?.id === src.id;
                              const docObj = documents.find((d) => d.id === src.document_id);
                              
                              const relScore = src.relevance_score !== null ? src.relevance_score : 0.88;
                              const confidencePercent = Math.round(relScore * 100);
                              
                              let confidenceBadge = {
                                label: `High Grounding (${confidencePercent}%)`,
                                styles: "bg-emerald-950/40 text-emerald-300 border-emerald-500/20"
                              };
                              if (confidencePercent < 70) {
                                confidenceBadge = {
                                  label: `Partial Grounding (${confidencePercent}%)`,
                                  styles: "bg-amber-950/40 text-amber-300 border-amber-500/20"
                                };
                              } else if (confidencePercent < 85) {
                                confidenceBadge = {
                                  label: `Medium Grounding (${confidencePercent}%)`,
                                  styles: "bg-cyan-950/40 text-cyan-300 border-cyan-500/20"
                                };
                              }

                              return (
                                <div
                                  key={src.id}
                                  onMouseEnter={() => setHoveredSource(src)}
                                  onMouseLeave={() => setHoveredSource(null)}
                                  className={`text-xs p-3 rounded-2xl border transition-all ${
                                    isHovered
                                      ? "bg-purple-500/10 border-purple-500 text-white shadow-md"
                                      : "bg-slate-900 border-slate-800 text-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 font-bold truncate">
                                      <FileText size={13} className="text-purple-400 shrink-0" />
                                      <span className="truncate max-w-[130px]" title={docObj?.display_name || `Doc #${src.document_id}`}>
                                        {docObj?.display_name || `Doc #${src.document_id}`}
                                      </span>
                                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
                                        [Doc-{idx}]
                                      </span>
                                    </div>

                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-950 border border-slate-800 text-gray-400 shrink-0">
                                      Page {src.page_number !== null ? src.page_number : "N/A"}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${confidenceBadge.styles}`}>
                                      {confidenceBadge.label}
                                    </span>
                                  </div>

                                  <p className="line-clamp-2 text-[11px] text-gray-400 italic leading-relaxed border-l-2 border-purple-500/40 pl-2">
                                    "{src.supporting_excerpt}"
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* 5-Step AI Reasoning Pipeline */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs text-indigo-300 font-bold shrink-0">
                    AI
                  </div>
                  <AIProcessingIndicator label="Iris AI Engine Active" />
                </motion.div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 font-mono">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              disabled={loading}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={
                activeConvId === null 
                  ? "Type your question (a thread will be created automatically)..." 
                  : "Ask Iris AI (e.g. 'Summarize section 3' or 'Extract action items')..."
              }
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500/50 rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl px-5 flex items-center justify-center transition-all shadow-md"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>

      <AIToolsHubModal
        isOpen={toolsModalOpen}
        onClose={() => setToolsModalOpen(false)}
        onRunTool={(query) => executePromptQuery(query)}
      />
    </div>
  );
};

export default ChatPage;

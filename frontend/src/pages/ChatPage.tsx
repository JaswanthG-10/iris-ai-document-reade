import React, { useState, useEffect, useRef } from "react";
import { docApi, chatApi } from "../services/api";
import type { Document, Conversation, Message, MessageSource } from "../types";

import { KnowledgeGraph } from "../components/common/KnowledgeGraph";
import { 
  MessageSquare, Plus, Trash2, Send, Edit2, Check, X, FileText, 
  BookOpen, Sparkles
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

  // Loading and inputs
  const [inputMsg, setInputMsg] = useState(initialPrompt || "");
  const [loading, setLoading] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  
  // Renaming chat state
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

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
      alert("Failed to start new chat session: " + err);
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
      const reply = await chatApi.submitQuestion(targetConvId, userText, selectedDocIds);
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

  const handleToggleDocSelect = (docId: number) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Extract cited doc IDs for active RAG visual highlights in background
  const getCitedDocIds = (): number[] => {
    const list: number[] = [];
    if (hoveredSource?.document_id) {
      return [hoveredSource.document_id];
    }
    // Pull cited document IDs from the last message in current thread
    const assistantMsgs = messages.filter((m) => m.role === "assistant");
    if (assistantMsgs.length > 0) {
      const lastMsg = assistantMsgs[assistantMsgs.length - 1];
      lastMsg.sources?.forEach((src) => {
        if (src.document_id && !list.includes(src.document_id)) {
          list.push(src.document_id);
        }
      });
    }
    return list;
  };

  // Highlight citation chips inside text segments
  const renderMessageContent = (content: string, sources: MessageSource[] = []) => {
    const parts = content.split(/(\[Doc-\d+\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[Doc-(\d+)\]/);
      if (match) {
        const sourceIdx = parseInt(match[1], 10);
        const source = sources[sourceIdx];
        if (!source) return part;

        const isHovered = hoveredSource?.id === source.id;
        return (
          <span
            key={idx}
            onMouseEnter={() => setHoveredSource(source)}
            onMouseLeave={() => setHoveredSource(null)}
            className={`inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded cursor-help mx-0.5 border transition-all ${
              isHovered 
                ? "bg-brandCyan text-darkBg border-brandCyan scale-110 shadow-[0_0_8px_#00E5FF]" 
                : "bg-brandCyan/10 text-brandCyan border-brandCyan/20 hover:border-brandCyan/40"
            }`}
          >
            [{sourceIdx}]
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Ambient background knowledge graph */}
      <KnowledgeGraph documents={documents} citedDocIds={getCitedDocIds()} />

      {/* Conversations History Sidebar */}
      <div className="w-72 bg-[#131720]/45 border-r border-white/5 flex flex-col justify-between z-10 glass-panel">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Chat Threads</h2>
            <button
              onClick={handleCreateChat}
              className="p-2 rounded-lg bg-brandCyan/10 text-brandCyan hover:bg-brandCyan/20 transition-all border border-brandCyan/15"
              title="Initialize dialogue session"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {loadingConvs ? (
              <div className="flex justify-center p-6">
                <span className="w-5 h-5 border-2 border-brandCyan/30 border-t-brandCyan rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-4 text-xs text-gray-500">
                No active chat logs. Click '+' to start.
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConvId === conv.id;
                const isRenaming = renamingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => !isRenaming && setActiveConvId(conv.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group ${
                      isActive 
                        ? "bg-[#181D29] border border-white/5 text-white" 
                        : "text-gray-400 hover:text-white hover:bg-white/[0.01]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare size={14} className={isActive ? "text-brandCyan" : "text-gray-500"} />
                      {isRenaming ? (
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameChat(conv.id)}
                          className="bg-black/35 border border-brandCyan/30 rounded px-1.5 py-0.5 text-xs text-white outline-none w-full"
                          autoFocus
                        />
                      ) : (
                        <span className="text-xs font-semibold truncate">{conv.title}</span>
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
      <div className="flex-1 flex flex-col justify-between min-w-0 z-10 bg-gradient-to-t from-darkBg via-darkBg/95 to-transparent relative">
        
        {/* Top Header & Document Scoped Search Controls */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between glass-panel">
          <div>
            <h1 className="text-sm font-bold text-white">
              {conversations.find((c) => c.id === activeConvId)?.title || "Chat Console"}
            </h1>
            <p className="text-[10px] text-gray-400">
              Query grounding provider: <span className="text-brandCyan font-semibold">Gemini 1.5 Flash</span>
            </p>
          </div>

          {/* Document scope selector */}
          <div className="relative">
            <button
              onClick={() => setShowDocSelector(!showDocSelector)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedDocIds.length > 0
                  ? "bg-brandIndigo/10 border-brandIndigo text-brandIndigo"
                  : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
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
              <div className="absolute right-0 mt-2 w-72 glass-panel rounded-xl p-4 shadow-2xl z-30 border border-white/10 bg-[#131720]">
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
                          className="rounded border-white/10 bg-black/40 text-brandCyan focus:ring-0"
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
                  className="w-full bg-brandCyan text-darkBg py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#00D0EB] transition-all"
                >
                  Confirm Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Log viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeConvId === null ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <MessageSquare size={36} className="text-gray-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-gray-400">Initialize Chat Connection</p>
              <p className="text-xs max-w-xs mt-1 leading-relaxed">
                Choose a conversation thread on the left pane or click '+' to start questioning.
              </p>
            </div>
          ) : messages.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 max-w-sm mx-auto">
              <Sparkles size={24} className="text-brandCyan mb-3" />
              <p className="text-sm font-semibold text-gray-300">Intelligent Grounding Terminal</p>
              <p className="text-xs mt-1 leading-relaxed">
                Submit queries regarding your vectorized documents. DocuMind will pull semantic matches and cite exactly where the fact is from.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div 
                    key={msg.id} 
                    className={`flex items-start gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-brandCyan/5 border border-brandCyan/25 flex items-center justify-center text-[10px] text-brandCyan font-black shrink-0">
                        AI
                      </div>
                    )}
                    <div className="max-w-[75%] space-y-2">
                      <div 
                        className={`rounded-2xl p-4 text-sm leading-relaxed border ${
                          isUser 
                            ? "bg-[#181D29] border-white/5 text-white" 
                            : "bg-[#131720]/80 border-white/5 text-gray-200 shadow-md"
                        }`}
                      >
                        {isUser ? (
                          msg.content
                        ) : (
                          <div className="whitespace-pre-wrap">
                            {renderMessageContent(msg.content, msg.sources)}
                          </div>
                        )}
                      </div>

                      {/* Display source card citations below Assistant responses */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-col gap-2 mt-3 font-mono">
                          <div className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-wider flex items-center gap-1.5">
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
                                styles: "bg-[#E7F9F1] dark:bg-emerald-950/40 text-[#10B981] border-emerald-500/20"
                              };
                              if (confidencePercent < 70) {
                                confidenceBadge = {
                                  label: `Partial Grounding (${confidencePercent}%)`,
                                  styles: "bg-[#FEF6E7] dark:bg-amber-950/40 text-[#F59E0B] border-amber-500/20"
                                };
                              } else if (confidencePercent < 85) {
                                confidenceBadge = {
                                  label: `Medium Grounding (${confidencePercent}%)`,
                                  styles: "bg-[#E5FAFC] dark:bg-cyan-950/40 text-[#06B6D4] border-cyan-500/20"
                                };
                              }

                              return (
                                <div
                                  key={src.id}
                                  onMouseEnter={() => setHoveredSource(src)}
                                  onMouseLeave={() => setHoveredSource(null)}
                                  className={`text-xs p-3 rounded-2xl border transition-all ${
                                    isHovered
                                      ? "bg-purple-500/10 border-[#8B5CF6] text-[#1A1D2E] dark:text-white shadow-md"
                                      : "bg-white dark:bg-slate-900 border-[#E7E9F3] dark:border-slate-800 text-[#1A1D2E] dark:text-slate-200"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 font-bold truncate">
                                      <FileText size={13} className="text-[#8B5CF6] shrink-0" />
                                      <span className="truncate max-w-[130px]" title={docObj?.display_name || `Doc #${src.document_id}`}>
                                        {docObj?.display_name || `Doc #${src.document_id}`}
                                      </span>
                                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 shrink-0">
                                        [Doc-{idx}]
                                      </span>
                                    </div>

                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] shrink-0">
                                      Page {src.page_number !== null ? src.page_number : "N/A"}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${confidenceBadge.styles}`}>
                                      {confidenceBadge.label}
                                    </span>
                                  </div>

                                  <p className="line-clamp-2 text-[11px] text-[#6B7085] dark:text-slate-400 italic leading-relaxed border-l-2 border-[#8B5CF6]/40 pl-2">
                                    "{src.supporting_excerpt}"
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming loading animation */}
              {loading && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-brandCyan/5 border border-brandCyan/25 flex items-center justify-center text-[10px] text-brandCyan font-black shrink-0">
                    AI
                  </div>
                  <div className="bg-[#131720]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-brandCyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-brandCyan rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-brandCyan rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box form */}
        <div className="p-4 border-t border-white/5 glass-panel">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              disabled={activeConvId === null || loading}
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={
                activeConvId === null 
                  ? "Select a chat session first..." 
                  : "Ask DocuMind (e.g. 'Summarize section 3')"
              }
              className="flex-1 bg-[#161C27]/40 border border-white/5 focus:border-brandCyan/40 focus:ring-1 focus:ring-brandCyan/40 rounded-xl py-3.5 px-5 text-sm text-white placeholder-gray-600 outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={activeConvId === null || loading || !inputMsg.trim()}
              className="bg-brandIndigo hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl px-5 flex items-center justify-center transition-all shadow-[0_0_10px_rgba(99,102,241,0.2)]"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
export default ChatPage;

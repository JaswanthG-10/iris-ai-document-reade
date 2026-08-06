import React, { useState } from "react";
import { 
  Bot, 
  FileText, 
  Palette, 
  MessageSquare, 
  Bell, 
  ShieldCheck, 
  Check, 
  Download,
  RotateCcw
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ai" | "documents" | "appearance" | "chat" | "notifications" | "privacy">("ai");
  const [saved, setSaved] = useState(false);

  // AI State
  const [aiModel, setAiModel] = useState("gemini-2.0-flash");
  const [responseLength, setResponseLength] = useState("balanced");
  const [creativityLevel, setCreativityLevel] = useState("precise");
  const [streaming, setStreaming] = useState(true);
  const [defaultSummaryStyle, setDefaultSummaryStyle] = useState("Executive");

  // Documents State
  const [ocrEnabled, setOcrEnabled] = useState(true);
  const [autoProcessing, setAutoProcessing] = useState(true);
  const [autoSummarize, setAutoSummarize] = useState(true);

  // Appearance State
  const [fontSize, setFontSize] = useState("Medium");
  const [animationsToggle, setAnimationsToggle] = useState(true);

  // Chat State
  const [autoScroll, setAutoScroll] = useState(true);
  const [markdownRendering, setMarkdownRendering] = useState(true);
  const [showCitations, setShowCitations] = useState(true);

  // Notifications State
  const [uploadAlerts, setUploadAlerts] = useState(true);
  const [processingAlerts, setProcessingAlerts] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "ai", label: "AI & Intelligence", icon: Bot },
    { id: "documents", label: "Document Processing", icon: FileText },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "chat", label: "Chat Preferences", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Data", icon: ShieldCheck }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans select-none text-[#EDEFF7] space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#12151F] border border-[#232838] shadow-lg">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Application Settings
          </h1>
          <p className="text-xs text-[#8A90A6]">
            Customize your AI model preferences, document processing defaults, and workspace appearance.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-6 rounded-2xl cta-indigo-btn font-bold text-xs flex items-center gap-2 shadow-md"
        >
          {saved ? <Check size={16} /> : null}
          <span>{saved ? "Settings Saved" : "Save Changes"}</span>
        </button>
      </div>

      {/* Main Settings Tabs & Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="space-y-1 bg-[#12151F] border border-[#232838] rounded-3xl p-3 shadow-lg h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#6E6BFF]/10 text-[#6E6BFF] font-bold border-l-2 border-[#6E6BFF]"
                    : "text-[#8A90A6] hover:text-white hover:bg-[#1A1E2B]"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#6E6BFF]" : "text-[#5A6078]"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="md:col-span-3 bg-[#12151F] border border-[#232838] rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          
          {/* TAB 1: AI */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">AI Model & Synthesis Settings</h2>
                <p className="text-xs text-[#8A90A6]">Select default intelligence models and response detail.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-white">AI Model Selection</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#232838] rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-[#6E6BFF]"
                  >
                    <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Fast & Recommended)</option>
                    <option value="gemini-2.0-pro">Google Gemini 2.0 Pro (High Intelligence Synthesis)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-white">Response Length</label>
                    <select
                      value={responseLength}
                      onChange={(e) => setResponseLength(e.target.value)}
                      className="w-full bg-[#0B0D14] border border-[#232838] rounded-2xl px-4 py-3 text-xs text-white outline-none"
                    >
                      <option value="concise">Concise & Direct</option>
                      <option value="balanced">Balanced Overview</option>
                      <option value="detailed">Detailed & Comprehensive</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-white">Creativity Level</label>
                    <select
                      value={creativityLevel}
                      onChange={(e) => setCreativityLevel(e.target.value)}
                      className="w-full bg-[#0B0D14] border border-[#232838] rounded-2xl px-4 py-3 text-xs text-white outline-none"
                    >
                      <option value="precise">Strictly Fact-Grounded (Precise)</option>
                      <option value="balanced">Balanced Natural Tone</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-white">Default Summary Style</label>
                  <select
                    value={defaultSummaryStyle}
                    onChange={(e) => setDefaultSummaryStyle(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#232838] rounded-2xl px-4 py-3 text-xs text-white outline-none"
                  >
                    <option value="Executive">Executive Summary (Overview + Key Takeaways)</option>
                    <option value="Bullet">Structured Bullet Points</option>
                    <option value="Academic">Academic Abstract & Methodology</option>
                    <option value="Business">Business Analysis & Risk Assessment</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Streaming Responses</p>
                    <p className="text-[11px] text-[#8A90A6]">Stream answer tokens in real-time as AI generates.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={streaming}
                    onChange={(e) => setStreaming(e.target.checked)}
                    className="rounded text-[#6E6BFF] focus:ring-0 bg-[#0B0D14]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Document Ingestion Defaults</h2>
                <p className="text-xs text-[#8A90A6]">Configure automatic text extraction and OCR options.</p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Optical Character Recognition (OCR)</p>
                    <p className="text-[11px] text-[#8A90A6]">Automatically extract text from scanned PDF images.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ocrEnabled}
                    onChange={(e) => setOcrEnabled(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Auto Document Processing</p>
                    <p className="text-[11px] text-[#8A90A6]">Index documents immediately upon upload completion.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoProcessing}
                    onChange={(e) => setAutoProcessing(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Auto Summarization</p>
                    <p className="text-[11px] text-[#8A90A6]">Automatically generate executive summaries when a file opens.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSummarize}
                    onChange={(e) => setAutoSummarize(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Appearance & Interface</h2>
                <p className="text-xs text-[#8A90A6]">Customize visual font scaling and theme settings.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-white">Theme</label>
                  <div className="p-3 rounded-2xl bg-[#0B0D14] border border-[#232838] font-semibold text-white flex items-center justify-between">
                    <span>Dark Theme ("Deep Signal" Obsidian Mode)</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#6E6BFF]/10 text-[#6E6BFF] font-bold border border-[#6E6BFF]/20">Dark Active</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-white">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full bg-[#0B0D14] border border-[#232838] rounded-2xl px-4 py-3 text-xs text-white outline-none"
                  >
                    <option value="Small">Small (14px)</option>
                    <option value="Medium">Medium Default (15px)</option>
                    <option value="Large">Large (16px)</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Smooth UI Animations</p>
                    <p className="text-[11px] text-[#8A90A6]">Enable subtle transitions and interactive card elevation.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={animationsToggle}
                    onChange={(e) => setAnimationsToggle(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: CHAT */}
          {activeTab === "chat" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Chat Console Options</h2>
                <p className="text-xs text-[#8A90A6]">Manage citation badges, markdown rendering, and thread history.</p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Show Sentence Citation Badges</p>
                    <p className="text-[11px] text-[#8A90A6]">Display clickable [Doc-0] page citation chips on AI claims.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showCitations}
                    onChange={(e) => setShowCitations(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Auto Scroll to New Messages</p>
                    <p className="text-[11px] text-[#8A90A6]">Scroll to bottom automatically as AI streaming tokens arrive.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Markdown Table & Code Formatting</p>
                    <p className="text-[11px] text-[#8A90A6]">Render rich markdown tables and syntax-highlighted code blocks.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={markdownRendering}
                    onChange={(e) => setMarkdownRendering(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Alerts & System Notifications</h2>
                <p className="text-xs text-[#8A90A6]">Configure toast popups and completion banners.</p>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Upload Complete Toasts</p>
                    <p className="text-[11px] text-[#8A90A6]">Notify when document upload and indexing finish.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={uploadAlerts}
                    onChange={(e) => setUploadAlerts(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0B0D14] border border-[#232838] cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Processing Warning Banners</p>
                    <p className="text-[11px] text-[#8A90A6]">Surface notifications if a PDF contains non-searchable image text.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={processingAlerts}
                    onChange={(e) => setProcessingAlerts(e.target.checked)}
                    className="rounded text-[#6E6BFF] bg-[#0B0D14]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 6: PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">Privacy & Workspace Control</h2>
                <p className="text-xs text-[#8A90A6]">Export your data or clear document workspace history.</p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-[#F5A524]/10 border border-[#F5A524]/20 text-[#F5A524] flex items-center justify-between">
                  <div>
                    <p className="font-bold">Export Workspace Data</p>
                    <p className="text-[11px] text-[#8A90A6]">Download all document summaries and conversation histories as JSON.</p>
                  </div>
                  <button
                    onClick={() => alert("Exporting workspace data JSON bundle...")}
                    className="py-2 px-3 rounded-xl bg-[#0B0D14] border border-[#F5A524]/40 font-bold text-[#F5A524] flex items-center gap-1.5 shadow-sm"
                  >
                    <Download size={13} /> Export JSON
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-between">
                  <div>
                    <p className="font-bold">Clear Chat Conversations</p>
                    <p className="text-[11px] text-red-300">Delete all past AI chat threads while keeping uploaded documents intact.</p>
                  </div>
                  <button
                    onClick={() => alert("Chat threads cleared successfully.")}
                    className="py-2 px-3 rounded-xl bg-[#0B0D14] border border-red-500/40 font-bold text-red-400 flex items-center gap-1.5 shadow-sm"
                  >
                    <RotateCcw size={13} /> Clear Threads
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
export default SettingsPage;

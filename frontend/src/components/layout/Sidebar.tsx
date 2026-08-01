import React from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  MessageSquare, 
  Sparkles, 
  Settings, 
  Globe, 
  BookOpen,
  Layers,
  ChevronRight
} from "lucide-react";
import type { NavigationTab } from "../../types";

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "dashboard" as NavigationTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "library" as NavigationTab, label: "Document Library", icon: FolderKanban },
    { id: "chat" as NavigationTab, label: "Iris RAG Chat", icon: MessageSquare },
    { id: "prompts" as NavigationTab, label: "Iris View", icon: Sparkles },
    { id: "docs" as NavigationTab, label: "Architecture & Docs", icon: BookOpen },
    { id: "settings" as NavigationTab, label: "Settings", icon: Settings },
    { id: "landing" as NavigationTab, label: "Landing Preview", icon: Globe }
  ];

  return (
    <aside className="w-[280px] bg-white dark:bg-slate-950 border-r border-[#E7E9F3] dark:border-slate-800 flex flex-col justify-between p-5 select-none shrink-0 transition-colors">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_4px_14px_rgba(139,92,246,0.25)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#1A1D2E] dark:text-white">
                Iris AI
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#6B7085] dark:text-slate-400 font-mono">Intelligent Platform</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#A0A4B8] dark:text-slate-500 mb-2.5 font-mono">
            Iris Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all relative overflow-hidden ${
                  isActive
                    ? "bg-[#F0EBFC] dark:bg-purple-950/40 text-[#8B5CF6] dark:text-purple-300 shadow-sm"
                    : "text-[#6B7085] dark:text-slate-400 hover:text-[#1A1D2E] dark:hover:text-slate-200 hover:bg-[#F0F1F8] dark:hover:bg-slate-900/60"
                }`}
              >
                {/* Active Pill 3px Gradient Left Border Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-purple-600 to-cyan-500 rounded-r" />
                )}

                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#8B5CF6] dark:text-cyan-400" : "text-[#A0A4B8] dark:text-slate-500"}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-purple-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vector Core Telemetry Pill */}
      <div className="p-4 rounded-2xl bg-[#F8F9FC] dark:bg-slate-900/80 border border-[#E7E9F3] dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#6B7085] dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#06B6D4]" /> Iris Vector Core
          </span>
          <span className="text-[#10B981] font-bold flex items-center gap-1 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> Active
          </span>
        </div>
        <div className="text-[10px] text-[#A0A4B8] dark:text-slate-500 font-mono">
          Vector DB: Chroma / FAISS Local
        </div>
      </div>
    </aside>
  );
};

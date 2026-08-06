import React from "react";
import { 
  LayoutDashboard, 
  FolderKanban, 
  MessageSquare, 
  Sparkles, 
  Settings, 
  ChevronRight,
  Code2
} from "lucide-react";
import type { NavigationTab } from "../../types";

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenAboutDeveloper?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenAboutDeveloper }) => {
  const navItems = [
    { id: "dashboard" as NavigationTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "library" as NavigationTab, label: "Document Library", icon: FolderKanban },
    { id: "chat" as NavigationTab, label: "AI Chat Console", icon: MessageSquare },
    { id: "prompts" as NavigationTab, label: "AI Views & Tools", icon: Sparkles },
    { id: "settings" as NavigationTab, label: "Settings", icon: Settings }
  ];

  return (
    <aside className="w-[270px] bg-[#12151F] border-r border-[#232838] flex flex-col justify-between p-5 select-none shrink-0 text-[#EDEFF7] font-sans shadow-lg">
      <div>
        {/* Prominent Logo Lockup (Top-Left) */}
        <div className="flex items-center gap-3.5 px-2 py-2 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6E6BFF] to-[#3FD0C9] text-white p-2 flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-5 h-5 fill-current text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                Iris AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#6E6BFF]/10 text-[#6E6BFF] border border-[#6E6BFF]/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#8A90A6]">AI Document Assistant</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#5A6078] mb-2 font-mono">
            Navigation Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? "bg-[#6E6BFF]/10 text-[#6E6BFF] border-l-2 border-[#6E6BFF] font-bold shadow-sm"
                    : "text-[#8A90A6] hover:text-white hover:bg-[#1A1E2B]"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#6E6BFF]" : "text-[#8A90A6]"}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#6E6BFF] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Area: Developer Specs Button */}
      <div className="pt-4 border-t border-[#232838]">
        {onOpenAboutDeveloper && (
          <button
            onClick={onOpenAboutDeveloper}
            className="w-full py-2.5 px-3 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF]/40 text-[#8A90A6] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Code2 size={14} className="text-[#6E6BFF]" />
            <span>Developer Specs</span>
          </button>
        )}
      </div>
    </aside>
  );
};

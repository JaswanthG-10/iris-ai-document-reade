import React from "react";
import { Search, Command } from "lucide-react";
import { ProfileDropdown } from "../ui/ProfileDropdown";
import type { NavigationTab } from "../../types";

interface TopHeaderProps {
  onOpenCommandPalette: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenCommandPalette,
  activeTab
}) => {
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard": return "System Overview Dashboard";
      case "library": return "Document Intelligence Library";
      case "chat": return "Iris Grounded RAG Chat Engine";
      case "prompts": return "Iris View";
      case "docs": return "Iris Architecture & Technical Specs";
      case "settings": return "Platform Settings & Preferences";
      case "landing": return "Public SaaS Overview";
      default: return "Dashboard Overview";
    }
  };

  return (
    <header className="h-[72px] bg-white dark:bg-slate-950/80 border-b border-[#E7E9F3] dark:border-slate-800 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0 transition-colors">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
        <span className="text-[#6B7085] dark:text-slate-400 font-bold">Iris AI</span>
        <span className="text-[#A0A4B8]">/</span>
        <span className="text-[#1A1D2E] dark:text-slate-100 font-bold tracking-tight">{getBreadcrumbTitle()}</span>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar with Inset Shadow */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 text-[#6B7085] dark:text-slate-400 hover:text-[#1A1D2E] text-xs font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] transition-all"
        >
          <Search className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Quick search & command actions...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] text-[#A0A4B8] border border-[#E7E9F3] dark:border-slate-700 flex items-center gap-0.5 font-sans">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        <div className="h-5 w-px bg-[#E7E9F3] dark:bg-slate-800" />

        {/* User Profile Dropdown Menu */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

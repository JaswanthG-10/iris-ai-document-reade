import React from "react";
import { motion } from "framer-motion";
import { Search, Command, Sparkles } from "lucide-react";
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
      case "settings": return "Platform Settings & Preferences";
      default: return "Dashboard Overview";
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[72px] bg-[#0A0D14]/80 backdrop-blur-xl border-b border-[#232838] px-6 flex items-center justify-between z-20 shrink-0 select-none shadow-lg"
    >
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono">
        <span className="text-[#8A90A6] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#6E6BFF] animate-pulse" />
          Iris AI
        </span>
        <span className="text-[#5A6078]">/</span>
        <motion.span
          key={activeTab}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-white font-bold tracking-tight"
        >
          {getBreadcrumbTitle()}
        </motion.span>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar with Focus Glow */}
        <motion.button
          whileHover={{ scale: 1.02, borderColor: "rgba(110, 107, 255, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-[#12151F] border border-[#232838] text-[#8A90A6] hover:text-white text-xs font-mono shadow-inner transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-[#6E6BFF] group-hover:scale-110 transition-transform" />
          <span>Search documents or execute command...</span>
          <kbd className="px-2 py-0.5 rounded-md bg-[#1A1E2B] text-[10px] text-[#A0A4B8] border border-[#232838] flex items-center gap-1 font-sans">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </motion.button>

        <div className="h-5 w-px bg-[#232838]" />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </motion.header>
  );
};

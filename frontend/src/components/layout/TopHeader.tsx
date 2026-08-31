import React from "react";
import { motion } from "framer-motion";
import { Search, Command, Sparkles, Menu } from "lucide-react";
import { ProfileDropdown } from "../ui/ProfileDropdown";
import type { NavigationTab } from "../../types";

interface TopHeaderProps {
  onOpenCommandPalette: () => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onToggleMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenCommandPalette,
  activeTab,
  onToggleMobileMenu
}) => {
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard";
      case "library": return "Document Library";
      case "chat": return "AI Chat Console";
      case "prompts": return "Iris View";
      case "settings": return "Settings";
      default: return "Dashboard";
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-[64px] sm:h-[72px] bg-[#0A0D14]/90 backdrop-blur-xl border-b border-[#232838] px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 select-none shadow-lg"
    >
      {/* Left side: Hamburger Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-[#12151F] border border-[#232838] text-[#8A90A6] hover:text-white transition-all"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={18} />
          </motion.button>
        )}

        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono truncate">
          <span className="text-[#8A90A6] font-semibold flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#6E6BFF] animate-pulse" />
            <span className="hidden sm:inline">Iris AI</span>
          </span>
          <span className="text-[#5A6078]">/</span>
          <motion.span
            key={activeTab}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white font-bold tracking-tight truncate max-w-[140px] sm:max-w-none"
          >
            {getBreadcrumbTitle()}
          </motion.span>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search Bar Button (Desktop & Mobile) */}
        <motion.button
          whileHover={{ scale: 1.02, borderColor: "rgba(110, 107, 255, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-xl bg-[#12151F] border border-[#232838] text-[#8A90A6] hover:text-white text-xs font-mono shadow-inner transition-all group"
        >
          <Search className="w-3.5 h-3.5 text-[#6E6BFF] group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Search documents or commands...</span>
          <span className="md:hidden text-[11px]">Search</span>
          <kbd className="hidden sm:flex px-1.5 py-0.5 rounded-md bg-[#1A1E2B] text-[10px] text-[#A0A4B8] border border-[#232838] items-center gap-1 font-sans">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </motion.button>

        <div className="h-5 w-px bg-[#232838] hidden sm:block" />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </motion.header>
  );
};

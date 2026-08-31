import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderKanban, 
  MessageSquare, 
  Sparkles, 
  Settings, 
  ChevronRight,
  Code2,
  X
} from "lucide-react";
import type { NavigationTab } from "../../types";

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenAboutDeveloper?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenAboutDeveloper,
  mobileOpen = false,
  onCloseMobile
}) => {
  const navItems = [
    { id: "dashboard" as NavigationTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "library" as NavigationTab, label: "Document Library", icon: FolderKanban },
    { id: "chat" as NavigationTab, label: "AI Chat Console", icon: MessageSquare },
    { id: "prompts" as NavigationTab, label: "AI Views & Tools", icon: Sparkles },
    { id: "settings" as NavigationTab, label: "Settings", icon: Settings }
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-5 text-[#EDEFF7] font-sans select-none">
      <div>
        {/* Logo Lockup with close button on mobile */}
        <div className="flex items-center justify-between px-2 py-2 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-3.5 cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6E6BFF] via-[#3FD0C9] to-[#818CF8] text-white p-2 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 overflow-hidden">
              <Sparkles className="w-5 h-5 fill-current text-white relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  Iris AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#6E6BFF]/15 text-[#6E6BFF] border border-[#6E6BFF]/30 shadow-sm">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-[#8A90A6]">AI Document Intelligence</p>
            </div>
          </motion.div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-[#8A90A6] hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#5A6078] mb-2 font-mono">
            Navigation Menu
          </div>
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 + 0.1, duration: 0.25 }}
                whileHover={{ x: 4, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 sm:py-2.5 rounded-2xl text-xs font-semibold relative transition-colors ${
                  isActive
                    ? "text-white font-bold"
                    : "text-[#8A90A6] hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarGlow"
                    className="absolute inset-0 bg-gradient-to-r from-[#6E6BFF]/20 to-[#3FD0C9]/10 rounded-2xl border-l-2 border-[#6E6BFF] shadow-lg shadow-indigo-500/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-2.5 truncate relative z-10">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#6E6BFF]" : "text-[#8A90A6]"}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-[#6E6BFF] shrink-0 relative z-10" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer Developer Specs */}
      <div className="pt-4 border-t border-[#232838]">
        {onOpenAboutDeveloper && (
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onOpenAboutDeveloper();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full py-3 sm:py-2.5 px-3 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF]/40 text-[#8A90A6] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Code2 size={14} className="text-[#6E6BFF]" />
            <span>Developer Specs</span>
          </motion.button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Always Visible on lg screens) */}
      <aside className="hidden lg:flex w-[270px] bg-[#12151F]/95 border-r border-[#232838] flex-col justify-between shrink-0 z-20 relative shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-over on < lg screens) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#12151F] border-r border-[#232838] z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { Building, Sun, Moon, Keyboard, HardDrive, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative font-mono" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F0F1F8] dark:hover:bg-slate-900 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 p-0.5 shadow-sm">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-xs font-bold text-[#8B5CF6]">
            {user?.name ? user.name[0].toUpperCase() : "I"}
          </div>
        </div>
        <div className="hidden sm:block text-xs text-left">
          <div className="font-bold text-[#1A1D2E] dark:text-slate-100 leading-none">{user?.name || "Developer"}</div>
          <div className="text-[10px] text-[#6B7085] dark:text-slate-400 mt-0.5">{user?.email || "dev@iris.ai"}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#A0A4B8]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-0.5 animate-fade-in">
          <div className="px-3 py-2 border-b border-[#E7E9F3] dark:border-slate-800">
            <div className="font-bold text-[#1A1D2E] dark:text-slate-100">{user?.name || "Developer"}</div>
            <div className="text-[10px] text-[#6B7085] dark:text-slate-400 truncate">{user?.email || "dev@iris.ai"}</div>
          </div>

          <button onClick={() => { alert("Workspace: Iris Enterprise Main"); setIsOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#1A1D2E] dark:text-slate-200 hover:bg-[#F0F1F8] dark:hover:bg-slate-800">
            <Building className="w-4 h-4 text-[#8B5CF6]" />
            <span>Workspace: Enterprise</span>
          </button>

          <button onClick={() => { toggleTheme(); setIsOpen(false); }} className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[#1A1D2E] dark:text-slate-200 hover:bg-[#F0F1F8] dark:hover:bg-slate-800">
            <div className="flex items-center gap-2.5">
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#8B5CF6]" />}
              <span>Appearance</span>
            </div>
            <span className="text-[10px] text-[#A0A4B8] capitalize">{theme}</span>
          </button>

          <button onClick={() => { alert("Keyboard Shortcuts:\n• Cmd+K: Quick Search & Commands\n• Esc: Close Modals"); setIsOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#1A1D2E] dark:text-slate-200 hover:bg-[#F0F1F8] dark:hover:bg-slate-800">
            <Keyboard className="w-4 h-4 text-[#06B6D4]" />
            <span>Keyboard Shortcuts</span>
          </button>

          <div className="px-3 py-2 border-t border-b border-[#E7E9F3] dark:border-slate-800 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#6B7085] flex items-center gap-1"><HardDrive className="w-3 h-3 text-[#10B981]" /> Storage Meter</span>
              <span className="font-bold text-[#1A1D2E] dark:text-slate-200">1.42 / 5.0 GB</span>
            </div>
            <div className="w-full h-1.5 bg-[#F0F1F8] dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full" style={{ width: "28.4%" }} />
            </div>
          </div>

          <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#EF4444] hover:bg-[#FDEDED] dark:hover:bg-rose-950/30">
            <LogOut className="w-4 h-4" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

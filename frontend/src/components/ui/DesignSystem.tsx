import React from "react";
import { Search, Command } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-cyan-500 hover:brightness-105 text-white shadow-[0_4px_14px_rgba(139,92,246,0.25)] active:scale-98 font-bold",
    secondary: "bg-[#06B6D4] hover:bg-cyan-400 text-white font-bold shadow-md shadow-cyan-500/20 active:scale-98",
    outline: "border border-[#E7E9F3] dark:border-slate-800 hover:border-[#C9CDE8] dark:hover:border-slate-700 text-[#1A1D2E] dark:text-slate-200 hover:bg-[#F0F1F8] dark:hover:bg-slate-800/50",
    ghost: "text-[#6B7085] dark:text-slate-400 hover:text-[#1A1D2E] dark:hover:text-slate-100 hover:bg-[#F0F1F8] dark:hover:bg-slate-800/40",
    danger: "bg-[#EF4444] hover:bg-rose-500 text-white shadow-md shadow-rose-500/20 active:scale-98"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs sm:text-sm gap-2",
    lg: "px-6 py-3 text-sm sm:text-base gap-2.5"
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      )}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; interactive?: boolean; onClick?: () => void }> = ({
  children,
  className = "",
  interactive = false,
  onClick
}) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-2xl shadow-[0_1px_2px_rgba(20,20,50,0.04),0_4px_12px_rgba(20,20,50,0.05)] transition-all duration-200 ${
      interactive ? "hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(20,20,50,0.06),0_12px_24px_rgba(139,92,246,0.08)] hover:border-[#C9CDE8] cursor-pointer" : ""
    } ${className}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: "indigo" | "emerald" | "amber" | "rose" | "cyan";
  className?: string;
}> = ({ children, variant = "indigo", className = "" }) => {
  const styles = {
    indigo: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20",
    emerald: "bg-[#E7F9F1] dark:bg-emerald-950/40 text-[#10B981] border-emerald-500/20",
    cyan: "bg-[#E5FAFC] dark:bg-cyan-950/40 text-[#06B6D4] border-cyan-500/20",
    amber: "bg-[#FEF6E7] dark:bg-amber-950/40 text-[#F59E0B] border-amber-500/20",
    rose: "bg-[#FDEDED] dark:bg-rose-950/40 text-[#EF4444] border-rose-500/20"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-[#F0F1F8] dark:bg-slate-800 rounded-xl ${className}`} />
);

export const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}> = ({ isOpen, onClose, onSelectAction }) => {
  if (!isOpen) return null;

  const actions = [
    { id: "dashboard", label: "Go to Overview Dashboard", icon: "📊" },
    { id: "library", label: "Manage Document Library", icon: "📚" },
    { id: "chat", label: "Start Iris RAG Chat Session", icon: "💬" },
    { id: "prompts", label: "Open Iris View Prompts", icon: "⭐" },
    { id: "docs", label: "View Architecture & System Specs", icon: "📖" },
    { id: "upload", label: "Upload New Core Document", icon: "📤" },
    { id: "settings", label: "Open Platform Preferences", icon: "⚙️" }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono">
        <div className="flex items-center px-4 py-3 border-b border-[#E7E9F3] dark:border-slate-800">
          <Search className="w-4 h-4 text-[#8B5CF6] mr-2" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-[#1A1D2E] dark:text-slate-100 placeholder-[#A0A4B8] focus:outline-none"
          />
          <button onClick={onClose} className="px-2 py-0.5 text-xs text-[#A0A4B8] hover:text-[#1A1D2E] border border-[#E7E9F3] rounded-lg">
            ESC
          </button>
        </div>

        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          {actions.map((act) => (
            <button
              key={act.id}
              onClick={() => {
                onSelectAction(act.id);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#1A1D2E] dark:text-slate-200 hover:bg-[#F0F1F8] dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span>{act.icon}</span>
                <span>{act.label}</span>
              </div>
              <Command className="w-3 h-3 text-[#A0A4B8]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

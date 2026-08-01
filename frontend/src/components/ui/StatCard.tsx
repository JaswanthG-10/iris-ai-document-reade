import React from "react";
import { Card } from "./DesignSystem";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badgeText?: string;
  badgeVariant?: "emerald" | "indigo" | "amber" | "cyan" | "rose";
  icon: React.ElementType;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  badgeText,
  badgeVariant = "emerald",
  icon: Icon,
  iconBgColor = "bg-purple-500/10 dark:bg-purple-950/40",
  iconColor = "text-purple-600 dark:text-purple-400"
}) => {
  const badgeStyles = {
    emerald: "bg-[#E7F9F1] text-[#10B981] border-emerald-500/20",
    indigo: "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20",
    cyan: "bg-[#E5FAFC] text-[#06B6D4] border-cyan-500/20",
    amber: "bg-[#FEF6E7] text-[#F59E0B] border-amber-500/20",
    rose: "bg-[#FDEDED] text-[#EF4444] border-rose-500/20"
  };

  return (
    <Card interactive className="p-5 flex flex-col justify-between space-y-3 font-sans">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7085] dark:text-slate-400">
          {label}
        </span>
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${iconBgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-extrabold text-[#1A1D2E] dark:text-white font-mono tracking-tight">
            {value}
          </span>
          {badgeText && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeStyles[badgeVariant]}`}>
              {badgeText}
            </span>
          )}
        </div>

        {subtext && (
          <p className="text-[11px] text-[#A0A4B8] dark:text-slate-400 font-mono mt-1">
            {subtext}
          </p>
        )}
      </div>
    </Card>
  );
};

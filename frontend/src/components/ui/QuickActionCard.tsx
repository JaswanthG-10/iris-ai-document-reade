import React from "react";
import { ArrowRight } from "lucide-react";
import { Card } from "./DesignSystem";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  onClick: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  onClick
}) => {
  return (
    <Card
      interactive
      onClick={onClick}
      className="p-5 flex flex-col justify-between space-y-3 group border-[#E7E9F3] dark:border-slate-800 hover:border-[#C9CDE8] font-sans"
    >
      <div className="flex items-center justify-between gap-2">
        <div className={`w-11 h-11 rounded-2xl ${gradient} flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="w-7 h-7 rounded-full bg-[#F0F1F8] dark:bg-slate-800 flex items-center justify-center text-[#6B7085] group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#1A1D2E] dark:text-white group-hover:text-[#8B5CF6] transition-colors mb-1">
          {title}
        </h3>
        <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </Card>
  );
};

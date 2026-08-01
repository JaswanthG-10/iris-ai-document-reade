import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, Button } from "./DesignSystem";

interface RecommendationCardProps {
  title: string;
  description: string;
  confidence: number;
  icon: React.ElementType;
  actionText: string;
  onAction: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  description,
  confidence,
  icon: Icon,
  actionText,
  onAction
}) => {
  return (
    <Card className="p-4 flex flex-col justify-between space-y-3 border-[#E7E9F3] dark:border-slate-800 font-sans">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1A1D2E] dark:text-white line-clamp-1">{title}</h4>
            <p className="text-[11px] text-[#6B7085] dark:text-slate-400 font-mono mt-0.5 line-clamp-1">{description}</p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E5FAFC] text-[#06B6D4] border border-cyan-500/20 shrink-0">
          {confidence}% confidence
        </span>
      </div>

      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={onAction} className="text-xs font-mono">
          {actionText} <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </Card>
  );
};

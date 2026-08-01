import React from "react";
import { Upload, Sparkles, MessageSquare, Scale, Download, Clock } from "lucide-react";
import { Card } from "./DesignSystem";

export interface ActivityEvent {
  id: string;
  type: "upload" | "summary" | "chat" | "compare" | "export";
  title: string;
  subtitle: string;
  time: string;
}

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "upload": return { icon: Upload, color: "text-[#06B6D4] bg-[#E5FAFC]" };
      case "summary": return { icon: Sparkles, color: "text-[#8B5CF6] bg-[#F0EBFC]" };
      case "chat": return { icon: MessageSquare, color: "text-[#10B981] bg-[#E7F9F1]" };
      case "compare": return { icon: Scale, color: "text-[#F59E0B] bg-[#FEF6E7]" };
      case "export": return { icon: Download, color: "text-blue-600 bg-blue-50" };
      default: return { icon: Clock, color: "text-[#6B7085] bg-[#F0F1F8]" };
    }
  };

  return (
    <Card className="p-5 space-y-4 font-sans border-[#E7E9F3] dark:border-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold font-mono text-[#1A1D2E] dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#8B5CF6]" /> Recent AI Activity Feed
        </h3>
        <span className="text-[10px] font-mono text-[#6B7085] dark:text-slate-400">Real-time Telemetry</span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-[#E7E9F3] dark:before:bg-slate-800">
        {events.map((event) => {
          const { icon: Icon, color } = getEventIcon(event.type);
          return (
            <div key={event.id} className="flex items-start gap-3 relative pl-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-xs font-mono">
                <div className="font-bold text-[#1A1D2E] dark:text-slate-200">{event.title}</div>
                <div className="text-[11px] text-[#6B7085] dark:text-slate-400">{event.subtitle}</div>
              </div>
              <span className="text-[10px] text-[#A0A4B8] dark:text-slate-500 font-mono shrink-0">
                {event.time}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

import React, { useState } from "react";
import { Calendar, Clock, Download, FileText, Filter } from "lucide-react";

export interface TimelineEventItem {
  id: string;
  title: string;
  dateStr: string;
  category: "deadline" | "milestone" | "deliverable" | "compliance";
  docTitle: string;
  pageNumber: number;
  description: string;
}

interface TimelineCalendarViewProps {
  events?: TimelineEventItem[];
}

export const TimelineCalendarView: React.FC<TimelineCalendarViewProps> = ({ events }) => {
  const defaultEvents: TimelineEventItem[] = [
    {
      id: "evt-1",
      title: "System Design & Architecture Deliverable",
      dateStr: "2026-08-15",
      category: "deadline",
      docTitle: "CSE-to-AIML-Comeback-Roadmap.pdf",
      pageNumber: 2,
      description: "Finalize multi-stage RAG pipeline and vector search index specifications."
    },
    {
      id: "evt-[#2]",
      title: "Security & Compliance Audit Review",
      dateStr: "2026-08-22",
      category: "compliance",
      docTitle: "CSE-to-AIML-Comeback-Roadmap.pdf",
      pageNumber: 3,
      description: "Verify tenant isolation filters and 1536-dim vector embedding privacy."
    },
    {
      id: "evt-3",
      title: "Production Deployment & SLA Verification",
      dateStr: "2026-09-01",
      category: "milestone",
      docTitle: "System-Design-Spec.pdf",
      pageNumber: 4,
      description: "Verify 99.9% uptime availability and automatic fallback synthesis."
    }
  ];

  const activeEvents = events && events.length > 0 ? events : defaultEvents;
  const [filterCat, setFilterCat] = useState<string>("all");

  const filteredEvents = activeEvents.filter((evt) =>
    filterCat === "all" ? true : evt.category === filterCat
  );

  // ICS File Generator for 1-Click Calendar Export (Google Calendar / Apple Calendar / Outlook)
  const handleExportICS = (evt: TimelineEventItem) => {
    const formattedDate = evt.dateStr.replace(/-/g, "");
    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Iris AI Intelligence Platform//Timeline Exporter//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Iris AI Task - ${evt.title}`,
      `DESCRIPTION:${evt.description} (Document: ${evt.docTitle}, Page ${evt.pageNumber})`,
      `DTSTART;VALUE=DATE:${formattedDate}`,
      `DTEND;VALUE=DATE:${formattedDate}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `iris_task_${evt.id}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full p-6 rounded-3xl bg-[#12151F] border border-[#232838] shadow-2xl font-mono select-none space-y-6 text-[#EDEFF7]">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232838] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#3FD0C9]/10 text-[#3FD0C9] border border-[#3FD0C9]/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Proactive Timeline & Extracted Obligations
            </h2>
            <p className="text-[10px] text-[#8A90A6]">
              Extracted deadlines, milestones, and deliverables with 1-click ICS Calendar export
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter size={13} className="text-[#8A90A6]" />
          {["all", "deadline", "milestone", "compliance"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold uppercase transition-all ${
                filterCat === cat
                  ? "bg-[#6E6BFF]/20 text-[#6E6BFF] border border-[#6E6BFF]/40"
                  : "bg-[#1A1E2B] text-[#8A90A6] hover:text-white border border-[#232838]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Event Feed */}
      <div className="relative pl-6 space-y-6 border-l-2 border-[#232838]">
        {filteredEvents.map((evt) => {
          let badgeStyle = "bg-[#6E6BFF]/10 text-[#6E6BFF] border-[#6E6BFF]/20";
          if (evt.category === "deadline") badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20";
          if (evt.category === "compliance") badgeStyle = "bg-[#F5A524]/10 text-[#F5A524] border-[#F5A524]/20";
          if (evt.category === "milestone") badgeStyle = "bg-[#3ECF8E]/10 text-[#3ECF8E] border-[#3ECF8E]/20";

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#12151F] border-2 border-[#6E6BFF] group-hover:border-[#3FD0C9] transition-colors" />

              <div className="p-4 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF]/40 transition-all space-y-2.5 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${badgeStyle}`}>
                      {evt.category}
                    </span>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#6E6BFF] transition-colors">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 text-[11px] text-[#3FD0C9] font-bold">
                      <Clock size={12} /> {evt.dateStr}
                    </span>
                    <button
                      onClick={() => handleExportICS(evt)}
                      className="px-2.5 py-1 rounded-xl bg-[#0B0D14] border border-[#232838] hover:border-[#6E6BFF] text-[#6E6BFF] text-[10px] font-bold flex items-center gap-1 transition-all"
                      title="Export to Calendar (.ics)"
                    >
                      <Download size={11} /> Export ICS
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#EDEFF7] leading-relaxed">
                  {evt.description}
                </p>

                <div className="pt-2 border-t border-[#232838] flex items-center justify-between text-[10px] text-[#8A90A6]">
                  <span className="flex items-center gap-1">
                    <FileText size={11} className="text-[#6E6BFF]" /> {evt.docTitle}
                  </span>
                  <span>Source Page {evt.pageNumber}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

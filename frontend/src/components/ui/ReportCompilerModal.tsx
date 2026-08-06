import React, { useState } from "react";
import { FileText, Download, Trash2, X, Share2, Layers, BookOpen } from "lucide-react";

export interface PinnedReportItem {
  id: string;
  title: string;
  content: string;
  docTitle?: string;
  pageNumber?: number | string;
  citationLabel?: string;
}

interface ReportCompilerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedItems: PinnedReportItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const ReportCompilerModal: React.FC<ReportCompilerModalProps> = ({
  isOpen,
  onClose,
  pinnedItems,
  onRemoveItem,
  onClearAll
}) => {
  if (!isOpen) return null;

  const [reportTitle, setReportTitle] = useState("Iris AI Executive Briefing Report");
  const [downloading, setDownloading] = useState(false);

  const handleExport = (format: "markdown" | "pdf") => {
    setDownloading(true);

    let docText = `# ${reportTitle}\n\n`;
    docText += `*Compiled via Iris AI Team Workspaces on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    pinnedItems.forEach((item, idx) => {
      docText += `## ${idx + 1}. ${item.title}\n\n`;
      docText += `${item.content}\n\n`;
      docText += `> **Source**: ${item.docTitle || "Document"} (Page ${item.pageNumber || 1}) — ${item.citationLabel || "[Doc-0]"}\n\n---\n\n`;
    });

    if (format === "markdown") {
      const blob = new Blob([docText], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, "_")}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // PDF export fallback via printable text window
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>${reportTitle}</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
                h1 { color: #4F46E5; border-bottom: 2px solid #EEE; pb: 10px; }
                h2 { color: #333; margin-top: 24px; }
                blockquote { background: #F8F9FC; border-left: 4px solid #6E6BFF; padding: 12px; font-size: 13px; color: #555; }
                hr { border: none; border-top: 1px solid #EEE; margin: 20px 0; }
              </style>
            </head>
            <body>
              ${docText.replace(/\n/g, "<br/>")}
            </body>
          </html>
        `);
        win.document.close();
        win.print();
      }
    }

    setTimeout(() => {
      setDownloading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono select-none animate-fade-in text-[#EDEFF7]">
      <div className="bg-[#12151F] border border-[#232838] rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232838] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6E6BFF] to-[#3FD0C9] p-0.5 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Team Report Compiler & Exporter
              </h2>
              <p className="text-[10px] text-[#8A90A6]">
                Compile pinned findings into a formatted executive deliverable ({pinnedItems.length} Pinned Items)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1A1E2B] border border-[#232838] text-[#8A90A6] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Title Input */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-[#8A90A6] uppercase tracking-wider">
            Deliverable Document Title
          </label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="w-full bg-[#0B0D14] border border-[#232838] focus:border-[#6E6BFF] rounded-2xl px-4 py-2.5 text-xs text-white outline-none transition-all"
          />
        </div>

        {/* Pinned Items List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {pinnedItems.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#232838] rounded-2xl space-y-2 text-[#8A90A6]">
              <Layers className="w-8 h-8 mx-auto text-[#6E6BFF] animate-pulse" />
              <p className="text-xs font-bold text-white">No Pinned Findings Yet</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Click "Pin to Report" on any finding or chat response to build your compiled team deliverable.
              </p>
            </div>
          ) : (
            pinnedItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF]/40 transition-all space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#6E6BFF]">
                    Item #{idx + 1}: {item.title}
                  </span>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded bg-[#0B0D14] text-[#8A90A6] hover:text-red-400 transition-colors"
                    title="Remove from report"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <p className="text-xs text-[#EDEFF7] line-clamp-3 leading-relaxed">
                  {item.content}
                </p>

                <div className="pt-2 border-t border-[#232838] flex items-center justify-between text-[10px] text-[#8A90A6]">
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} className="text-[#3FD0C9]" /> {item.docTitle || "Document"} (Page {item.pageNumber || 1})
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#0B0D14] border border-[#232838] font-bold text-[#6E6BFF]">
                    {item.citationLabel || `[Doc-${idx}]`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#232838] flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            onClick={onClearAll}
            disabled={pinnedItems.length === 0}
            className="px-3 py-2 rounded-xl bg-[#1A1E2B] border border-[#232838] hover:text-red-400 text-[#8A90A6] transition-colors disabled:opacity-50"
          >
            Clear Deck
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("markdown")}
              disabled={pinnedItems.length === 0 || downloading}
              className="px-4 py-2.5 rounded-xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF] text-[#EDEFF7] font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download size={13} /> Export Markdown (.md)
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={pinnedItems.length === 0 || downloading}
              className="px-4 py-2.5 rounded-xl cta-gradient-btn text-white font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Share2 size={13} /> Compile & Print PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

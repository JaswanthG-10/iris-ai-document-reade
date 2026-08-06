import React, { useState } from "react";
import { 
  Layout, 
  Layers, 
  Compass, 
  Box, 
  Settings, 
  HelpCircle, 
  Sparkles,
  Maximize2,
  CheckCircle2,
  Copy
} from "lucide-react";

export interface SidebarWireframeProps {
  className?: string;
}

export const SidebarWireframe: React.FC<SidebarWireframeProps> = ({ className = "" }) => {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  const primaryNavItems = [
    { id: 1, labelWidth: "w-28", icon: Layout },
    { id: 2, labelWidth: "w-24", icon: Layers },
    { id: 3, labelWidth: "w-32", icon: Compass },
    { id: 4, labelWidth: "w-20", icon: Box },
    { id: 5, labelWidth: "w-28", icon: Sparkles }
  ];

  const utilityNavItems = [
    { id: 6, labelWidth: "w-24", icon: Settings },
    { id: 7, labelWidth: "w-20", icon: HelpCircle }
  ];

  const handleCopy = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className={`w-full space-y-6 font-sans ${className}`}>
      
      {/* 4. CANVAS FRAME: Presentation container wrapping the entire application layout */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-[#0B0D14] border border-[#232838] shadow-2xl overflow-hidden select-none">
        
        {/* STRUCTURAL ALIGNMENT GUIDE LINES (Outer Margins & Corner Markers) */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#6E6BFF]/40 pointer-events-none" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#6E6BFF]/40 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#6E6BFF]/40 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#6E6BFF]/40 pointer-events-none" />
        
        {/* Alignment Dashed Grid Overlay */}
        <div className="absolute inset-x-6 top-6 bottom-14 border border-dashed border-[#232838] pointer-events-none rounded-2xl opacity-60" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-6 mb-2 border-b border-[#232838] relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6E6BFF] animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Wireframe Inspector Mode
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF] text-xs font-mono font-semibold text-[#EDEFF7] flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copiedCode ? <CheckCircle2 size={13} className="text-[#3ECF8E]" /> : <Copy size={13} />}
              <span>{copiedCode ? "Copied Spec" : "Copy Spec"}</span>
            </button>
          </div>
        </div>

        {/* 1. SPLIT LAYOUT: Main outer container split horizontally into Sidebar & Content Viewport */}
        <div className="w-full h-[520px] rounded-2xl bg-[#12151F] border border-[#232838] flex flex-col md:flex-row overflow-hidden shadow-2xl relative z-10">
          
          {/* 2. SIDEBAR STRUCTURE: Narrow left-hand column */}
          <aside className="w-full md:w-64 bg-[#12151F] border-r border-[#232838] flex flex-col justify-between p-5 shrink-0">
            
            {/* Header Section: Brand block featuring small icon slot + "TypeUI" label */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-8 h-8 rounded-xl bg-[#6E6BFF] text-white p-1.5 flex items-center justify-center shadow-md font-mono font-black text-sm shrink-0">
                  <div className="w-3 h-3 rounded-sm bg-white" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  TypeUI
                </span>
              </div>

              {/* Primary Navigation List: Vertical stack of 5 navigation items */}
              <div className="space-y-1.5">
                <span className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#5A6078] block mb-2">
                  Primary Menu
                </span>

                {primaryNavItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeItemIndex === idx;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveItemIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-mono text-xs ${
                        isActive
                          ? "bg-[#6E6BFF]/15 text-[#6E6BFF] border-l-2 border-[#6E6BFF] font-bold shadow-sm"
                          : "text-[#8A90A6] hover:text-white hover:bg-[#1A1E2B]"
                      }`}
                    >
                      {/* Left Icon Slot */}
                      <div className={`p-1 rounded-md shrink-0 ${isActive ? "text-[#6E6BFF]" : "text-[#8A90A6]"}`}>
                        <Icon size={16} />
                      </div>

                      {/* Right Layout Placeholder Line */}
                      <div className={`h-2.5 rounded-full ${item.labelWidth} ${isActive ? "bg-[#6E6BFF]" : "bg-[#232838]"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider & Footer Section */}
            <div className="space-y-3 pt-4">
              {/* Horizontal Structural Divider Line */}
              <div className="w-full border-t border-[#232838]" />

              {/* 2 Utility Navigation Items */}
              <div className="space-y-1">
                {utilityNavItems.map((item, idx) => {
                  const Icon = item.icon;
                  const itemIdx = 5 + idx;
                  const isActive = activeItemIndex === itemIdx;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveItemIndex(itemIdx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-mono text-xs ${
                        isActive
                          ? "bg-[#6E6BFF]/15 text-[#6E6BFF] border-l-2 border-[#6E6BFF] font-bold"
                          : "text-[#8A90A6] hover:text-white hover:bg-[#1A1E2B]"
                      }`}
                    >
                      {/* Left Icon Slot */}
                      <div className="p-1 rounded-md text-[#8A90A6] shrink-0">
                        <Icon size={16} />
                      </div>

                      {/* Right Layout Placeholder Line */}
                      <div className={`h-2.5 rounded-full ${item.labelWidth} ${isActive ? "bg-[#6E6BFF]" : "bg-[#232838]"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* 3. CONTENT VIEWPORT: Right-hand panel as a large container block with rounded corners */}
          <main className="flex-1 p-6 bg-[#0B0D14] flex flex-col justify-between relative overflow-hidden">
            
            {/* Generic Repeating Diagonal-Stripe Placeholder Pattern Container */}
            <div 
              className="w-full h-full rounded-2xl border-2 border-dashed border-[#232838] relative flex flex-col items-center justify-center p-8 text-center"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  -45deg,
                  rgba(110, 107, 255, 0.04),
                  rgba(110, 107, 255, 0.04) 14px,
                  rgba(26, 30, 43, 0.5) 14px,
                  rgba(26, 30, 43, 0.5) 28px
                )`
              }}
            >
              <div className="p-4 rounded-3xl bg-[#12151F]/90 border border-[#232838] shadow-2xl max-w-sm space-y-3 relative z-10 backdrop-blur-md">
                <div className="w-10 h-10 rounded-2xl bg-[#6E6BFF]/10 text-[#6E6BFF] flex items-center justify-center mx-auto">
                  <Maximize2 size={20} />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white font-mono">
                    Content Viewport Area
                  </h4>
                  <p className="text-xs text-[#8A90A6]">
                    Generic diagonal-stripe pattern representing empty structural viewport area.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#1A1E2B] text-[10px] font-mono text-[#6E6BFF] border border-[#232838]">
                    flex-1 viewport
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[#1A1E2B] text-[10px] font-mono text-[#3ECF8E] border border-[#232838]">
                    rounded-2xl
                  </span>
                </div>
              </div>
            </div>

          </main>

        </div>

        {/* 4. CANVAS FRAME LABEL: Bold text label at bottom-left reading "Application Sidebar Navigation" */}
        <div className="mt-4 flex items-center justify-between relative z-10">
          <div className="text-sm font-bold font-mono text-white tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6E6BFF]" />
            <span>Application Sidebar Navigation</span>
          </div>

          <div className="text-xs font-mono text-[#5A6078]">
            Structure Spec v1.0 • Split Layout Wireframe
          </div>
        </div>

      </div>

    </div>
  );
};

export default SidebarWireframe;

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, Database, Search, Cpu } from "lucide-react";

interface AIProcessingIndicatorProps {
  currentStepIndex?: number;
  label?: string;
}

const STEPS = [
  { label: "Reading document structure", icon: FileText },
  { label: "Extracting text passages & metadata", icon: Cpu },
  { label: "Generating multi-dimensional embeddings", icon: Database },
  { label: "Searching grounded knowledge base", icon: Search },
  { label: "Synthesizing executive AI response", icon: Sparkles }
];

export const AIProcessingIndicator: React.FC<AIProcessingIndicatorProps> = ({ label }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const StepIcon = STEPS[activeStep].icon;

  return (
    <div className="flex flex-col space-y-4 p-5 rounded-2xl bg-[#0D0E15]/90 border border-indigo-500/20 backdrop-blur-xl shadow-2xl max-w-md my-3">
      {/* Animated Orb & Step Title */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-xl border border-dashed border-indigo-400/40"
          />
          <StepIcon size={18} className="text-indigo-400 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            {label || "AI Neural Pipeline Active"}
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={activeStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-medium text-slate-200 truncate"
            >
              {STEPS[activeStep].label}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* 5-Step Pipeline Progress Bars */}
      <div className="grid grid-cols-5 gap-1.5 pt-1">
        {STEPS.map((_, idx) => {
          const isDone = idx < activeStep;
          const isActive = idx === activeStep;
          return (
            <div key={idx} className="relative h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: isDone ? "100%" : isActive ? "75%" : "0%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className={`h-full rounded-full ${
                  isDone
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : isActive
                    ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 animate-pulse"
                    : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

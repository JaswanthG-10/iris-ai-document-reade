import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  FileText, 
  Zap, 
  HelpCircle, 
  Scale, 
  Clock, 
  PhoneCall, 
  BookOpen, 
  ArrowRight,
  Search,
  SlidersHorizontal
} from "lucide-react";

interface PromptLibraryPageProps {
  onSelectPrompt: (queryText: string) => void;
}

export const PromptLibraryPage: React.FC<PromptLibraryPageProps> = ({ onSelectPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Executive", "Tasks", "Extraction", "Analysis", "Schedules"];

  const prompts = [
    {
      id: "summarize",
      title: "Executive Document Summary",
      category: "Executive",
      icon: FileText,
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
      description: "Generate a comprehensive overall executive summary highlighting core findings, key takeaways, and main objectives.",
      prompt: "Summarize this document and present a comprehensive executive summary."
    },
    {
      id: "action-items",
      title: "Extract Action Tasks & Owners",
      category: "Tasks",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
      description: "Identify all actionable tasks, deliverables, next steps, assigned owners, and required operational follow-ups.",
      prompt: "Extract all key action items, tasks, next steps, and deliverables mentioned in this document."
    },
    {
      id: "explain-jargon",
      title: "Explain Jargon & Acronyms",
      category: "Extraction",
      icon: BookOpen,
      color: "from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30",
      description: "Detect complex technical terms, acronyms, and industry jargon, providing simplified plain-English explanations.",
      prompt: "Identify complex technical terms or acronyms in this document and explain them in plain language."
    },
    {
      id: "generate-faq",
      title: "Generate FAQs & Answer Keys",
      category: "Extraction",
      icon: HelpCircle,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
      description: "Automatically construct a structured list of Frequently Asked Questions (FAQs) based directly on document text.",
      prompt: "Generate a structured FAQ list of the top 5 questions answered in this document with concise verified answers."
    },
    {
      id: "compare-docs",
      title: "Compare & Contrast Analysis",
      category: "Analysis",
      icon: Scale,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
      description: "Perform comparative analysis across documents to highlight key contrasts, overlaps, and conflicting details.",
      prompt: "Perform a comparative analysis contrasting key differences, overlaps, and points across the documents."
    },
    {
      id: "find-deadlines",
      title: "Milestone & Deadline Tracker",
      category: "Schedules",
      icon: Clock,
      color: "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30",
      description: "Locate all operational milestones, contractual deadlines, submission dates, and expiration schedules.",
      prompt: "Extract all dates, operational deadlines, milestones, and schedule commitments found in this document."
    },
    {
      id: "extract-contacts",
      title: "Extract Contacts & Emails",
      category: "Extraction",
      icon: PhoneCall,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
      description: "Extract all contact details including email addresses, phone numbers, office locations, and point-of-contact names.",
      prompt: "Parse and list all contact details, email addresses, phone numbers, and names mentioned in the document."
    }
  ];

  const filteredPrompts = prompts.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto p-6 font-sans select-none text-[#EDEFF7] relative z-10"
    >
      {/* Header Banner */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="p-8 rounded-3xl bg-[#12151F] border border-[#232838] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6E6BFF]/15 border border-[#6E6BFF]/30 text-[#6E6BFF] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Views & Automated Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Iris View AI Tool Suite
          </h1>
          <p className="text-xs sm:text-sm text-[#8A90A6] leading-relaxed">
            Click any automated prompt view below to execute instant grounded RAG document intelligence.
          </p>
        </div>
      </motion.div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#12151F] border border-[#232838] shadow-lg">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <SlidersHorizontal size={14} className="text-[#6E6BFF] mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#6E6BFF] text-white shadow-md"
                  : "bg-[#1A1E2B] text-[#8A90A6] hover:text-white border border-[#232838]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6BFF]" />
          <input
            type="text"
            placeholder="Search AI tools & prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1E2B] border border-[#232838] focus:border-[#6E6BFF] text-xs rounded-xl pl-9 pr-4 py-2 text-white placeholder-[#8A90A6] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* AI Tool Prompt Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredPrompts.map((p) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => onSelectPrompt(p.prompt)}
              className="p-6 rounded-2xl bg-[#12151F] border border-[#232838] hover:border-[#6E6BFF]/40 shadow-xl cursor-pointer flex flex-col justify-between space-y-4 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-10 h-10 rounded-2xl border bg-gradient-to-br flex items-center justify-center ${p.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#1A1E2B] border border-[#232838] text-[#8A90A6]">
                    {p.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#3FD0C9] transition-colors">
                  {p.title}
                </h3>

                <p className="text-xs text-[#8A90A6] leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#232838] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#5A6078] uppercase tracking-wider">Instant RAG Run</span>
                <span className="px-3 py-1.5 rounded-xl bg-[#6E6BFF]/10 text-[#6E6BFF] border border-[#6E6BFF]/30 group-hover:bg-[#6E6BFF] group-hover:text-white text-xs font-bold transition-all flex items-center gap-1.5">
                  Execute Tool <ArrowRight size={13} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

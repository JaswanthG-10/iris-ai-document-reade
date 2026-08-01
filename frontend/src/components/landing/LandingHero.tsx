import React, { useState } from "react";
import { 
  Sparkles, 
  Upload, 
  Database, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  Layers, 
  Lock, 
  ChevronDown
} from "lucide-react";
import { Button, Card, Badge } from "../ui/DesignSystem";

export const LandingHero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const workflowStages = [
    { title: "1. Upload", desc: "Drag PDF, DOCX, TXT or Image files", icon: Upload, color: "text-cyan-400" },
    { title: "2. Extraction", desc: "Multi-page OCR text & metadata parsing", icon: FileText, color: "text-indigo-400" },
    { title: "3. Chunking & Embeddings", desc: "Dense 1536-dim vector space indexing", icon: Database, color: "text-purple-400" },
    { title: "4. Semantic Search", desc: "Cosine similarity graph retrieval", icon: Search, color: "text-pink-400" },
    { title: "5. Grounded Answer", desc: "Response with page-level citations", icon: CheckCircle2, color: "text-emerald-400" }
  ];

  const faqs = [
    {
      q: "How does DocuMind AI eliminate hallucinations in answers?",
      a: "DocuMind AI enforces strict RAG (Retrieval-Augmented Generation) grounding. Every statement is linked to an exact source page and paragraph excerpt with a cryptographic verification hash."
    },
    {
      q: "What file formats and sizes are supported?",
      a: "We support PDF, DOCX, TXT, and image files (PNG/JPG with automated OCR). File sizes up to 50MB are processed with sub-second vector chunk indexing."
    },
    {
      q: "Is my document data private and secure?",
      a: "Yes. Documents are encrypted in transit (TLS 1.3) and at rest (AES-256). Vector embeddings are isolated per account with zero model re-training on your private files."
    }
  ];

  return (
    <div className="space-y-16 py-8 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <Badge variant="indigo" className="px-4 py-1 text-xs uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Next-Gen Intelligent RAG Platform
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Transform Your Documents Into <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-300 to-pink-500">Traceable Intelligence</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-outfit max-w-2xl mx-auto">
          Upload PDFs, DOCX, or research papers. DocuMind AI chunks, indexes, and retrieves precise answers grounded with exact page citations and similarity scores.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" onClick={onGetStarted} className="w-full sm:w-auto font-bold shadow-xl">
            Explore Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="space-y-6 pt-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Automated Processing Pipeline</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">From raw file ingestion to grounded vector citations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowStages.map((st, idx) => {
            const Icon = st.icon;
            return (
              <Card key={idx} className="relative p-5 text-center flex flex-col items-center justify-between border-indigo-500/20">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-3">
                  <Icon className={`w-6 h-6 ${st.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-1">{st.title}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{st.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Multi-Document RAG</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Query single files or synthesize answers across your entire document repository with cross-document reasoning.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero-Hallucination Citations</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Every response includes clickable source cards with document title, page number, and similarity score percentage.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Enterprise Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Isolated vector spaces, end-to-end encryption, and role-based access control for complete privacy.
          </p>
        </Card>
      </div>

      <div className="space-y-6 pt-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              className="p-4 cursor-pointer hover:border-indigo-500/40 transition-all"
              interactive
            >
              <div
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="flex items-center justify-between font-semibold text-sm text-slate-200"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-indigo-400 transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
              </div>
              {activeFaq === idx && (
                <p className="text-xs text-slate-400 font-mono mt-3 pt-3 border-t border-slate-800 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

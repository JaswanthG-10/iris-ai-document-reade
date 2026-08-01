import React, { useState, useRef, useEffect } from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { docApi } from "../../services/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "dissolving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Canvas Particle Animation Engine
  useEffect(() => {
    if (uploadStatus !== "dissolving" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check accessibility settings
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Skip canvas animation and transition status quickly
      const timer = setTimeout(() => setUploadStatus("success"), 2500);
      return () => clearTimeout(timer);
    }

    // Set canvas dimensions matching parent container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const startX = canvas.width / 2;
    const startY = 100; // Position of the file card
    const endX = canvas.width / 2;
    const endY = canvas.height - 70; // Position of the central "Knowledge Core"

    // Initialize 80 floating particles
    const particles: Particle[] = [];
    const colors = ["#00E5FF", "#6366F1", "#3B82F6", "#818CF8"];
    
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: startX + (Math.random() - 0.5) * 80,
        y: startY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 0.8 + Math.random() * 0.2,
        size: 1 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    particlesRef.current = particles;

    let framesElapsed = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      framesElapsed++;

      // 1. Draw central glowing target (Knowledge Core)
      const glowGrad = ctx.createRadialGradient(endX, endY, 2, endX, endY, 30);
      glowGrad.addColorStop(0, "rgba(0, 229, 255, 0.4)");
      glowGrad.addColorStop(0.4, "rgba(99, 102, 241, 0.2)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      
      ctx.beginPath();
      ctx.arc(endX, endY, 30, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(endX, endY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00E5FF";
      ctx.fill();

      // 2. Animate and pull particles towards the core
      let activeParticles = 0;
      particlesRef.current.forEach((p) => {
        if (p.alpha <= 0) return;
        activeParticles++;

        // Calculate gravity pull vector
        const dx = endX - p.x;
        const dy = endY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 8) {
          const force = 0.15; // Gravity pull strength
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          
          // Apply friction/drag
          p.vx *= 0.95;
          p.vy *= 0.95;

          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Absorb particle: fade out
          p.alpha -= 0.05;
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;

      // 3. Transition to success screen once all particles dissolve
      if (activeParticles === 0 || framesElapsed > 180) {
        setUploadStatus("success");
      } else {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [uploadStatus]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setUploading(true);
    setUploadStatus("idle");
    setErrorMsg("");

    try {
      await docApi.upload(file);
      // Trigger dissolve animation phase
      setUploadStatus("dissolving");
    } catch (err: any) {
      setUploadStatus("error");
      setErrorMsg(err.message || "Failed uploading file. Check configuration.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUploadStatus("idle");
    setUploading(false);
    setErrorMsg("");
    onClose();
  };

  const handleFinished = () => {
    onUploadSuccess();
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg glass-panel rounded-2xl relative overflow-hidden flex flex-col min-h-[380px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Ingest Structured Knowledge</h2>
          <button 
            onClick={handleClose} 
            disabled={uploadStatus === "dissolving" && !uploading}
            className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Upload Body */}
        <div className="flex-1 p-6 flex flex-col justify-center relative">
          
          {uploadStatus === "idle" && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-brandCyan bg-brandCyan/5" 
                  : "border-white/10 hover:border-brandCyan/40 hover:bg-white/[0.01]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleChange}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-2 border-brandCyan/30 border-t-brandCyan rounded-full animate-spin" />
                  <p className="text-sm text-brandCyan font-semibold animate-pulse">Uploading file metadata...</p>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-brandCyan/5 text-brandCyan mb-4">
                    <Upload size={28} />
                  </div>
                  <p className="text-sm text-gray-300 font-semibold mb-1">
                    Drag and drop file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports PDF, DOCX, or TXT up to 20MB
                  </p>
                </>
              )}
            </div>
          )}

          {uploadStatus === "dissolving" && (
            <div className="absolute inset-0 flex flex-col items-center justify-between p-6">
              {/* Virtual File Card with scanning sweeping light */}
              <div className="relative w-48 h-24 bg-[#161C27]/80 rounded-xl border border-white/10 p-4 flex items-center gap-3 overflow-hidden shadow-2xl z-10">
                {/* Green/Cyan Sweep Scanline */}
                <div className="absolute inset-x-0 h-0.5 bg-brandCyan shadow-[0_0_8px_#00E5FF] animate-scan" />
                <div className="p-2 rounded-lg bg-brandCyan/5 text-brandCyan">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{fileName}</p>
                  <p className="text-[10px] text-gray-500">{(fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>

              {/* HTML5 Animation Canvas */}
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

              {/* Core destination footer label */}
              <div className="flex flex-col items-center gap-1 z-10">
                <p className="text-xs text-brandCyan font-bold tracking-wider uppercase animate-pulse">
                  Chunking & Vectorizing Document...
                </p>
                <p className="text-[10px] text-gray-500">Transforming document text nodes into embeddings</p>
              </div>
            </div>
          )}

          {uploadStatus === "success" && (
            <div className="flex flex-col items-center text-center p-4">
              <div className="p-4 rounded-full bg-green-950/20 text-green-400 mb-4 border border-green-500/20 animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ingestion Complete</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">
                <span className="text-white font-semibold">{fileName}</span> has been vectorized and stored in the secure tenant document index.
              </p>
              <button
                onClick={handleFinished}
                className="bg-brandCyan text-darkBg px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#00D0EB] transition-all"
              >
                Close & Refresh
              </button>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex flex-col items-center text-center p-4">
              <div className="p-4 rounded-full bg-red-950/20 text-red-400 mb-4 border border-red-500/20">
                <AlertCircle size={36} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Ingestion Failed</h3>
              <p className="text-sm text-red-400 max-w-sm mb-6">{errorMsg}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setUploadStatus("idle")}
                  className="bg-white/5 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all border border-white/5"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

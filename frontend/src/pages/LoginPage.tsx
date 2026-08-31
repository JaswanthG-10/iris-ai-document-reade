import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  FileText, 
  Search, 
  Check, 
  Lock, 
  Mail, 
  User as UserIcon,
  FileType,
  Cpu,
  Zap
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onSwitchToRegister?: () => void;
  initialMode?: "login" | "register";
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  initialMode = "login" 
}) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mouse cursor tracking glow coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate password strength score (0-4)
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = calculatePasswordStrength(password);
  const strengthLabels = ["Weak", "Fair", "Strong", "Ultra Secure"];
  const strengthColors = ["bg-red-500", "bg-amber-500", "bg-blue-500", "bg-[#22C55E]"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email || "admin@iris.ai", password || "password123");
      } else {
        await register(name || "Architect User", email || "newuser@iris.ai", password || "password123");
      }
      setLoading(false);
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your details and try again.");
      setLoading(false);
      setSuccess(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading || success) return;
    setError(null);
    setLoading(true);

    try {
      await login("google.dev@iris.ai", "password123");
      setLoading(false);
      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err: any) {
      setError(err.message || "Google authentication failed. Please try again.");
      setLoading(false);
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0A0A0A] text-[#EDEFF7] font-sans overflow-y-auto lg:overflow-hidden select-none relative">
      
      {/* Dynamic Cursor Parallax Glow Follower */}
      <div 
        className="pointer-events-none fixed w-[600px] h-[600px] rounded-full opacity-25 blur-[130px] transition-transform duration-300 ease-out z-0"
        style={{
          background: "radial-gradient(circle, #3B82F6 0%, #8B5CF6 50%, transparent 80%)",
          left: `${mousePos.x - 300}px`,
          top: `${mousePos.y - 300}px`
        }}
      />

      {/* Static Background Ambient Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#3B82F6]/15 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/15 blur-[160px] pointer-events-none" />

      {/* LEFT 55% PANEL: Branding, Neural Lines, Floating Cards & AI Illustration */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 bg-[#0A0A0A]/80 border-r border-white/[0.08] relative z-10 overflow-hidden">
        
        {/* Top-Left Prominent Iris View Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B82F6] via-[#06B6D4] to-[#8B5CF6] text-white p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#3B82F6] fill-[#3B82F6]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                Iris View
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30">
                AI PLATFORM
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#8A90A6]">Document Intelligence Platform</p>
          </div>
        </div>

        {/* Hero Branding Content & Neural Document Artwork */}
        <div className="my-auto max-w-xl space-y-8 relative">
          
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-semibold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 shadow-sm"
            >
              <Cpu className="w-3.5 h-3.5 text-[#06B6D4]" /> Next-Gen Neural Document Engine
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="text-4xl font-extrabold text-white tracking-tight leading-tight"
            >
              Understand Documents <br />
              <span className="bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent">
                with Artificial Intelligence
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-sm text-[#8A90A6] leading-relaxed max-w-lg font-sans"
            >
              Upload PDFs, DOCX, PPT, or TXT files and instantly chat, summarize, search, and extract key business insights using AI.
            </motion.p>
          </div>

          {/* Animated Glassmorphism Illustration with Floating Document Cards & Neural Nodes */}
          <div className="p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] relative overflow-hidden shadow-2xl space-y-4">
            
            {/* SVG Neural Network Lines Connecting Glowing Nodes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
              <line x1="80" y1="40" x2="220" y2="90" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="220" y1="90" x2="360" y2="40" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="120" y1="130" x2="220" y2="90" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="4 4" />
              
              <circle cx="80" cy="40" r="4" fill="#3B82F6" className="animate-ping" />
              <circle cx="220" cy="90" r="6" fill="#06B6D4" />
              <circle cx="360" cy="40" r="4" fill="#8B5CF6" className="animate-ping" />
              <circle cx="120" cy="130" r="5" fill="#3B82F6" />
            </svg>

            {/* 4 Floating Document Badge Cards */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <motion.div 
                animate={{ y: [0, -4, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-3.5 rounded-2xl bg-[#121216]/90 border border-white/[0.1] backdrop-blur-lg space-y-1.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-xl bg-blue-500/10 text-[#3B82F6]">
                    <FileType size={16} />
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-blue-500/10 text-[#3B82F6]">PDF Document</span>
                </div>
                <p className="text-xs font-bold text-white truncate">Financial_Q3_Report.pdf</p>
                <p className="text-[10px] text-[#8A90A6]">42 Pages • Grounded Vector Index</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 4, 0] }} 
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="p-3.5 rounded-2xl bg-[#121216]/90 border border-white/[0.1] backdrop-blur-lg space-y-1.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-xl bg-violet-500/10 text-[#8B5CF6]">
                    <FileText size={16} />
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-violet-500/10 text-[#8B5CF6]">DOCX Brief</span>
                </div>
                <p className="text-xs font-bold text-white truncate">System_Architecture.docx</p>
                <p className="text-[10px] text-[#8A90A6]">18 Pages • Auto Summarized</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -5, 0] }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="p-3.5 rounded-2xl bg-[#121216]/90 border border-white/[0.1] backdrop-blur-lg space-y-1.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-xl bg-cyan-500/10 text-[#06B6D4]">
                    <Search size={16} />
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-cyan-500/10 text-[#06B6D4]">Smart Search</span>
                </div>
                <p className="text-xs font-bold text-white truncate">Cross-Document Queries</p>
                <p className="text-[10px] text-[#8A90A6]">Instant passage matches</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 5, 0] }} 
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="p-3.5 rounded-2xl bg-[#121216]/90 border border-white/[0.1] backdrop-blur-lg space-y-1.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="p-1.5 rounded-xl bg-emerald-500/10 text-[#22C55E]">
                    <Zap size={16} />
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-emerald-500/10 text-[#22C55E]">AI Synthesis</span>
                </div>
                <p className="text-xs font-bold text-white truncate">Structured Executive FAQ</p>
                <p className="text-[10px] text-[#8A90A6]">100% Citation Backed</p>
              </motion.div>
            </div>

          </div>

        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#8A90A6] font-mono">
          <span>© 2026 Iris View AI Platform</span>
          <span className="flex items-center gap-2 text-[#22C55E] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> Neural Engine Online
          </span>
        </div>
      </div>

      {/* RIGHT 45% PANEL: Rounded Glassmorphism Authentication Card */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        
        <div className="w-full max-w-md space-y-6">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white p-2 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 fill-current text-white" />
            </div>
            <span className="text-xl font-bold text-white font-sans">Iris View AI</span>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) */}
          <div className="p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] grid grid-cols-2 gap-1 font-mono text-xs shadow-inner">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              className={`py-2.5 rounded-xl font-bold transition-all relative ${
                mode === "login"
                  ? "bg-[#3B82F6] text-white shadow-lg shadow-blue-500/25"
                  : "text-[#8A90A6] hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              className={`py-2.5 rounded-xl font-bold transition-all relative ${
                mode === "register"
                  ? "bg-[#3B82F6] text-white shadow-lg shadow-blue-500/25"
                  : "text-[#8A90A6] hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Glassmorphism Auth Card */}
          <motion.div 
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8 rounded-3xl bg-[#121216]/80 backdrop-blur-2xl border border-white/[0.1] shadow-2xl space-y-5 relative overflow-hidden"
          >
            
            {/* Ambient Inner Border Glow */}
            <div className="absolute inset-0 border border-gradient-to-r from-blue-500/20 via-transparent to-violet-500/20 pointer-events-none rounded-3xl" />

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {mode === "login" ? "Welcome Back" : "Start Document Analysis"}
              </h3>
              <p className="text-xs text-[#8A90A6]">
                {mode === "login" 
                  ? "Enter your account credentials to access your document workspace." 
                  : "Register your corporate email to unlock AI document synthesis."}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2 animate-shake">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Field (Register mode only) */}
              {mode === "register" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <UserIcon size={13} className="text-[#3B82F6]" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-[#0A0A0A]/90 border border-white/[0.1] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 rounded-2xl px-4 py-3 text-xs text-white outline-none transition-all placeholder-[#5A6078]"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Mail size={13} className="text-[#3B82F6]" /> Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#0A0A0A]/90 border border-white/[0.1] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 rounded-2xl px-4 py-3 text-xs text-white outline-none transition-all placeholder-[#5A6078]"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Lock size={13} className="text-[#3B82F6]" /> Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => alert("Password reset link sent to your email.")}
                      className="text-xs text-[#3B82F6] hover:underline font-semibold"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0A0A]/90 border border-white/[0.1] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 rounded-2xl px-4 py-3 text-xs text-white outline-none transition-all pr-12 placeholder-[#5A6078]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-[#8A90A6] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator (Register Mode) */}
                {mode === "register" && password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8A90A6]">
                      <span>Password Strength:</span>
                      <span className="font-bold text-white">{strengthLabels[strengthScore - 1] || "Too Short"}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            step <= strengthScore ? strengthColors[strengthScore - 1] : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Me Checkbox */}
              {mode === "login" && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-[#8A90A6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-white/[0.1] text-[#3B82F6] focus:ring-0 cursor-pointer bg-[#0A0A0A]"
                    />
                    <span>Remember me for 30 days</span>
                  </label>
                </div>
              )}

              {/* Large Gradient CTA Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-[#3B82F6] via-[#06B6D4] to-[#8B5CF6] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                <span>{mode === "login" ? "Sign In to Iris View" : "Create Enterprise Account"}</span>
                {success ? (
                  <Check size={16} className="text-white" />
                ) : loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={15} />
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <span className="relative px-3 bg-[#121216] text-[11px] font-mono uppercase text-[#8A90A6]">
                Or authenticate with
              </span>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || success}
              className="w-full py-3 px-6 rounded-2xl bg-[#0A0A0A]/90 border border-white/[0.1] hover:border-[#3B82F6]/50 hover:bg-white/[0.05] text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

          </motion.div>

          {/* Switch Hint */}
          <div className="text-center">
            <p className="text-xs text-[#8A90A6]">
              {mode === "login" ? "Don't have an enterprise account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-[#3B82F6] hover:underline font-bold"
              >
                {mode === "login" ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
export default LoginPage;

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mouse drift state for background gradient blobs
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Animation sequence states
  // stages: "idle" | "submitting" | "collapsing" | "orbiting" | "checkmark" | "done"
  const [animStage, setAnimStage] = useState<"idle" | "submitting" | "collapsing" | "orbiting" | "checkmark" | "done">("idle");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (animStage !== "idle") return;
    setError(null);

    if (shouldReduceMotion) {
      // Reduced motion fallback
      try {
        setAnimStage("submitting");
        await login(email || "admin@iris.ai", password || "password123");
      } catch (err: any) {
        setError(err.message || "Failed to sign in. Please verify your credentials.");
        setAnimStage("idle");
      }
      return;
    }

    // Full 1.6s Choreographed Framer Motion sequence
    try {
      // 0ms: Submitting / Button scale 0.97
      setAnimStage("submitting");

      // 150ms: Form fields fade out + translateY(-8px) -> Collapsing card to 96px circle
      setTimeout(() => {
        setAnimStage("collapsing");
      }, 150);

      // 450ms: Particles orbit and spiral inward
      setTimeout(() => {
        setAnimStage("orbiting");
      }, 450);

      // Trigger login API call during animation
      const loginPromise = login(email || "admin@iris.ai", password || "password123");

      // 1150ms: Morph into checkmark
      setTimeout(async () => {
        try {
          await loginPromise;
          setAnimStage("checkmark");

          // 1450ms: Card scale up and fade out to dashboard
          setTimeout(() => {
            setAnimStage("done");
          }, 350);
        } catch (err: any) {
          setError(err.message || "Failed to sign in. Please verify credentials.");
          setAnimStage("idle");
        }
      }, 1150);

    } catch (err: any) {
      setError(err.message || "Sign in failed.");
      setAnimStage("idle");
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#F8F9FC] dark:bg-[#0B0F19] flex items-center justify-center p-4 overflow-hidden select-none font-sans">
      
      {/* 3 Asymmetrical Soft Blurred Gradient Blobs with Mouse Drift (±8px) */}
      <motion.div
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/20 blur-[90px] pointer-events-none"
      />
      <motion.div
        animate={{ x: -mousePos.x * 1.2, y: -mousePos.y * 1.2 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/20 blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ x: mousePos.y * 0.8, y: mousePos.x * 0.8 }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
        className="absolute top-[30%] left-[35%] w-[400px] h-[400px] rounded-full bg-cyan-400/15 blur-[80px] pointer-events-none"
      />

      {/* Centered Glass Login Card (440px max-width, 20px radius, 32px padding) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={
          animStage === "collapsing" || animStage === "orbiting" || animStage === "checkmark"
            ? { opacity: 1, y: 0, width: 96, height: 96, borderRadius: "50%", padding: 0 }
            : animStage === "done"
            ? { opacity: 0, scale: 1.08 }
            : { opacity: 1, y: 0, width: "100%", maxWidth: 440, borderRadius: 20, padding: 32 }
        }
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative bg-white dark:bg-slate-900 border border-[#E7E9F3] dark:border-slate-800 backdrop-blur-xl shadow-[0_1px_2px_rgba(20,20,50,0.04),0_4px_12px_rgba(20,20,50,0.05)] z-10 flex flex-col justify-center items-center overflow-hidden"
      >
        
        {/* Animated Sequence Overlay (Circle, Orbiting Particles & Checkmark) */}
        {(animStage === "collapsing" || animStage === "orbiting" || animStage === "checkmark") && (
          <div className="absolute inset-0 flex items-center justify-center">
            {animStage === "orbiting" && (
              <div className="relative w-16 h-16 flex items-center justify-center">
                {/* Rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-600 border-r-cyan-400 animate-spin" />
                {/* 6 Orbiting Particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: 360, scale: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.1, ease: "linear" }}
                    className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    style={{
                      top: `${50 + 35 * Math.sin((i * Math.PI) / 3)}%`,
                      left: `${50 + 35 * Math.cos((i * Math.PI) / 3)}%`
                    }}
                  />
                ))}
              </div>
            )}

            {animStage === "checkmark" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-500"
              >
                <Check className="w-8 h-8 stroke-[3]" />
              </motion.div>
            )}
          </div>
        )}

        {/* Regular Login Form Content */}
        {animStage !== "collapsing" && animStage !== "orbiting" && animStage !== "checkmark" && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={animStage === "submitting" ? { opacity: 0, y: -8 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-6"
          >
            {/* Header: Logo + Title */}
            <div className="text-center space-y-1.5">
              <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 mb-3">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[#1A1D2E] dark:text-white tracking-tight">
                Iris AI
              </h1>
              <p className="text-xs text-[#6B7085] dark:text-slate-400 font-mono uppercase tracking-wider">
                Document Intelligence Platform
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FDEDED] text-[#EF4444] border border-rose-200 text-xs font-mono">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1D2E] dark:text-slate-300 mb-1.5 font-mono">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-sm text-[#1A1D2E] dark:text-slate-100 placeholder-[#A0A4B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-500/10 font-mono transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#1A1D2E] dark:text-slate-300 font-mono">
                    PASSWORD
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Demo Mode: Click 'Sign In' to enter Iris AI."); }} className="text-xs text-[#8B5CF6] hover:underline font-mono">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E7E9F3] dark:border-slate-800 text-sm text-[#1A1D2E] dark:text-slate-100 placeholder-[#A0A4B8] focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-500/10 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A4B8] hover:text-[#6B7085]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-sm shadow-[0_4px_14px_rgba(139,92,246,0.25)] hover:shadow-purple-500/35 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Sign In to Platform <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E7E9F3] dark:border-slate-800" /></div>
              <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] text-[#A0A4B8] uppercase font-mono">
                or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={() => login("sso-user@iris.ai", "password123")}
              className="w-full py-2.5 rounded-xl border border-[#E7E9F3] dark:border-slate-800 hover:bg-[#F0F1F8] dark:hover:bg-slate-800 text-xs font-semibold text-[#1A1D2E] dark:text-slate-200 transition-all flex items-center justify-center gap-2 font-mono"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google Workspace SSO
            </button>

            <div className="text-center text-xs text-[#6B7085] dark:text-slate-400 font-mono">
              New here?{" "}
              <button onClick={onSwitchToRegister} className="text-[#8B5CF6] hover:underline font-bold">
                Create account
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

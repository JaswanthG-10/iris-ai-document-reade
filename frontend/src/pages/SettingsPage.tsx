import React, { useState } from "react";
import { Settings, Sun, Moon, Check, Sliders, ShieldCheck } from "lucide-react";
import { Card, Button, Badge } from "../components/ui/DesignSystem";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [chunkSize, setChunkSize] = useState(350);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("documind_chunk_size", String(chunkSize));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="glass-panel p-5">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Platform Preferences & Retrieval Settings
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Manage user profile information, UI theme mode, and document retrieval parameters.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
          User Profile Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block mb-1">NAME</span>
            <input
              type="text"
              readOnly
              value={user?.name || "Developer"}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            />
          </div>
          <div>
            <span className="text-slate-500 block mb-1">EMAIL</span>
            <input
              type="text"
              readOnly
              value={user?.email || "user@documind.ai"}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
          Appearance & Theme Mode
        </h3>
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Current Theme: <strong className="text-indigo-400 capitalize">{theme}</strong></span>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400 mr-1" /> : <Moon className="w-4 h-4 text-indigo-400 mr-1" />}
            Toggle to {theme === "dark" ? "Light" : "Dark"} Mode
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" /> Vector Retrieval Parameters
          </h3>
          <Badge variant="emerald" className="font-mono">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> System Operational
          </Badge>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400 font-semibold">Semantic Chunk Size:</span>
              <span className="text-cyan-400 font-bold">{chunkSize} words</span>
            </div>
            <input
              type="range"
              min="150"
              max="800"
              step="50"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">Controls the text passage size used during vector embedding generation.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSave} className="font-bold">
            {saved ? <Check className="w-4 h-4 mr-1" /> : null}
            {saved ? "Settings Saved" : "Save Preferences"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

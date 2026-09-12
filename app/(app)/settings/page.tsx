"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Palette,
  Volume2,
  Eye,
  Globe,
  Check,
  Save,
} from "lucide-react";
import { useTheme, ThemeName } from "@/lib/theme/ThemeContext";
import { sound } from "@/lib/audio/soundEffects";

const themes: { id: ThemeName; name: string; color: string; desc: string }[] = [
  { id: "cyberpunk", name: "Cyberpunk 2099", color: "from-cyan-500 to-blue-600", desc: "Default neon cyan & high-contrast obsidian" },
  { id: "arcane", name: "Arcane Void", color: "from-purple-500 to-indigo-600", desc: "Mystic ethereal violet with cosmic accents" },
  { id: "emerald", name: "Emerald Haven", color: "from-emerald-500 to-teal-600", desc: "Verdant jade & focused tranquility" },
  { id: "neon", name: "Neon Synthwave", color: "from-pink-500 to-cyan-500", desc: "Vibrant magenta laser retrofuturistic vibe" },
  { id: "midnight", name: "Midnight Obsidian", color: "from-slate-600 to-zinc-900", desc: "Monochrome stealth dark mode with gold trim" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [timezone, setTimezone] = useState("UTC");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSoundEnabled(sound.isEnabled());
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.data) {
        setShowOnLeaderboard(data.data.showOnLeaderboard ?? true);
        setTimezone(data.data.timezone || "UTC");
      }
    } catch {}
  };

  const handleToggleSound = (enabled: boolean) => {
    sound.playClick();
    sound.setEnabled(enabled);
    setSoundEnabled(enabled);
    saveSettings({ soundEnabled: enabled });
  };

  const handleSelectTheme = (newTheme: ThemeName) => {
    sound.playClick();
    setTheme(newTheme);
    saveSettings({ theme: newTheme });
  };

  const handleToggleLeaderboard = (show: boolean) => {
    sound.playClick();
    setShowOnLeaderboard(show);
    saveSettings({ showOnLeaderboard: show });
  };

  const handleTimezoneChange = (tz: string) => {
    setTimezone(tz);
    saveSettings({ timezone: tz });
  };

  const saveSettings = async (patch: any) => {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
          <SettingsIcon className="w-8 h-8 text-cyan-400" />
          Realm Settings & Preferences
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Customize your sensory RPG experience, audio feedback, visual themes, and community visibility.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" /> Preferences saved and synchronized.
        </div>
      )}

      {/* Visual Theme Picker */}
      <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c] space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white font-display">
            HUD Visual Palette & Theme
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          Select your active visual theme. The interface transforms in real time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                theme === t.id
                  ? "bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  : "bg-black/30 border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${t.color} p-0.5 shadow-sm flex-shrink-0`}
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{t.name}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t.desc}</p>
                </div>
              </div>

              {theme === t.id && (
                <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Audio & Micro-interactions */}
      <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Audio & Web Audio Fanfares</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Play celebratory chimes on quest completion, level-up fanfares, and coin pings.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleToggleSound(!soundEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
            soundEnabled
              ? "bg-cyan-400 text-black shadow-sm"
              : "bg-[#1e2438] text-gray-400 hover:text-white"
          }`}
        >
          {soundEnabled ? "ENABLED" : "MUTED"}
        </button>
      </div>

      {/* Privacy & Community Visibility */}
      <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Leaderboard Visibility</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Show your username, level, and XP on the public global leaderboard.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleToggleLeaderboard(!showOnLeaderboard)}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${
            showOnLeaderboard
              ? "bg-amber-400 text-black shadow-sm"
              : "bg-[#1e2438] text-gray-400 hover:text-white"
          }`}
        >
          {showOnLeaderboard ? "PUBLIC" : "PRIVATE"}
        </button>
      </div>

      {/* Timezone Configuration */}
      <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Daily Streak Timezone</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Determines when daily quests reset and streak continuity boundaries.
            </p>
          </div>
        </div>

        <select
          value={timezone}
          onChange={(e) => handleTimezoneChange(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#090b12] border border-[#23293e] text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
        >
          <option value="UTC">UTC (Coordinated Universal Time)</option>
          <option value="America/New_York">America/New_York (EST/EDT)</option>
          <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
          <option value="Europe/London">Europe/London (GMT/BST)</option>
          <option value="Europe/Berlin">Europe/Berlin (CET/CEST)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
          <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
          <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
        </select>
      </div>
    </div>
  );
}

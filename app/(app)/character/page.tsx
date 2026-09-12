"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  Coins,
  Sparkles,
  Code2,
  Dumbbell,
  BookOpen,
  Brain,
  Flame,
  Palette,
  HeartPulse,
  Briefcase,
  TrendingUp,
  Edit2,
  Check,
} from "lucide-react";
import { useGameHud } from "@/lib/context/GameHudContext";
import { sound } from "@/lib/audio/soundEffects";

const attributeMeta: Record<string, { label: string; desc: string; icon: any; color: string; border: string }> = {
  intelligence: {
    label: "Intelligence",
    desc: "Coding, systems engineering, study, analytical problem solving",
    icon: Code2,
    color: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  strength: {
    label: "Strength",
    desc: "Physical fitness, heavy compound lifting, endurance, athletics",
    icon: Dumbbell,
    color: "text-red-400",
    border: "border-red-500/30",
  },
  wisdom: {
    label: "Wisdom",
    desc: "Reading books, philosophical reflection, strategic mental models",
    icon: BookOpen,
    color: "text-purple-400",
    border: "border-purple-500/30",
  },
  focus: {
    label: "Focus",
    desc: "Mindfulness, meditation, distraction-free deep work blocks",
    icon: Brain,
    color: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  discipline: {
    label: "Discipline",
    desc: "Career advancement, financial budgets, difficult daily commitments",
    icon: Briefcase,
    color: "text-amber-400",
    border: "border-amber-500/30",
  },
  vitality: {
    label: "Vitality",
    desc: "Hydration, sleep optimization, healthy nutrition, bodily recovery",
    icon: HeartPulse,
    color: "text-rose-400",
    border: "border-rose-500/30",
  },
  creativity: {
    label: "Creativity",
    desc: "UI/UX design, writing, art, architecture, innovative solutions",
    icon: Palette,
    color: "text-pink-400",
    border: "border-pink-500/30",
  },
  consistency: {
    label: "Consistency",
    desc: "Unbroken habit streaks and daily momentum preservation",
    icon: Flame,
    color: "text-orange-400",
    border: "border-orange-500/30",
  },
};

export default function CharacterPage() {
  const { user, character, refreshUserData } = useGameHud();
  const [characterData, setCharacterData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Bio
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCharacter();
  }, []);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/character");
      const data = await res.json();
      if (data.success) {
        setCharacterData(data.data);
        setDisplayName(data.data.profile?.displayName || "");
        setBio(data.data.profile?.bio || "");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    sound.playClick();
    setSaving(true);
    try {
      const res = await fetch("/api/character", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio }),
      });
      const data = await res.json();
      if (data.success) {
        setEditing(false);
        await refreshUserData();
        fetchCharacter();
      }
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const progress = characterData?.character?.progress || {
    level: 1,
    currentXp: 0,
    xpForNextLevel: 100,
    progressPercent: 0,
    rank: "Novice",
  };

  const attrs = characterData?.character?.attributes || {
    strength: 10,
    intelligence: 10,
    wisdom: 10,
    discipline: 10,
    vitality: 10,
    focus: 10,
    creativity: 10,
    consistency: 10,
  };

  return (
    <div className="space-y-8">
      {/* Hero Character Profile Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121626] via-[#0e111d] to-[#121422] border border-[#23293f] shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar Area */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-amber-400 p-1 shadow-[0_0_30px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#0d0f17] rounded-xl flex items-center justify-center font-bold text-3xl text-cyan-400 font-display">
                {progress.level}
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-mono font-bold text-[10px] uppercase shadow-md">
              {progress.rank}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-black/60 border border-cyan-400 text-white font-bold text-xl"
                  />
                ) : (
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                    {characterData?.profile?.displayName || "Hero Adventurer"}
                  </h1>
                )}
                <p className="text-xs font-mono text-cyan-400 mt-0.5">
                  @{characterData?.profile?.username || "hero"} • Level {progress.level} {progress.rank}
                </p>
              </div>

              <div>
                {editing ? (
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs font-mono uppercase flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setEditing(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#171b2d] hover:bg-[#1f253d] border border-white/10 text-gray-300 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full mt-3 px-3 py-2 rounded-lg bg-black/60 border border-white/20 text-xs text-gray-200"
              />
            ) : (
              <p className="text-xs text-gray-300 mt-2.5 max-w-2xl leading-relaxed">
                {characterData?.profile?.bio || "A heroic adventurer forging reality through daily discipline."}
              </p>
            )}

            {/* XP & Stats Bar */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Total XP</span>
                <span className="text-base font-bold text-cyan-300">{progress.totalXp} XP</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Next Level</span>
                <span className="text-base font-bold text-white">
                  {progress.currentXp} / {progress.xpForNextLevel} XP
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Treasury</span>
                <span className="text-base font-bold text-amber-300">
                  {characterData?.character?.gold || 0} Gold
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Quests Cleared</span>
                <span className="text-base font-bold text-emerald-400">
                  {characterData?.stats?.completedQuests || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes Progression Matrix */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white font-display">
              8 Core RPG Character Attributes
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Powered by real-world actions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(attributeMeta).map(([key, meta]) => {
            const val = attrs[key] || 10;
            const Icon = meta.icon;
            // Progress toward next 50-stat milestone
            const percent = Math.min(100, Math.round(((val % 50) / 50) * 100));

            return (
              <div
                key={key}
                className={`p-5 rounded-2xl bg-[#111422] border ${meta.border} shadow-sm hover:border-opacity-100 transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl bg-black/40 ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-white">
                      {val}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white capitalize">
                    {meta.label}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                    {meta.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                    <span>Rank Progress</span>
                    <span>{val} / {Math.ceil((val + 1) / 50) * 50}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.color.replace("text-", "bg-")}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Character Upgrades Timeline */}
      <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c]">
        <h3 className="text-base font-bold text-white font-display mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Recent Upgrades & Stat Surges
        </h3>

        {characterData?.recentLogs?.length === 0 ? (
          <p className="text-xs text-gray-500 py-3 text-center">No recent stat growth recorded.</p>
        ) : (
          <div className="space-y-2.5">
            {characterData?.recentLogs?.map((log: any) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-gray-200">{log.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{log.description}</p>
                </div>
                <div className="text-right font-mono text-xs flex-shrink-0">
                  {log.xpDelta > 0 && <span className="text-cyan-300 font-bold mr-2">+{log.xpDelta} XP</span>}
                  {log.attributeDelta > 0 && (
                    <span className="text-purple-300 font-bold capitalize">
                      +{log.attributeDelta} {log.attributeType?.slice(0, 3)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Zap,
  Coins,
  ShieldAlert,
} from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({ unlockedCount: 0, totalCount: 0, completionRate: 0 });
  const [rarityFilter, setRarityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/achievements");
      const data = await res.json();
      if (data.success) {
        setAchievements(data.data.achievements || []);
        setStats(data.data.stats || { unlockedCount: 0, totalCount: 0, completionRate: 0 });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const filtered = achievements.filter(
    (a) => rarityFilter === "ALL" || a.rarity === rarityFilter
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-400" />
            Achievements & Hall of Honor
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Permanent prestige marks awarded for surpassing real-world milestones.
          </p>
        </div>

        {/* Unlock Progress */}
        <div className="p-3 rounded-2xl bg-[#111422] border border-amber-500/30 flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-gray-400 uppercase">Honor Score</span>
            <p className="text-base font-black text-amber-300 font-mono">
              {stats.unlockedCount} / {stats.totalCount} ({stats.completionRate}%)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
            {stats.completionRate}%
          </div>
        </div>
      </div>

      {/* Rarity Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "COMMON", "RARE", "EPIC", "LEGENDARY"].map((rarity) => (
          <button
            key={rarity}
            onClick={() => {
              sound.playClick();
              setRarityFilter(rarity);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              rarityFilter === rarity
                ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "bg-[#111422] text-gray-400 hover:text-white border border-[#20273c]"
            }`}
          >
            {rarity}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-[#11131e] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                ach.unlocked
                  ? "bg-[#131626] border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                  : "bg-[#0d0f17] border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      ach.unlocked
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      ach.rarity === "LEGENDARY"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : ach.rarity === "EPIC"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : ach.rarity === "RARE"
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                        : "bg-gray-900 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {ach.rarity}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {ach.name}
                  {ach.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h3>

                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">+{ach.xpReward} XP</span>
                  <span className="text-amber-300 font-bold">+{ach.goldReward} G</span>
                </div>

                {ach.unlocked ? (
                  <span className="text-[10px] text-emerald-400 font-bold">
                    UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

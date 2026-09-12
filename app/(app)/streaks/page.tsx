"use client";

import React, { useState, useEffect } from "react";
import { Flame, ShieldCheck, Trophy, Sparkles, Calendar, Zap, CheckCircle2 } from "lucide-react";
import { useGameHud } from "@/lib/context/GameHudContext";

export default function StreaksPage() {
  const { streak } = useGameHud();
  const [streakData, setStreakData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreaks();
  }, []);

  const fetchStreaks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/streaks");
      const data = await res.json();
      if (data.success) setStreakData(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Generate 90-day date grid for heatmap
  const generateHeatmapGrid = () => {
    const days: { date: string; count: number; xp: number }[] = [];
    const activitiesMap = new Map<string, any>(
      (streakData?.heatmapData || []).map((a: any) => [a.date, a])
    );

    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const activity = activitiesMap.get(dateStr);
      days.push({
        date: dateStr,
        count: Number(activity?.questCount || 0),
        xp: Number(activity?.xpEarned || 0),
      });
    }
    return days;
  };

  const heatmapDays = generateHeatmapGrid();
  const currentStreak = streakData?.streak?.currentStreak || streak?.currentStreak || 0;
  const longestStreak = streakData?.streak?.longestStreak || streak?.longestStreak || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-white/10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
          <Flame className="w-8 h-8 text-orange-500 fill-orange-500/30 animate-pulse" />
          Momentum & Habit Streaks
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Consistency is the cornerstone of character evolution. Complete at least one quest daily to fuel your flame.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1a1310] via-[#121422] to-[#0c0d16] border border-orange-500/30 shadow-[0_0_25px_rgba(249,115,22,0.15)] flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <Flame className="w-9 h-9 fill-current animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              Current Active Streak
            </span>
            <div className="text-4xl font-black text-white font-display mt-0.5">
              {currentStreak} Days
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Active today. Keep the flame roaring tomorrow!
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#161220] via-[#121422] to-[#0c0d16] border border-amber-500/30 shadow-[0_0_25px_rgba(251,191,36,0.15)] flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              All-Time Personal Record
            </span>
            <div className="text-4xl font-black text-white font-display mt-0.5">
              {longestStreak} Days
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your legendary record of unbroken discipline.
            </p>
          </div>
        </div>
      </div>

      {/* 90-Day Calendar Heatmap */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111422] border border-[#20273c]">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-display">
              90-Day Activity Heatmap
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-[#181d2f]" />
            <span className="w-3 h-3 rounded-sm bg-cyan-900" />
            <span className="w-3 h-3 rounded-sm bg-cyan-700" />
            <span className="w-3 h-3 rounded-sm bg-cyan-500" />
            <span className="w-3 h-3 rounded-sm bg-cyan-300" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
          {heatmapDays.map((item, index) => {
            const count = item.count;
            let bgClass = "bg-[#181d2f]";
            if (count >= 4) bgClass = "bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.8)]";
            else if (count === 3) bgClass = "bg-cyan-500 shadow-[0_0_6px_rgba(0,240,255,0.6)]";
            else if (count === 2) bgClass = "bg-cyan-700";
            else if (count === 1) bgClass = "bg-cyan-900";

            return (
              <div
                key={index}
                title={`${item.date}: ${item.count} quests cleared (+${item.xp} XP)`}
                className={`w-4 h-4 rounded-sm transition-transform hover:scale-125 cursor-pointer ${bgClass}`}
              />
            );
          })}
        </div>
      </div>

      {/* Streak Milestones Roadmap */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111422] border border-[#20273c]">
        <h2 className="text-lg font-bold text-white font-display mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          Milestones & Streak Badges
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streakData?.milestones?.map((m: any) => (
            <div
              key={m.days}
              className={`p-4 rounded-2xl border transition-all ${
                m.reached
                  ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                  : "bg-black/30 border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400">
                  {m.days} DAYS
                </span>
                {m.reached ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <span className="text-[10px] font-mono text-gray-500">Locked</span>
                )}
              </div>
              <p className="text-sm font-bold text-white">{m.label}</p>
              <p className="text-[11px] text-gray-400 mt-1">
                {m.reached ? "Unlocked and claimed!" : `${Math.max(0, m.days - currentStreak)} days remaining`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

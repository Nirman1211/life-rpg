"use client";

import React, { useState, useEffect } from "react";
import { Crown, Flame, Zap, Award, Sparkles, Medal } from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState("xp");
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?sortBy=${sortBy}`);
      const data = await res.json();
      if (data.success) setPlayers(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Crown className="w-8 h-8 text-amber-400" />
            Global Hall of Legends
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Top ranked adventurers across the realm ranked by raw XP power, habit streaks, and level ascension.
          </p>
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111422] border border-[#20273c]">
          <button
            onClick={() => {
              sound.playClick();
              setSortBy("xp");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
              sortBy === "xp"
                ? "bg-amber-400 text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            XP POWER
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSortBy("streak");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
              sortBy === "streak"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            STREAKS
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSortBy("level");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
              sortBy === "level"
                ? "bg-cyan-400 text-black shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            LEVEL
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-[#111422] border border-[#20273c] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090b12] text-gray-400 uppercase text-[11px] border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Adventurer</th>
                <th className="px-6 py-4">Level & Rank</th>
                <th className="px-6 py-4">Total XP</th>
                <th className="px-6 py-4">Streak</th>
                <th className="px-6 py-4 text-right">Treasury</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-14 bg-white/5" />
                  </tr>
                ))
              ) : (
                players.map((p) => (
                  <tr
                    key={p.userId}
                    className={`transition-colors ${
                      p.isCurrentUser
                        ? "bg-amber-500/10 border-l-4 border-l-amber-400 font-bold"
                        : "hover:bg-[#141828]"
                    }`}
                  >
                    <td className="px-6 py-4">
                      {p.rank === 1 ? (
                        <div className="w-7 h-7 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                          1
                        </div>
                      ) : p.rank === 2 ? (
                        <div className="w-7 h-7 rounded-full bg-slate-300 text-black font-black flex items-center justify-center shadow-[0_0_10px_rgba(203,213,225,0.5)]">
                          2
                        </div>
                      ) : p.rank === 3 ? (
                        <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-black flex items-center justify-center shadow-[0_0_10px_rgba(180,83,9,0.5)]">
                          3
                        </div>
                      ) : (
                        <span className="text-gray-400 font-mono text-sm pl-2">
                          #{p.rank}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                          {p.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-sans font-bold text-sm text-white">
                            <span>{p.displayName}</span>
                            {p.isCurrentUser && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-black font-bold uppercase">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 text-xs font-mono">@{p.username}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-white font-bold">Lvl {p.level}</span>{" "}
                      <span className="text-cyan-400 text-[11px] uppercase">({p.rankTitle || p.rank_title || "Adventurer"})</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-cyan-300 font-bold text-sm">
                        {p.totalXp.toLocaleString()} XP
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-orange-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {p.streak} Days
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="text-amber-300 font-bold">
                        {p.gold.toLocaleString()} G
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

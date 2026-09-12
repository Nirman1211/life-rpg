"use client";

import React from "react";
import { Skull, ShieldAlert, Sparkles, CheckCircle } from "lucide-react";

interface BossHealthBarProps {
  bossName: string;
  currentHp: number;
  totalHp: number;
  isDefeated: boolean;
  xpReward: number;
  goldReward: number;
}

export function BossHealthBar({
  bossName,
  currentHp,
  totalHp,
  isDefeated,
  xpReward,
  goldReward,
}: BossHealthBarProps) {
  const hpPercent = Math.max(0, Math.min(100, Math.round((currentHp / totalHp) * 100)));

  return (
    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-[#1b1018] via-[#121422] to-[#0c0d16] border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.15)] overflow-hidden">
      {/* Ambient Red Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-red-500/10 rounded-full blur-3xl" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]">
            <Skull className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                Active Boss Battle
              </span>
              {isDefeated && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Vanquished
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide mt-0.5">
              {bossName}
            </h3>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs text-gray-400">Boss Bounty:</span>
          <p className="text-sm font-bold text-amber-300">
            +{xpReward} XP / +{goldReward} G
          </p>
        </div>
      </div>

      {/* HP Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-mono font-bold">
          <span className="text-red-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> HP
          </span>
          <span className={isDefeated ? "text-emerald-400" : "text-gray-300"}>
            {currentHp} / {totalHp} ({hpPercent}%)
          </span>
        </div>

        <div className="relative w-full h-3.5 rounded-full bg-black/60 p-0.5 border border-red-500/20 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isDefeated
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                : "bg-gradient-to-r from-red-600 via-rose-500 to-orange-400 shadow-[0_0_15px_rgba(239,68,68,0.7)]"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

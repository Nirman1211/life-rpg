"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Coins, Shield, Sparkles } from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

export interface CelebrationData {
  xp: number;
  gold: number;
  attribute: {
    type: string;
    value: number;
  };
}

interface QuestCelebrationToastProps {
  data: CelebrationData | null;
  onDismiss: () => void;
}

export function QuestCelebrationToast({ data, onDismiss }: QuestCelebrationToastProps) {
  useEffect(() => {
    if (data) {
      sound.playQuestComplete();
      const timer = setTimeout(() => {
        onDismiss();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [data, onDismiss]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 p-4 rounded-2xl bg-[#111420]/95 border border-cyan-400/40 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(0,240,255,0.25)] min-w-[280px]"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Quest Complete!
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            {/* XP Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-sm font-bold">
              <Zap className="w-3.5 h-3.5 fill-current" />
              +{data.xp} XP
            </div>

            {/* Gold Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 font-mono text-sm font-bold">
              <Coins className="w-3.5 h-3.5" />
              +{data.gold} G
            </div>

            {/* Attribute Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-sm font-bold capitalize">
              <Shield className="w-3.5 h-3.5" />
              +{data.attribute.value} {data.attribute.type.slice(0, 3)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

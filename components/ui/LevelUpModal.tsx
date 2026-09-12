"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { sound } from "@/lib/audio/soundEffects";
import { Sparkles, Trophy, Coins, ArrowRight, Star } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newRank: string;
  goldBonus: number;
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newRank,
  goldBonus,
}: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      sound.playLevelUp();

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#00f0ff", "#fbbf24", "#a855f7", "#ffffff"],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#00f0ff", "#fbbf24"],
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#a855f7", "#fbbf24"],
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md p-8 rounded-2xl bg-gradient-to-b from-[#161a29] to-[#0d0f17] border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(0,240,255,0.3)] text-center overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />

            {/* Radiant Level Badge */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-28 h-28 mb-6 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-1 shadow-[0_0_30px_rgba(251,191,36,0.6)]"
            >
              <div className="w-full h-full rounded-full bg-[#0d0f17] flex flex-col items-center justify-center border-2 border-amber-400">
                <span className="text-xs uppercase tracking-widest font-mono text-amber-400 font-bold">Level</span>
                <span className="text-4xl font-extrabold text-white tracking-tighter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                  {newLevel}
                </span>
              </div>
            </motion.div>

            {/* Title & Rank */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h2 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-amber-300 uppercase">
                LEVEL UP!
              </h2>
              <p className="mt-2 text-sm text-gray-300 flex items-center justify-center gap-1.5">
                Ascended to <span className="font-semibold text-cyan-300 underline underline-offset-4">{newRank}</span>
              </p>
            </motion.div>

            {/* Rewards Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-around"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">Gold Bounty</p>
                  <p className="text-lg font-bold text-amber-300">+{goldBonus}</p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">Perks</p>
                  <p className="text-sm font-semibold text-cyan-300">New Items</p>
                </div>
              </div>
            </motion.div>

            {/* Action CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="mt-8 w-full py-3 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 tracking-wide uppercase transition-all"
            >
              Claim Glory & Continue
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

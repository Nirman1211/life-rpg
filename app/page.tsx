"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Shield,
  Flame,
  Coins,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sword,
  Brain,
  Skull,
  Star,
  Users,
  BarChart3,
  Dumbbell,
  BookOpen,
  Code2,
} from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

export default function LandingPage() {
  const router = useRouter();

  const handleDemoLogin = async () => {
    sound.playClick();
    try {
      const res = await fetch("/api/auth/demo-login", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        sound.playLevelUp();
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-[#f3f4f6] selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Top Floating Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#08090d]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-300 font-display">
              LIFE//RPG
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleDemoLogin}
            className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1-Click Judge Demo
          </button>
          <Link
            href="/login"
            className="text-xs font-semibold text-gray-300 hover:text-white transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
          >
            Start Journey
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Background Mesh */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Gamified Productivity
          </div>

          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] font-display">
            YOUR LIFE. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-purple-400">
              YOUR QUEST.
            </span> <br />
            YOUR LEVEL.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
            Turn everyday goals into quests, build unstoppable streaks, defeat boss monsters of procrastination, and upgrade your character stats in real life.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-black bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:brightness-110 shadow-[0_0_30px_rgba(0,240,255,0.45)] transition-all flex items-center justify-center gap-2 tracking-wide uppercase text-sm"
            >
              Start Your Journey
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleDemoLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-gray-200 bg-[#121625] hover:bg-[#181d32] border border-[#262f48] shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Instant Hackathon Demo
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-mono">100%</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Postgres Persistence</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">8 Stats</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">Attribute Engine</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">Non-Linear</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">RPG Leveling Curve</p>
            </div>
          </div>
        </div>

        {/* Hero Interactive HUD Preview */}
        <div className="flex-1 w-full max-w-xl z-10">
          <div className="relative p-6 rounded-3xl bg-[#111422]/90 border border-[#252e46] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,240,255,0.15)] backdrop-blur-2xl">
            {/* Top HUD Mockup */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-md">
                  <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center font-bold text-lg text-cyan-400">
                    4
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Alexander Vance</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                      Adventurer
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1 text-amber-300 font-mono">
                      <Coins className="w-3.5 h-3.5" /> 380 Gold
                    </span>
                    <span className="flex items-center gap-1 text-orange-400 font-mono">
                      <Flame className="w-3.5 h-3.5" /> 6 Day Streak
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-cyan-400 font-bold">XP PROGRESS (LEVEL 4 → 5)</span>
                <span className="text-gray-400">180 / 800 XP (23%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-400 rounded-full w-[23%] shadow-[0_0_12px_rgba(0,240,255,0.8)]" />
              </div>
            </div>

            {/* Simulated Quest Card */}
            <div className="mt-5 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#161a2c] border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Solve 2 LeetCode Hard DSA Problems</p>
                    <p className="text-xs text-cyan-300 font-mono mt-0.5">+80 XP • +40 Gold • +5 Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={handleDemoLogin}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                >
                  Complete
                </button>
              </div>

              {/* Boss Battle Sneak Peek */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 to-[#161a2c] border border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                    <Skull className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase text-red-400">Active Boss Quest</p>
                    <p className="text-sm font-bold text-white">The Overfitting Hydra</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-red-400">50 / 100 HP</span>
                  <div className="w-20 h-1.5 bg-black/60 rounded-full mt-1 border border-white/5 overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Attribute Badges */}
            <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-red-400 block font-bold">STR 24</span>
                <span className="text-[10px] text-gray-500">Fitness</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-cyan-400 block font-bold">INT 38</span>
                <span className="text-[10px] text-gray-500">Coding</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-purple-400 block font-bold">WIS 22</span>
                <span className="text-[10px] text-gray-500">Reading</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-emerald-400 block font-bold">FOC 26</span>
                <span className="text-[10px] text-gray-500">Focus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Loop Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            Engineered Dopamine Loop
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 font-display">
            How LIFE RPG Breaks Delayed Gratification
          </h2>
          <p className="text-gray-400 mt-3 text-sm sm:text-base">
            Video games hook your brain with immediate feedback. We apply those exact mathematical game mechanics to your real-world ambitions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#11131c] border border-[#202538] hover:border-cyan-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sword className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Formulate Quests</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Convert tasks into Easy, Normal, Hard, Epic, or Legendary quests categorized across coding, fitness, and study.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11131c] border border-[#202538] hover:border-amber-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Harvest XP & Gold</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Immediate tactile audio, floating reward numbers, and atomic database increments reinforce positive behavior.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11131c] border border-[#202538] hover:border-purple-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Upgrade Attributes</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Coding boosts Intelligence. Deadlifts boost Strength. Meditation boosts Focus. Build an all-around balanced character.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#11131c] border border-[#202538] hover:border-red-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Skull className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">4. Vanquish Bosses</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Decompose massive projects into subquests that reduce Boss HP until you claim massive victory bounties.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
            Everything You Need To Ascend
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 font-display">
            A Complete RPG System For Your Real Life
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-[#111422] border border-[#222a3e]">
            <Flame className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Streaks & Calendar Heatmap</h3>
            <p className="text-sm text-gray-400 mt-2">
              Timezone-aware streak engine with a 90-day interactive activity heatmap tracking your consistency like GitHub commits.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-[#111422] border border-[#222a3e]">
            <Trophy className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Rarity Achievements</h3>
            <p className="text-sm text-gray-400 mt-2">
              Unlock tiered achievements from Common to Legendary. Automatic server validation prevents stat spoofing.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-[#111422] border border-[#222a3e]">
            <Sparkles className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Rewards Emporium & Themes</h3>
            <p className="text-sm text-gray-400 mt-2">
              Spend earned Gold on Cyberpunk, Arcane, Emerald, and Neon themes, prestigious titles, and avatar frames.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-[#111422] border border-[#222a3e]">
            <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Advanced Progress Analytics</h3>
            <p className="text-sm text-gray-400 mt-2">
              Recharts velocity line charts, category completion donuts, and 8-point attribute radar charts.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-[#111422] border border-[#222a3e]">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Global Leaderboard</h3>
            <p className="text-sm text-gray-400 mt-2">
              Compete with other adventurers ranked by Total XP, Streaks, or Level, with customizable privacy settings.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-[#111422] border border-[#222a3e]">
            <Brain className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-lg font-bold text-white">Smart Quest Assistant</h3>
            <p className="text-sm text-gray-400 mt-2">
              AI-driven goal decomposition with smart heuristic fallback that splits any goal into actionable quests.
            </p>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#14192b] to-[#0d0f18] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.2)]">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            The World Is Waiting
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3 font-display">
            Ready To Level Up Your Reality?
          </h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto text-base sm:text-lg">
            Join the adventurers transforming daily tasks into epic character growth.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all uppercase tracking-wide text-sm"
            >
              Create Character Free
            </Link>
            <button
              onClick={handleDemoLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-gray-200 bg-[#171c2e] hover:bg-[#1e253e] border border-white/10 transition-all text-sm"
            >
              1-Click Demo Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LIFE RPG. Built for Hackathon Excellence.</p>
          <div className="flex items-center gap-6 text-gray-400">
            <Link href="/login" className="hover:text-cyan-400 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-cyan-400 transition-colors">Sign Up</Link>
            <button onClick={handleDemoLogin} className="hover:text-amber-400 transition-colors">Demo Mode</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

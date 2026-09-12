"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Zap,
  Flame,
  Coins,
  Shield,
  Clock,
  ArrowRight,
  Code2,
  Dumbbell,
  BookOpen,
  Brain,
  Skull,
  TrendingUp,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useGameHud } from "@/lib/context/GameHudContext";
import { BossHealthBar } from "@/components/ui/BossHealthBar";
import { sound } from "@/lib/audio/soundEffects";

export default function DashboardPage() {
  const { user, character, streak, refreshUserData, triggerQuestCelebration, triggerLevelUp } = useGameHud();
  const [quests, setQuests] = useState<any[]>([]);
  const [activeBoss, setActiveBoss] = useState<any | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Quick Quest Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: "",
    difficulty: "NORMAL",
    attributeType: "intelligence",
    recurrence: "DAILY",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [questsRes, bossRes, historyRes] = await Promise.all([
        fetch("/api/quests?status=TODO"),
        fetch("/api/boss-quests"),
        fetch("/api/history?limit=5"),
      ]);

      const questsData = await questsRes.json();
      const bossData = await bossRes.json();
      const historyData = await historyRes.json();

      if (questsData.success) setQuests(questsData.data || []);
      if (bossData.success && bossData.data.length > 0) {
        const undefeated = bossData.data.find((b: any) => !b.isDefeated) || bossData.data[0];
        setActiveBoss(undefeated);
      }
      if (historyData.success) setRecentLogs(historyData.data.logs || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    sound.playClick();
    setCompletingId(questId);

    // Optimistic UI: remove from active view
    const targetQuest = quests.find((q) => q.id === questId);
    setQuests((prev) => prev.filter((q) => q.id !== questId));

    try {
      const res = await fetch(`/api/quests/${questId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        const result = data.data;

        // Trigger celebratory floating pill
        triggerQuestCelebration({
          xp: result.xpDelta,
          gold: result.goldDelta,
          attribute: {
            type: result.attributeType,
            value: result.attributeDelta,
          },
        });

        // Trigger boss sound if boss damaged
        if (result.bossDamaged) {
          sound.playBossDamage();
        }

        // Trigger level up modal if leveled up
        if (result.didLevelUp) {
          triggerLevelUp({
            newLevel: result.newLevel,
            newRank: result.character.rank,
            goldBonus: (result.newLevel - result.previousLevel) * 100,
          });
        }

        // Refresh stats across HUD
        await refreshUserData();
        fetchDashboardData();
      } else {
        // Rollback optimistic update
        if (targetQuest) {
          setQuests((prev) => [targetQuest, ...prev]);
        }
        alert(data.error?.message || "Could not complete quest.");
      }
    } catch {
      if (targetQuest) {
        setQuests((prev) => [targetQuest, ...prev]);
      }
    } finally {
      setCompletingId(null);
    }
  };

  const handleCreateQuickQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuest.title.trim()) return;

    sound.playClick();
    setSubmitting(true);
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuest),
      });
      const data = await res.json();

      if (data.success) {
        setQuests((prev) => [data.data, ...prev]);
        setShowAddModal(false);
        setNewQuest({
          title: "",
          difficulty: "NORMAL",
          attributeType: "intelligence",
          recurrence: "DAILY",
        });
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const attributes = character?.attributes || {
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
      {/* Top Greeting & Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#121627] via-[#0f121d] to-[#121422] border border-[#23293f] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Day {streak?.currentStreak || 0} Of Unstoppable Reality
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Greetings, {user?.profile?.displayName || "Champion"}!
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              Your attributes await enhancement. Conquer today's quests to harvest XP, maintain your streak, and weaken the Procrastination Boss.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setShowAddModal(true);
              }}
              className="px-5 py-3 rounded-xl font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              Forge New Quest
            </button>
            <Link
              href="/quests"
              className="px-4 py-3 rounded-xl font-semibold text-gray-300 bg-[#171b2b] hover:bg-[#1e2338] border border-white/10 transition-colors text-xs"
            >
              View Quest Board
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Quests & Boss, Right Attributes & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Boss Quest Section */}
          {activeBoss && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Skull className="w-4 h-4" /> Priority Raid Target
                </span>
                <Link href="/boss-quests" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                  View Sub-Quests <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <BossHealthBar
                bossName={activeBoss.bossName}
                currentHp={activeBoss.currentHp}
                totalHp={activeBoss.totalHp}
                isDefeated={activeBoss.isDefeated}
                xpReward={activeBoss.xpReward}
                goldReward={activeBoss.goldReward}
              />
            </div>
          )}

          {/* Today's Active Quests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white font-display">
                  Today's Active Quests
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  {quests.length} pending
                </span>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Quick Add
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-[#11131e] animate-pulse border border-white/5" />
                ))}
              </div>
            ) : quests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#11131e]/80 border border-dashed border-[#23293e] text-center">
                <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-60" />
                <h3 className="text-base font-bold text-white">All Quests Completed!</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  You have cleared all active quests for today. Create another quest or rest to preserve your streak.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold font-mono transition-colors"
                >
                  + Add Next Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-4 rounded-2xl bg-[#111422] hover:bg-[#141829] border border-[#20273c] hover:border-cyan-500/40 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleCompleteQuest(quest.id)}
                        disabled={completingId === quest.id}
                        title="Click to Complete Quest"
                        className="w-7 h-7 rounded-lg border-2 border-[#333d59] group-hover:border-cyan-400 flex items-center justify-center text-transparent hover:text-cyan-400 transition-colors flex-shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4 fill-cyan-400 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              quest.difficulty === "LEGENDARY"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : quest.difficulty === "EPIC"
                                ? "bg-purple-950 text-purple-300 border border-purple-800"
                                : quest.difficulty === "HARD"
                                ? "bg-red-950 text-red-300 border border-red-800"
                                : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            }`}
                          >
                            {quest.difficulty}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 uppercase">
                            {quest.recurrence}
                          </span>
                          {quest.bossQuestId && (
                            <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.2 rounded border border-red-900/40">
                              Boss Raid
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-white truncate mt-1">
                          {quest.title}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-400 font-mono mt-1">
                          <span className="text-cyan-300 font-semibold">+{quest.xpReward} XP</span>
                          <span className="text-amber-300 font-semibold">+{quest.goldReward} G</span>
                          <span className="text-purple-300 capitalize">
                            +{quest.attributeReward} {quest.attributeType?.slice(0, 4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCompleteQuest(quest.id)}
                      disabled={completingId === quest.id}
                      className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-[0_0_12px_rgba(0,240,255,0.4)] flex-shrink-0"
                    >
                      {completingId === quest.id ? "Validating..." : "Complete"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Hero Attributes & Activity Feed */}
        <div className="space-y-8">
          {/* Attributes Matrix */}
          <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-display">Hero Attributes</h3>
              </div>
              <Link href="/character" className="text-xs text-cyan-400 hover:underline font-mono">
                Full Sheet
              </Link>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Intelligence
                </span>
                <span className="font-bold text-cyan-300">{attributes.intelligence}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-red-400" /> Strength
                </span>
                <span className="font-bold text-red-300">{attributes.strength}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" /> Wisdom
                </span>
                <span className="font-bold text-purple-300">{attributes.wisdom}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" /> Focus
                </span>
                <span className="font-bold text-emerald-300">{attributes.focus}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" /> Consistency
                </span>
                <span className="font-bold text-orange-300">{attributes.consistency}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-display">Recent Activity</h3>
              </div>
              <Link href="/history" className="text-xs text-amber-400 hover:underline font-mono">
                View All
              </Link>
            </div>

            {recentLogs.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No recent activity logged.</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs">
                    <p className="font-bold text-gray-200 truncate">{log.title}</p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{log.description}</p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Quest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#111422] border border-cyan-400/40 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 font-display">
              Forge New Quest
            </h3>

            <form onSubmit={handleCreateQuickQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Quest Objective
                </label>
                <input
                  type="text"
                  required
                  value={newQuest.title}
                  onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
                  placeholder="e.g. Read 20 pages of clean architecture"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newQuest.difficulty}
                    onChange={(e) => setNewQuest({ ...newQuest, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                  >
                    <option value="EASY">EASY (+25 XP)</option>
                    <option value="NORMAL">NORMAL (+50 XP)</option>
                    <option value="HARD">HARD (+90 XP)</option>
                    <option value="EPIC">EPIC (+180 XP)</option>
                    <option value="LEGENDARY">LEGENDARY (+300 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Attribute Boost
                  </label>
                  <select
                    value={newQuest.attributeType}
                    onChange={(e) => setNewQuest({ ...newQuest, attributeType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                  >
                    <option value="intelligence">Intelligence (Coding/Study)</option>
                    <option value="strength">Strength (Fitness)</option>
                    <option value="wisdom">Wisdom (Reading)</option>
                    <option value="focus">Focus (Mindfulness)</option>
                    <option value="discipline">Discipline (Habits)</option>
                    <option value="vitality">Vitality (Health/Water)</option>
                    <option value="creativity">Creativity (Art/Design)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold uppercase tracking-wider font-mono shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50"
                >
                  {submitting ? "Forging..." : "Add To Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

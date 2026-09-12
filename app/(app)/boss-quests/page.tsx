"use client";

import React, { useState, useEffect } from "react";
import {
  Skull,
  Plus,
  CheckCircle2,
  ShieldAlert,
  Trophy,
  Zap,
  Coins,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useGameHud } from "@/lib/context/GameHudContext";
import { BossHealthBar } from "@/components/ui/BossHealthBar";
import { sound } from "@/lib/audio/soundEffects";

export default function BossQuestsPage() {
  const { refreshUserData, triggerQuestCelebration, triggerLevelUp } = useGameHud();
  const [bossQuests, setBossQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Boss Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    bossName: "",
    totalHp: 100,
    subQuest1: "",
    subQuest2: "",
    subQuest3: "",
  });

  useEffect(() => {
    fetchBosses();
  }, []);

  const fetchBosses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/boss-quests");
      const data = await res.json();
      if (data.success) setBossQuests(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSubQuest = async (questId: string) => {
    sound.playClick();
    sound.playBossDamage();

    try {
      const res = await fetch(`/api/quests/${questId}/complete`, { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const result = data.data;
        triggerQuestCelebration({
          xp: result.xpDelta,
          gold: result.goldDelta,
          attribute: {
            type: result.attributeType,
            value: result.attributeDelta,
          },
        });

        if (result.didLevelUp) {
          triggerLevelUp({
            newLevel: result.newLevel,
            newRank: result.character.rank,
            goldBonus: (result.newLevel - result.previousLevel) * 100,
          });
        }

        await refreshUserData();
        fetchBosses();
      } else {
        alert(data.error?.message || "Could not execute boss damage.");
      }
    } catch {}
  };

  const handleCreateBoss = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    const subQuests = [formData.subQuest1, formData.subQuest2, formData.subQuest3]
      .filter((sq) => sq.trim().length > 0)
      .map((sq, i) => ({
        title: sq,
        difficulty: i === 2 ? "EPIC" : "NORMAL",
        attributeType: "intelligence",
      }));

    try {
      const res = await fetch("/api/boss-quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          bossName: formData.bossName || "Titan of Hesitation",
          totalHp: Number(formData.totalHp),
          subQuests,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          title: "",
          bossName: "",
          totalHp: 100,
          subQuest1: "",
          subQuest2: "",
          subQuest3: "",
        });
        fetchBosses();
      }
    } catch {}
  };

  const activeBosses = bossQuests.filter((b) => !b.isDefeated);
  const defeatedBosses = bossQuests.filter((b) => b.isDefeated);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Skull className="w-8 h-8 text-red-500 animate-pulse" />
            Boss Battles & Epic Raids
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Break monumental challenges into damage phases. Each sub-quest strike drains Boss HP until total victory.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            setShowModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        >
          <Plus className="w-4 h-4" />
          Summon Boss Raid
        </button>
      </div>

      {/* Active Bosses Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-400" />
          Active Battles ({activeBosses.length})
        </h2>

        {loading ? (
          <div className="h-48 rounded-3xl bg-[#11131e] animate-pulse border border-white/5" />
        ) : activeBosses.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#111422]/70 border border-dashed border-[#252c42] text-center">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No Active Boss Battles!</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              All procrastination titans have been vanquished. Summon your next major real-life milestone as a Boss Raid.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono"
            >
              + Summon New Boss
            </button>
          </div>
        ) : (
          activeBosses.map((boss) => (
            <div
              key={boss.id}
              className="p-6 rounded-3xl bg-[#111422] border border-red-500/20 shadow-lg space-y-6"
            >
              <BossHealthBar
                bossName={boss.bossName}
                currentHp={boss.currentHp}
                totalHp={boss.totalHp}
                isDefeated={boss.isDefeated}
                xpReward={boss.xpReward}
                goldReward={boss.goldReward}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 font-bold uppercase tracking-wider">
                    Required Raid Strikes ({boss.subQuests?.filter((s: any) => s.status === "COMPLETED").length || 0} / {boss.subQuests?.length || 0})
                  </span>
                  <span className="text-gray-500">Each strike inflicts 25-50 HP damage</span>
                </div>

                <div className="space-y-2">
                  {boss.subQuests?.map((sub: any) => (
                    <div
                      key={sub.id}
                      className={`p-3 rounded-xl flex items-center justify-between gap-3 border transition-colors ${
                        sub.status === "COMPLETED"
                          ? "bg-black/40 border-emerald-500/20 text-gray-500"
                          : "bg-black/60 border-white/5 hover:border-red-500/30 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            sub.status === "COMPLETED" ? "text-emerald-400" : "text-gray-600"
                          }`}
                        />
                        <span className={`text-sm font-semibold ${sub.status === "COMPLETED" ? "line-through" : ""}`}>
                          {sub.title}
                        </span>
                      </div>

                      {sub.status !== "COMPLETED" ? (
                        <button
                          onClick={() => handleCompleteSubQuest(sub.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                        >
                          Execute Strike
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-emerald-400 font-bold">Struck</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vanquished Titans Trophy Archive */}
      {defeatedBosses.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Hall of Vanquished Titans ({defeatedBosses.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defeatedBosses.map((boss) => (
              <div
                key={boss.id}
                className="p-4 rounded-2xl bg-[#0e1017] border border-emerald-500/20 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Vanquished</span>
                  <p className="text-sm font-bold text-white mt-0.5">{boss.bossName}</p>
                  <p className="text-xs text-gray-500">{boss.title}</p>
                </div>
                <div className="text-right font-mono text-xs text-amber-300 font-bold">
                  +{boss.xpReward} XP / +{boss.goldReward} G
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summon Boss Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#111422] border border-red-500/40 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 font-display flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500" />
              Summon Boss Raid
            </h3>

            <form onSubmit={handleCreateBoss} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Epic Real-Life Goal
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Build and Deploy Full-Stack SaaS MVP"
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Boss Monster Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bossName}
                    onChange={(e) => setFormData({ ...formData, bossName: e.target.value })}
                    placeholder="e.g. The Overfitting Hydra"
                    className="w-full px-4 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Boss Total HP
                  </label>
                  <select
                    value={formData.totalHp}
                    onChange={(e) => setFormData({ ...formData, totalHp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs font-mono"
                  >
                    <option value={100}>100 HP (Standard Boss)</option>
                    <option value={150}>150 HP (Major Boss)</option>
                    <option value={250}>250 HP (Mythic Raid)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-mono uppercase text-gray-400">
                  Sub-Quest Strikes (Defeating sub-quests reduces boss HP)
                </label>
                <input
                  type="text"
                  required
                  value={formData.subQuest1}
                  onChange={(e) => setFormData({ ...formData, subQuest1: e.target.value })}
                  placeholder="Phase 1: Architecture design and database schema"
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs"
                />
                <input
                  type="text"
                  required
                  value={formData.subQuest2}
                  onChange={(e) => setFormData({ ...formData, subQuest2: e.target.value })}
                  placeholder="Phase 2: Core API implementation and auth"
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs"
                />
                <input
                  type="text"
                  required
                  value={formData.subQuest3}
                  onChange={(e) => setFormData({ ...formData, subQuest3: e.target.value })}
                  placeholder="Phase 3: Production deployment and verification"
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono uppercase shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  Begin Raid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

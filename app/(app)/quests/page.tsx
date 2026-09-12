"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Sparkles,
  Filter,
  CheckCircle2,
  Trash2,
  Clock,
  Coins,
  Zap,
  Brain,
  Search,
  ArrowRight,
} from "lucide-react";
import { useGameHud } from "@/lib/context/GameHudContext";
import { sound } from "@/lib/audio/soundEffects";

export default function QuestsPage() {
  const { refreshUserData, triggerQuestCelebration, triggerLevelUp } = useGameHud();
  const [quests, setQuests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [recurrenceFilter, setRecurrenceFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    difficulty: "NORMAL",
    recurrence: "DAILY",
    attributeType: "intelligence",
    estimatedMins: 30,
  });

  // AI Generator State
  const [aiGoal, setAiGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);

  useEffect(() => {
    fetchQuests();
    fetchCategories();
  }, [statusFilter, recurrenceFilter]);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      let url = "/api/quests?";
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      if (recurrenceFilter !== "ALL") url += `recurrence=${recurrenceFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setQuests(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {}
  };

  const handleComplete = async (questId: string) => {
    sound.playClick();
    const target = quests.find((q) => q.id === questId);
    if (!target) return;

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

        if (result.bossDamaged) sound.playBossDamage();
        if (result.didLevelUp) {
          triggerLevelUp({
            newLevel: result.newLevel,
            newRank: result.character.rank,
            goldBonus: (result.newLevel - result.previousLevel) * 100,
          });
        }

        await refreshUserData();
        fetchQuests();
      } else {
        alert(data.error?.message || "Could not complete quest.");
      }
    } catch {}
  };

  const handleDelete = async (questId: string) => {
    if (!confirm("Are you sure you want to abandon this quest?")) return;
    sound.playClick();
    try {
      const res = await fetch(`/api/quests/${questId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setQuests((prev) => prev.filter((q) => q.id !== questId));
      }
    } catch {}
  };

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          title: "",
          description: "",
          categoryId: "",
          difficulty: "NORMAL",
          recurrence: "DAILY",
          attributeType: "intelligence",
          estimatedMins: 30,
        });
        fetchQuests();
      }
    } catch {}
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoal.trim()) return;
    sound.playClick();
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/generate-quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: aiGoal }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResults(data.data.quests || []);
      }
    } catch {
    } finally {
      setAiLoading(false);
    }
  };

  const handleImportAiQuest = async (questItem: any) => {
    sound.playClick();
    try {
      const res = await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: questItem.title,
          description: questItem.description,
          difficulty: questItem.difficulty,
          attributeType: questItem.attributeType,
          recurrence: "ONCE",
          estimatedMins: questItem.estimatedMins || 30,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResults((prev) => prev.filter((q) => q.title !== questItem.title));
        fetchQuests();
      }
    } catch {}
  };

  const filteredQuests = quests.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <CheckSquare className="w-8 h-8 text-cyan-400" />
            Quest Command Board
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Organize, execute, and harvest rewards from your daily tasks and epic endeavors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              setShowAiModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Smart AI Assistant
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.35)]"
          >
            <Plus className="w-4 h-4" />
            Forge Quest
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#111422] border border-[#20273c]">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active quests..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#090b12] border border-[#23293e] text-white text-xs focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["ALL", "TODO", "COMPLETED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                statusFilter === tab
                  ? "bg-cyan-400 text-black"
                  : "bg-[#181d2f] text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}

          <div className="w-px h-5 bg-white/10 mx-1" />

          {["ALL", "DAILY", "ONCE"].map((rec) => (
            <button
              key={rec}
              onClick={() => setRecurrenceFilter(rec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-colors ${
                recurrenceFilter === rec
                  ? "bg-purple-500 text-white"
                  : "bg-[#181d2f] text-gray-400 hover:text-white"
              }`}
            >
              {rec}
            </button>
          ))}
        </div>
      </div>

      {/* Quests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#11131e] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111422]/60 border border-dashed border-[#23293e] text-center">
          <CheckSquare className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Quests In This Category</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            You don't have any quests matching the selected filters. Forge a new quest or try the Smart AI Assistant.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase font-mono"
          >
            + Create Quest Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className={`p-5 rounded-2xl bg-[#111422] border transition-all flex flex-col justify-between group ${
                quest.status === "COMPLETED"
                  ? "border-emerald-500/30 opacity-70"
                  : "border-[#20273c] hover:border-cyan-400/40 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
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

                  <button
                    onClick={() => handleDelete(quest.id)}
                    title="Delete Quest"
                    className="text-gray-600 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className={`text-base font-bold text-white ${quest.status === "COMPLETED" ? "line-through text-gray-400" : ""}`}>
                  {quest.title}
                </h3>
                {quest.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {quest.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-cyan-300 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> +{quest.xpReward} XP
                  </span>
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Coins className="w-3 h-3" /> +{quest.goldReward} G
                  </span>
                  <span className="text-purple-300 capitalize hidden sm:inline">
                    +{quest.attributeReward} {quest.attributeType?.slice(0, 4)}
                  </span>
                </div>

                {quest.status !== "COMPLETED" ? (
                  <button
                    onClick={() => handleComplete(quest.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  >
                    Complete
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Cleared
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Forge Quest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#111422] border border-cyan-400/40 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 font-display">
              Forge New Quest
            </h3>

            <form onSubmit={handleCreateQuest} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Quest Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Code 2 hours of distributed systems"
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                  Description / Tactical Details
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific tasks, constraints, or links..."
                  className="w-full px-4 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs font-mono"
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
                    Recurrence
                  </label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs font-mono"
                  >
                    <option value="DAILY">Daily Quest</option>
                    <option value="WEEKLY">Weekly Quest</option>
                    <option value="ONCE">One-Time Quest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-gray-400 mb-1">
                    Attribute
                  </label>
                  <select
                    value={formData.attributeType}
                    onChange={(e) => setFormData({ ...formData, attributeType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs font-mono"
                  >
                    <option value="intelligence">Intelligence</option>
                    <option value="strength">Strength</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="focus">Focus</option>
                    <option value="discipline">Discipline</option>
                    <option value="vitality">Vitality</option>
                    <option value="creativity">Creativity</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold uppercase font-mono"
                >
                  Inscribe Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart AI Quest Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#111422] border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.25)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white font-display">
                  AI Quest Architect
                </h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-xs text-gray-500 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Enter any real-world ambition. The AI will decompose it into structured sequential quests.
            </p>

            <form onSubmit={handleAiGenerate} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                  placeholder="e.g. Master Machine Learning and Ship a Model"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-xs focus:border-purple-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-mono text-xs font-bold transition-all disabled:opacity-50"
                >
                  {aiLoading ? "Generating..." : "Decompose"}
                </button>
              </div>
            </form>

            {/* Generated Quest Results */}
            {aiResults.length > 0 && (
              <div className="mt-5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                <span className="text-[11px] font-mono text-purple-400 uppercase font-bold">
                  Generated Quest Path (Click to Inscribe):
                </span>
                {aiResults.map((resQuest, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block">
                        {resQuest.difficulty} • {resQuest.attributeType}
                      </span>
                      <p className="font-bold text-gray-200 mt-0.5">{resQuest.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{resQuest.description}</p>
                    </div>
                    <button
                      onClick={() => handleImportAiQuest(resQuest)}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/40 font-mono text-[11px] font-bold flex-shrink-0"
                    >
                      + Inscribe
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

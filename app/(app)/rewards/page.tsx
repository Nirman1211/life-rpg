"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Check,
  Zap,
  Package,
  ArrowRight,
  Shield,
  Palette,
  Award,
} from "lucide-react";
import { useGameHud } from "@/lib/context/GameHudContext";
import { sound } from "@/lib/audio/soundEffects";

export default function RewardsShopPage() {
  const { character, refreshUserData } = useGameHud();
  const [rewards, setRewards] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rewards");
      const data = await res.json();
      if (data.success) {
        setRewards(data.data.rewards || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (reward: any) => {
    if (reward.isOwned && reward.category !== "BOOSTER") return;
    sound.playClick();
    setPurchasingId(reward.id);

    try {
      const res = await fetch(`/api/rewards/${reward.id}/purchase`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        sound.playCoinDing();
        await refreshUserData();
        fetchRewards();
      } else {
        alert(data.error?.message || "Purchase failed.");
      }
    } catch {
    } finally {
      setPurchasingId(null);
    }
  };

  const filtered = rewards.filter(
    (r) => categoryFilter === "ALL" || r.category === categoryFilter
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <ShoppingBag className="w-8 h-8 text-amber-400" />
            Reward Emporium
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Reinvest your hard-earned quest Gold into holographic themes, titles, and character frames.
          </p>
        </div>

        {/* Treasury Balance */}
        <div className="p-3.5 rounded-2xl bg-[#111422] border border-amber-500/30 flex items-center gap-3">
          <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase">Treasury Balance</span>
            <p className="text-xl font-black text-amber-300 font-mono">
              {character?.gold || 0} Gold
            </p>
          </div>
          <Link
            href="/inventory"
            className="ml-4 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
          >
            <Package className="w-3.5 h-3.5" /> Backpack
          </Link>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["ALL", "THEME", "TITLE", "AVATAR_FRAME", "BOOSTER"].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.playClick();
              setCategoryFilter(cat);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              categoryFilter === cat
                ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                : "bg-[#111422] text-gray-400 hover:text-white border border-[#20273c]"
            }`}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-[#11131e] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-[#111422] border transition-all flex flex-col justify-between group ${
                item.isOwned
                  ? "border-emerald-500/30 shadow-sm"
                  : item.canAfford
                  ? "border-[#252c42] hover:border-amber-500/50 shadow-md"
                  : "border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      item.rarity === "LEGENDARY"
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : item.rarity === "EPIC"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : item.rarity === "RARE"
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                        : "bg-gray-900 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {item.rarity}
                  </span>

                  <span className="text-[10px] font-mono text-gray-500 uppercase">
                    {item.category.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm font-mono font-bold text-amber-300">
                  <Coins className="w-4 h-4 text-amber-400" />
                  {item.cost === 0 ? "FREE" : `${item.cost} G`}
                </div>

                {item.isOwned && item.category !== "BOOSTER" ? (
                  <Link
                    href="/inventory"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Owned
                  </Link>
                ) : (
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!item.canAfford || purchasingId === item.id}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                  >
                    {purchasingId === item.id ? "Forging..." : "Purchase"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

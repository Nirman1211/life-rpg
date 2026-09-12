"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Check, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { useTheme, ThemeName } from "@/lib/theme/ThemeContext";
import { sound } from "@/lib/audio/soundEffects";

export default function InventoryPage() {
  const { setTheme } = useTheme();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [equippingId, setEquippingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (data.success) {
        setInventory(data.data || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEquip = async (item: any) => {
    sound.playClick();
    setEquippingId(item.id);

    try {
      const res = await fetch(`/api/inventory/${item.id}/equip`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        // If it's a theme and was equipped, update local theme context immediately
        if (item.reward.category === "THEME" && data.data.isEquipped) {
          const themeName = (item.reward.effectValue || "cyberpunk") as ThemeName;
          setTheme(themeName);
        }

        fetchInventory();
      }
    } catch {
    } finally {
      setEquippingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <Package className="w-8 h-8 text-cyan-400" />
            Hero Inventory & Gear
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your collected cosmetic titles, visual themes, and equipment.
          </p>
        </div>

        <Link
          href="/rewards"
          className="px-4 py-2.5 rounded-xl bg-[#111422] hover:bg-[#181d2f] border border-[#20273c] text-amber-300 font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          Visit Emporium
        </Link>
      </div>

      {/* Inventory Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-[#11131e] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : inventory.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111422]/60 border border-dashed border-[#23293e] text-center">
          <Package className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Your Backpack Is Empty</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            You have not acquired any cosmetic titles or themes yet. Head over to the Reward Emporium to unlock your first item.
          </p>
          <Link
            href="/rewards"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs uppercase font-mono"
          >
            Browse Rewards <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-[#111422] border transition-all flex flex-col justify-between ${
                item.isEquipped
                  ? "border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                  : "border-[#20273c] hover:border-white/20"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-gray-400 border border-white/5">
                    {item.reward.category.replace("_", " ")}
                  </span>

                  {item.isEquipped && (
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1">
                      <Check className="w-3 h-3" /> Equipped
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">
                  {item.reward.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {item.reward.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-gray-500">
                  Acquired {new Date(item.acquiredAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleToggleEquip(item)}
                  disabled={equippingId === item.id}
                  className={`px-4 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                    item.isEquipped
                      ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                      : "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  }`}
                >
                  {equippingId === item.id
                    ? "Updating..."
                    : item.isEquipped
                    ? "Unequip"
                    : "Equip Gear"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

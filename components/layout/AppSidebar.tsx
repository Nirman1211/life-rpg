"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Skull,
  Shield,
  Flame,
  Trophy,
  ShoppingBag,
  Package,
  BarChart3,
  Crown,
  History,
  Settings,
} from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quests", label: "Quests", icon: CheckSquare },
  { href: "/boss-quests", label: "Boss Battles", icon: Skull, highlight: true },
  { href: "/character", label: "Character", icon: Shield },
  { href: "/streaks", label: "Streaks", icon: Flame },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/rewards", label: "Rewards Shop", icon: ShoppingBag },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Crown },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-[#1f2538] bg-[#090b12] p-4 flex-shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 px-3 py-1 block">
          RPG Navigation
        </span>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => sound.playClick()}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#121624] border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive
                    ? "text-cyan-400"
                    : item.highlight
                    ? "text-red-400"
                    : "text-gray-400 group-hover:text-cyan-400"
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.highlight && !isActive && (
                <span className="ml-auto text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40">
                  Boss
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Motivational Quest Banner */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121625] to-[#0c0e17] border border-[#252c42] text-xs">
          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">
            Rule of the Realm:
          </p>
          <p className="text-gray-400 mt-1 leading-relaxed">
            "Every completed task bridges your reality with your legend."
          </p>
        </div>
      </div>
    </aside>
  );
}

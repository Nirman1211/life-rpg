"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Skull,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

const mobileItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/quests", label: "Quests", icon: CheckSquare },
  { href: "/boss-quests", label: "Boss", icon: Skull },
  { href: "/character", label: "Hero", icon: Shield },
  { href: "/rewards", label: "Shop", icon: ShoppingBag },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090b12]/95 border-t border-[#1f2538] backdrop-blur-lg px-2 py-1.5 flex items-center justify-around">
      {mobileItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => sound.playClick()}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? "text-cyan-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-cyan-400 fill-cyan-400/20" : ""}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

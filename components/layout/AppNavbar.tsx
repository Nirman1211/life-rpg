"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Coins,
  Flame,
  Volume2,
  VolumeX,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

interface AppNavbarProps {
  user: any;
  character: any;
  streak: any;
  onRefresh?: () => void;
}

export function AppNavbar({ user, character, streak, onRefresh }: AppNavbarProps) {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setSoundEnabled(sound.isEnabled());
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      fetchNotifications();
    } catch {}
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.setEnabled(next);
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const progress = character?.progress || {
    level: character?.level || 1,
    currentXp: character?.currentXp || 0,
    xpForNextLevel: 100,
    progressPercent: 0,
    rank: character?.rank || "Novice",
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f2538] bg-[#090b12]/90 backdrop-blur-md px-4 lg:px-8 py-2.5 flex items-center justify-between">
      {/* Brand Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 group">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#0d0f17] rounded-[7px] flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 text-lg font-display">
            LIFE//RPG
          </span>
          <span className="block text-[10px] uppercase font-mono tracking-widest text-gray-400 -mt-1">
            Level Up Reality
          </span>
        </div>
      </Link>

      {/* Central HUD Stats */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Level & XP HUD */}
        <div className="flex items-center gap-2 bg-[#121522] border border-[#232a3e] rounded-xl px-3 py-1.5 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              LVL
            </span>
            <span className="text-base font-extrabold text-white leading-none">
              {progress.level}
            </span>
          </div>

          <div className="hidden md:flex flex-col w-32">
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
              <span>XP</span>
              <span>{progress.currentXp} / {progress.xpForNextLevel}</span>
            </div>
            <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all duration-500"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gold Counter */}
        <div className="flex items-center gap-1.5 bg-[#121522] border border-[#232a3e] rounded-xl px-3 py-1.5 shadow-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-mono font-bold text-amber-300 text-sm">
            {character?.gold || 0}
          </span>
        </div>

        {/* Streak Flame */}
        <div className="flex items-center gap-1.5 bg-[#121522] border border-[#232a3e] rounded-xl px-3 py-1.5 shadow-sm">
          <Flame className={`w-4 h-4 ${(streak?.currentStreak || 0) > 0 ? "text-orange-400 fill-orange-400 animate-pulse" : "text-gray-500"}`} />
          <span className="font-mono font-bold text-orange-300 text-sm">
            {streak?.currentStreak || 0}d
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? "Mute audio" : "Unmute audio"}
          className="p-2 rounded-lg bg-[#121522] hover:bg-[#181d2f] border border-[#232a3e] text-gray-400 hover:text-cyan-300 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-[#121522] hover:bg-[#181d2f] border border-[#232a3e] text-gray-400 hover:text-cyan-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#111422] border border-[#252c42] shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-cyan-400 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="mt-2 max-h-64 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 text-center">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`py-2 text-xs ${n.read ? "opacity-60" : "opacity-100"}`}>
                      <p className="font-semibold text-gray-200">{n.title}</p>
                      <p className="text-gray-400 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-[#121522] hover:bg-[#181d2f] border border-[#232a3e] transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.profile?.displayName?.charAt(0) || "U"}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-gray-300 max-w-[90px] truncate">
              {user?.profile?.displayName || "Adventurer"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#111422] border border-[#252c42] shadow-2xl py-1.5 z-50">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-bold text-white truncate">{user?.profile?.displayName}</p>
                <p className="text-[10px] text-cyan-400 uppercase font-mono">{progress.rank}</p>
              </div>
              <Link
                href="/character"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-[#191e32] hover:text-white"
              >
                <User className="w-4 h-4 text-cyan-400" /> Character Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-[#191e32] hover:text-white"
              >
                <Settings className="w-4 h-4 text-gray-400" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

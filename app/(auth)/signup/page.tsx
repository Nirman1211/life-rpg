"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Lock, Mail, User, Sparkles, AlertCircle } from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data?.error?.message || "Failed to create account. Please try again.");
      } else {
        sound.playLevelUp();
        router.push("/dashboard");
      }
    } catch {
      setError("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-[#11131e]/90 border border-[#23293e] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-xl relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300 font-display">
              LIFE//RPG
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Forge Your Character</h1>
          <p className="text-xs text-gray-400 mt-1">Begin at Level 1. Upgrade stats through real-world actions.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3.5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">
              Hero Display Name
            </label>
            <div className="relative">
              <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g. Alexander Vance"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">
              Character Handle / Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. CyberKnight"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="hero@liferpg.app"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-1">
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a0c14] border border-[#23293e] text-white text-sm focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.4)] uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Forging Hero Profile..." : "Ascend to Level 1"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Already have an adventurer account?{" "}
          <Link href="/login" className="text-purple-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

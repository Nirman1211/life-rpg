"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Zap,
  CheckCircle2,
  PieChart as PieIcon,
  Shield,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics?range=${range}`);
      const resData = await res.json();
      if (resData.success) setData(resData.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {
    level: 1,
    rank: "Novice",
    totalXp: 0,
    gold: 0,
    currentStreak: 0,
    totalCompletions: 0,
  };

  const xpTimeline = data?.xpTimeline || [];
  const attributes = data?.attributes || [];
  const categoryDistribution = data?.categoryDistribution || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            Progression Analytics & Metrics
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Deep-dive metrics charting your XP velocity, attribute balance, and habit distribution.
          </p>
        </div>

        {/* Range Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#111422] border border-[#20273c]">
          {["7d", "30d", "90d", "1y"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                range === r
                  ? "bg-cyan-400 text-black shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111422] border border-[#20273c]">
          <span className="text-xs font-mono text-gray-400 uppercase">Current Level</span>
          <p className="text-2xl font-black text-white font-mono mt-1">
            Lvl {kpis.level} <span className="text-xs font-normal text-cyan-400 font-sans">({kpis.rank})</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111422] border border-[#20273c]">
          <span className="text-xs font-mono text-gray-400 uppercase">Lifetime XP</span>
          <p className="text-2xl font-black text-cyan-300 font-mono mt-1">
            {kpis.totalXp} XP
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111422] border border-[#20273c]">
          <span className="text-xs font-mono text-gray-400 uppercase">Total Quests Cleared</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {kpis.totalCompletions}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#111422] border border-[#20273c]">
          <span className="text-xs font-mono text-gray-400 uppercase">Active Streak</span>
          <p className="text-2xl font-black text-orange-400 font-mono mt-1">
            {kpis.currentStreak} Days
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* XP Velocity Line Chart */}
        <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c]">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white font-display">XP Velocity Timeline</h3>
          </div>

          <div className="h-64 w-full">
            {xpTimeline.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                No XP transactions recorded in this window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpTimeline}>
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0d0f17", borderColor: "#20273c", borderRadius: "12px" }}
                    labelStyle={{ color: "#00f0ff", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#00f0ff"
                    strokeWidth={3}
                    dot={{ fill: "#00f0ff", r: 4 }}
                    activeDot={{ r: 6, fill: "#fbbf24" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Attribute Balance Radar Chart */}
        <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c]">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white font-display">8-Attribute Balance Radar</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={attributes}>
                <PolarGrid stroke="#23293e" />
                <PolarAngleAxis dataKey="attribute" stroke="#9ca3af" fontSize={10} />
                <PolarRadiusAxis stroke="#4b5563" fontSize={10} />
                <Radar
                  name="Hero Attributes"
                  dataKey="value"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryDistribution.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#111422] border border-[#20273c]">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-display">Completed Quests by Category</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryDistribution.map((cat: any, i: number) => (
              <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 text-center">
                <span className="text-xs font-bold text-gray-300 block truncate">{cat.name}</span>
                <span className="text-lg font-black text-cyan-400 font-mono mt-1 block">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

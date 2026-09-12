"use client";

import React, { useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Zap,
  Coins,
  Shield,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Skull,
  CheckCircle2,
} from "lucide-react";
import { sound } from "@/lib/audio/soundEffects";

export default function HistoryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory(pagination.page);
  }, [pagination.page]);

  const fetchHistory = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/history?page=${page}&limit=15`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs || []);
        setPagination(data.data.pagination || { page: 1, totalPages: 1, totalCount: 0 });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    sound.playClick();
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-display flex items-center gap-2.5">
            <HistoryIcon className="w-8 h-8 text-cyan-400" />
            Chronological Activity Log
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            An immutable ledger of every quest conquered, attribute boosted, and boss struck.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400">
          Total Logged Actions: <span className="text-white font-bold">{pagination.totalCount}</span>
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-[#11131e] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111422]/60 border border-dashed border-[#23293e] text-center">
          <HistoryIcon className="w-10 h-10 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Action Logs Recorded</h3>
          <p className="text-xs text-gray-400 mt-1">
            Complete your first quest to begin your permanent hero chronicle.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-[#111422] border border-[#20273c] flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center flex-shrink-0">
                  {log.type === "LEVEL_UP" ? (
                    <Trophy className="w-5 h-5 text-amber-400" />
                  ) : log.type === "BOSS_DAMAGED" || log.type === "BOSS_DEFEATED" ? (
                    <Skull className="w-5 h-5 text-red-400" />
                  ) : log.type === "ACHIEVEMENT_UNLOCKED" ? (
                    <Trophy className="w-5 h-5 text-purple-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{log.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{log.description}</p>
                  <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono text-xs flex-shrink-0">
                {log.xpDelta > 0 && (
                  <span className="text-cyan-300 font-bold block">+{log.xpDelta} XP</span>
                )}
                {log.goldDelta !== 0 && (
                  <span
                    className={`font-bold block ${
                      log.goldDelta > 0 ? "text-amber-300" : "text-gray-400"
                    }`}
                  >
                    {log.goldDelta > 0 ? `+${log.goldDelta}` : log.goldDelta} G
                  </span>
                )}
                {log.attributeDelta > 0 && (
                  <span className="text-purple-300 font-bold capitalize block">
                    +{log.attributeDelta} {log.attributeType?.slice(0, 3)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/10">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl bg-[#111422] border border-[#20273c] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-gray-400">
            Page <span className="text-white font-bold">{pagination.page}</span> of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl bg-[#111422] border border-[#20273c] text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

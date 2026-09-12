"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { QuestCelebrationToast, CelebrationData } from "@/components/ui/QuestCelebrationToast";

interface LevelUpData {
  newLevel: number;
  newRank: string;
  goldBonus: number;
}

interface GameHudContextType {
  user: any;
  character: any;
  streak: any;
  refreshUserData: () => Promise<void>;
  triggerQuestCelebration: (data: CelebrationData) => void;
  triggerLevelUp: (data: LevelUpData) => void;
}

const GameHudContext = createContext<GameHudContextType | null>(null);

export function GameHudProvider({
  initialUser,
  children,
}: {
  initialUser: any;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState(initialUser);
  const [character, setCharacter] = useState(initialUser?.character || null);
  const [streak, setStreak] = useState(initialUser?.streak || null);

  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);

  const refreshUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.data) {
        setUser(data.data);
        setCharacter(data.data.character);
        setStreak(data.data.streak);
      }
    } catch (err) {
      console.error("Failed to refresh HUD data:", err);
    }
  };

  const triggerQuestCelebration = (data: CelebrationData) => {
    setCelebrationData(data);
  };

  const triggerLevelUp = (data: LevelUpData) => {
    setLevelUpData(data);
  };

  return (
    <GameHudContext.Provider
      value={{
        user,
        character,
        streak,
        refreshUserData,
        triggerQuestCelebration,
        triggerLevelUp,
      }}
    >
      {children}

      <QuestCelebrationToast
        data={celebrationData}
        onDismiss={() => setCelebrationData(null)}
      />

      <LevelUpModal
        isOpen={!!levelUpData}
        onClose={() => setLevelUpData(null)}
        newLevel={levelUpData?.newLevel || 1}
        newRank={levelUpData?.newRank || "Novice"}
        goldBonus={levelUpData?.goldBonus || 100}
      />
    </GameHudContext.Provider>
  );
}

export function useGameHud() {
  const ctx = useContext(GameHudContext);
  if (!ctx) {
    throw new Error("useGameHud must be used within GameHudProvider");
  }
  return ctx;
}

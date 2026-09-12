import { describe, it, expect } from "vitest";
import {
  calculateXPForLevel,
  calculateCumulativeXP,
  calculateLevel,
  getLevelProgress,
  getRankTitle,
  getEnforcedRewards,
  getYesterdayString,
} from "../lib/rpg/engine";

describe("RPG Progression Engine", () => {
  it("calculates non-linear XP thresholds correctly", () => {
    // Level 1 -> 2
    expect(calculateXPForLevel(1)).toBe(100);
    // Level 2 -> 3
    expect(calculateXPForLevel(2)).toBe(282); // floor(100 * 2^1.5)
    // Level 3 -> 4
    expect(calculateXPForLevel(3)).toBe(519); // floor(100 * 3^1.5)
    // Level 4 -> 5
    expect(calculateXPForLevel(4)).toBe(800); // floor(100 * 4^1.5)
  });

  it("calculates cumulative XP thresholds", () => {
    expect(calculateCumulativeXP(1)).toBe(0);
    expect(calculateCumulativeXP(2)).toBe(100);
    expect(calculateCumulativeXP(3)).toBe(100 + 282); // 382
    expect(calculateCumulativeXP(4)).toBe(382 + 519); // 901
  });

  it("correctly identifies level from total XP", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(50)).toBe(1);
    expect(calculateLevel(99)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(381)).toBe(2);
    expect(calculateLevel(382)).toBe(3);
    expect(calculateLevel(901)).toBe(4);
    expect(calculateLevel(1701)).toBe(5);
  });

  it("computes accurate HUD level progress percentages", () => {
    const p1 = getLevelProgress(50);
    expect(p1.level).toBe(1);
    expect(p1.currentXp).toBe(50);
    expect(p1.xpForNextLevel).toBe(100);
    expect(p1.progressPercent).toBe(50);
    expect(p1.rank).toBe("Novice");

    const p2 = getLevelProgress(100);
    expect(p2.level).toBe(2);
    expect(p2.currentXp).toBe(0);
    expect(p2.xpForNextLevel).toBe(282);
    expect(p2.progressPercent).toBe(0);
  });

  it("maps ranks accurately based on character level", () => {
    expect(getRankTitle(1)).toBe("Novice");
    expect(getRankTitle(4)).toBe("Novice");
    expect(getRankTitle(5)).toBe("Adventurer");
    expect(getRankTitle(10)).toBe("Warrior");
    expect(getRankTitle(15)).toBe("Elite");
    expect(getRankTitle(20)).toBe("Master");
    expect(getRankTitle(30)).toBe("Champion");
    expect(getRankTitle(50)).toBe("Legend");
  });

  it("enforces server-side rewards by difficulty", () => {
    expect(getEnforcedRewards("EASY")).toEqual({ xpReward: 25, goldReward: 15, attributeReward: 2 });
    expect(getEnforcedRewards("NORMAL")).toEqual({ xpReward: 50, goldReward: 25, attributeReward: 3 });
    expect(getEnforcedRewards("HARD")).toEqual({ xpReward: 90, goldReward: 45, attributeReward: 5 });
    expect(getEnforcedRewards("EPIC")).toEqual({ xpReward: 180, goldReward: 80, attributeReward: 8 });
    expect(getEnforcedRewards("LEGENDARY")).toEqual({ xpReward: 300, goldReward: 150, attributeReward: 12 });
  });

  it("computes consecutive yesterday dates properly", () => {
    expect(getYesterdayString("2026-09-12")).toBe("2026-09-11");
    expect(getYesterdayString("2026-03-01")).toBe("2026-02-28");
  });
});

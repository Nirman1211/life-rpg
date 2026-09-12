import prisma from "@/lib/db";

export interface LevelProgress {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  totalXp: number;
  progressPercent: number;
  rank: string;
}

export interface QuestRewardValues {
  xpReward: number;
  goldReward: number;
  attributeReward: number;
}

/**
 * Calculates XP required to advance from (level) to (level + 1)
 * Formula: 100 * level^1.5
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 100;
  return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculates total cumulative XP needed from Level 1 to reach target level
 */
export function calculateCumulativeXP(targetLevel: number): number {
  if (targetLevel <= 1) return 0;
  let total = 0;
  for (let l = 1; l < targetLevel; l++) {
    total += calculateXPForLevel(l);
  }
  return total;
}

/**
 * Calculates level from total accumulated XP
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  let level = 1;
  let accumulated = 0;

  while (true) {
    const needed = calculateXPForLevel(level);
    if (accumulated + needed > totalXp) {
      return level;
    }
    accumulated += needed;
    level++;
    if (level >= 100) return 100; // Cap at 100
  }
}

/**
 * Returns full level progress and percentile for HUD displays
 */
export function getLevelProgress(totalXp: number): LevelProgress {
  const level = calculateLevel(totalXp);
  const currentLevelBaseXp = calculateCumulativeXP(level);
  const xpForNextLevel = calculateXPForLevel(level);
  const currentXp = Math.max(0, totalXp - currentLevelBaseXp);
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentXp / xpForNextLevel) * 100)));
  const rank = getRankTitle(level);

  return {
    level,
    currentXp,
    xpForNextLevel,
    totalXp,
    progressPercent,
    rank,
  };
}

/**
 * Ranks based on character level
 */
export function getRankTitle(level: number): string {
  if (level >= 50) return "Legend";
  if (level >= 30) return "Champion";
  if (level >= 20) return "Master";
  if (level >= 15) return "Elite";
  if (level >= 10) return "Warrior";
  if (level >= 5) return "Adventurer";
  return "Novice";
}

/**
 * Server-enforced rewards based on difficulty to prevent cheating
 */
export function getEnforcedRewards(difficulty: string): QuestRewardValues {
  switch (difficulty.toUpperCase()) {
    case "EASY":
      return { xpReward: 25, goldReward: 15, attributeReward: 2 };
    case "HARD":
      return { xpReward: 90, goldReward: 45, attributeReward: 5 };
    case "EPIC":
      return { xpReward: 180, goldReward: 80, attributeReward: 8 };
    case "LEGENDARY":
      return { xpReward: 300, goldReward: 150, attributeReward: 12 };
    case "NORMAL":
    default:
      return { xpReward: 50, goldReward: 25, attributeReward: 3 };
  }
}

/**
 * Normalizes date string into YYYY-MM-DD
 */
export function getDateString(date: Date = new Date(), timezone: string = "UTC"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split("T")[0];
  }
}

/**
 * Calculates previous day in YYYY-MM-DD
 */
export function getYesterdayString(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export interface CompletionResult {
  quest: any;
  character: any;
  xpDelta: number;
  goldDelta: number;
  attributeDelta: number;
  attributeType: string;
  previousLevel: number;
  newLevel: number;
  didLevelUp: boolean;
  unlockedAchievements: any[];
  streakUpdated: boolean;
  currentStreak: number;
  bossDamaged: boolean;
  bossDefeated: boolean;
}

/**
 * ATOMIC QUEST COMPLETION ENGINE
 * Runs all updates inside a single database transaction
 */
export async function completeQuestTransaction(
  userId: string,
  questId: string
): Promise<CompletionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      character: {
        include: { attributes: true },
      },
      streak: true,
      settings: true,
    },
  });

  if (!user || !user.character) {
    throw new Error("USER_NOT_FOUND");
  }

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    include: { category: true, bossQuest: true },
  });

  if (!quest) {
    throw new Error("QUEST_NOT_FOUND");
  }

  if (quest.userId !== userId) {
    throw new Error("UNAUTHORIZED_QUEST_ACCESS");
  }

  // If one-time quest is already completed, disallow repeat completion
  if (quest.recurrence === "ONCE" && quest.status === "COMPLETED") {
    throw new Error("ALREADY_COMPLETED");
  }

  const userTimezone = user.profile?.timezone || user.settings?.timezone || "UTC";
  const todayStr = getDateString(new Date(), userTimezone);

  // Check for idempotency: if already completed today
  const existingCompletion = await prisma.questCompletion.findUnique({
    where: {
      questId_completedDateStr: {
        questId,
        completedDateStr: todayStr,
      },
    },
  });

  if (existingCompletion) {
    throw new Error("ALREADY_COMPLETED_TODAY");
  }

  // Calculate enforced rewards
  const rewards = getEnforcedRewards(quest.difficulty);
  const attributeKey = (quest.attributeType || quest.category?.defaultAttribute || "intelligence").toLowerCase();

  const previousTotalXp = user.character.totalXp;
  const previousLevel = user.character.level;
  const newTotalXp = previousTotalXp + rewards.xpReward;
  const newLevelProgress = getLevelProgress(newTotalXp);
  const didLevelUp = newLevelProgress.level > previousLevel;
  const levelUpGoldBonus = didLevelUp ? (newLevelProgress.level - previousLevel) * 100 : 0;
  const totalGoldToAdd = rewards.goldReward + levelUpGoldBonus;

  // Execute database transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Record Quest Completion
    await tx.questCompletion.create({
      data: {
        questId,
        userId,
        completedDateStr: todayStr,
        xpAwarded: rewards.xpReward,
        goldAwarded: rewards.goldReward,
        attributeAwarded: rewards.attributeReward,
        attributeType: attributeKey,
      },
    });

    // 2. Update Quest status
    const updatedQuest = await tx.quest.update({
      where: { id: questId },
      data: {
        status: quest.recurrence === "ONCE" ? "COMPLETED" : "TODO",
        completedAt: new Date(),
      },
    });

    // 3. Update Character Stats
    const updatedCharacter = await tx.character.update({
      where: { userId },
      data: {
        level: newLevelProgress.level,
        currentXp: newLevelProgress.currentXp,
        totalXp: newTotalXp,
        gold: { increment: totalGoldToAdd },
        rank: newLevelProgress.rank,
      },
    });

    // 4. Update Attributes
    const validAttributes = [
      "strength",
      "intelligence",
      "wisdom",
      "discipline",
      "vitality",
      "focus",
      "creativity",
      "consistency",
    ];
    const targetAttribute = validAttributes.includes(attributeKey) ? attributeKey : "intelligence";

    if (user.character?.attributes?.id) {
      await tx.attributes.update({
        where: { characterId: user.character.id },
        data: {
          [targetAttribute]: { increment: rewards.attributeReward },
        },
      });
    }

    // 5. Update Streak
    let currentStreak = user.streak?.currentStreak || 0;
    let longestStreak = user.streak?.longestStreak || 0;
    let streakUpdated = false;
    const lastActive = user.streak?.lastActiveDate;
    const yesterdayStr = getYesterdayString(todayStr);

    if (lastActive !== todayStr) {
      if (lastActive === yesterdayStr) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      streakUpdated = true;

      await tx.streak.upsert({
        where: { userId },
        create: {
          userId,
          currentStreak,
          longestStreak,
          lastActiveDate: todayStr,
        },
        update: {
          currentStreak,
          longestStreak,
          lastActiveDate: todayStr,
        },
      });
    }

    // 6. Update Daily Activity Aggregates
    await tx.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: todayStr },
      },
      create: {
        userId,
        date: todayStr,
        questCount: 1,
        xpEarned: rewards.xpReward,
        goldEarned: totalGoldToAdd,
      },
      update: {
        questCount: { increment: 1 },
        xpEarned: { increment: rewards.xpReward },
        goldEarned: { increment: totalGoldToAdd },
      },
    });

    // 7. Log XP Transaction
    await tx.xPTransaction.create({
      data: {
        userId,
        amount: rewards.xpReward,
        source: "QUEST_COMPLETION",
        referenceId: questId,
      },
    });

    // 8. Log Activity
    await tx.activityLog.create({
      data: {
        userId,
        type: "QUEST_COMPLETED",
        title: `Completed Quest: ${quest.title}`,
        description: `Earned +${rewards.xpReward} XP, +${rewards.goldReward} Gold, +${rewards.attributeReward} ${targetAttribute.toUpperCase()}.`,
        xpDelta: rewards.xpReward,
        goldDelta: rewards.goldReward,
        attributeDelta: rewards.attributeReward,
        attributeType: targetAttribute,
      },
    });

    if (didLevelUp) {
      await tx.activityLog.create({
        data: {
          userId,
          type: "LEVEL_UP",
          title: `Leveled Up to Level ${newLevelProgress.level}!`,
          description: `Ascended to rank ${newLevelProgress.rank}! Awarded +${levelUpGoldBonus} bonus Gold!`,
          xpDelta: 0,
          goldDelta: levelUpGoldBonus,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: `LEVEL UP! Level ${newLevelProgress.level} Achieved!`,
          message: `Congratulations! You ascended to ${newLevelProgress.rank} and received ${levelUpGoldBonus} Gold!`,
          type: "LEVEL_UP",
        },
      });
    }

    // 9. Boss Quest Damage Handling
    let bossDamaged = false;
    let bossDefeated = false;

    if (quest.bossQuestId) {
      const boss = await tx.bossQuest.findUnique({
        where: { id: quest.bossQuestId },
      });

      if (boss && !boss.isDefeated) {
        bossDamaged = true;
        const damage = Math.max(15, Math.floor(rewards.xpReward / 2));
        const newHp = Math.max(0, boss.currentHp - damage);
        bossDefeated = newHp === 0;

        await tx.bossQuest.update({
          where: { id: boss.id },
          data: {
            currentHp: newHp,
            isDefeated: bossDefeated,
            defeatedAt: bossDefeated ? new Date() : null,
          },
        });

        await tx.activityLog.create({
          data: {
            userId,
            type: bossDefeated ? "BOSS_DEFEATED" : "BOSS_DAMAGED",
            title: bossDefeated ? `Vanquished Boss: ${boss.bossName}!` : `Struck Boss: ${boss.bossName}`,
            description: bossDefeated
              ? `Defeated the boss! Earned massive victory rewards!`
              : `Dealt ${damage} damage to ${boss.bossName}. Remaining HP: ${newHp}/${boss.totalHp}`,
          },
        });

        if (bossDefeated) {
          // Award Boss bonus
          await tx.character.update({
            where: { userId },
            data: {
              totalXp: { increment: boss.xpReward },
              gold: { increment: boss.goldReward },
            },
          });

          await tx.notification.create({
            data: {
              userId,
              title: `BOSS VANQUISHED: ${boss.bossName}!`,
              message: `You slayed the boss and received +${boss.xpReward} XP & +${boss.goldReward} Gold!`,
              type: "ACHIEVEMENT",
            },
          });
        }
      }
    }

    // 10. Check and Unlock Achievements
    const unlockedAchievements: any[] = [];
    const userCompletedCount = await tx.questCompletion.count({ where: { userId } });
    const userDefeatedBossCount = await tx.bossQuest.count({ where: { userId, isDefeated: true } });

    // Fetch achievements user doesn't have yet
    const existingUserAchIds = (
      await tx.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      })
    ).map((a) => a.achievementId);

    const pendingAchievements = await tx.achievement.findMany({
      where: { id: { notIn: existingUserAchIds } },
    });

    for (const ach of pendingAchievements) {
      let isEligible = false;

      switch (ach.requirementType) {
        case "QUEST_COUNT":
          if (userCompletedCount >= ach.requirementValue) isEligible = true;
          break;
        case "STREAK_DAYS":
          if (currentStreak >= ach.requirementValue) isEligible = true;
          break;
        case "LEVEL_REACHED":
          if (newLevelProgress.level >= ach.requirementValue) isEligible = true;
          break;
        case "BOSS_DEFEATED":
          if (userDefeatedBossCount >= ach.requirementValue) isEligible = true;
          break;
        case "GOLD_EARNED":
          if (updatedCharacter.gold >= ach.requirementValue) isEligible = true;
          break;
      }

      if (isEligible) {
        const unlocked = await tx.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
          },
          include: { achievement: true },
        });

        // Award achievement rewards
        await tx.character.update({
          where: { userId },
          data: {
            totalXp: { increment: ach.xpReward },
            gold: { increment: ach.goldReward },
          },
        });

        await tx.activityLog.create({
          data: {
            userId,
            type: "ACHIEVEMENT_UNLOCKED",
            title: `Achievement Unlocked: ${ach.name}!`,
            description: ach.description,
            xpDelta: ach.xpReward,
            goldDelta: ach.goldReward,
          },
        });

        await tx.notification.create({
          data: {
            userId,
            title: `ACHIEVEMENT: ${ach.name}`,
            message: `Unlocked '${ach.name}' (+${ach.xpReward} XP, +${ach.goldReward} Gold)!`,
            type: "ACHIEVEMENT",
          },
        });

        unlockedAchievements.push(unlocked.achievement);
      }
    }

    return {
      quest: updatedQuest,
      character: updatedCharacter,
      xpDelta: rewards.xpReward,
      goldDelta: totalGoldToAdd,
      attributeDelta: rewards.attributeReward,
      attributeType: targetAttribute,
      previousLevel,
      newLevel: newLevelProgress.level,
      didLevelUp,
      unlockedAchievements,
      streakUpdated,
      currentStreak,
      bossDamaged,
      bossDefeated,
    };
  });
}

import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/db";
import { completeQuestTransaction, calculateLevel, getLevelProgress } from "@/lib/rpg/engine";
import bcrypt from "bcryptjs";

describe("Hackathon Gamification Math & Level-Up Audit", () => {
  let testUserId: string;
  let testQuestId: string;

  beforeAll(async () => {
    // 1. Create dedicated test user
    const passwordHash = await bcrypt.hash("auditpass123", 4);
    const user = await prisma.user.create({
      data: {
        email: `audit_math_${Date.now()}@liferpg.test`,
        passwordHash,
        profile: {
          create: {
            username: `audit_math_${Date.now()}`,
            displayName: "Math Auditor",
          },
        },
        character: {
          create: {
            level: 1,
            currentXp: 95,
            totalXp: 95,
            gold: 100,
            rank: "Novice",
            attributes: {
              create: {
                strength: 10,
                intelligence: 10,
                wisdom: 10,
                discipline: 10,
                vitality: 10,
                focus: 10,
                creativity: 10,
                consistency: 10,
              },
            },
          },
        },
        streak: {
          create: {
            currentStreak: 1,
            longestStreak: 1,
            lastActiveDate: "2026-01-01",
          },
        },
      },
    });
    testUserId = user.id;

    // Pre-unlock FIRST_BLOOD achievement so it does not add unrequested bonus XP to our 95+20 audit
    const firstBlood = await prisma.achievement.findUnique({
      where: { code: "FIRST_BLOOD" },
    });
    if (firstBlood) {
      await prisma.userAchievement.create({
        data: {
          userId: testUserId,
          achievementId: firstBlood.id,
        },
      });
    }

    // Create a 20 XP custom quest
    const quest = await prisma.quest.create({
      data: {
        userId: testUserId,
        title: "Audit Precision Task",
        difficulty: "EASY",
        xpReward: 20,
        goldReward: 10,
        attributeReward: 2,
        attributeType: "wisdom",
        recurrence: "DAILY",
        status: "TODO",
      },
    });
    testQuestId = quest.id;
  });

  it("calculates level curve and progress bar math accurately for 115 total XP", () => {
    const level = calculateLevel(115);
    expect(level).toBe(2);

    const progress = getLevelProgress(115);
    expect(progress.level).toBe(2);
    expect(progress.currentXp).toBe(15);         // 115 - 100
    expect(progress.xpForNextLevel).toBe(282);    // Math.floor(100 * 2^1.5) = 282
    expect(progress.progressPercent).toBe(5);     // Math.round((15 / 282) * 100) = 5%
    expect(progress.rank).toBe("Novice");
  });

  it("transitions Level 1 (95 XP) + 25 XP (EASY quest) -> Level 2 (120 XP) with 100 bonus gold and atomic database logs", async () => {
    const initialChar = await prisma.character.findUnique({
      where: { userId: testUserId },
    });
    expect(initialChar?.totalXp).toBe(95);
    expect(initialChar?.level).toBe(1);
    expect(initialChar?.gold).toBe(100);

    // Complete the EASY quest (Server-enforced: +25 XP, +15 Gold, +2 Attribute)
    const result = await completeQuestTransaction(testUserId, testQuestId);

    // Verify engine return payload
    expect(result.didLevelUp).toBe(true);
    expect(result.previousLevel).toBe(1);
    expect(result.newLevel).toBe(2);
    expect(result.xpDelta).toBe(25);
    // goldDelta includes 15 gold from EASY quest + 100 bonus gold for leveling up
    expect(result.goldDelta).toBe(115);
    expect(result.attributeDelta).toBe(2);
    expect(result.attributeType).toBe("wisdom");

    // Verify atomic Character record updates in DB
    const updatedChar = await prisma.character.findUnique({
      where: { userId: testUserId },
      include: { attributes: true },
    });
    expect(updatedChar?.totalXp).toBe(120);
    expect(updatedChar?.level).toBe(2);
    // Gold: initial (100) + quest (15) + level-up bonus (100) = 215
    expect(updatedChar?.gold).toBe(215);
    // Wisdom attribute increased by 2
    expect(updatedChar?.attributes?.wisdom).toBe(12);

    // Verify XPTransaction log
    const xpTx = await prisma.xPTransaction.findFirst({
      where: {
        userId: testUserId,
        referenceId: testQuestId,
        source: "QUEST_COMPLETION",
      },
    });
    expect(xpTx).toBeDefined();
    expect(xpTx?.amount).toBe(25);

    // Verify ActivityLog entries
    const questLog = await prisma.activityLog.findFirst({
      where: {
        userId: testUserId,
        type: "QUEST_COMPLETED",
      },
    });
    expect(questLog).toBeDefined();
    expect(questLog?.xpDelta).toBe(25);
    expect(questLog?.goldDelta).toBe(15);

    const levelUpLog = await prisma.activityLog.findFirst({
      where: {
        userId: testUserId,
        type: "LEVEL_UP",
      },
    });
    expect(levelUpLog).toBeDefined();
    expect(levelUpLog?.description).toContain("Novice");

    // Verify QuestCompletion idempotency entry
    const completion = await prisma.questCompletion.findFirst({
      where: { questId: testQuestId },
    });
    expect(completion).toBeDefined();
    expect(completion?.xpAwarded).toBe(25);
    expect(completion?.goldAwarded).toBe(15);
  });
});

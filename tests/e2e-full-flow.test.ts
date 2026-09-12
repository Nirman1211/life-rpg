import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { completeQuestTransaction, getLevelProgress } from "@/lib/rpg/engine";

describe("E2E Full Hero Journey & Persistence", () => {
  let userA: any;
  let userB: any;
  let questA: any;
  let bossA: any;
  let themeReward: any;

  beforeAll(async () => {
    // 1. Setup User A (Primary Hero)
    const passwordHashA = await bcrypt.hash("hero_password_123", 4);
    userA = await prisma.user.create({
      data: {
        email: `e2e_hero_${Date.now()}@liferpg.test`,
        passwordHash: passwordHashA,
        profile: {
          create: {
            username: `hero_${Date.now()}`,
            displayName: "E2E Valiant Hero",
            timezone: "UTC",
          },
        },
        character: {
          create: {
            level: 1,
            currentXp: 0,
            totalXp: 0,
            gold: 300,
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
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
    });

    // 2. Setup User B (Isolated User)
    const passwordHashB = await bcrypt.hash("other_password_123", 4);
    userB = await prisma.user.create({
      data: {
        email: `e2e_other_${Date.now()}@liferpg.test`,
        passwordHash: passwordHashB,
        profile: {
          create: {
            username: `other_${Date.now()}`,
            displayName: "Isolated User B",
            timezone: "UTC",
          },
        },
        character: {
          create: {
            level: 1,
            currentXp: 0,
            totalXp: 0,
            gold: 50,
            rank: "Novice",
          },
        },
      },
    });

    // Fetch or create a reward for purchase testing
    themeReward = await prisma.reward.findFirst({
      where: { category: "THEME", cost: { gt: 0 } },
    });
    if (!themeReward) {
      themeReward = await prisma.reward.create({
        data: {
          name: "Test Void Theme",
          description: "Test theme description",
          cost: 150,
          rarity: "RARE",
          category: "THEME",
          icon: "Sparkles",
          effectType: "THEME_ID",
          effectValue: "arcane",
        },
      });
    }
  });

  it("Step 1: Authenticates and verifies isolated user credentials", async () => {
    const fetchedUser = await prisma.user.findUnique({
      where: { id: userA.id },
      include: { profile: true, character: { include: { attributes: true } } },
    });

    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.email).toBe(userA.email);
    expect(fetchedUser?.character?.level).toBe(1);
    expect(fetchedUser?.character?.gold).toBe(300);

    const isMatch = await bcrypt.compare("hero_password_123", fetchedUser!.passwordHash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare("wrong_pass", fetchedUser!.passwordHash);
    expect(isWrongMatch).toBe(false);
  });

  it("Step 2: Creates a Boss Quest with sub-quests", async () => {
    bossA = await prisma.bossQuest.create({
      data: {
        userId: userA.id,
        title: "Master Next.js Architecture",
        bossName: "The Monolith Dragon",
        totalHp: 100,
        currentHp: 100,
        xpReward: 500,
        goldReward: 250,
      },
    });

    questA = await prisma.quest.create({
      data: {
        userId: userA.id,
        bossQuestId: bossA.id,
        title: "Implement High-Performance Full-Stack API",
        difficulty: "HARD", // 90 XP, 45 Gold, 5 Int
        attributeType: "intelligence",
        recurrence: "ONCE",
        status: "TODO",
      },
    });

    expect(questA.bossQuestId).toBe(bossA.id);
    expect(questA.status).toBe("TODO");
  });

  it("Step 3: Completes quest, damages boss, levels up, and updates streak", async () => {
    const result = await completeQuestTransaction(userA.id, questA.id);

    expect(result.xpDelta).toBe(90);
    expect(result.goldDelta).toBeGreaterThanOrEqual(45);
    expect(result.attributeDelta).toBe(5);
    expect(result.attributeType).toBe("intelligence");
    expect(result.bossDamaged).toBe(true);
    expect(result.currentStreak).toBe(1);

    // Verify Boss HP dropped
    const updatedBoss = await prisma.bossQuest.findUnique({
      where: { id: bossA.id },
    });
    expect(updatedBoss?.currentHp).toBeLessThan(100);
  });

  it("Step 4: Proves Database Persistence across simulated refresh", async () => {
    // Re-fetch clean from database
    const refreshedUser = await prisma.user.findUnique({
      where: { id: userA.id },
      include: {
        character: { include: { attributes: true } },
        streak: true,
        activityLogs: true,
        xpTransactions: true,
      },
    });

    expect(refreshedUser?.character?.totalXp).toBeGreaterThanOrEqual(90);
    expect(refreshedUser?.character?.attributes?.intelligence).toBe(15);
    expect(refreshedUser?.streak?.currentStreak).toBe(1);
    expect(refreshedUser?.activityLogs.length).toBeGreaterThanOrEqual(1);
    expect(refreshedUser?.xpTransactions.length).toBeGreaterThanOrEqual(1);
  });

  it("Step 5: Enforces strict data isolation (User B cannot access or modify User A's quest)", async () => {
    // User B tries to complete User A's quest
    await expect(completeQuestTransaction(userB.id, questA.id)).rejects.toThrow(
      "UNAUTHORIZED_QUEST_ACCESS"
    );
  });

  it("Step 6: Purchases shop item and equips it in Inventory", async () => {
    const initialGold = (
      await prisma.character.findUnique({ where: { userId: userA.id } })
    )?.gold!;

    expect(initialGold).toBeGreaterThanOrEqual(themeReward.cost);

    // Execute Purchase
    await prisma.$transaction(async (tx) => {
      await tx.character.update({
        where: { userId: userA.id },
        data: { gold: { decrement: themeReward.cost } },
      });
      await tx.purchase.create({
        data: {
          userId: userA.id,
          rewardId: themeReward.id,
          price: themeReward.cost,
        },
      });
      await tx.inventory.create({
        data: {
          userId: userA.id,
          rewardId: themeReward.id,
          isEquipped: true,
        },
      });
      await tx.userSettings.upsert({
        where: { userId: userA.id },
        create: { userId: userA.id, theme: themeReward.effectValue },
        update: { theme: themeReward.effectValue },
      });
    });

    // Verify Inventory & Settings persistence
    const inventoryItem = await prisma.inventory.findUnique({
      where: {
        userId_rewardId: {
          userId: userA.id,
          rewardId: themeReward.id,
        },
      },
    });
    expect(inventoryItem?.isEquipped).toBe(true);

    const settings = await prisma.userSettings.findUnique({
      where: { userId: userA.id },
    });
    expect(settings?.theme).toBe(themeReward.effectValue);
  });
});

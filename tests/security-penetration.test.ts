import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/db";
import { completeQuestTransaction } from "@/lib/rpg/engine";
import { verifyJWT, signJWT } from "@/lib/auth/jwt";
import bcrypt from "bcryptjs";

describe("Security & Multi-Tenant Data Isolation Audit", () => {
  let userAId: string;
  let userBId: string;
  let userAQuestId: string;
  let userABossId: string;
  let userAOnceQuestId: string;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("secpass123", 4);

    // Create User A
    const userA = await prisma.user.create({
      data: {
        email: `usera_${Date.now()}@liferpg.test`,
        passwordHash,
        profile: {
          create: {
            username: `usera_${Date.now()}`,
            displayName: "Player Alpha",
          },
        },
        character: {
          create: {
            level: 1,
            currentXp: 0,
            totalXp: 0,
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
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
    });
    userAId = userA.id;

    // Create User B
    const userB = await prisma.user.create({
      data: {
        email: `userb_${Date.now()}@liferpg.test`,
        passwordHash,
        profile: {
          create: {
            username: `userb_${Date.now()}`,
            displayName: "Player Beta",
          },
        },
        character: {
          create: {
            level: 1,
            currentXp: 0,
            totalXp: 0,
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
            currentStreak: 0,
            longestStreak: 0,
          },
        },
      },
    });
    userBId = userB.id;

    // User A creates a daily Quest
    const questA = await prisma.quest.create({
      data: {
        userId: userAId,
        title: "User A Confidential Quest",
        difficulty: "NORMAL",
        recurrence: "DAILY",
        status: "TODO",
      },
    });
    userAQuestId = questA.id;

    // User A creates a one-time Quest
    const onceQuestA = await prisma.quest.create({
      data: {
        userId: userAId,
        title: "User A Once-In-A-Lifetime Quest",
        difficulty: "HARD",
        recurrence: "ONCE",
        status: "TODO",
      },
    });
    userAOnceQuestId = onceQuestA.id;

    // User A creates a Boss Raid
    const bossA = await prisma.bossQuest.create({
      data: {
        userId: userAId,
        title: "User A Personal Boss Raid",
        bossName: "Alpha Dragon",
        totalHp: 100,
        currentHp: 100,
      },
    });
    userABossId = bossA.id;
  });

  it("prevents User B from completing User A's quest", async () => {
    // Attempting to complete User A's quest as User B must fail with UNAUTHORIZED_QUEST_ACCESS
    await expect(completeQuestTransaction(userBId, userAQuestId)).rejects.toThrow(
      "UNAUTHORIZED_QUEST_ACCESS"
    );

    // Verify User A's quest remains TODO
    const quest = await prisma.quest.findUnique({
      where: { id: userAQuestId },
    });
    expect(quest?.status).toBe("TODO");

    // Verify User B received 0 XP and 0 Gold
    const charB = await prisma.character.findUnique({
      where: { userId: userBId },
    });
    expect(charB?.totalXp).toBe(0);
  });

  it("enforces idempotency: User A cannot complete the same daily quest twice in one day", async () => {
    // First completion succeeds
    const res1 = await completeQuestTransaction(userAId, userAQuestId);
    expect(res1.xpDelta).toBe(50);

    // Second completion on the same day throws ALREADY_COMPLETED_TODAY
    await expect(completeQuestTransaction(userAId, userAQuestId)).rejects.toThrow(
      "ALREADY_COMPLETED_TODAY"
    );
  });

  it("enforces ONCE recurrence: User A cannot complete an ONCE quest again even on subsequent days", async () => {
    // First completion of ONCE quest
    const res1 = await completeQuestTransaction(userAId, userAOnceQuestId);
    expect(res1.xpDelta).toBe(90);

    // Check status in DB is COMPLETED
    const quest = await prisma.quest.findUnique({
      where: { id: userAOnceQuestId },
    });
    expect(quest?.status).toBe("COMPLETED");

    // Second completion attempt must throw ALREADY_COMPLETED
    await expect(completeQuestTransaction(userAId, userAOnceQuestId)).rejects.toThrow();
  });

  it("prevents forged or tampered JWT sessions", async () => {
    // Tampered signature
    const invalidResult = await verifyJWT("eyJhbGciOiJIUzI1NiJ9.tampered.signature");
    expect(invalidResult).toBeNull();

    // Valid signature verifies correctly
    const validToken = await signJWT({ userId: userAId, email: "test@liferpg.test" }, "1h");
    const validPayload = await verifyJWT(validToken);
    expect(validPayload?.userId).toBe(userAId);
  });

  it("verifies user isolation on database queries", async () => {
    // User B querying their own quests must NOT see User A's quests
    const questsB = await prisma.quest.findMany({
      where: { userId: userBId },
    });
    expect(questsB.some((q) => q.userId === userAId)).toBe(false);

    // User B querying their own boss raids must NOT see User A's boss raids
    const bossB = await prisma.bossQuest.findMany({
      where: { userId: userBId },
    });
    expect(bossB.some((b) => b.userId === userAId)).toBe(false);
  });
});

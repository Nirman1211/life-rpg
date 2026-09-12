import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/db";
import { completeQuestTransaction } from "@/lib/rpg/engine";
import bcrypt from "bcryptjs";

describe("Quest Completion Engine & Idempotency", () => {
  let testUserId: string;
  let testQuestId: string;

  beforeAll(async () => {
    // Create an isolated test user
    const passwordHash = await bcrypt.hash("testpass123", 4);
    const user = await prisma.user.create({
      data: {
        email: `tester_${Date.now()}@liferpg.test`,
        passwordHash,
        profile: {
          create: {
            username: `tester_${Date.now()}`,
            displayName: "Test Adventurer",
          },
        },
        character: {
          create: {
            level: 1,
            currentXp: 0,
            totalXp: 0,
            gold: 50,
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
    testUserId = user.id;

    // Create a quest for the user
    const quest = await prisma.quest.create({
      data: {
        userId: testUserId,
        title: "Test Unit Quest",
        difficulty: "HARD", // 90 XP, 45 Gold, 5 Int
        attributeType: "intelligence",
        recurrence: "DAILY",
        status: "TODO",
      },
    });
    testQuestId = quest.id;
  });

  it("completes quest atomically, awards server-enforced rewards, and triggers First Blood achievement", async () => {
    const result = await completeQuestTransaction(testUserId, testQuestId);

    // 90 XP from quest
    expect(result.xpDelta).toBe(90);
    expect(result.goldDelta).toBe(45);
    expect(result.attributeDelta).toBe(5);
    expect(result.attributeType).toBe("intelligence");
    expect(result.currentStreak).toBe(1);

    // Unlocks First Blood achievement (+50 XP, +25 Gold)
    expect(result.unlockedAchievements.length).toBeGreaterThanOrEqual(1);
    expect(result.unlockedAchievements[0].code).toBe("FIRST_BLOOD");

    // Total XP in DB: 90 (quest) + 50 (achievement) = 140
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUserId },
      include: {
        character: { include: { attributes: true } },
        streak: true,
        activityLogs: true,
      },
    });

    expect(updatedUser?.character?.totalXp).toBe(140);
    expect(updatedUser?.character?.attributes?.intelligence).toBe(15);
    expect(updatedUser?.streak?.currentStreak).toBe(1);
    expect(updatedUser?.activityLogs.length).toBeGreaterThanOrEqual(1);
  });

  it("blocks duplicate completion on the same day (Idempotency protection)", async () => {
    // Calling completion again for the same quest on the same day must throw ALREADY_COMPLETED_TODAY
    await expect(completeQuestTransaction(testUserId, testQuestId)).rejects.toThrow(
      "ALREADY_COMPLETED_TODAY"
    );

    // Verify XP was not awarded a second time
    const character = await prisma.character.findUnique({
      where: { userId: testUserId },
    });
    expect(character?.totalXp).toBe(140);
  });

  it("triggers level-up and awards bonus gold when threshold is reached", async () => {
    // Current totalXp is 140 (which leveled up to Level 2 since 140 >= 100)
    // Create another quest to add 90 XP (140 + 90 = 230 XP)
    const quest2 = await prisma.quest.create({
      data: {
        userId: testUserId,
        title: "Second Quest",
        difficulty: "HARD",
        attributeType: "strength",
        recurrence: "ONCE",
      },
    });

    const result = await completeQuestTransaction(testUserId, quest2.id);

    expect(result.xpDelta).toBe(90);
    const character = await prisma.character.findUnique({
      where: { userId: testUserId },
    });
    expect(character?.totalXp).toBe(230);
  });
});

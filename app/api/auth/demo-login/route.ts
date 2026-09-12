import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { setSessionCookie } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return apiError(
        "DATABASE_URL environment variable is missing on Vercel. Please add it in Vercel Dashboard -> Project Settings -> Environment Variables and click Redeploy.",
        "MISSING_DATABASE_URL",
        500
      );
    }

    let demoUser = await prisma.user.findUnique({
      where: { email: "demo@liferpg.app" },
      include: {
        profile: true,
        character: {
          include: { attributes: true },
        },
        streak: true,
        settings: true,
      },
    });

    // Auto-provision demo hero on the fly if not in database
    if (!demoUser) {
      console.log("Demo user not found. Auto-provisioning demo hero on the fly...");
      const passwordHash = await bcrypt.hash("password123", 10);

      demoUser = await prisma.user.create({
        data: {
          email: "demo@liferpg.app",
          passwordHash,
          profile: {
            create: {
              username: "CyberKnight",
              displayName: "Alexander Vance",
              avatarUrl: "/avatars/warrior.png",
              bio: "Senior code artisan and reality conqueror. Turning daily discipline into legendary stats.",
              timezone: "UTC",
            },
          },
          character: {
            create: {
              level: 4,
              currentXp: 180,
              totalXp: 780,
              gold: 380,
              health: 100,
              maxHealth: 100,
              rank: "Adventurer",
              attributes: {
                create: {
                  strength: 24,
                  intelligence: 38,
                  wisdom: 22,
                  discipline: 30,
                  vitality: 20,
                  focus: 26,
                  creativity: 18,
                  consistency: 28,
                },
              },
            },
          },
          streak: {
            create: {
              currentStreak: 6,
              longestStreak: 12,
              lastActiveDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
            },
          },
          settings: {
            create: {
              theme: "cyberpunk",
              soundEnabled: true,
              publicProfile: true,
              showOnLeaderboard: true,
            },
          },
        },
        include: {
          profile: true,
          character: {
            include: { attributes: true },
          },
          streak: true,
          settings: true,
        },
      });

      // Also create starting demo quests and active boss raid
      try {
        await prisma.quest.createMany({
          data: [
            {
              userId: demoUser.id,
              title: "Implement Distributed Cache with Redis",
              description: "Design LRU cache layer and write benchmark tests.",
              difficulty: "HARD",
              status: "TODO",
              recurrence: "DAILY",
              xpReward: 90,
              goldReward: 45,
              attributeReward: 5,
              attributeType: "intelligence",
            },
            {
              userId: demoUser.id,
              title: "5km Morning Trail Run",
              description: "Pace under 5:15/km, hydration check.",
              difficulty: "NORMAL",
              status: "TODO",
              recurrence: "DAILY",
              xpReward: 50,
              goldReward: 25,
              attributeReward: 3,
              attributeType: "strength",
            },
            {
              userId: demoUser.id,
              title: "Deep Reading: Clean Architecture Chapter 4-6",
              description: "Annotate core design patterns and boundaries.",
              difficulty: "EASY",
              status: "TODO",
              recurrence: "DAILY",
              xpReward: 25,
              goldReward: 15,
              attributeReward: 2,
              attributeType: "wisdom",
            },
          ],
        });

        await prisma.bossQuest.create({
          data: {
            userId: demoUser.id,
            title: "The Procrastination Behemoth",
            description: "A shadowy colossus feeding on delayed deadlines and abandoned drafts.",
            bossName: "Dread Titan Chronos",
            bossAvatar: "/avatars/boss-dragon.png",
            totalHp: 150,
            currentHp: 110,
            xpReward: 750,
            goldReward: 400,
            isDefeated: false,
          },
        });
      } catch (err) {
        console.warn("Could not seed sub-quests for demo user:", err);
      }
    }

    await setSessionCookie({
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
    });

    const { passwordHash: _, ...safeUser } = demoUser;
    return apiSuccess(safeUser);
  } catch (error) {
    console.error("Demo login error:", error);
    return handleApiError(error);
  }
}

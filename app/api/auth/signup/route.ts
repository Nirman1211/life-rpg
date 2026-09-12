import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { setSessionCookie } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const SignupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(30),
  timezone: z.string().optional().default("UTC"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = SignupSchema.parse(body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingEmail) {
      return apiError("Email is already registered", "EMAIL_EXISTS", 409);
    }

    const existingUsername = await prisma.profile.findUnique({
      where: { username: data.username.toLowerCase() },
    });
    if (existingUsername) {
      return apiError("Username is already taken", "USERNAME_TAKEN", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            username: data.username.toLowerCase(),
            displayName: data.displayName,
            avatarUrl: "/avatars/warrior.png",
            timezone: data.timezone,
          },
        },
        character: {
          create: {
            level: 1,
            currentXp: 0,
            totalXp: 0,
            gold: 100, // Starter gold
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
        settings: {
          create: {
            theme: "cyberpunk",
            soundEnabled: true,
            publicProfile: true,
            showOnLeaderboard: true,
            timezone: data.timezone,
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

    // Give default theme & title in inventory
    const defaultTheme = await prisma.reward.findFirst({ where: { effectValue: "cyberpunk" } });
    const defaultTitle = await prisma.reward.findFirst({ where: { effectValue: "Novice Wanderer" } });
    if (defaultTheme) {
      await prisma.inventory.create({
        data: { userId: newUser.id, rewardId: defaultTheme.id, isEquipped: true },
      });
    }
    if (defaultTitle) {
      await prisma.inventory.create({
        data: { userId: newUser.id, rewardId: defaultTitle.id, isEquipped: true },
      });
    }

    // Set auth cookie
    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return apiSuccess(safeUser, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

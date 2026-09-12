import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "xp"; // "xp", "streak", "level"

    // Fetch users who allow public leaderboard
    const users = await prisma.user.findMany({
      where: {
        settings: {
          showOnLeaderboard: true,
        },
      },
      include: {
        profile: true,
        character: true,
        streak: true,
      },
      take: 50,
    });

    // Map and sort
    const mapped = users.map((u) => ({
      userId: u.id,
      username: u.profile?.username || "Adventurer",
      displayName: u.profile?.displayName || "Anonymous Hero",
      avatarUrl: u.profile?.avatarUrl || "/avatars/warrior.png",
      level: u.character?.level || 1,
      totalXp: u.character?.totalXp || 0,
      gold: u.character?.gold || 0,
      rankTitle: u.character?.rank || "Novice",
      streak: u.streak?.currentStreak || 0,
      longestStreak: u.streak?.longestStreak || 0,
      isCurrentUser: currentUser ? currentUser.id === u.id : false,
    }));

    if (sortBy === "streak") {
      mapped.sort((a, b) => b.streak - a.streak || b.totalXp - a.totalXp);
    } else if (sortBy === "level") {
      mapped.sort((a, b) => b.level - a.level || b.totalXp - a.totalXp);
    } else {
      mapped.sort((a, b) => b.totalXp - a.totalXp);
    }

    // Add 1-indexed ranks
    const ranked = mapped.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return apiSuccess(ranked);
  } catch (error) {
    return handleApiError(error);
  }
}

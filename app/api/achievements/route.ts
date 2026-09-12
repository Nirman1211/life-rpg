import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireAuth();

    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ rarity: "asc" }, { xpReward: "asc" }],
    });

    const userUnlocked = await prisma.userAchievement.findMany({
      where: { userId: user.id },
    });

    const unlockedMap = new Map<string, Date>();
    for (const ua of userUnlocked) {
      unlockedMap.set(ua.achievementId, ua.unlockedAt);
    }

    const achievements = allAchievements.map((ach) => ({
      ...ach,
      unlocked: unlockedMap.has(ach.id),
      unlockedAt: unlockedMap.get(ach.id) || null,
    }));

    const unlockedCount = userUnlocked.length;
    const totalCount = allAchievements.length;
    const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return apiSuccess({
      achievements,
      stats: {
        unlockedCount,
        totalCount,
        completionRate,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

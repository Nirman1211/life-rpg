import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireAuth();

    const streak = await prisma.streak.findUnique({
      where: { userId: user.id },
    });

    // Fetch past 90 days daily activities
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        userId: user.id,
        date: { gte: cutoffStr },
      },
      orderBy: { date: "asc" },
    });

    const milestones = [
      { days: 3, label: "Sprout of Habit", reached: (streak?.longestStreak || 0) >= 3 },
      { days: 7, label: "Kindled Flame", reached: (streak?.longestStreak || 0) >= 7 },
      { days: 14, label: "Fortified Will", reached: (streak?.longestStreak || 0) >= 14 },
      { days: 30, label: "Iron Discipline", reached: (streak?.longestStreak || 0) >= 30 },
      { days: 60, label: "Diamond Focus", reached: (streak?.longestStreak || 0) >= 60 },
      { days: 100, label: "Century Ascendant", reached: (streak?.longestStreak || 0) >= 100 },
      { days: 365, label: "Immortal Consistency", reached: (streak?.longestStreak || 0) >= 365 },
    ];

    return apiSuccess({
      streak: streak || { currentStreak: 0, longestStreak: 0, lastActiveDate: null },
      heatmapData: dailyActivities,
      milestones,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

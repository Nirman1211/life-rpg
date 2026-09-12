import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d"; // 7d, 30d, 90d, 1y

    let days = 30;
    if (range === "7d") days = 7;
    else if (range === "90d") days = 90;
    else if (range === "1y") days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    // 1. Daily Activities for Line Chart
    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId: user.id,
        date: { gte: startDateStr },
      },
      orderBy: { date: "asc" },
    });

    // 2. Character & Attributes for Radar Chart
    const character = await prisma.character.findUnique({
      where: { userId: user.id },
      include: { attributes: true },
    });

    const attrData = [
      { attribute: "Strength", value: character?.attributes?.strength || 10 },
      { attribute: "Intelligence", value: character?.attributes?.intelligence || 10 },
      { attribute: "Wisdom", value: character?.attributes?.wisdom || 10 },
      { attribute: "Discipline", value: character?.attributes?.discipline || 10 },
      { attribute: "Vitality", value: character?.attributes?.vitality || 10 },
      { attribute: "Focus", value: character?.attributes?.focus || 10 },
      { attribute: "Creativity", value: character?.attributes?.creativity || 10 },
      { attribute: "Consistency", value: character?.attributes?.consistency || 10 },
    ];

    // 3. Category Distribution for Donut Chart
    const categoryCompletions = await prisma.quest.groupBy({
      by: ["categoryId"],
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      _count: { id: true },
    });

    const categories = await prisma.questCategory.findMany();
    const categoryMap = new Map(categories.map((c) => [c.id, { name: c.name, color: c.color }]));

    const categoryDistribution = categoryCompletions
      .filter((cc) => cc.categoryId && categoryMap.has(cc.categoryId))
      .map((cc) => {
        const cat = categoryMap.get(cc.categoryId!)!;
        return {
          name: cat.name,
          color: cat.color,
          count: cc._count.id,
        };
      });

    // 4. Overall KPIs
    const totalCompletions = await prisma.questCompletion.count({
      where: { userId: user.id },
    });

    const streak = await prisma.streak.findUnique({
      where: { userId: user.id },
    });

    return apiSuccess({
      kpis: {
        level: character?.level || 1,
        rank: character?.rank || "Novice",
        totalXp: character?.totalXp || 0,
        gold: character?.gold || 0,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        totalCompletions,
      },
      xpTimeline: activities.map((a) => ({
        date: a.date.slice(5), // MM-DD
        xp: a.xpEarned,
        quests: a.questCount,
      })),
      attributes: attrData,
      categoryDistribution,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

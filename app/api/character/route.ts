import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { getLevelProgress } from "@/lib/rpg/engine";
import { apiSuccess, handleApiError } from "@/lib/api/response";

const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(30).optional(),
  bio: z.string().max(250).optional(),
  avatarUrl: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const character = await prisma.character.findUnique({
      where: { userId: user.id },
      include: {
        attributes: true,
      },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const progress = getLevelProgress(character?.totalXp || 0);

    const recentLogs = await prisma.activityLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Count completed quests
    const completedCount = await prisma.questCompletion.count({
      where: { userId: user.id },
    });

    return apiSuccess({
      character: {
        ...character,
        progress,
      },
      profile,
      stats: {
        completedQuests: completedCount,
      },
      recentLogs,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = UpdateProfileSchema.parse(body);

    const updatedProfile = await prisma.profile.update({
      where: { userId: user.id },
      data,
    });

    return apiSuccess(updatedProfile);
  } catch (error) {
    return handleApiError(error);
  }
}

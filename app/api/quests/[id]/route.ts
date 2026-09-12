import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { getEnforcedRewards } from "@/lib/rpg/engine";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const UpdateQuestSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional().nullable(),
  difficulty: z.enum(["EASY", "NORMAL", "HARD", "EPIC", "LEGENDARY"]).optional(),
  recurrence: z.enum(["ONCE", "DAILY", "WEEKLY"]).optional(),
  attributeType: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  estimatedMins: z.number().int().min(5).max(480).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const quest = await prisma.quest.findUnique({
      where: { id },
      include: { category: true, bossQuest: true },
    });

    if (!quest) {
      return apiError("Quest not found", "NOT_FOUND", 404);
    }

    if (quest.userId !== user.id) {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    return apiSuccess(quest);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = UpdateQuestSchema.parse(body);

    const existingQuest = await prisma.quest.findUnique({
      where: { id },
    });

    if (!existingQuest) {
      return apiError("Quest not found", "NOT_FOUND", 404);
    }

    if (existingQuest.userId !== user.id) {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    const updateData: any = { ...data };
    if (data.difficulty) {
      const rewards = getEnforcedRewards(data.difficulty);
      updateData.xpReward = rewards.xpReward;
      updateData.goldReward = rewards.goldReward;
      updateData.attributeReward = rewards.attributeReward;
    }
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }

    const updated = await prisma.quest.update({
      where: { id },
      data: updateData,
      include: { category: true, bossQuest: true },
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const quest = await prisma.quest.findUnique({
      where: { id },
    });

    if (!quest) {
      return apiError("Quest not found", "NOT_FOUND", 404);
    }

    if (quest.userId !== user.id) {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    await prisma.quest.delete({
      where: { id },
    });

    return apiSuccess({ id, message: "Quest deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

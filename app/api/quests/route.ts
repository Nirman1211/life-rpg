import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { getEnforcedRewards } from "@/lib/rpg/engine";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const CreateQuestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional().default(""),
  categoryId: z.string().optional().nullable(),
  bossQuestId: z.string().optional().nullable(),
  difficulty: z.enum(["EASY", "NORMAL", "HARD", "EPIC", "LEGENDARY"]).default("NORMAL"),
  recurrence: z.enum(["ONCE", "DAILY", "WEEKLY"]).default("DAILY"),
  attributeType: z.string().optional().default("intelligence"),
  dueDate: z.string().optional().nullable(),
  estimatedMins: z.number().int().min(5).max(480).optional().default(30),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const recurrence = searchParams.get("recurrence");
    const categoryId = searchParams.get("categoryId");

    const where: any = { userId: user.id };

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (recurrence && recurrence !== "ALL") {
      where.recurrence = recurrence;
    }
    if (categoryId && categoryId !== "ALL") {
      where.categoryId = categoryId;
    }

    const quests = await prisma.quest.findMany({
      where,
      include: {
        category: true,
        bossQuest: {
          select: {
            id: true,
            title: true,
            bossName: true,
            currentHp: true,
            totalHp: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    return apiSuccess(quests);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = CreateQuestSchema.parse(body);

    // Calculate server-enforced reward points
    const rewards = getEnforcedRewards(data.difficulty);

    // If category is provided, use defaultAttribute if none specified
    let targetAttribute = data.attributeType;
    if (data.categoryId) {
      const category = await prisma.questCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (category && !data.attributeType) {
        targetAttribute = category.defaultAttribute;
      }
    }

    const quest = await prisma.quest.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        bossQuestId: data.bossQuestId,
        difficulty: data.difficulty,
        recurrence: data.recurrence,
        attributeType: targetAttribute || "intelligence",
        xpReward: rewards.xpReward,
        goldReward: rewards.goldReward,
        attributeReward: rewards.attributeReward,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedMins: data.estimatedMins,
        status: "TODO",
      },
      include: {
        category: true,
        bossQuest: true,
      },
    });

    return apiSuccess(quest, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

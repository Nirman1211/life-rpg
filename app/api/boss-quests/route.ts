import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { getEnforcedRewards } from "@/lib/rpg/engine";
import { apiSuccess, handleApiError } from "@/lib/api/response";

const CreateBossQuestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional().default(""),
  bossName: z.string().min(2).max(50).default("Procrastination Behemoth"),
  bossAvatar: z.string().default("/avatars/boss-dragon.png"),
  totalHp: z.number().int().min(50).max(1000).default(100),
  xpReward: z.number().int().min(200).max(5000).default(500),
  goldReward: z.number().int().min(100).max(2500).default(250),
  subQuests: z
    .array(
      z.object({
        title: z.string().min(2),
        difficulty: z.enum(["EASY", "NORMAL", "HARD", "EPIC", "LEGENDARY"]).default("NORMAL"),
        attributeType: z.string().default("intelligence"),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const bossQuests = await prisma.bossQuest.findMany({
      where: { userId: user.id },
      include: {
        subQuests: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(bossQuests);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = CreateBossQuestSchema.parse(body);

    const boss = await prisma.bossQuest.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description,
        bossName: data.bossName,
        bossAvatar: data.bossAvatar,
        totalHp: data.totalHp,
        currentHp: data.totalHp,
        xpReward: data.xpReward,
        goldReward: data.goldReward,
        isDefeated: false,
      },
    });

    if (data.subQuests && data.subQuests.length > 0) {
      for (const sq of data.subQuests) {
        const rewards = getEnforcedRewards(sq.difficulty);
        await prisma.quest.create({
          data: {
            userId: user.id,
            bossQuestId: boss.id,
            title: sq.title,
            difficulty: sq.difficulty,
            attributeType: sq.attributeType,
            xpReward: rewards.xpReward,
            goldReward: rewards.goldReward,
            attributeReward: rewards.attributeReward,
            status: "TODO",
            recurrence: "ONCE",
          },
        });
      }
    }

    const completeBoss = await prisma.bossQuest.findUnique({
      where: { id: boss.id },
      include: { subQuests: true },
    });

    return apiSuccess(completeBoss, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

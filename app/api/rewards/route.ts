import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireAuth();

    const rewards = await prisma.reward.findMany({
      orderBy: [{ category: "asc" }, { cost: "asc" }],
    });

    const userInventory = await prisma.inventory.findMany({
      where: { userId: user.id },
    });

    const ownedRewardIds = new Set(userInventory.map((i) => i.rewardId));
    const equippedRewardIds = new Set(userInventory.filter((i) => i.isEquipped).map((i) => i.rewardId));

    const character = await prisma.character.findUnique({
      where: { userId: user.id },
      select: { gold: true },
    });

    const catalog = rewards.map((r) => ({
      ...r,
      isOwned: ownedRewardIds.has(r.id),
      isEquipped: equippedRewardIds.has(r.id),
      canAfford: (character?.gold || 0) >= r.cost,
    }));

    return apiSuccess({
      rewards: catalog,
      userGold: character?.gold || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

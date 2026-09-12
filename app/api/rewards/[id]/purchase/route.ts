import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: rewardId } = await params;

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return apiError("Reward not found", "NOT_FOUND", 404);
    }

    const existingItem = await prisma.inventory.findUnique({
      where: {
        userId_rewardId: {
          userId: user.id,
          rewardId,
        },
      },
    });

    // Boosters can be bought multiple times, permanent items only once
    if (existingItem && reward.category !== "BOOSTER") {
      return apiError("Item is already owned", "ALREADY_OWNED", 400);
    }

    const character = await prisma.character.findUnique({
      where: { userId: user.id },
      select: { gold: true },
    });

    if (!character || character.gold < reward.cost) {
      return apiError("Insufficient gold balance", "INSUFFICIENT_FUNDS", 400);
    }

    // Execute atomic purchase transaction
    const purchaseResult = await prisma.$transaction(async (tx) => {
      // Deduct gold
      const updatedCharacter = await tx.character.update({
        where: { userId: user.id },
        data: {
          gold: { decrement: reward.cost },
        },
      });

      // Record purchase
      const purchase = await tx.purchase.create({
        data: {
          userId: user.id,
          rewardId,
          price: reward.cost,
        },
      });

      // Upsert inventory
      const inventoryItem = await tx.inventory.upsert({
        where: {
          userId_rewardId: {
            userId: user.id,
            rewardId,
          },
        },
        create: {
          userId: user.id,
          rewardId,
          quantity: 1,
          isEquipped: false,
        },
        update: {
          quantity: { increment: 1 },
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          type: "REWARD_BOUGHT",
          title: `Purchased: ${reward.name}`,
          description: `Spent ${reward.cost} Gold in the Reward Emporium.`,
          goldDelta: -reward.cost,
        },
      });

      // Handle instant boosters
      if (reward.category === "BOOSTER" && reward.effectType === "BOOST") {
        const [boostType, boostVal] = (reward.effectValue || "").split(":");
        const numVal = parseInt(boostVal?.replace("+", "") || "0", 10);
        if (boostType === "xp") {
          await tx.character.update({
            where: { userId: user.id },
            data: { totalXp: { increment: numVal } },
          });
        } else if (boostType === "focus" && user.character?.attributes?.id) {
          await tx.attributes.update({
            where: { characterId: user.character.id },
            data: { focus: { increment: numVal } },
          });
        }
      }

      return {
        reward,
        inventoryItem,
        remainingGold: updatedCharacter.gold,
      };
    });

    return apiSuccess(purchaseResult);
  } catch (error) {
    return handleApiError(error);
  }
}

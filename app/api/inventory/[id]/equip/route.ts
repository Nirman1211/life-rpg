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
    const { id: inventoryId } = await params;

    const item = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: { reward: true },
    });

    if (!item) {
      return apiError("Inventory item not found", "NOT_FOUND", 404);
    }

    if (item.userId !== user.id) {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    const nextEquippedState = !item.isEquipped;

    await prisma.$transaction(async (tx) => {
      if (nextEquippedState) {
        // Unequip other items in the same category
        const sameCategoryItems = await tx.inventory.findMany({
          where: {
            userId: user.id,
            reward: { category: item.reward.category },
            id: { not: item.id },
          },
        });

        for (const sci of sameCategoryItems) {
          await tx.inventory.update({
            where: { id: sci.id },
            data: { isEquipped: false },
          });
        }
      }

      // Update current item state
      await tx.inventory.update({
        where: { id: item.id },
        data: { isEquipped: nextEquippedState },
      });

      // If theme, persist in UserSettings
      if (item.reward.category === "THEME") {
        const themeId = nextEquippedState ? item.reward.effectValue || "cyberpunk" : "cyberpunk";
        await tx.userSettings.upsert({
          where: { userId: user.id },
          create: { userId: user.id, theme: themeId },
          update: { theme: themeId },
        });
      }
    });

    return apiSuccess({
      id: item.id,
      isEquipped: nextEquippedState,
      category: item.reward.category,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

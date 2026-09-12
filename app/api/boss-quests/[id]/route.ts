import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const bossQuest = await prisma.bossQuest.findUnique({
      where: { id },
      include: {
        subQuests: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!bossQuest) {
      return apiError("Boss quest not found", "NOT_FOUND", 404);
    }

    if (bossQuest.userId !== user.id) {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    return apiSuccess(bossQuest);
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

    const bossQuest = await prisma.bossQuest.findUnique({
      where: { id },
    });

    if (!bossQuest) {
      return apiError("Boss quest not found", "NOT_FOUND", 404);
    }

    if (bossQuest.userId !== user.id) {
      return apiError("Forbidden", "FORBIDDEN", 403);
    }

    await prisma.bossQuest.delete({
      where: { id },
    });

    return apiSuccess({ id, message: "Boss quest deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

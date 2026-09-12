import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireAuth();

    const inventory = await prisma.inventory.findMany({
      where: { userId: user.id },
      include: { reward: true },
      orderBy: [{ isEquipped: "desc" }, { acquiredAt: "desc" }],
    });

    return apiSuccess(inventory);
  } catch (error) {
    return handleApiError(error);
  }
}

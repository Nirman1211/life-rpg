import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const user = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    });

    return apiSuccess({
      notifications,
      unreadCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));

    if (body.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, userId: user.id },
        data: { read: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    }

    return apiSuccess({ message: "Notifications marked as read" });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { setSessionCookie } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

export async function POST() {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@liferpg.app" },
      include: {
        profile: true,
        character: {
          include: { attributes: true },
        },
        streak: true,
        settings: true,
      },
    });

    if (!demoUser) {
      return apiError("Demo user not found. Please run seed first.", "DEMO_NOT_FOUND", 404);
    }

    await setSessionCookie({
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
    });

    const { passwordHash: _, ...safeUser } = demoUser;
    return apiSuccess(safeUser);
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

const UpdateSettingsSchema = z.object({
  theme: z.enum(["cyberpunk", "arcane", "emerald", "neon", "midnight"]).optional(),
  soundEnabled: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  showOnLeaderboard: z.boolean().optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    const user = await requireAuth();

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    return apiSuccess(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = UpdateSettingsSchema.parse(body);

    const updated = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

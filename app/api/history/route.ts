import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({
        where: { userId: user.id },
      }),
    ]);

    return apiSuccess({
      logs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

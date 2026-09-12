import prisma from "@/lib/db";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function GET() {
  try {
    const categories = await prisma.questCategory.findMany({
      orderBy: { name: "asc" },
    });
    return apiSuccess(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

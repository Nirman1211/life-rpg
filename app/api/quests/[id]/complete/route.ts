import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { completeQuestTransaction } from "@/lib/rpg/engine";
import { apiSuccess, handleApiError } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const result = await completeQuestTransaction(user.id, id);

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}

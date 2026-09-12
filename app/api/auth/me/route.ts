import { getCurrentUser } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return apiError("Unauthenticated", "UNAUTHORIZED", 401);
  }
  return apiSuccess(user);
}

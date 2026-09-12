import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { setSessionCookie } from "@/lib/auth/session";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        profile: true,
        character: {
          include: { attributes: true },
        },
        streak: true,
        settings: true,
      },
    });

    if (!user) {
      return apiError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return apiError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...safeUser } = user;
    return apiSuccess(safeUser);
  } catch (error) {
    return handleApiError(error);
  }
}

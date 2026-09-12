import { cookies } from "next/headers";
import { signJWT, verifyJWT, TokenPayload } from "./jwt";
import prisma from "@/lib/db";

export const SESSION_COOKIE_NAME = "liferpg_session";

export async function setSessionCookie(payload: TokenPayload) {
  const token = await signJWT(payload, "14d");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  return token;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionPayload(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

export async function getCurrentUser() {
  const payload = await getSessionPayload();
  if (!payload?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        profile: true,
        character: {
          include: {
            attributes: true,
          },
        },
        streak: true,
        settings: true,
      },
    });

    if (!user) return null;

    // Do not return passwordHash
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

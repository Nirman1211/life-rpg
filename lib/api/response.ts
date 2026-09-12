import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function apiError(message: string, code = "BAD_REQUEST", status = 400, details?: any) {
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  console.error("API Error encountered:", error);

  if (error instanceof ZodError) {
    return apiError("Validation failed", "VALIDATION_ERROR", 422, error.flatten().fieldErrors);
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }
    if (error.message === "ALREADY_COMPLETED_TODAY") {
      return apiError("Quest has already been completed today", "ALREADY_COMPLETED", 409);
    }
    if (error.message === "QUEST_NOT_FOUND") {
      return apiError("Quest not found", "NOT_FOUND", 404);
    }
    if (error.message === "UNAUTHORIZED_QUEST_ACCESS") {
      return apiError("You do not have access to this quest", "FORBIDDEN", 403);
    }
    return apiError(error.message, "SERVER_ERROR", 500);
  }

  return apiError("An unexpected server error occurred", "INTERNAL_ERROR", 500);
}

import { NextResponse } from "next/server";

import { verifyEmailByToken } from "@/entities/auth/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token") ?? "";
  const user = await verifyEmailByToken(token);
  const redirectUrl = new URL("/auth", request.url);

  redirectUrl.searchParams.set(user ? "verified" : "error", "1");

  return NextResponse.redirect(redirectUrl);
}

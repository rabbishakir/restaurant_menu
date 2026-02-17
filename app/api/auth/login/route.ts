import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, createSessionToken } from "../../../../lib/session";

export async function POST(req: Request) {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!adminUser || !adminPass || !sessionSecret) {
    return NextResponse.json(
      { success: false, error: "Auth environment variables are not configured." },
      { status: 500 },
    );
  }

  const body = (await req.json()) as { username?: string; password?: string };
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (username !== adminUser || password !== adminPass) {
    return NextResponse.json(
      { success: false, error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(sessionSecret);
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return res;
}

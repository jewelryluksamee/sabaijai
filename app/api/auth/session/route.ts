import { auth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "__session";
const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return Response.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_MS / 1000,
      path: "/",
    });

    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return Response.json({ status: "ok" });
}

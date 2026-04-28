import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { verifyGoogleCredential } from "@/lib/google";
import { findOrCreateGoogleUser } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credential = typeof body?.credential === "string" ? body.credential : "";

    if (!credential) {
      return NextResponse.json({ error: "Google did not return a credential." }, { status: 400 });
    }

    const profile = await verifyGoogleCredential(credential);
    const user = findOrCreateGoogleUser(profile);
    await createSession(user.id);

    return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Google sign-in failed." },
      { status: 400 },
    );
  }
}

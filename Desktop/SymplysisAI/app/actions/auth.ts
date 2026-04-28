"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, deleteSession } from "@/lib/auth";
import {
  createPasswordResetToken,
  createUser,
  findUserByCredentials,
  resetPasswordWithToken,
} from "@/lib/users";

type State = { error: string } | null;
type PasswordResetRequestState = { error?: string; success?: string; resetUrl?: string } | null;
type ChangePasswordState = { error: string } | null;

export async function login(_: State, formData: FormData): Promise<State> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const user = findUserByCredentials(email, password);
    await createSession(user.id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  redirect("/dashboard");
}

export async function signup(_: State, formData: FormData): Promise<State> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    const user = createUser(name, email, password);
    await createSession(user.id);
  } catch (e) {
    return { error: (e as Error).message };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

export async function requestPasswordReset(_: PasswordResetRequestState, formData: FormData): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Enter the email address for your account." };
  }

  const token = createPasswordResetToken(email);
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "development" ? "http" : "https");
  const origin = host ? `${proto}://${host}` : "";

  return {
    success: token
      ? "Password reset link created. Email delivery is not configured in this build, so you can open the live reset URL below."
      : "If that email exists, a reset link is now ready for it.",
    resetUrl: token ? `${origin}/change-password?token=${token}` : undefined,
  };
}

export async function changePassword(_: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token) {
    return { error: "This password reset link is invalid or has expired." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    resetPasswordWithToken(token, password);
  } catch (error) {
    return { error: (error as Error).message };
  }

  redirect("/login?reset=success");
}

"use client";

import Link from "next/link";
import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changePassword } from "@/app/actions/auth";

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<ChangePasswordLoading />}>
      <ChangePasswordContent />
    </Suspense>
  );
}

function ChangePasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return <ChangePasswordShell token={token} />;
}

function ChangePasswordShell({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, action, pending] = useActionState(changePassword, null);

  if (!token) {
    return (
      <div className="stack" style={{ ["--stack-gap" as never]: "1.25rem" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "0.5rem" }}>Change password</h1>
          <p style={{ fontSize: "var(--text-sm)" }}>
            This reset link is missing or invalid.
          </p>
        </div>

        <Link href="/forgot-password">
          <Button variant="primary" size="lg" style={{ width: "100%" }}>
            Request a new reset link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="stack" style={{ ["--stack-gap" as never]: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "0.5rem" }}>Change password</h1>
        <p style={{ fontSize: "var(--text-sm)" }}>
          Set a new password for your workspace account.
        </p>
      </div>

      <form className="stack" style={{ ["--stack-gap" as never]: "1rem" }} action={action}>
        <input type="hidden" name="token" value={token} />

        <Input
          name="password"
          label="New password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          trailing={(
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ display: "inline-flex" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        />

        <Input
          name="confirmPassword"
          label="Confirm new password"
          type={showConfirm ? "text" : "password"}
          placeholder="Repeat your new password"
          autoComplete="new-password"
          required
          trailing={(
            <button
              type="button"
              onClick={() => setShowConfirm((value) => !value)}
              aria-label={showConfirm ? "Hide password" : "Show password"}
              style={{ display: "inline-flex" }}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        />

        {state?.error && (
          <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>
            {state.error}
          </p>
        )}

        <Button type="submit" loading={pending} variant="primary" size="lg" style={{ width: "100%" }}>
          Update password
        </Button>
      </form>

      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textAlign: "center" }}>
        Already fixed it? <Link href="/login" style={{ color: "var(--brand)", fontWeight: 500 }}>Back to sign in</Link>
      </p>
    </div>
  );
}

function ChangePasswordLoading() {
  return (
    <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "0.5rem" }}>Change password</h1>
        <p style={{ fontSize: "var(--text-sm)" }}>Loading your reset link...</p>
      </div>
      <div className="skeleton" style={{ height: 44, borderRadius: "var(--radius-md)" }} />
      <div className="skeleton" style={{ height: 44, borderRadius: "var(--radius-md)" }} />
    </div>
  );
}

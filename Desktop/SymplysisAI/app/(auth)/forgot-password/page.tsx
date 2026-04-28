"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <div className="stack" style={{ ["--stack-gap" as never]: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "0.5rem" }}>Forgot password</h1>
        <p style={{ fontSize: "var(--text-sm)" }}>
          Enter your account email and we&apos;ll generate a reset link.
        </p>
      </div>

      {state?.success ? (
        <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
          <p
            role="status"
            style={{
              padding: "1rem",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-success-soft)",
              border: "1px solid oklch(60% 0.16 155 / 0.16)",
              color: "oklch(38% 0.14 155)",
              fontSize: "var(--text-sm)",
            }}
          >
            {state.success}
          </p>

          {state.resetUrl && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              <p style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                Reset URL
              </p>
              <a
                href={state.resetUrl}
                style={{
                  display: "block",
                  marginTop: "0.625rem",
                  color: "var(--brand-active)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  wordBreak: "break-all",
                }}
              >
                {state.resetUrl}
              </a>
            </div>
          )}

          <Link href="/login">
            <Button variant="secondary" size="lg" style={{ width: "100%" }}>
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form className="stack" style={{ ["--stack-gap" as never]: "1rem" }} action={action}>
          <Input
            name="email"
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
          />

          {state?.error && (
            <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>
              {state.error}
            </p>
          )}

          <Button type="submit" loading={pending} variant="primary" size="lg" style={{ width: "100%" }}>
            Create reset link
          </Button>
        </form>
      )}

      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textAlign: "center" }}>
        Remembered it? <Link href="/login" style={{ color: "var(--brand)", fontWeight: 500 }}>Back to sign in</Link>
      </p>
    </div>
  );
}

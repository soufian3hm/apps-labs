"use client";
import Link from "next/link";
import { Suspense, useState, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageShell passwordWasReset={false} />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const passwordWasReset = searchParams.get("reset") === "success";

  return <LoginPageShell passwordWasReset={passwordWasReset} />;
}

function LoginPageShell({ passwordWasReset }: { passwordWasReset: boolean }) {
  const [show, setShow] = useState(false);
  const [state, action, pending] = useActionState(login, null);

  return (
    <div className="stack" style={{ ["--stack-gap" as never]: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "0.5rem" }}>Welcome back</h1>
        <p style={{ fontSize: "var(--text-sm)" }}>
          New here? <Link href="/signup" style={{ color: "var(--brand)", fontWeight: 500 }}>Create an account</Link>
        </p>
      </div>

      {passwordWasReset && (
        <p
          role="status"
          style={{
            padding: "0.875rem 1rem",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-success-soft)",
            color: "oklch(38% 0.14 155)",
            fontSize: "var(--text-sm)",
            border: "1px solid oklch(60% 0.16 155 / 0.16)",
          }}
        >
          Password updated. Sign in with your new password.
        </p>
      )}

      <div className="stack" style={{ ["--stack-gap" as never]: "0.5rem" }}>
        <GoogleAuthButton mode="signin" />
        <Button variant="secondary" size="lg" style={{ width: "100%" }} leadingIcon={<GitHubIcon />} disabled>
          GitHub sign-in unavailable
        </Button>
      </div>

      <div className="row" style={{ gap: "0.75rem" }}>
        <hr className="divider" style={{ flex: 1 }} />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>or</span>
        <hr className="divider" style={{ flex: 1 }} />
      </div>

      <form className="stack" style={{ ["--stack-gap" as never]: "1rem" }} action={action}>
        <Input name="email" label="Email" type="email" placeholder="you@company.com" autoComplete="email" required />
        <div>
          <div className="row row-between" style={{ marginBottom: "0.5rem" }}>
            <label htmlFor="pw" className="label">Password</label>
            <Link href="/forgot-password" style={{ fontSize: "var(--text-xs)", color: "var(--brand)", fontWeight: 500 }}>Forgot password?</Link>
          </div>
          <Input
            id="pw"
            name="password"
            type={show ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            trailing={
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} style={{ display: "inline-flex" }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </div>
        {state?.error && (
          <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{state.error}</p>
        )}
        <Button type="submit" loading={pending} variant="primary" size="lg" style={{ width: "100%" }}>Sign in</Button>
      </form>

      <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textAlign: "center" }}>
        By continuing you agree to our <Link href="#" style={{ textDecoration: "underline" }}>Terms</Link> and <Link href="#" style={{ textDecoration: "underline" }}>Privacy Policy</Link>.
      </p>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.5 2.34 1.07 2.91.82.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.1-4.55-4.94 0-1.1.4-2 1.03-2.7-.1-.26-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.8a9.6 9.6 0 0 1 2.5.34c1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.4.1 2.66.64.7 1.03 1.6 1.03 2.7 0 3.85-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

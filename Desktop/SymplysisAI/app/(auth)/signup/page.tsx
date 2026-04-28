"use client";
import Link from "next/link";
import { useState, useActionState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [pw, setPw] = useState("");
  const [state, action, pending] = useActionState(signup, null);
  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length);
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["var(--color-error)", "var(--color-warning)", "var(--color-warning)", "var(--color-success)", "var(--color-success)"];

  return (
    <div className="stack" style={{ ["--stack-gap" as never]: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "0.5rem" }}>Create your workspace</h1>
        <p style={{ fontSize: "var(--text-sm)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--brand)", fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>

      <GoogleAuthButton mode="signup" />

      <div className="row" style={{ gap: "0.75rem" }}>
        <hr className="divider" style={{ flex: 1 }} />
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>or</span>
        <hr className="divider" style={{ flex: 1 }} />
      </div>

      <form className="stack" style={{ ["--stack-gap" as never]: "1rem" }} action={action}>
        <Input name="name" label="Full name" placeholder="Layla Rahman" autoComplete="name" required />
        <Input name="email" label="Work email" type="email" placeholder="you@company.com" autoComplete="email" required />
        <div>
          <Input
            name="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          {pw.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: 4, flex: 1, borderRadius: 2,
                    background: i < strength ? colors[strength] : "var(--color-bg-tertiary)",
                    transition: "background var(--duration-base)",
                  }} />
                ))}
              </div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 6, display: "block" }}>
                {labels[strength]}
              </span>
            </div>
          )}
        </div>

        <label style={{ display: "flex", gap: "0.625rem", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
          <input type="checkbox" defaultChecked style={{ marginTop: 3 }} />
          <span>Send me product updates and the occasional growth playbook. No spam.</span>
        </label>

        {state?.error && (
          <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{state.error}</p>
        )}

        <Button type="submit" loading={pending} variant="primary" size="lg" style={{ width: "100%" }}>Create account</Button>
      </form>

      <ul role="list" style={{ display: "grid", gap: "0.5rem", fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
        {["Free 14-day trial of Pro", "No credit card required", "Cancel anytime"].map((t) => (
          <li key={t} style={{ display: "flex", gap: 6 }}><Check size={14} style={{ color: "var(--color-success)" }} />{t}</li>
        ))}
      </ul>
    </div>
  );
}

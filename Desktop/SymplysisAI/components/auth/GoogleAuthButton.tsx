"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type Mode = "signin" | "signup";

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: string;
              logo_alignment?: "left" | "center";
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleAuthButton({ mode }: { mode: Mode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;

    const handleCredential = async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setError("Google did not return a credential.");
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const authResponse = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = (await authResponse.json()) as { error?: string; redirectTo?: string };

        if (!authResponse.ok) {
          throw new Error(data.error || "Google sign-in failed.");
        }

        window.location.assign(data.redirectTo || "/dashboard");
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Google sign-in failed.");
        setLoading(false);
      }
    };

    const renderButton = () => {
      if (!containerRef.current || !window.google?.accounts?.id) return;

      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: mode === "signin" ? "continue_with" : "signup_with",
        width: String(Math.max(260, Math.floor(containerRef.current.getBoundingClientRect().width))),
        logo_alignment: "left",
      });
    };

    const initialize = () => {
      if (disposed || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        ux_mode: "popup",
      });

      renderButton();

      if ("ResizeObserver" in window && containerRef.current) {
        resizeObserver = new ResizeObserver(() => renderButton());
        resizeObserver.observe(containerRef.current);
      }
    };

    const scriptId = "google-identity-services";
    const handleLoad = () => initialize();
    const handleError = () => setError("Failed to load Google Sign-In.");

    if (window.google?.accounts?.id) {
      initialize();
    } else {
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", handleLoad);
        script.addEventListener("error", handleError);
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", handleLoad);
        script.addEventListener("error", handleError);
      }

      return () => {
        disposed = true;
        resizeObserver?.disconnect();
        script?.removeEventListener("load", handleLoad);
        script?.removeEventListener("error", handleError);
      };
    }

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
    };
  }, [mode]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="stack" style={{ ["--stack-gap" as never]: "0.5rem" }}>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled
          style={{ width: "100%" }}
        >
          Google sign-in unavailable
        </Button>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
          Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to enable Google auth.
        </p>
      </div>
    );
  }

  return (
    <div className="stack" style={{ ["--stack-gap" as never]: "0.5rem" }}>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          minHeight: 44,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          pointerEvents: loading ? "none" : undefined,
          opacity: loading ? 0.7 : 1,
        }}
      />
      {loading && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
          Completing Google sign-in...
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FieldProps {
  label?: string;
  optional?: boolean;
  help?: string;
  error?: string;
  trailing?: ReactNode;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, optional, help, error, trailing, id, className, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `i-${reactId}`;
  const helpId = help ? `${inputId}-help` : undefined;
  const errorId = error ? `${inputId}-err` : undefined;

  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {optional && <span className="optional">(optional)</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(helpId, errorId) || undefined}
          className={cn("input", className)}
          style={trailing ? { paddingRight: "2.75rem" } : undefined}
          {...rest}
        />
        {trailing && (
          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", display: "inline-flex" }}>
            {trailing}
          </span>
        )}
      </div>
      {help && !error && <span id={helpId} className="help">{help}</span>}
      {error && (
        <span id={errorId} className="error-msg" role="alert">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, optional, help, error, id, className, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `t-${reactId}`;
  return (
    <div className="field">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {optional && <span className="optional">(optional)</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn("input", className)}
        rows={4}
        {...rest}
      />
      {help && !error && <span className="help">{help}</span>}
      {error && <span className="error-msg" role="alert">{error}</span>}
    </div>
  );
});

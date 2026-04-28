"use client";
import { useState } from "react";
import { Upload, Image as ImageIcon, ArrowRight, ArrowLeft, Check, Sparkles, RefreshCcw, Eye, EyeOff, MoreHorizontal, Wand2 } from "lucide-react";
import { Topbar } from "@/components/dashboard/Topbar";
import {
  LandingPageDevicePreview,
  PreviewModeToggle,
  type LandingPagePreviewContent,
  type PreviewMode,
} from "@/components/dashboard/LandingPageDevicePreview";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

const STEPS = ["Upload", "Brand context", "Generate", "Refine"];

export default function GeneratePage() {
  const [step, setStep] = useState(0);
  return (
    <>
      <Topbar title="New generation" />
      <main style={{ padding: "2rem 1.5rem 4rem", maxWidth: 1200, width: "100%" }}>
        <Stepper current={step} />

        <div style={{ marginTop: "var(--space-8)" }}>
          {step === 0 && <StepUpload onNext={() => setStep(1)} />}
          {step === 1 && <StepBrand onBack={() => setStep(0)} onNext={() => setStep(2)} />}
          {step === 2 && <StepGenerate onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <StepRefine onBack={() => setStep(2)} />}
        </div>
      </main>
    </>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol role="list" style={{ display: "flex", gap: "0.5rem", listStyle: "none", padding: 0, flexWrap: "wrap" }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} style={{ display: "flex", alignItems: "center", gap: "0.625rem", flex: "1 1 180px" }}>
            <span style={{
              width: 28, height: 28, borderRadius: "50%",
              background: done ? "var(--brand)" : active ? "var(--brand-soft)" : "var(--color-bg-tertiary)",
              color: done ? "white" : active ? "var(--brand-active)" : "var(--color-text-tertiary)",
              border: active ? "1px solid var(--brand)" : "1px solid transparent",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--text-xs)", fontWeight: 600, flexShrink: 0,
            }}>
              {done ? <Check size={14} /> : i + 1}
            </span>
            <span style={{
              fontSize: "var(--text-sm)", fontWeight: 500,
              color: active ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
            }}>{label}</span>
            {i < STEPS.length - 1 && <span style={{ flex: 1, height: 1, background: "var(--color-border-subtle)", marginLeft: 4 }} />}
          </li>
        );
      })}
    </ol>
  );
}

function StepUpload({ onNext }: { onNext: () => void }) {
  const [hasFile, setHasFile] = useState(false);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-6)" }} className="gen-cols">
      <Card>
        <h2 style={{ fontSize: "var(--text-xl)" }}>Upload your product</h2>
        <p style={{ marginTop: "0.5rem", marginBottom: "var(--space-6)" }}>A real packshot or product photo works best. PNG, JPG, or WEBP up to 20MB.</p>

        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.875rem",
          minHeight: 280, padding: "2rem",
          border: "1.5px dashed var(--color-border-default)",
          borderRadius: "var(--radius-lg)",
          background: hasFile ? "var(--brand-soft)" : "var(--color-bg-secondary)",
          cursor: "pointer", transition: "all var(--duration-base)",
        }}>
          <input type="file" accept="image/*" onChange={() => setHasFile(true)} style={{ display: "none" }} />
          {hasFile ? (
            <>
              <span style={{ width: 64, height: 64, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, oklch(85% 0.10 200), oklch(80% 0.12 320))" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>hydra-serum-packshot.png</div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 2 }}>2.4 MB · 1200 × 1200</div>
              </div>
              <Button variant="ghost" size="sm">Replace image</Button>
            </>
          ) : (
            <>
              <span style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-text-secondary)",
              }}>
                <Upload size={22} />
              </span>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "var(--text-base)", fontWeight: 600 }}>Drop your product image</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginTop: 4 }}>
                  or <span style={{ color: "var(--brand)", fontWeight: 500 }}>browse files</span>
                </div>
              </div>
              <span className="badge"><ImageIcon size={12} /> PNG · JPG · WEBP</span>
            </>
          )}
        </label>

        {hasFile && (
          <div style={{ marginTop: "var(--space-6)", padding: "1rem", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
            <div className="row" style={{ gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Sparkles size={14} style={{ color: "var(--brand)" }} />
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Analysis complete</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["Skincare", "Premium", "Cool palette", "Clean minimalist", "Female-leaning audience"].map((t) => (
                <Badge key={t} plain tone="brand">{t}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="row row-between" style={{ marginTop: "var(--space-6)" }}>
          <Button variant="ghost" disabled>Back</Button>
          <Button variant="primary" disabled={!hasFile} trailingIcon={<ArrowRight size={14} />} onClick={onNext}>Continue</Button>
        </div>
      </Card>

      <Card style={{ background: "var(--color-bg-secondary)" }}>
        <h3 style={{ fontSize: "var(--text-base)" }}>Why a real image?</h3>
        <p style={{ fontSize: "var(--text-sm)", marginTop: "0.5rem", marginBottom: "1rem" }}>
          We extract palette, category, style, and likely positioning from the photo. Stock images work,
          but real packshots produce dramatically more aligned campaigns.
        </p>
        <ul role="list" style={{ display: "flex", flexDirection: "column", gap: "0.625rem", fontSize: "var(--text-sm)" }}>
          {["Detects category and likely audience", "Pulls a usable color palette automatically", "Drives consistent visual tone across assets"].map((t) => (
            <li key={t} style={{ display: "flex", gap: 8 }}><Check size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />{t}</li>
          ))}
        </ul>
      </Card>
      <style>{`@media (max-width: 920px) { .gen-cols { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function StepBrand({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <Card style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ fontSize: "var(--text-xl)" }}>Brand context</h2>
      <p style={{ marginTop: "0.5rem", marginBottom: "var(--space-6)" }}>
        The more we know about your brand, the more aligned the output. All fields are optional.
      </p>

      <div className="stack" style={{ ["--stack-gap" as never]: "1.25rem" }}>
        <Input label="Brand name" placeholder="Aurora Skincare" defaultValue="Aurora Skincare" />
        <Input label="Product name" placeholder="Hydra Serum" defaultValue="Hydra Serum" />
        <Textarea label="One-line value proposition" placeholder="Deep hydration without the heavy feel." optional />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="gen-row">
          <div className="field">
            <label className="label">Tone</label>
            <select className="input">
              <option>Premium · calm · clinical</option>
              <option>Bold · punchy · direct</option>
              <option>Friendly · warm · approachable</option>
              <option>Luxurious · editorial · refined</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Market</label>
            <select className="input">
              <option>United Arab Emirates</option>
              <option>Saudi Arabia</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>France</option>
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="gen-row">
          <div className="field">
            <label className="label">Language</label>
            <select className="input">
              <option>English</option>
              <option>Arabic (RTL)</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          </div>
          <div className="field">
            <label className="label">Audience</label>
            <select className="input">
              <option>Women, 25–45, urban</option>
              <option>Men, 18–35, fitness</option>
              <option>Parents, 30–50</option>
              <option>Custom</option>
            </select>
          </div>
        </div>
        <Textarea label="Anything else we should know?" optional placeholder="e.g. avoid mentioning competitors. Lean into clean-beauty positioning." />
      </div>

      <div className="row row-between" style={{ marginTop: "var(--space-8)" }}>
        <Button variant="ghost" leadingIcon={<ArrowLeft size={14} />} onClick={onBack}>Back</Button>
        <div className="row" style={{ gap: 8 }}>
          <Button variant="ghost" onClick={onNext}>Skip for now</Button>
          <Button variant="primary" trailingIcon={<ArrowRight size={14} />} onClick={onNext}>Continue</Button>
        </div>
      </div>
      <style>{`@media (max-width: 600px) { .gen-row { grid-template-columns: 1fr !important; } }`}</style>
    </Card>
  );
}

function StepGenerate({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const assets = [
    { id: "lp", t: "Landing page", s: "Hero, features, FAQ, pricing, footer", recommended: true },
    { id: "ad", t: "Ad copy", s: "12 variants for Meta and Google", recommended: true },
    { id: "vo", t: "Voiceover script", s: "30s spoken script + audio export" },
    { id: "po", t: "Poster set", s: "Square, story, and 1080×1350" },
    { id: "em", t: "Email sequence", s: "3-step welcome flow" },
    { id: "ug", t: "UGC script", s: "Coming soon", disabled: true },
  ];
  const [selected, setSelected] = useState<string[]>(["lp", "ad"]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Card style={{ maxWidth: 880, margin: "0 auto" }}>
      <h2 style={{ fontSize: "var(--text-xl)" }}>Choose what to generate</h2>
      <p style={{ marginTop: "0.5rem", marginBottom: "var(--space-6)" }}>
        Pick one asset or run a full campaign in one shot. Everything stays aligned — same product, same brand, same source of truth.
      </p>

      <div className="grid-auto" style={{ ["--min" as never]: "240px" }}>
        {assets.map((a) => {
          const isSelected = selected.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => !a.disabled && toggle(a.id)}
              disabled={a.disabled}
              aria-pressed={isSelected}
              style={{
                position: "relative",
                textAlign: "left",
                padding: "1rem",
                border: `1.5px solid ${isSelected ? "var(--brand)" : "var(--color-border-subtle)"}`,
                background: isSelected ? "var(--brand-soft)" : "var(--color-bg-elevated)",
                borderRadius: "var(--radius-lg)",
                opacity: a.disabled ? 0.5 : 1,
                cursor: a.disabled ? "not-allowed" : "pointer",
                transition: "all var(--duration-base)",
              }}
            >
              <div className="row row-between" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>{a.t}</span>
                {a.recommended && !a.disabled && <Badge plain tone="brand">Recommended</Badge>}
              </div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{a.s}</p>
              {isSelected && (
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "var(--brand)", color: "white",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="row row-between" style={{ marginTop: "var(--space-8)" }}>
        <Button variant="ghost" leadingIcon={<ArrowLeft size={14} />} onClick={onBack}>Back</Button>
        <Button variant="brand" disabled={selected.length === 0} leadingIcon={<Sparkles size={14} />} onClick={onNext}>
          Generate {selected.length} {selected.length === 1 ? "asset" : "assets"}
        </Button>
      </div>
    </Card>
  );
}

function StepRefine({ onBack }: { onBack: () => void }) {
  const sections = [
    { name: "Hero", body: "Deep hydration without the heavy feel. Aurora Hydra Serum delivers 72-hour moisture in a weightless formula." },
    { name: "Features", body: "Clinical-grade hyaluronic acid · Fragrance-free · Dermatologist-tested · Vegan formula" },
    { name: "Benefits", body: "Plumper skin in 7 days. Visible glow in 14. Long-term barrier support that compounds with every use." },
    { name: "FAQ", body: "Is it safe during pregnancy? · Can I layer it with retinol? · How long until I see results?" },
    { name: "Pricing", body: "30ml — $48 · 50ml — $72 · Refill pouch — $36" },
    { name: "Footer", body: "Free shipping over $40 · 60-day money back · Carbon-neutral delivery" },
  ];
  const [hidden, setHidden] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const toggleHide = (n: string) => setHidden((h) => (h.includes(n) ? h.filter((x) => x !== n) : [...h, n]));
  const visiblePreviewSections = sections
    .filter((section) => section.name !== "Hero" && !hidden.includes(section.name))
    .map((section) => ({ title: section.name, body: section.body }));
  const previewContent: LandingPagePreviewContent = {
    brand: "Aurora Skincare",
    eyebrow: "Barrier repair serum",
    price: "$48",
    headline: "Hydration that holds from morning to midnight.",
    body: hidden.includes("Hero")
      ? "The hero is currently hidden. Show it again from the Hero block to restore the top conversion section."
      : sections[0].body,
    cta: "Shop Hydra Serum",
    url: "aurora.co/products/hydra-serum",
    highlights: ["72-hour moisture", "Derm-tested", "Bundle and save 15%"],
    sections: visiblePreviewSections,
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--space-6)" }} className="gen-cols">
      <div>
        <div className="row row-between" style={{ marginBottom: "var(--space-4)" }}>
          <div>
            <h2 style={{ fontSize: "var(--text-xl)" }}>Hydra Serum landing page</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-tertiary)", marginTop: 2 }}>Generated 32 seconds ago · 6 sections</p>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Button variant="ghost" leadingIcon={<RefreshCcw size={14} />}>Regenerate all</Button>
            <Button variant="primary">Export</Button>
          </div>
        </div>

        <Card style={{ padding: "0.875rem", marginBottom: "var(--space-4)" }}>
          <div className="row row-between" style={{ gap: "0.875rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
            <div>
              <h3 style={{ fontSize: "var(--text-base)" }}>Landing page preview</h3>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 2 }}>
                Inspect the result before export.
              </p>
            </div>
            <PreviewModeToggle mode={previewMode} onChange={setPreviewMode} />
          </div>
          <LandingPageDevicePreview mode={previewMode} content={previewContent} title="Generated Hydra Serum landing page" />
        </Card>

        <div className="stack" style={{ ["--stack-gap" as never]: "0.75rem" }}>
          {sections.map((s) => {
            const isHidden = hidden.includes(s.name);
            return (
              <Card key={s.name} hover style={{ padding: "1rem 1.25rem", opacity: isHidden ? 0.5 : 1 }}>
                <div className="row row-between" style={{ marginBottom: "0.5rem" }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.name}</span>
                  </div>
                  <div className="row" style={{ gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" aria-label="Regenerate this section" title="Regenerate"><Wand2 size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" aria-label={isHidden ? "Show section" : "Hide section"} onClick={() => toggleHide(s.name)} title={isHidden ? "Show" : "Hide"}>
                      {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" aria-label="More"><MoreHorizontal size={14} /></button>
                  </div>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", lineHeight: 1.55 }}>{s.body}</p>
                <div style={{ marginTop: "0.75rem", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["Make it more premium", "Stronger CTA", "Tighter for COD buyers"].map((p) => (
                    <button key={p} className="badge" style={{ cursor: "pointer", background: "var(--color-bg-elevated)" }}>
                      <Wand2 size={11} /> {p}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="row" style={{ marginTop: "var(--space-6)", gap: 8 }}>
          <Button variant="ghost" leadingIcon={<ArrowLeft size={14} />} onClick={onBack}>Back</Button>
        </div>
      </div>

      <aside className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
        <Card>
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "0.5rem" }}>Project</h3>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "linear-gradient(135deg, oklch(85% 0.10 200), oklch(80% 0.12 320))" }} />
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Hydra Serum</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>Aurora Skincare</div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "0.75rem" }}>Detected attributes</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Skincare", "Premium", "Cool palette", "Female 25–45", "UAE / KSA"].map((t) => (
              <Badge key={t} plain>{t}</Badge>
            ))}
          </div>
        </Card>
        <Card style={{ background: "var(--color-bg-secondary)" }}>
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "0.5rem" }}>Generate more</h3>
          <p style={{ fontSize: "var(--text-sm)", marginBottom: "0.75rem" }}>Add ad copy or a voiceover from the same source.</p>
          <Button variant="secondary" size="sm" style={{ width: "100%" }} leadingIcon={<Sparkles size={14} />}>Add asset</Button>
        </Card>
      </aside>
      <style>{`@media (max-width: 1024px) { .gen-cols { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

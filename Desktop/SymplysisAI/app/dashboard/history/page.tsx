"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Layers3,
  Mic,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  LandingPageDevicePreview,
  PreviewModeToggle,
  type PreviewMode,
} from "@/components/dashboard/LandingPageDevicePreview";
import { Topbar } from "@/components/dashboard/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type HistoryType = "Poster" | "Voiceover" | "Landing page" | "Ad copy";

interface ProductSummary {
  name: string;
  category: string;
  price: string;
  audience: string;
  offer: string;
  sku: string;
}

interface BaseHistoryItem {
  id: string;
  name: string;
  brand: string;
  type: HistoryType;
  when: string;
  status: "Ready";
  notes: string;
  product: ProductSummary;
}

interface PosterHistoryItem extends BaseHistoryItem {
  type: "Poster";
  headline: string;
  cta: string;
  formats: string[];
  previewSvg: string;
}

interface VoiceoverHistoryItem extends BaseHistoryItem {
  type: "Voiceover";
  voice: string;
  duration: string;
  language: string;
  angle: string;
  script: string;
  waveform: number[];
}

interface LandingPageHistoryItem extends BaseHistoryItem {
  type: "Landing page";
  url: string;
  cta: string;
  eyebrow: string;
  headline: string;
  body: string;
  highlights: string[];
  sections: { title: string; body: string }[];
  previewSvg: string;
}

interface AdCopyHistoryItem extends BaseHistoryItem {
  type: "Ad copy";
  channel: string;
  objective: string;
  hook: string;
  variants: { label: string; headline: string; body: string; cta: string }[];
}

type HistoryItem =
  | PosterHistoryItem
  | VoiceoverHistoryItem
  | LandingPageHistoryItem
  | AdCopyHistoryItem;

const historyTypes: HistoryType[] = ["Poster", "Voiceover", "Landing page", "Ad copy"];

const typeDescriptions: Record<HistoryType, string> = {
  Poster: "Artwork first. Download the image, then open a modal for the product brief.",
  Voiceover: "Listen to the result first, then open the modal for the full script and offer details.",
  "Landing page": "Show the cover image first and click through to inspect the full landing page in a modal.",
  "Ad copy": "Browse compact rows, then open a modal to inspect every copy variant.",
};

const allItems: HistoryItem[] = [
  {
    id: "poster-hydra",
    name: "Hydra Serum poster set",
    brand: "Aurora Skincare",
    type: "Poster",
    when: "2h ago",
    status: "Ready",
    notes: "Winter hydration creative for paid social and story placements.",
    product: {
      name: "Hydra Serum",
      category: "Barrier repair serum",
      price: "$49",
      audience: "Dry-skin shoppers in colder markets",
      offer: "Bundle and save 15%",
      sku: "AUR-HYDRA-50",
    },
    headline: "Clinically hydrated skin in 7 nights.",
    cta: "Shop the winter repair set",
    formats: ["1080×1350", "1080×1920", "1000×1500"],
    previewSvg: createPosterPreview({
      brand: "Aurora Skincare",
      title: "Hydra Serum",
      body: "Clinically hydrated skin in 7 nights.",
      accentA: "#6D4AFF",
      accentB: "#5ED2FF",
      chip: "Winter repair",
    }),
  },
  {
    id: "voiceover-vellum",
    name: "Vellum scarf UGC voiceover",
    brand: "Vellum",
    type: "Voiceover",
    when: "Yesterday",
    status: "Ready",
    notes: "Warm founder-style read for premium gifting reels.",
    product: {
      name: "Cashmere Wrap Scarf",
      category: "Luxury winter accessory",
      price: "$118",
      audience: "Premium gift shoppers",
      offer: "Free gift wrap this week",
      sku: "VEL-CASH-WRAP",
    },
    voice: "Nadia · Warm / Conversational",
    duration: "30s",
    language: "English",
    angle: "Gift-ready luxury without sounding too polished",
    script:
      "If you want one gift that looks expensive, feels personal, and actually gets used, this is it. Vellum's cashmere wrap scarf is soft from the first wear, light enough for every day, and ships gift-ready this week.",
    waveform: [36, 62, 44, 70, 50, 86, 66, 40, 72, 58, 82, 46, 68, 54, 76, 38],
  },
  {
    id: "landing-hydra",
    name: "Hydra Serum landing page",
    brand: "Aurora Skincare",
    type: "Landing page",
    when: "4h ago",
    status: "Ready",
    notes: "Focused on winter dryness, ingredient proof, and a premium bundle upsell.",
    product: {
      name: "Hydra Serum",
      category: "Barrier repair serum",
      price: "$49",
      audience: "Skincare shoppers with dry or reactive skin",
      offer: "Bundle and save 15%",
      sku: "AUR-HYDRA-50",
    },
    url: "aurora.co/products/hydra-serum",
    cta: "Shop Hydra Serum",
    eyebrow: "Barrier repair serum",
    headline: "Hydration that holds from morning to midnight.",
    body: "A cleaner landing-page structure built to convert winter-dry shoppers with proof, routine framing, and one strong offer.",
    highlights: ["Ceramides + ectoin", "Derm-tested", "Bundle upsell"],
    sections: [
      {
        title: "What it fixes",
        body: "Dryness, flaking, tightness, and that mid-day feeling where skin already looks tired.",
      },
      {
        title: "Why it converts",
        body: "The page stacks ingredient proof, social proof, and the bundle offer before the FAQ.",
      },
      {
        title: "How the offer stays premium",
        body: "It avoids discount-heavy language and keeps the page focused on product value first.",
      },
    ],
    previewSvg: createLandingPreview({
      brand: "Aurora Skincare",
      eyebrow: "Barrier repair serum",
      headline: "Hydration that holds from morning to midnight.",
      accentA: "#6D4AFF",
      accentB: "#5ED2FF",
    }),
  },
  {
    id: "adcopy-aurora",
    name: "Q4 winter Meta ads",
    brand: "Aurora Skincare",
    type: "Ad copy",
    when: "Yesterday",
    status: "Ready",
    notes: "Cold-weather retargeting pack with cleaner premium language.",
    product: {
      name: "Hydra Serum",
      category: "Barrier repair serum",
      price: "$49",
      audience: "Returning shoppers and winter-dry audiences",
      offer: "Bundle and save 15%",
      sku: "AUR-HYDRA-50",
    },
    channel: "Meta",
    objective: "Retargeting",
    hook: "Dry skin is usually a barrier issue, not just a hydration issue.",
    variants: [
      {
        label: "Hook A",
        headline: "Winter skin? Fix the barrier first.",
        body: "Hydra Serum layers ceramides, ectoin, and panthenol to help skin stay calm and hydrated from AM to PM.",
        cta: "Shop now",
      },
      {
        label: "Hook B",
        headline: "The serum we reach for when skin starts flaking.",
        body: "Two pumps after cleansing, moisturizer on top, and the tight dry feeling starts backing off fast.",
        cta: "Build your bundle",
      },
    ],
  },
  {
    id: "adcopy-vellum",
    name: "Vellum Google gift ads",
    brand: "Vellum",
    type: "Ad copy",
    when: "5 days ago",
    status: "Ready",
    notes: "High-intent gifting copy structured for paid search and branded retargeting.",
    product: {
      name: "Cashmere Wrap Scarf",
      category: "Luxury winter accessory",
      price: "$118",
      audience: "Premium gift shoppers",
      offer: "Free gift wrap this week",
      sku: "VEL-CASH-WRAP",
    },
    channel: "Google",
    objective: "High-intent search",
    hook: "Looks premium, ships ready to gift, and works for every winter wardrobe.",
    variants: [
      {
        label: "Search 1",
        headline: "Cashmere Gift Scarf | Free Gift Wrap",
        body: "Premium winter scarf in soft cashmere feel. Gift-ready shipping this week only.",
        cta: "Shop gifts",
      },
      {
        label: "Search 2",
        headline: "Luxury Scarf For Her | Ships Gift-Ready",
        body: "Vellum cashmere wrap scarf with complimentary gift wrap and elevated everyday styling.",
        cta: "View colors",
      },
    ],
  },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<HistoryType | null>(null);
  const [query, setQuery] = useState("");
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null);
  const [playingVoiceoverId, setPlayingVoiceoverId] = useState<string | null>(null);
  const [landingPreviewMode, setLandingPreviewMode] = useState<PreviewMode>("desktop");

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = allItems.filter((item) => {
    if (filter && item.type !== filter) return false;
    if (!normalizedQuery) return true;
    return getSearchText(item).includes(normalizedQuery);
  });

  useEffect(() => {
    if (!activeItem) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveItem(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItem]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sections = historyTypes
    .map((type) => ({ type, items: visibleItems.filter((item) => item.type === type) }))
    .filter((section) => section.items.length > 0);

  const downloadItem = (item: HistoryItem) => {
    if (item.type === "Poster") {
      downloadBlob(`${slugify(`${item.brand}-${item.name}`)}.svg`, item.previewSvg, "image/svg+xml;charset=utf-8");
      return;
    }
    if (item.type === "Landing page") {
      downloadBlob(`${slugify(`${item.brand}-${item.name}`)}.html`, buildLandingPageHtml(item), "text/html;charset=utf-8");
      return;
    }
    if (item.type === "Voiceover") {
      downloadBlob(`${slugify(`${item.brand}-${item.name}`)}.txt`, buildVoiceoverText(item), "text/plain;charset=utf-8");
      return;
    }
    downloadBlob(`${slugify(`${item.brand}-${item.name}`)}.txt`, buildAdCopyText(item), "text/plain;charset=utf-8");
  };

  const toggleVoiceoverPreview = (item: VoiceoverHistoryItem) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (playingVoiceoverId === item.id) {
      synth.cancel();
      setPlayingVoiceoverId(null);
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(item.script);
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    utterance.onend = () => setPlayingVoiceoverId(null);
    utterance.onerror = () => setPlayingVoiceoverId(null);
    setPlayingVoiceoverId(item.id);
    synth.speak(utterance);
  };

  return (
    <>
      <Topbar title="History" />
      <main style={{ padding: "2rem 1.5rem 4rem", maxWidth: 1280, width: "100%" }}>
        <div className="row row-between" style={{ marginBottom: "var(--space-6)", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)" }}>Result-first history</h2>
            <p style={{ marginTop: 4 }}>
              {visibleItems.length} of {allItems.length} saved outputs
            </p>
          </div>
          <Link href="/dashboard/generate">
            <Button variant="primary" leadingIcon={<Plus size={14} />}>
              New generation
            </Button>
          </Link>
        </div>

        <Card style={{ padding: "1rem", marginBottom: "var(--space-6)" }}>
          <div className="row" style={{ gap: "0.75rem", flexWrap: "wrap", alignItems: "stretch" }}>
            <div style={{ flex: "1 1 280px", minWidth: 0, position: "relative" }}>
              <Search size={16} style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
              <Input
                aria-label="Search history"
                className="history-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, brands, hooks, offers..."
              />
            </div>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {historyTypes.map((type) => {
                const active = filter === type;
                const count = allItems.filter((item) => item.type === type).length;
                return (
                  <button
                    key={type}
                    className="badge"
                    onClick={() => setFilter(active ? null : type)}
                    style={{
                      cursor: "pointer",
                      background: active ? "var(--brand-soft)" : "var(--color-bg-elevated)",
                      color: active ? "var(--brand-active)" : "var(--color-text-secondary)",
                      borderColor: active ? "transparent" : "var(--color-border-default)",
                    }}
                  >
                    {type} · {count}
                  </button>
                );
              })}
              {(filter || query) && (
                <Button size="sm" variant="ghost" onClick={() => { setFilter(null); setQuery(""); }}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </Card>

        {sections.length === 0 ? (
          <EmptyState onClear={() => { setFilter(null); setQuery(""); }} />
        ) : (
          <div className="stack" style={{ ["--stack-gap" as never]: "2rem" }}>
            {sections.map(({ type, items }) => (
              <section key={type}>
                <div className="row row-between" style={{ marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontSize: "var(--text-xl)" }}>{type}</h3>
                    <p style={{ marginTop: 4, maxWidth: 760 }}>{typeDescriptions[type]}</p>
                  </div>
                  {type === "Landing page" ? (
                    <div className="row" style={{ gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      <Badge tone="neutral">{items.length} saved</Badge>
                      <PreviewModeToggle mode={landingPreviewMode} onChange={setLandingPreviewMode} label="History landing page preview mode" />
                    </div>
                  ) : (
                    <Badge tone="neutral">{items.length} saved</Badge>
                  )}
                </div>

                {type === "Poster" && (
                  <div className="grid-auto" style={{ ["--min" as never]: "280px" }}>
                    {items.map((item) => (
                      <PosterCard key={item.id} item={item as PosterHistoryItem} onDownload={downloadItem} onOpen={setActiveItem} />
                    ))}
                  </div>
                )}

                {type === "Voiceover" && (
                  <div className="grid-auto" style={{ ["--min" as never]: "320px" }}>
                    {items.map((item) => (
                      <VoiceoverCard
                        key={item.id}
                        item={item as VoiceoverHistoryItem}
                        isPlaying={playingVoiceoverId === item.id}
                        onDownload={downloadItem}
                        onOpen={setActiveItem}
                        onTogglePreview={toggleVoiceoverPreview}
                      />
                    ))}
                  </div>
                )}

                {type === "Landing page" && (
                  <div className="grid-auto" style={{ ["--min" as never]: "360px" }}>
                    {items.map((item) => (
                      <LandingPageCard
                        key={item.id}
                        item={item as LandingPageHistoryItem}
                        previewMode={landingPreviewMode}
                        onDownload={downloadItem}
                        onOpen={setActiveItem}
                      />
                    ))}
                  </div>
                )}

                {type === "Ad copy" && (
                  <Card style={{ padding: 0, overflow: "hidden" }}>
                    {(items as AdCopyHistoryItem[]).map((item, index) => (
                      <AdCopyRow
                        key={item.id}
                        item={item}
                        isLast={index === items.length - 1}
                        onDownload={downloadItem}
                        onOpen={setActiveItem}
                      />
                    ))}
                  </Card>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {activeItem && (
        <HistoryModal
          item={activeItem}
          isVoicePlaying={playingVoiceoverId === activeItem.id}
          landingPreviewMode={landingPreviewMode}
          onClose={() => setActiveItem(null)}
          onDownload={downloadItem}
          onLandingPreviewModeChange={setLandingPreviewMode}
          onToggleVoiceoverPreview={toggleVoiceoverPreview}
        />
      )}

      <style>{`
        .history-search { padding-left: 2.5rem !important; }
        .history-poster-frame,
        .history-landing-frame {
          width: 100%;
          border: 1px solid var(--color-border-subtle);
          border-radius: calc(var(--radius-lg) - 2px);
          overflow: hidden;
          background: var(--color-bg-secondary);
        }
        .history-poster-frame img,
        .history-landing-frame img {
          width: 100%;
          height: auto;
        }
        .history-voice-wave {
          display: grid;
          grid-template-columns: repeat(16, minmax(0, 1fr));
          gap: 0.35rem;
          align-items: end;
          height: 96px;
        }
        .history-voice-wave span {
          border-radius: 999px;
          background: linear-gradient(180deg, var(--brand), color-mix(in srgb, var(--brand) 35%, white));
          opacity: 0.85;
        }
        .history-voice-wave span.is-playing {
          animation: voiceBar 0.9s ease-in-out infinite alternate;
        }
        .history-modal-scrim {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: oklch(8% 0.01 270 / 0.52);
        }
        .history-modal {
          width: min(1120px, 100%);
          max-height: calc(100dvh - 2rem);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .history-modal-scroll {
          overflow: auto;
          padding: 1.25rem 1.25rem 1.5rem;
        }
        .history-modal-grid,
        .history-landing-modal-grid {
          display: grid;
          gap: 1rem;
        }
        .history-modal-grid {
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.8fr);
        }
        .history-landing-modal-grid {
          grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.72fr);
        }
        .history-full-landing {
          background: white;
          border: 1px solid var(--color-border-subtle);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .history-full-landing section + section {
          border-top: 1px solid var(--color-border-subtle);
        }
        @keyframes voiceBar {
          from { transform: scaleY(0.72); opacity: 0.55; }
          to { transform: scaleY(1.08); opacity: 1; }
        }
        @media (max-width: 980px) {
          .history-modal-grid,
          .history-landing-modal-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

function PosterCard({
  item,
  onDownload,
  onOpen,
}: {
  item: PosterHistoryItem;
  onDownload: (item: HistoryItem) => void;
  onOpen: (item: HistoryItem) => void;
}) {
  return (
    <Card style={{ padding: "0.875rem" }}>
      <div className="history-poster-frame" style={{ marginBottom: "0.875rem" }}>
        <img alt={item.name} loading="lazy" src={svgToDataUri(item.previewSvg)} />
      </div>
      <div className="row row-between" style={{ alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div>
          <h4 style={{ fontSize: "var(--text-base)" }}>{item.name}</h4>
          <p style={{ marginTop: 4 }}>{item.brand} · {item.product.name}</p>
        </div>
        <Badge tone="success">{item.status}</Badge>
      </div>
      <p style={{ fontSize: "var(--text-sm)", marginBottom: "0.875rem" }}>{item.headline}</p>
      <div className="row" style={{ flexWrap: "wrap", gap: 6, marginBottom: "0.875rem" }}>
        {item.formats.map((format) => (
          <span key={format} className="badge" style={{ background: "var(--color-bg-secondary)" }}>
            {format}
          </span>
        ))}
      </div>
      <div className="row row-between" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{item.when}</span>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" variant="secondary" leadingIcon={<Download size={14} />} onClick={() => onDownload(item)}>Download</Button>
          <Button size="sm" variant="ghost" onClick={() => onOpen(item)}>Details</Button>
        </div>
      </div>
    </Card>
  );
}

function VoiceoverCard({
  item,
  isPlaying,
  onDownload,
  onOpen,
  onTogglePreview,
}: {
  item: VoiceoverHistoryItem;
  isPlaying: boolean;
  onDownload: (item: HistoryItem) => void;
  onOpen: (item: HistoryItem) => void;
  onTogglePreview: (item: VoiceoverHistoryItem) => void;
}) {
  return (
    <Card style={{ padding: "1rem" }}>
      <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border-subtle)", background: "linear-gradient(180deg, color-mix(in srgb, var(--brand-soft) 65%, white), white)", padding: "1rem", marginBottom: "0.875rem" }}>
        <div className="row row-between" style={{ alignItems: "flex-start", marginBottom: "0.875rem", gap: "0.75rem" }}>
          <div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: 4 }}>{item.voice} · {item.duration}</div>
            <h4 style={{ fontSize: "var(--text-base)" }}>{item.name}</h4>
          </div>
          <button className="btn btn-secondary btn-sm btn-icon" aria-label={isPlaying ? "Stop voice preview" : "Play voice preview"} onClick={() => onTogglePreview(item)}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
        <div className="history-voice-wave" aria-hidden="true">
          {item.waveform.map((value, index) => (
            <span key={index} className={isPlaying ? "is-playing" : ""} style={{ height: `${value}px`, animationDelay: `${index * 45}ms` }} />
          ))}
        </div>
      </div>
      <p style={{ fontSize: "var(--text-sm)", marginBottom: "0.875rem" }}>“{item.script.slice(0, 118)}{item.script.length > 118 ? "..." : ""}”</p>
      <div className="row row-between" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{item.when}</span>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" variant="secondary" leadingIcon={isPlaying ? <Pause size={14} /> : <Play size={14} />} onClick={() => onTogglePreview(item)}>{isPlaying ? "Stop" : "Preview"}</Button>
          <Button size="sm" variant="secondary" leadingIcon={<Download size={14} />} onClick={() => onDownload(item)}>Download</Button>
          <Button size="sm" variant="ghost" onClick={() => onOpen(item)}>Details</Button>
        </div>
      </div>
    </Card>
  );
}

function LandingPageCard({
  item,
  previewMode,
  onDownload,
  onOpen,
}: {
  item: LandingPageHistoryItem;
  previewMode: PreviewMode;
  onDownload: (item: HistoryItem) => void;
  onOpen: (item: HistoryItem) => void;
}) {
  return (
    <Card style={{ padding: "0.875rem" }}>
      <div style={{ marginBottom: "0.875rem" }}>
        <LandingPageDevicePreview mode={previewMode} content={getLandingPreviewContent(item)} compact title={item.name} />
      </div>
      <div className="row row-between" style={{ alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <div>
          <h4 style={{ fontSize: "var(--text-base)" }}>{item.name}</h4>
          <p style={{ marginTop: 4 }}>{item.brand} · {item.product.name}</p>
        </div>
        <Badge tone="success">{item.status}</Badge>
      </div>
      <p style={{ fontSize: "var(--text-sm)", marginBottom: "0.875rem" }}>{item.headline}</p>
      <div className="row" style={{ flexWrap: "wrap", gap: 6, marginBottom: "0.875rem" }}>
        {item.highlights.map((highlight) => (
          <span key={highlight} className="badge" style={{ background: "var(--color-bg-secondary)" }}>
            {highlight}
          </span>
        ))}
      </div>
      <div className="row row-between" style={{ gap: "0.75rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{item.when}</span>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" variant="secondary" leadingIcon={<Download size={14} />} onClick={() => onDownload(item)}>Download</Button>
          <Button size="sm" variant="ghost" leadingIcon={<ExternalLink size={14} />} onClick={() => onOpen(item)}>View full page</Button>
        </div>
      </div>
    </Card>
  );
}

function AdCopyRow({
  item,
  isLast,
  onDownload,
  onOpen,
}: {
  item: AdCopyHistoryItem;
  isLast: boolean;
  onDownload: (item: HistoryItem) => void;
  onOpen: (item: HistoryItem) => void;
}) {
  return (
    <div style={{ padding: "1rem 1.125rem", borderBottom: isLast ? "none" : "1px solid var(--color-border-subtle)" }}>
      <div className="row row-between" style={{ alignItems: "flex-start", gap: "0.875rem", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: "1 1 320px" }}>
          <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: "0.375rem" }}>
            <span className="badge" style={{ background: "var(--brand-soft)", color: "var(--brand-active)", borderColor: "transparent" }}>{item.channel}</span>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{item.objective}</span>
          </div>
          <h4 style={{ fontSize: "var(--text-base)", marginBottom: "0.25rem" }}>{item.variants[0].headline}</h4>
          <p style={{ fontSize: "var(--text-sm)", marginBottom: "0.375rem" }}>{item.brand} · {item.product.name} · {item.hook}</p>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{item.variants.length} variants · {item.when}</span>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" variant="secondary" leadingIcon={<Download size={14} />} onClick={() => onDownload(item)}>Download</Button>
          <Button size="sm" variant="ghost" onClick={() => onOpen(item)}>Details</Button>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({
  item,
  isVoicePlaying,
  landingPreviewMode,
  onClose,
  onDownload,
  onLandingPreviewModeChange,
  onToggleVoiceoverPreview,
}: {
  item: HistoryItem;
  isVoicePlaying: boolean;
  landingPreviewMode: PreviewMode;
  onClose: () => void;
  onDownload: (item: HistoryItem) => void;
  onLandingPreviewModeChange: (mode: PreviewMode) => void;
  onToggleVoiceoverPreview: (item: VoiceoverHistoryItem) => void;
}) {
  const TypeIcon = item.type === "Poster" ? ImageIcon : item.type === "Voiceover" ? Mic : item.type === "Landing page" ? Layers3 : FileText;

  return (
    <div className="history-modal-scrim" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="history-modal" role="dialog" aria-modal="true" aria-labelledby={`history-modal-${item.id}`}>
        <div className="row row-between" style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border-subtle)", gap: "0.875rem", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: "0.375rem" }}>
              <span className="badge" style={{ background: "var(--brand-soft)", color: "var(--brand-active)", borderColor: "transparent" }}>
                <TypeIcon size={12} />
                {item.type}
              </span>
              <Badge tone="success">{item.status}</Badge>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{item.when}</span>
            </div>
            <h3 id={`history-modal-${item.id}`} style={{ fontSize: "var(--text-xl)" }}>{item.name}</h3>
            <p style={{ marginTop: 4 }}>{item.brand} · {item.product.name}</p>
          </div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <Button size="sm" variant="secondary" leadingIcon={<Download size={14} />} onClick={() => onDownload(item)}>Download</Button>
            <Button size="sm" variant="ghost" iconOnly leadingIcon={<X size={16} />} aria-label="Close modal" onClick={onClose} />
          </div>
        </div>
        <div className="history-modal-scroll">
          {item.type === "Poster" && <PosterModalBody item={item} />}
          {item.type === "Voiceover" && <VoiceoverModalBody item={item} isPlaying={isVoicePlaying} onToggleVoiceoverPreview={onToggleVoiceoverPreview} />}
          {item.type === "Landing page" && (
            <LandingPageModalBody
              item={item}
              previewMode={landingPreviewMode}
              onPreviewModeChange={onLandingPreviewModeChange}
            />
          )}
          {item.type === "Ad copy" && <AdCopyModalBody item={item} />}
        </div>
      </div>
    </div>
  );
}

function PosterModalBody({ item }: { item: PosterHistoryItem }) {
  return (
    <div className="history-modal-grid">
      <Card style={{ padding: "0.875rem" }}>
        <div className="history-poster-frame">
          <img alt={item.name} src={svgToDataUri(item.previewSvg)} />
        </div>
      </Card>
      <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
        <ProductDetailsCard brand={item.brand} product={item.product} />
        <DetailCard title="Creative details" pairs={[
          ["Primary headline", item.headline],
          ["CTA", item.cta],
          ["Formats", item.formats.join(", ")],
          ["Notes", item.notes],
        ]} />
      </div>
    </div>
  );
}

function VoiceoverModalBody({
  item,
  isPlaying,
  onToggleVoiceoverPreview,
}: {
  item: VoiceoverHistoryItem;
  isPlaying: boolean;
  onToggleVoiceoverPreview: (item: VoiceoverHistoryItem) => void;
}) {
  return (
    <div className="history-modal-grid">
      <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
        <Card style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--brand-soft) 65%, white), white)" }}>
          <div className="row row-between" style={{ alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
            <div>
              <h4 style={{ fontSize: "var(--text-base)", marginBottom: "0.25rem" }}>Voice preview</h4>
              <p>{item.voice} · {item.duration} · {item.language}</p>
            </div>
            <Button size="sm" variant="secondary" leadingIcon={isPlaying ? <Pause size={14} /> : <Play size={14} />} onClick={() => onToggleVoiceoverPreview(item)}>{isPlaying ? "Stop" : "Preview"}</Button>
          </div>
          <div className="history-voice-wave" aria-hidden="true" style={{ marginBottom: "1rem" }}>
            {item.waveform.map((value, index) => (
              <span key={index} className={isPlaying ? "is-playing" : ""} style={{ height: `${value}px`, animationDelay: `${index * 45}ms` }} />
            ))}
          </div>
          <p style={{ fontSize: "var(--text-sm)" }}>{item.angle}</p>
        </Card>
        <Card>
          <h4 style={{ fontSize: "var(--text-base)", marginBottom: "0.75rem" }}>Full script</h4>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", lineHeight: 1.75 }}>{item.script}</p>
        </Card>
      </div>
      <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
        <ProductDetailsCard brand={item.brand} product={item.product} />
        <DetailCard title="Production details" pairs={[
          ["Voice", item.voice],
          ["Language", item.language],
          ["Duration", item.duration],
          ["Angle", item.angle],
          ["Notes", item.notes],
        ]} />
      </div>
    </div>
  );
}

function LandingPageModalBody({
  item,
  previewMode,
  onPreviewModeChange,
}: {
  item: LandingPageHistoryItem;
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
}) {
  return (
    <div className="history-landing-modal-grid">
      <Card style={{ padding: "0.875rem" }}>
        <div className="row row-between" style={{ gap: "0.875rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
          <div>
            <h4 style={{ fontSize: "var(--text-base)" }}>Page preview</h4>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginTop: 2 }}>
              Switch device mode without leaving history.
            </p>
          </div>
          <PreviewModeToggle mode={previewMode} onChange={onPreviewModeChange} label="Modal landing page preview mode" />
        </div>
        <LandingPageDevicePreview mode={previewMode} content={getLandingPreviewContent(item)} title={item.name} />
      </Card>
      <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
        <ProductDetailsCard brand={item.brand} product={item.product} />
        <DetailCard title="Page details" pairs={[
          ["Primary CTA", item.cta],
          ["URL", item.url],
          ["Top angle", item.eyebrow],
          ["Notes", item.notes],
        ]} />
      </div>
    </div>
  );
}

function AdCopyModalBody({ item }: { item: AdCopyHistoryItem }) {
  return (
    <div className="history-modal-grid">
      <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
        {item.variants.map((variant) => (
          <Card key={variant.label} style={{ padding: "1rem" }}>
            <div className="row row-between" style={{ marginBottom: "0.75rem", gap: "0.75rem", flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "var(--brand-soft)", color: "var(--brand-active)", borderColor: "transparent" }}>{variant.label}</span>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>{variant.cta}</span>
            </div>
            <h4 style={{ fontSize: "var(--text-base)", marginBottom: "0.5rem" }}>{variant.headline}</h4>
            <p style={{ fontSize: "var(--text-sm)" }}>{variant.body}</p>
          </Card>
        ))}
      </div>
      <div className="stack" style={{ ["--stack-gap" as never]: "1rem" }}>
        <ProductDetailsCard brand={item.brand} product={item.product} />
        <DetailCard title="Campaign details" pairs={[
          ["Channel", item.channel],
          ["Objective", item.objective],
          ["Hook", item.hook],
          ["Notes", item.notes],
        ]} />
      </div>
    </div>
  );
}

function ProductDetailsCard({ brand, product }: { brand: string; product: ProductSummary }) {
  return (
    <DetailCard title="Related product" pairs={[
      ["Brand", brand],
      ["Product", product.name],
      ["Category", product.category],
      ["Price", product.price],
      ["Audience", product.audience],
      ["Offer", product.offer],
      ["SKU", product.sku],
    ]} />
  );
}

function DetailCard({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return (
    <Card>
      <h4 style={{ fontSize: "var(--text-base)", marginBottom: "0.75rem" }}>{title}</h4>
      {pairs.map(([label, value]) => (
        <div key={label} style={{ padding: "0.625rem 0", borderTop: "1px solid var(--color-border-subtle)" }}>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>{value}</div>
        </div>
      ))}
    </Card>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <Card style={{ textAlign: "center", padding: "4rem 2rem" }}>
      <span style={{ display: "inline-flex", width: 56, height: 56, borderRadius: "50%", background: "var(--brand-soft)", color: "var(--brand-active)", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
        <Sparkles size={22} />
      </span>
      <h3 style={{ fontSize: "var(--text-lg)" }}>No history matches the current filters</h3>
      <p style={{ marginTop: "0.5rem" }}>Try clearing the search or switching back to all output types.</p>
      <div className="row" style={{ justifyContent: "center", gap: 8, marginTop: "1.25rem", flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={onClear}>Clear filters</Button>
        <Link href="/dashboard/generate">
          <Button variant="primary">New generation</Button>
        </Link>
      </div>
    </Card>
  );
}

function getSearchText(item: HistoryItem) {
  const common = [item.name, item.brand, item.type, item.notes, item.product.name, item.product.category, item.product.offer, item.product.audience, item.product.sku];
  if (item.type === "Poster") return [...common, item.headline, item.cta, ...item.formats].join(" ").toLowerCase();
  if (item.type === "Voiceover") return [...common, item.voice, item.duration, item.language, item.angle, item.script].join(" ").toLowerCase();
  if (item.type === "Landing page") return [...common, item.url, item.cta, item.eyebrow, item.headline, item.body, ...item.highlights, ...item.sections.flatMap((section) => [section.title, section.body])].join(" ").toLowerCase();
  return [...common, item.channel, item.objective, item.hook, ...item.variants.flatMap((variant) => [variant.label, variant.headline, variant.body, variant.cta])].join(" ").toLowerCase();
}

function getLandingPreviewContent(item: LandingPageHistoryItem) {
  return {
    brand: item.brand,
    eyebrow: item.eyebrow,
    price: item.product.price,
    headline: item.headline,
    body: item.body,
    cta: item.cta,
    url: item.url,
    highlights: item.highlights,
    sections: item.sections,
  };
}

function createPosterPreview({
  brand,
  title,
  body,
  accentA,
  accentB,
  chip,
}: {
  brand: string;
  title: string;
  body: string;
  accentA: string;
  accentB: string;
  chip: string;
}) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" fill="none">
      <defs>
        <linearGradient id="bg" x1="120" y1="80" x2="980" y2="1230" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accentA}" />
          <stop offset="1" stop-color="${accentB}" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1350" fill="#08111f" />
      <circle cx="150" cy="180" r="260" fill="${accentA}" fill-opacity="0.35" />
      <circle cx="930" cy="1160" r="300" fill="${accentB}" fill-opacity="0.32" />
      <rect x="78" y="88" width="924" height="1174" rx="44" fill="url(#bg)" />
      <rect x="78" y="88" width="924" height="1174" rx="44" fill="black" fill-opacity="0.16" />
      <rect x="138" y="150" width="190" height="48" rx="24" fill="white" fill-opacity="0.2" />
      <text x="233" y="181" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" text-anchor="middle">${escapeSvgText(chip.toUpperCase())}</text>
      <text x="138" y="280" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="24" letter-spacing="3">${escapeSvgText(brand.toUpperCase())}</text>
      <text x="138" y="392" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="700">${escapeSvgText(title)}</text>
      <text x="138" y="472" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="38">${escapeSvgText(body)}</text>
      <rect x="138" y="580" width="804" height="430" rx="36" fill="white" fill-opacity="0.68" />
      <rect x="202" y="646" width="230" height="230" rx="48" fill="${accentA}" fill-opacity="0.4" />
      <rect x="344" y="618" width="318" height="280" rx="60" fill="white" fill-opacity="0.86" />
      <rect x="694" y="646" width="184" height="184" rx="40" fill="${accentB}" fill-opacity="0.32" />
      <rect x="138" y="1068" width="804" height="92" rx="30" fill="white" fill-opacity="0.18" />
      <text x="540" y="1125" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" text-anchor="middle">Tap to shop the full set</text>
    </svg>
  `;
}

function createLandingPreview({
  brand,
  eyebrow,
  headline,
  accentA,
  accentB,
}: {
  brand: string;
  eyebrow: string;
  headline: string;
  accentA: string;
  accentB: string;
}) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" fill="none">
      <defs>
        <linearGradient id="hero" x1="160" y1="160" x2="1080" y2="760" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accentA}" stop-opacity="0.18" />
          <stop offset="1" stop-color="${accentB}" stop-opacity="0.2" />
        </linearGradient>
      </defs>
      <rect width="1440" height="960" fill="#F8FAFC" />
      <rect x="110" y="70" width="1220" height="820" rx="36" fill="white" stroke="#E5E7EB" />
      <rect x="110" y="70" width="1220" height="72" rx="36" fill="#F1F5F9" />
      <circle cx="166" cy="106" r="9" fill="#CBD5E1" />
      <circle cx="196" cy="106" r="9" fill="#CBD5E1" />
      <circle cx="226" cy="106" r="9" fill="#CBD5E1" />
      <rect x="166" y="180" width="1108" height="270" rx="28" fill="url(#hero)" />
      <rect x="210" y="220" width="210" height="42" rx="21" fill="white" fill-opacity="0.88" />
      <text x="315" y="247" fill="#0F172A" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" text-anchor="middle">${escapeSvgText(eyebrow)}</text>
      <text x="210" y="330" fill="#0F172A" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700">${escapeSvgText(brand)}</text>
      <text x="210" y="398" fill="#334155" font-family="Arial, Helvetica, sans-serif" font-size="34">${escapeSvgText(headline)}</text>
      <rect x="210" y="444" width="210" height="56" rx="28" fill="#111827" />
      <text x="315" y="478" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" text-anchor="middle">Open preview</text>
      <rect x="166" y="500" width="340" height="156" rx="22" fill="#F8FAFC" stroke="#E5E7EB" />
      <rect x="550" y="500" width="340" height="156" rx="22" fill="#F8FAFC" stroke="#E5E7EB" />
      <rect x="934" y="500" width="340" height="156" rx="22" fill="#F8FAFC" stroke="#E5E7EB" />
      <rect x="166" y="706" width="1108" height="116" rx="22" fill="#F8FAFC" stroke="#E5E7EB" />
    </svg>
  `;
}

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function downloadBlob(filename: string, content: string, mimeType: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function buildVoiceoverText(item: VoiceoverHistoryItem) {
  return [
    item.name,
    `${item.brand} · ${item.product.name}`,
    "",
    `Voice: ${item.voice}`,
    `Language: ${item.language}`,
    `Duration: ${item.duration}`,
    `Angle: ${item.angle}`,
    `Offer: ${item.product.offer}`,
    "",
    "Script",
    item.script,
  ].join("\n");
}

function buildAdCopyText(item: AdCopyHistoryItem) {
  return [
    item.name,
    `${item.brand} · ${item.product.name}`,
    "",
    `Channel: ${item.channel}`,
    `Objective: ${item.objective}`,
    `Hook: ${item.hook}`,
    "",
    ...item.variants.flatMap((variant) => [
      variant.label,
      `Headline: ${variant.headline}`,
      `Body: ${variant.body}`,
      `CTA: ${variant.cta}`,
      "",
    ]),
  ].join("\n");
}

function buildLandingPageHtml(item: LandingPageHistoryItem) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(item.name)}</title>
    <style>
      body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #f8fafc; line-height: 1.6; }
      .wrap { max-width: 1080px; margin: 0 auto; padding: 48px 20px 72px; }
      .hero { background: linear-gradient(135deg, rgba(109,74,255,0.12), rgba(94,210,255,0.16)); border: 1px solid #dbe3ef; border-radius: 28px; padding: 40px; }
      .chip { display: inline-block; padding: 8px 14px; border-radius: 999px; background: white; border: 1px solid #dbe3ef; margin-right: 8px; margin-bottom: 10px; font-size: 12px; }
      h1 { font-size: 48px; line-height: 1.1; margin: 18px 0 12px; }
      h2 { font-size: 28px; margin: 0 0 10px; }
      p { color: #334155; }
      .cta { display: inline-block; margin-top: 18px; background: #111827; color: white; padding: 14px 22px; border-radius: 999px; text-decoration: none; font-weight: 700; }
      .sections { display: grid; gap: 16px; margin-top: 24px; }
      .panel { background: white; border: 1px solid #e5e7eb; border-radius: 20px; padding: 20px; }
    </style>
  </head>
  <body>
    <main class="wrap">
      <section class="hero">
        <span class="chip">${escapeHtml(item.eyebrow)}</span>
        <span class="chip">${escapeHtml(item.product.price)}</span>
        <h1>${escapeHtml(item.headline)}</h1>
        <p>${escapeHtml(item.body)}</p>
        <a class="cta" href="#">${escapeHtml(item.cta)}</a>
      </section>
      <section class="sections">
        ${item.sections.map((section) => `<article class="panel"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></article>`).join("")}
      </section>
    </main>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

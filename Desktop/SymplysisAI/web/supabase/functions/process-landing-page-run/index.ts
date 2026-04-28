import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const LOCK_SECONDS = 240;
const MAX_RETRIES = 6;
const DEFAULT_TEXT_MODEL = "gemini-3.1-flash-lite-preview";
const DEFAULT_IMAGE_MODEL = "gemini-3-pro-image-preview";
const LANDING_PAGE_ASSETS_BUCKET = "landing-page-assets";
const SECTION_ORDER = ["hero", "description", "features", "benefits", "faq", "reviews", "guarantees", "pricing", "footer"] as const;

type SectionType = (typeof SECTION_ORDER)[number];

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  description: "Description",
  features: "Features",
  benefits: "Benefits",
  faq: "FAQ",
  reviews: "Reviews",
  guarantees: "Guarantees",
  pricing: "Pricing",
  footer: "Footer",
};

type RunRecord = {
  id: string;
  user_id: string;
  workspace_id: string;
  workspace_item_id: string | null;
  title: string | null;
  status: string;
  workspace_name: string | null;
  workspace_item_title: string | null;
  workspace_item_kind: string | null;
  language: string | null;
  framework: string | null;
  model_name: string | null;
  prompt_snapshot: unknown;
  results: unknown;
  usage: unknown;
  job_payload: unknown;
  job_state: unknown;
  last_error: string | null;
  retry_count: number;
  processor_token: string | null;
  cancel_requested_at: string | null;
};

type SectionResult = {
  sectionType: SectionType;
  label: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  body: string;
  bullets: string[];
  cta: string;
  proof: string;
  layoutNote: string;
  imageUrl: string | null;
  imagePrompt: string;
};

type ResultsPayload = {
  productImageUrl: string | null;
  imageSource: "workspace_item" | "upload";
  accentColor: string | null;
  framework: string;
  frameworkLabel: string;
  language: string;
  sections: SectionResult[];
};

type StyleLockRecord = {
  mood: string;
  fontFamily: string;
  headlineTreatment: string;
  bodyTreatment: string;
  ctaStyle: string;
  backgroundDescription: string;
  dominantColor: string;
  secondaryColors: string[];
  texture: string;
  particles: string;
  layoutDescription: string;
  productTreatment: string;
  uniqueElements: string;
};

type EdgeChainRecord = {
  bottomEdge: {
    description: string;
    bottomPixelColor: string;
    gradientDirection: string;
    texture: string;
    elements: string[];
  };
};

type JobState = {
  nextSectionIndex: number;
  styleLock: StyleLockRecord | null;
  prevEdge: EdgeChainRecord | null;
  sectionPrompts: Record<string, string>;
  imagePrompts: Record<string, string>;
  analysisPrompts: Record<string, string>;
  sectionsCompleted: number;
};

type JobPayload = {
  workspace: Record<string, unknown>;
  item: Record<string, unknown>;
  config: {
    language: string;
    frameworkKey: string;
    accentColor: string | null;
    imageUrl: string | null;
    imageSource: "workspace_item" | "upload";
    textModel: string;
    imageModel: string;
  };
  sectionOrder: string[];
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.map((entry) => cleanString(entry)).filter(Boolean);
}

function normalizeSectionPayload(value: unknown): SectionResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const sectionType = cleanString(record.sectionType) as SectionType;
  if (!SECTION_ORDER.includes(sectionType)) return null;
  return {
    sectionType,
    label: cleanString(record.label) || SECTION_LABELS[sectionType],
    eyebrow: cleanString(record.eyebrow),
    heading: cleanString(record.heading),
    subheading: cleanString(record.subheading),
    body: cleanString(record.body),
    bullets: cleanStringArray(record.bullets).slice(0, 4),
    cta: cleanString(record.cta),
    proof: cleanString(record.proof),
    layoutNote: cleanString(record.layoutNote),
    imageUrl: cleanString(record.imageUrl) || null,
    imagePrompt: cleanString(record.imagePrompt),
  };
}

function normalizeResults(value: unknown): ResultsPayload {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  return {
    productImageUrl: cleanString(record.productImageUrl) || null,
    imageSource: cleanString(record.imageSource) === "upload" ? "upload" : "workspace_item",
    accentColor: cleanString(record.accentColor) || null,
    framework: cleanString(record.framework) || "aida",
    frameworkLabel: cleanString(record.frameworkLabel) || "AIDA",
    language: cleanString(record.language) || "English",
    sections: Array.isArray(record.sections)
      ? record.sections.map((entry) => normalizeSectionPayload(entry)).filter((entry): entry is SectionResult => Boolean(entry))
      : [],
  };
}

function normalizeJobState(value: unknown): JobState {
  const record = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  return {
    nextSectionIndex: typeof record.nextSectionIndex === "number" ? record.nextSectionIndex : 0,
    styleLock: record.styleLock && typeof record.styleLock === "object" ? (record.styleLock as StyleLockRecord) : null,
    prevEdge: record.prevEdge && typeof record.prevEdge === "object" ? (record.prevEdge as EdgeChainRecord) : null,
    sectionPrompts: record.sectionPrompts && typeof record.sectionPrompts === "object" ? (record.sectionPrompts as Record<string, string>) : {},
    imagePrompts: record.imagePrompts && typeof record.imagePrompts === "object" ? (record.imagePrompts as Record<string, string>) : {},
    analysisPrompts: record.analysisPrompts && typeof record.analysisPrompts === "object" ? (record.analysisPrompts as Record<string, string>) : {},
    sectionsCompleted: typeof record.sectionsCompleted === "number" ? record.sectionsCompleted : 0,
  };
}

function normalizeJobPayload(value: unknown): JobPayload | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const config = record.config && typeof record.config === "object" && !Array.isArray(record.config)
    ? (record.config as Record<string, unknown>)
    : null;
  if (!config) return null;
  return {
    workspace: record.workspace && typeof record.workspace === "object" && !Array.isArray(record.workspace)
      ? (record.workspace as Record<string, unknown>)
      : {},
    item: record.item && typeof record.item === "object" && !Array.isArray(record.item)
      ? (record.item as Record<string, unknown>)
      : {},
    config: {
      language: cleanString(config.language) || "English",
      frameworkKey: cleanString(config.frameworkKey) || "aida",
      accentColor: cleanString(config.accentColor) || null,
      imageUrl: cleanString(config.imageUrl) || null,
      imageSource: cleanString(config.imageSource) === "upload" ? "upload" : "workspace_item",
      textModel: cleanString(config.textModel) || DEFAULT_TEXT_MODEL,
      imageModel: cleanString(config.imageModel) || DEFAULT_IMAGE_MODEL,
    },
    sectionOrder: Array.isArray(record.sectionOrder)
      ? record.sectionOrder.map((entry) => cleanString(entry)).filter(Boolean)
      : [...SECTION_ORDER],
  };
}

function getFrameworkLabel(value: string) {
  switch (value) {
    case "pas":
      return "PAS";
    case "storybrand":
      return "StoryBrand";
    case "proof-stack":
      return "Proof Stack";
    case "objection-crusher":
      return "Objection Crusher";
    default:
      return "AIDA";
  }
}

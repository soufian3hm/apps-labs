# SymplysisAI — Frontend

A pure-frontend Next.js 15 build of the SymplysisAI marketing + product UI, designed per `.rules/buildlogic.txt` and the product spec in `.rules/requirement.txt`. **Light mode only. No backend, no DB — all data is mocked.** Forms and buttons are visual; wire when ready.

## Stack
- **Next.js (App Router)** + **TypeScript**
- **React 19**
- **lucide-react** icons
- **Plus Jakarta Sans** via `next/font` (avoids the Inter / Roboto / system-ui "AI tells")
- **Vanilla CSS** with a layered design system (`@layer reset, tokens, base, components, utilities`) — OKLCH color, `clamp()` typography, container queries, no Tailwind soup

## Run
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Routes
| Path | What |
|---|---|
| `/` | Marketing landing — hero, social proof, features, how-it-works, testimonials, pricing, FAQ, CTA, footer |
| `/pricing` | Pricing + full feature comparison + FAQ + CTA |
| `/login`, `/signup` | Two-column auth (brand panel + form). Social login + password strength |
| `/dashboard` | KPI cards, recent generations, quick start, tip widgets |
| `/dashboard/generate` | 4-step generator: upload → brand context → choose assets → refine sections |
| `/dashboard/history` | Filterable, sortable, bulk-selectable project table with empty state |
| `/dashboard/settings` | Tabs: Profile, Workspace, Brand voice, Billing, Members, API + Danger zone |
| `/_404` | Branded 404 |

## Design system

All tokens live in [`app/globals.css`](app/globals.css):
- **Color** — OKLCH, single accent (`--brand`), warm-cool grays, semantic surfaces
- **Type** — fluid `clamp()` scale, no arbitrary sizes, 16px+ body
- **Spacing** — 4px base scale, fluid section padding
- **Radius / shadow** — consistent 6/8/12/16/24, layered shadows
- **Motion** — 4 easings, 4 durations, full `prefers-reduced-motion` respect

## Buildlogic anti-slop checks
- No Inter / Roboto / system-ui as primary
- One dominant accent color, supporting tones only
- Real hover / active / focus / disabled states on every interactive element
- Empty states wherever a list could be empty
- Skeletons available in `globals.css` (`.skeleton`)
- Visible focus rings, skip link, semantic landmarks, ARIA on icon-only buttons
- Touch targets ≥ 40px, mobile breakpoints handled per component

## File map
```
app/
  layout.tsx, globals.css, page.tsx, not-found.tsx
  (auth)/layout.tsx, login/, signup/
  dashboard/layout.tsx, page.tsx, generate/, history/, settings/
  pricing/
components/
  ui/        Button, Input, Card, Badge, Logo
  marketing/ Nav, Hero, SocialProof, Features, HowItWorks, Testimonials, PricingTable, FAQ, CTA, Footer
  dashboard/ Sidebar, Topbar
lib/cn.ts
```

## Notes for wiring later
- Auth forms POST nowhere — add a server action or API route in `app/(auth)/*/page.tsx`
- Generator state is local React state — replace with server state when you wire the AI pipeline
- History data is hardcoded in `app/dashboard/history/page.tsx`
- No theme toggle (light only by request)

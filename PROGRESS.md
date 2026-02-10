# Comp'd — Build Progress

## Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Backend | Convex | Real-time database, mutations, queries, auth |
| Web | Next.js 16 + Tailwind | Business dashboard |
| Mobile | Expo SDK 54 + Expo Router | Creator app |
| Auth | Clerk | JWT-based auth, "convex" JWT template |
| Payments | Stripe (demo mode) | Deposits, fees, payouts |
| Design | @compd/design-tokens | Colors, typography, spacing, shadows |

**Monorepo structure:** npm workspaces — `apps/web`, `apps/mobile`, `packages/design-tokens`, `convex/` at root.

---

## Phase 1: Foundation — COMPLETE

- [x] Monorepo scaffold (npm workspaces, root tsconfig, .gitignore)
- [x] `packages/design-tokens/` — 8 token files (colors, typography, spacing, radius, shadows, motion, theme)
- [x] Convex schema — 11 tables, 34 indexes (`convex/schema.ts`)
  - users, businesses, creators, offers, deals, messages, notifications, contentArchives, disputes, scheduledJobs, blocks
- [x] Convex auth — Clerk JWT provider (`convex/auth.config.ts`)
- [x] Shared helpers — `requireUser`, `getBusinessForUser`, `getCreatorForUser` (`convex/helpers.ts`)
- [x] User management — store/sync, getCurrent, setRole (`convex/users.ts`)
- [x] Business profiles — create, getCurrent, update (`convex/businesses.ts`)
- [x] Creator profiles — create, getCurrent, update (`convex/creators.ts`)
- [x] Seed data — 5 businesses, 10 creators, 8 offers, 15 deals (`convex/seed.ts`, run with `npx convex run seed:populate`)
- [x] **Web app** — Next.js 16 with App Router, Tailwind v4, Clerk middleware
  - Root layout with DM Serif Display + DM Sans fonts
  - ClerkProvider → ConvexProviderWithClerk
  - Sign-in / sign-up pages (Clerk components)
  - Onboarding — role select (business/creator) → business setup or creator redirect
  - `@convex/*` tsconfig path alias for clean imports
- [x] **Mobile app** — Expo with Expo Router, Clerk token cache
  - Root layout with font loading + auth gate
  - Sign-in / sign-up screens
  - Onboarding — role select → business setup / creator setup
  - Tab navigator (Explore, Deals, Profile)

---

## Phase 2: Offer Management — COMPLETE

- [x] `convex/offers.ts` — Full CRUD with state machine (draft/active/paused/archived)
  - create, update, publish, pause, resume, archive mutations
  - discover query (for creators — filters by category, geo, tier)
  - listByCurrentBusiness, getById queries
- [x] **Web** — Offers list with filter tabs (All/Active/Draft/Paused), action menus
- [x] **Web** — 4-step offer creation wizard (what you provide → content requirements → availability → visibility)
- [x] **Web** — Offer detail page with compensation, requirements, stats, state actions
- [x] **Mobile** — Explore tab with horizontal category filter chips, offer cards
- [x] **Mobile** — Offer detail screen with business info, value card, content requirements, availability, "Apply" button

---

## Phase 3: Deal Flow — COMPLETE

- [x] `convex/deals.ts` — Full 14-state state machine with validated transitions
  - States: applied → approved → checked_in → redeemed → content_pending → content_submitted → content_verified → business_reviewed → completed
  - Terminal: declined, cancelled, no_show, expired, unfulfilled, disputed
  - Mutations: apply, approve, decline, cancel, checkIn, confirmService, submitContent, approveContent, requestRevision, complete, rateCreator, rateBusiness
  - Queries: getById (enriched), listByBusiness, listByCreator, listApplications
- [x] `convex/messages.ts` — Deal chat (send, listByDeal, markRead)
- [x] **Web** — Deals list with tabs (All/Applications/Active/Review/Completed), state badges, inline actions
- [x] **Web** — Deal detail with creator info, contract terms, content URLs, revision form, rating form, real-time chat sidebar
- [x] **Web** — Content library page (deals with submitted content)
- [x] **Mobile** — Deals tab with Active/Pending/Past filters
- [x] **Mobile** — Deal detail with Details/Chat tab switcher, check-in form, content submission, cancel, rating

---

## Phase 4: Dashboards + Notifications — COMPLETE

- [x] `convex/notifications.ts` — create (internal), send, list, unreadCount, markRead, markAllRead
- [x] Notification triggers on all deal mutations:
  - apply → notify business
  - approve → notify creator
  - decline → notify creator
  - cancel → notify other party
  - submitContent → notify business
  - approveContent → notify creator
  - requestRevision → notify creator
  - complete → notify both parties
- [x] `convex/analytics.ts` — businessDashboard query (aggregated offers/deals/stats/recent activity)
- [x] **Web** — NotificationBell component (dropdown, unread badge, mark-all-read, click-to-navigate)
- [x] **Web** — Dashboard top header bar with notification bell + UserButton
- [x] **Web** — Dashboard overview with action alerts, 7 stat cards, recent activity feed
- [x] **Web** — Settings page (business info, location, online presence, account stats)
- [x] **Mobile** — Notifications screen with unread indicators, mark-all-read, tap-to-navigate
- [x] **Mobile** — Notification bell with unread badge on Explore, Deals, and Profile headers

---

## Phase 5: Payments + Polish — COMPLETE (demo mode)

### Disputes
- [x] `convex/disputes.ts` — create, getByDeal, resolve mutations
  - Business can dispute from content_verified state
  - Creator can dispute from revision_requested state
  - Transitions deal to "disputed" state
  - Resolution resolves deal as completed or unfulfilled
  - Notifications to both parties on open/resolve
- [x] **Web** — Dispute UI on deal detail (open form, dispute info card, resolve buttons)
- [x] **Mobile** — Dispute UI on deal detail (open form, dispute info card)

### Payments (demo mode)
- [x] `convex/payments.ts` — Full skeleton with demo mode
  - createBusinessStripeAccount — stores placeholder account ID
  - holdDeposit — marks deposit as "held" on approve
  - releaseDeposit — marks deposit as "released" on complete
  - captureDeposit — marks deposit as "forfeited" on no-show
  - calculatePlatformFee — 15%/12%/10% based on business tier
  - getDealPaymentSummary, getBusinessPaymentStatus queries
- [x] Payment lifecycle wired into deal mutations (approve → hold, complete → release + fee)
- [x] **Web** — Payment card on deal detail (barter value, deposit status badges, platform fee, "DEMO MODE" label)
- [x] **Web** — Payments & Billing section on settings (Connect with Stripe, fee rate, plan info)
- [x] **Mobile** — Payment card on deal detail with deposit status indicators

### Polish
- [x] **Mobile** — Enhanced profile with avatar, trust tier progress bar, 4 performance metrics, social accounts, notification bell
- [x] **Web** — Landing page redesign (stan.store-inspired) — bold coral gradient hero with floating card composition, SocialProof (tilted profile cards), testimonial masonry wall (CSS columns), "$0 Cash Required" BigStat callout, "Not Just Another Marketplace" HowItWorks with decorative step numbers, Comparison table (traditional vs Comp'd), 3 FeatureShowcase sections with app mockups (trust tiers, deal tracking, content verification), clean CTA, minimal footer. ScrollReveal + CSS keyframe animations, prefers-reduced-motion support. 12 component files.
- [x] **Web** — Onboarding role selection (business → setup, creator → mobile redirect)

---

## Phase 6: Social Integration + Onboarding Polish — COMPLETE

### Schema + Duplicate Prevention
- [x] Added `by_instagram_handle` index to businesses table
- [x] Added `by_instagram_handle` and `by_tiktok_handle` indexes to creators table
- [x] `ENFORCE_SOCIAL_ELIGIBILITY = false` feature flag in `convex/constants.ts`
- [x] `convex/socialAuth.ts` — `checkHandleDuplicate` query, `connectInstagram`/`connectTikTok`/`disconnectInstagram`/`disconnectTikTok` mutations, `updateCreatorMetrics` internalMutation. Duplicate handle prevention via index queries.

### OAuth Infrastructure
- [x] `convex/http.ts` — HTTP router with Instagram/TikTok OAuth callback endpoints + Meta deauthorize endpoint
  - `POST /auth/instagram/callback` — code→token exchange (short→long-lived)
  - `POST /auth/tiktok/callback` — code→token exchange via TikTok API
  - `POST /auth/instagram/deauthorize` — Meta-required deauth callback
- [x] `apps/mobile/lib/instagramAuth.ts` — expo-auth-session OAuth2 flow to Instagram
- [x] `apps/mobile/lib/tiktokAuth.ts` — expo-auth-session OAuth2 flow to TikTok
- [x] Installed: `expo-auth-session`, `expo-web-browser`, `expo-location`, `expo-image-picker`

### Geolocation + Image Uploads
- [x] `apps/mobile/lib/geolocation.ts` — `getCurrentLocation()`, `geocodeAddress()`, `reverseGeocode()` using expo-location
- [x] `convex/files.ts` — `generateUploadUrl` mutation + `getUrl` query (Convex built-in storage)
- [x] `apps/mobile/lib/imagePicker.ts` — `pickImage()` + `uploadToConvex()` helpers
- [x] Updated `app.json` with expo-location and expo-image-picker plugins + permission strings

### Creator Onboarding Redesign (Mobile)
- [x] `apps/mobile/components/OnboardingWizard.tsx` — shared wizard with progress bar, step dots, back/next nav
- [x] Rewrote `apps/mobile/app/onboarding/creator-setup.tsx` as 4-step wizard:
  - Step 1 — About You: profile photo upload, bio, content niches
  - Step 2 — Location: city/state with "Use my location" GPS button + geocoding
  - Step 3 — Connect Accounts: Instagram/TikTok OAuth buttons with manual handle fallback, duplicate detection
  - Step 4 — Review: summary of all data, "Complete Setup" CTA

### Business Onboarding Parity
- [x] Rewrote `apps/mobile/app/onboarding/business-setup.tsx` with photo uploads (up to 5), geocoding, website field
- [x] Updated `apps/web/src/app/onboarding/page.tsx` — shared CATEGORIES from constants, added website + Google Business URL fields

### Social Account Management + Settings
- [x] Created `apps/mobile/app/(app)/settings.tsx` — connected accounts section (IG/TikTok status, metrics, disconnect)
- [x] Updated `apps/mobile/app/(app)/(tabs)/profile.tsx` — gear icon linking to settings
- [x] Updated `apps/web/src/app/dashboard/settings/page.tsx` — connected accounts section with connect/disconnect

### Eligibility Enforcement + Cron Jobs
- [x] Updated `convex/deals.ts` `apply` mutation — eligibility check using `ENFORCE_SOCIAL_ELIGIBILITY` flag + `checkCreatorEligibility()`
- [x] Created `convex/socialMetrics.ts` — `refreshAll` internalAction (fetches updated IG/TikTok metrics for connected creators)
- [x] Created `convex/crons.ts` — daily cron at 06:00 UTC calling `socialMetrics.refreshAll`
- [x] Updated `apps/mobile/app/(app)/offer/[id].tsx` — eligibility banner when no social accounts connected

### Attribution, ROI & Content Metrics
- [x] Created `convex/contentMetrics.ts` — `fetchPostMetrics` internalAction (IG + TikTok APIs), `updateArchiveMetrics` internalMutation
- [x] Created `apps/web/src/app/dashboard/attribution/page.tsx` — full attribution dashboard with summary stats, filter tabs, codes table, revenue reporting form, per-creator breakdown
- [x] Updated `apps/web/src/app/dashboard/layout.tsx` — added Attribution nav item

### Note on Social OAuth
Instagram/TikTok OAuth requires Meta App Review and TikTok Developer Portal approval. All code infrastructure is built and ready to enable. Set env vars (`META_APP_ID`, `META_APP_SECRET`, `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`) and flip `ENFORCE_SOCIAL_ELIGIBILITY = true` when approved.

---

## Code Quality Cleanup — COMPLETE

### Runtime Fixes
- [x] Fixed DMSans_600SemiBold → DMSans_700Bold across all mobile screens (font was never loaded)
- [x] Fixed deposit amounts (new=$10, established=$15) — were backwards from spec
- [x] Replaced `<style jsx>` in settings page with Tailwind classes (Turbopack compat)

### Shared Constants & Config
- [x] `convex/constants.ts` — DEAL_STATES, OFFER_STATES, VALID_DEAL_TRANSITIONS, DEPOSIT_AMOUNTS, FEE_RATES, TERMINAL_DEAL_STATES, NOTIFICATION_TYPES
- [x] `apps/mobile/lib/constants.ts` — STATE_CONFIG, CATEGORIES, NICHES, COMP_TYPE_LABELS, state group arrays
- [x] `apps/mobile/lib/theme.ts` — Design token re-exports for mobile
- [x] `apps/web/src/lib/constants.ts` — STATE_CONFIG, CATEGORIES, COMP_TYPE_LABELS, timeAgo(), isValidUrl()

### Shared Components
- [x] `apps/web/src/components/ui/LoadingState.tsx` — Replaced inline loading divs across 6 pages
- [x] `apps/web/src/components/ui/EmptyState.tsx` — Reusable empty state with icon
- [x] `apps/web/src/components/ui/StateBadge.tsx` — Deal/offer state badge
- [x] `apps/mobile/components/LoadingState.tsx` — Consistent loading spinner
- [x] `apps/mobile/components/EmptyState.tsx` — Empty state with icon
- [x] `apps/mobile/components/StateBadge.tsx` — State badge with colors
- [x] `apps/mobile/components/NotificationBadge.tsx` — Bell icon with unread count

### Type Safety
- [x] Removed all `as any` casts (was ~30 instances across 12 files)
- [x] Typed seed.ts arrays with `Id<T>` instead of `string[]`
- [x] Typed all deal/offer mutation parameters with `Id<"deals">` / `Id<"offers">`
- [x] Typed `addStateTransition` deal parameter properly
- [x] Terminal state checks use `(TERMINAL_DEAL_STATES as readonly string[]).includes()` pattern

### Error Handling
- [x] Replaced all 13 `alert()` calls with `setError()` + inline error banners (6 files)
- [x] Added `useState("")` error state to all action-heavy pages

### Security
- [x] Auth ownership check on `deals.getById` — caller must be business owner or creator
- [x] Visibility validation on `deals.apply` — enforces `established_plus` and `trusted_plus` tier gating
- [x] `messages.ts` — already had auth checks on send and listByDeal
- [x] Security headers in `next.config.ts` (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy)

### Brand Consistency
- [x] Replaced Tailwind default colors with brand palette on dashboard (amber→accent, teal→secondary, etc.)

---

## UI Polish — COMPLETE

- [x] **Mobile** — Fixed filter chip clipping on Explore tab (flexGrow/flexShrink: 0, increased padding)
- [x] **Mobile** — Smooth native navigation transitions using `react-native-screens` (no new dependencies)
  - Auth stack: `animation: "fade"`
  - Onboarding stack: `animation: "slide_from_right"`
  - Tab navigator: `animation: "shift"`
- [x] **Mobile** — Fixed Profile tab duplicate header (added `headerShown: false`, matches Explore/Deals pattern)

---

## File Inventory

### Convex Backend (23 files)
| File | Purpose |
|------|---------|
| `schema.ts` | 13 tables, 40+ indexes (incl. by_instagram_handle, by_tiktok_handle) |
| `auth.config.ts` | Clerk JWT provider |
| `constants.ts` | Shared constants (states, transitions, fees, revision reasons, quality tiers, eligibility, ENFORCE_SOCIAL_ELIGIBILITY flag) |
| `helpers.ts` | Shared auth utilities |
| `users.ts` | User store/sync, getCurrent, setRole |
| `businesses.ts` | Business CRUD |
| `creators.ts` | Creator CRUD |
| `offers.ts` | Offer CRUD, state machine, discover |
| `deals.ts` | 14-state deal state machine, all mutations (+ revision limits, auto-approve, attribution wiring, eligibility enforcement) |
| `messages.ts` | Deal chat |
| `notifications.ts` | Notification CRUD |
| `analytics.ts` | Dashboard aggregation |
| `payments.ts` | Stripe skeleton (demo mode) |
| `disputes.ts` | Dispute lifecycle |
| `attribution.ts` | Attribution code generation, tracking, business summary |
| `reputation.ts` | Trust tier calculation, reliability scoring, quality thresholds, eligibility checks |
| `contentArchives.ts` | Content library queries, filtering, categorization |
| `socialAuth.ts` | Instagram/TikTok connect/disconnect mutations, duplicate handle prevention |
| `socialMetrics.ts` | Cron-driven IG/TikTok metrics refresh for connected creators |
| `contentMetrics.ts` | Fetch post metrics (likes/comments/views) from social APIs |
| `http.ts` | HTTP router — OAuth callbacks (Instagram, TikTok), deauthorize endpoint |
| `files.ts` | Convex file storage — generateUploadUrl + getUrl |
| `crons.ts` | Daily cron (06:00 UTC social metrics refresh) |
| `seed.ts` | Demo data (including attribution codes) |

### Web App (15 pages + 5 components)
| Page | Purpose |
|------|---------|
| Landing | Hero, how it works, features, CTA |
| Sign-in/Sign-up | Clerk auth |
| Onboarding | Role select → business setup (with website/Google Business URL) or creator redirect |
| Dashboard | Analytics overview with stat cards + activity feed |
| Offers list | Filter tabs, state management, action menus |
| Offer create | 4-step wizard |
| Offer detail | Full offer with stats and actions |
| Deals list | Filter tabs, inline approve/decline |
| Deal detail | Creator info, contract, payment, content, chat, disputes |
| Content library | Content submissions grid |
| Attribution | Full attribution dashboard with filters, revenue reporting, per-creator ROI |
| Settings | Business profile editor, connected accounts, payments, account stats |

### Mobile App (17 screens + 1 shared component)
| Screen | Purpose |
|--------|---------|
| Auth (sign-in/sign-up) | Clerk auth |
| Onboarding (3 screens) | Role select, business setup (photos/GPS), creator setup (4-step wizard) |
| Explore tab | Offer discovery with category filters |
| Deals tab | Active/Pending/Past deal filters |
| Profile tab | Trust tier progress, stats, social, gear → settings |
| Offer detail | Full offer with apply button + eligibility banner |
| Deal detail | Details/Chat tabs, actions, payment info, disputes |
| Notifications | Notification list with unread indicators |
| Settings | Connected accounts management (IG/TikTok connect/disconnect) |

### Mobile Libraries (5 files)
| File | Purpose |
|------|---------|
| `lib/instagramAuth.ts` | expo-auth-session OAuth2 flow for Instagram |
| `lib/tiktokAuth.ts` | expo-auth-session OAuth2 flow for TikTok |
| `lib/geolocation.ts` | GPS location, geocoding, reverse geocoding |
| `lib/imagePicker.ts` | Image picking + upload to Convex storage |
| `components/OnboardingWizard.tsx` | Shared wizard with progress bar, step dots, navigation |

---

## Outstanding Items

### High Priority — Required for Launch

- [ ] **Real Stripe integration** — Install `stripe` package, add `STRIPE_SECRET_KEY`, uncomment real Stripe calls in `convex/payments.ts`. Need: Stripe account + Connect setup.
- [ ] **Production deployment** — EAS Build for mobile (App Store + Google Play), Vercel for web, production Convex deploy. Need: production Clerk + Convex keys.
- [ ] **Push notifications (Expo)** — Register push tokens, store in users table, send via Expo Push API on deal events. Currently only in-app notifications.
- [ ] **Meta App Review + TikTok Developer Portal** — OAuth code is built, need platform approval to enable real social verification. Set env vars and flip `ENFORCE_SOCIAL_ELIGIBILITY = true`.
- [x] **Instagram/TikTok OAuth infrastructure** — Full OAuth code (mobile + Convex HTTP callbacks), connect/disconnect mutations, duplicate handle prevention, feature flag
- [x] **Attribution system** — `attributionCodes` + `attributionEvents` tables, auto-generate promo code on deal approval, attribution summary on business dashboard, dedicated attribution page with revenue reporting
- [x] **Content Library upgrade** — Extended `contentArchives` schema, full gallery UI (grid, filters, sort, download, usage rights)

### Medium Priority — Important for Quality

- [ ] **Content verification pipeline** — Check Instagram/TikTok API for required tags, hashtags, location tags. Currently auto-verifies all submissions. (contentMetrics.ts fetches engagement metrics, but doesn't verify tag/hashtag compliance)
- [ ] **Geolocation check-in** — GPS infrastructure built (`geolocation.ts`), but check-in still uses manual 4-digit codes. Wire GPS proximity verification into deal check-in flow.
- [ ] **Error boundaries** — React error boundaries on web + mobile to catch and display errors gracefully.
- [ ] **Form validation** — Client-side validation on all forms (offer creation, onboarding, settings). Currently minimal.
- [ ] **Loading skeletons** — Replace "Loading..." text with shimmer/skeleton UI across both platforms.
- [ ] **Quality tier cron enforcement** — Automated scheduled tier demotion/promotion (constants + logic built, cron infra ready, enforcement deferred)
- [x] **Cron jobs / scheduled functions** — Daily social metrics refresh at 06:00 UTC. Content auto-approve via `ctx.scheduler.runAfter`. (Deal expiry/no-show crons still needed)
- [x] **Image uploads** — Convex file storage (`convex/files.ts`), image picker (`imagePicker.ts`), wired into onboarding (business photos, creator profile photo)
- [x] **Quality-score-to-trust-tier linkage** — Scoring constants, demotion/promotion rules, tier adjustment logic
- [x] **Content review enhancements** — 24h auto-approve timer on `content_verified`, 1-revision limit, objective revision reason enum
- [x] **Creator eligibility thresholds** — 1K followers, 2% engagement, local audience gating. Enforcement in `deals.apply` behind feature flag
- [x] **Trust tier progression** — `calculateTrustTier` + `calculateReliabilityScore` functions from BARTER_SYSTEM_SPEC
- [x] **Social metrics refresh** — `convex/socialMetrics.ts` daily cron fetches updated IG/TikTok follower counts + engagement rates
- [x] **Content metrics tracking** — `convex/contentMetrics.ts` fetches post likes/comments/views from social APIs

### Lower Priority — Nice to Have

- [ ] **Dark mode** — Design tokens support it. Need to wire theme context + toggle on both platforms.
- [ ] **iOS 26 Liquid Glass** — Tab bar + navigation. Requires Expo SDK 54+ / RN 0.80+ (documented in TECHNICAL_ARCHITECTURE.md).
- [ ] **Creator web dashboard** — Optional read-only dashboard for creators who prefer desktop. Currently redirect to mobile.
- [ ] **Admin panel** — Platform admin for dispute resolution, user management, analytics. Currently disputes resolved by either party.
- [ ] **QR code check-in** — Generate + scan QR codes for check-in instead of 4-digit codes.
- [ ] **Attribution QR code generation** — Server-side QR via `qrcode` npm package for promo codes.
- [ ] **Attribution referral link redirect system** — `/r/CODE` → business URL redirect tracking.
- [ ] **Search** — Full-text search for offers on mobile explore tab.
- [ ] **Pagination** — Cursor-based pagination for offers/deals/notifications lists (currently `.collect()` or `.take()`).
- [ ] **Analytics export** — CSV/PDF export of business analytics and deal history.
- [ ] **Email notifications** — Transactional emails (Resend/SendGrid) for deal milestones alongside in-app.
- [ ] **Rate limiting** — Prevent spam applications, message flooding.
- [ ] **Accessibility audit** — Screen reader labels, keyboard navigation, contrast ratios.
- [ ] **E2E tests** — Playwright for web, Detox/Maestro for mobile.
- [ ] **Deal expiry crons** — Auto-expire deals past content deadline, auto-no-show after 24h, reminder sequences.
- [ ] **Pricing model switch** — Flat per-deal fees (keep current % model until Stripe integration)

---

## Environment

| Key | Location | Value |
|-----|----------|-------|
| `CONVEX_DEPLOYMENT` | `.env.local` (root) | `dev:outgoing-wildcat-675` |
| `CONVEX_URL` | `.env.local` (root) | `https://outgoing-wildcat-675.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_URL` | `apps/web/.env.local` | `https://outgoing-wildcat-675.convex.cloud` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `apps/web/.env.local` | `pk_test_...` |
| `CLERK_SECRET_KEY` | `apps/web/.env.local` | `sk_test_...` |
| `EXPO_PUBLIC_CONVEX_URL` | `apps/mobile/.env.local` | `https://outgoing-wildcat-675.convex.cloud` |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `apps/mobile/.env.local` | `pk_test_...` |
| `META_APP_ID` | Convex env vars | *(required for IG OAuth — set after Meta App Review)* |
| `META_APP_SECRET` | Convex env vars | *(required for IG OAuth — set after Meta App Review)* |
| `TIKTOK_CLIENT_KEY` | Convex env vars | *(required for TikTok OAuth — set after Developer Portal approval)* |
| `TIKTOK_CLIENT_SECRET` | Convex env vars | *(required for TikTok OAuth — set after Developer Portal approval)* |

## Useful Commands

```bash
# Run web app
cd apps/web && npm run dev

# Run mobile app
cd apps/mobile && npx expo start

# Deploy Convex
npx convex dev --once

# Run Convex dev server (watches for changes)
npx convex dev

# Seed demo data
npx convex run seed:populate

# View Convex dashboard
# https://dashboard.convex.dev/d/outgoing-wildcat-675
```

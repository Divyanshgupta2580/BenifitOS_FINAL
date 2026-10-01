# BenefitOS UI Design Specification

**Document Version:** 3.0.0  
**Target Consumer:** Google Stitch / Automated AI UI Generation Engine  
**Product:** BenefitOS (National Citizen Welfare Discovery & Assistance Platform)  
**Authoring Status:** Complete Architectural & Visual Design Specification  

---

## 1. Product Overview

### 1.1 Product Identity
**BenefitOS** is a digital citizen welfare discovery, eligibility determination, and application assistance platform. It serves as a unified digital interface between Indian citizens and hundreds of central, state, and local government welfare schemes (such as PM-KISAN, PMAY Housing, Ayushman Bharat PM-JAY, MUDRA Loans, and state-level social security pensions).

### 1.2 Purpose & Core Mission
The mission of BenefitOS is to eliminate the friction, confusion, and bureaucratic opacity that prevent eligible citizens from receiving government benefits. BenefitOS accomplishes this by:
1. **Discovering Schemes:** Aggregating verified central and state welfare schemes in one unified catalog.
2. **Determining Eligibility:** Evaluating citizen demographic, income, occupational, and geographic attributes strictly through a deterministic rules engine.
3. **Explaining Benefits & Criteria:** Translating complex statutory criteria and government gazettes into plain, understandable language.
4. **Document Readiness:** Maintaining an encrypted Document Vault and automated AI vision OCR review to track required vs. ready documents.
5. **Streamlining Applications:** Offering a direct benefit transfer application wizard with timeline tracking.
6. **AI Citizen Copilot:** Providing context-aware, bilingual (English & Hindi) guidance grounded strictly in verified scheme data.
7. **Government Registry Integration:** Connecting citizen profiles to government service gateways (Aadhaar e-KYC, DigiLocker, DBT registries).

### 1.3 Core Architectural Principle
BenefitOS is fundamentally built on an immutable chain of authority:

```
┌─────────────────────────────────────────────────────────┐
│              DETERMINISTIC ELIGIBILITY ENGINE           │
│  Computes boolean eligibility using strict AST rules    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  VERIFIED SCHEME DATA                   │
│   Official gazettes, ministry criteria, benefit caps    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   AI CITIZEN COPILOT                    │
│ Explains verified data & answers questions bilingually  │
│ (AI NEVER calculates, overrides, or alters eligibility) │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                       │
│    Communicates clear, trustworthy public information   │
└─────────────────────────────────────────────────────────┘
```

> **CRITICAL RULE:** The AI Copilot is an explanatory assistant, **never** the authority that determines scheme eligibility. The UI must always attribute eligibility outcomes to the deterministic rules engine and official departmental criteria.

---

## 2. Target Users & Citizen Personas

### 2.1 Primary User Profile
The primary user of BenefitOS is an ordinary Indian citizen who:
- May have moderate to low digital literacy and use affordable mobile devices or community CSC (Common Service Centre) kiosks.
- Does not understand complex legal, administrative, or bureaucratic terminology.
- Often does not know which government ministry or department oversees a specific benefit.
- Frequently lacks awareness of required supporting documents until an application is rejected.
- Requires high-contrast visual clarity, plain language, and seamless bilingual support (English and Devanagari Hindi).

### 2.2 Design Imperatives for the Citizen User
1. **Extreme Clarity:** No ambiguous acronyms without expansion; immediate visual indication of whether a citizen qualifies for a benefit.
2. **High Trust & Authority:** The platform must look and feel like an authentic, highly secure public-service digital portal (not a private commercial app or crypto startup).
3. **Obvious Next Actions:** Every screen must clearly guide the user: "What do I do next?" (e.g., "Upload Income Certificate", "Apply on Official Portal", "Complete Missing Profile Fields").
4. **Accessibility First:** Strict compliance with WCAG 2.1 AA standards, large touch targets (minimum 44px), support for browser font scaling (A- / A / A+), and dark/light high-contrast modes.

---

## 3. Product Principles

1. **Deterministic Truth Over AI Hallucination:** If a citizen does not meet a criterion, the UI explicitly highlights the exact missing rule or document.
2. **Data Minimization & Privacy:** Citizens' personal identifying information (PII) is encrypted at rest and in transit. AI prompts only receive sanitized demographic attributes (age, state, category, income) — never raw passwords, Aadhaar numbers, or full street addresses.
3. **Zero Ambiguity Statuses:** Every status (Eligibility, Application, Document Verification) is communicated using a combined **Icon + Text Label + Subtext Explanation**. Color alone is never the sole indicator.
4. **Persistent Navigation:** The citizen is never lost in a deep hierarchy. The global application shell remains persistent across all authenticated screens.
5. **No Decorative Bloat:** Avoid frivolous animations, decorative 3D blobs, neon glows, or gamified match animations that undermine the seriousness of a government welfare portal.

---

## 4. Current UI Analysis

The current frontend implementation is a React 18 Single Page Application built with Tailwind CSS, React Query, Zustand, and React Router v7.

### 4.1 Implemented Screens & Components
- **Global Components:** `GovernmentHeader` (with emblem, font scaler, language switcher, theme toggle, profile menu) and `DashboardSidebar` (with 10 navigation tabs, collapsible rail mode, and NIC branding).
- **Dashboard:** Stacked layout with `GatewayStatusCard`, `CitizenCopilotHero`, `TopRecommendedSchemeCard`, `QuickAccessGrid` (4 cards), `DashboardStatsCards` (Vault + Applications), and `RecentNotificationsCard`.
- **Schemes:** `SchemeCatalogScreen` (search, category chips, card grid), `SchemeDetailScreen` (overview, rules, required docs, AI instructions section), and `EligibilitySimulatorScreen` (score circle, simulated rules note).
- **Recommendations:** `RecommendationDashboardScreen` (filter tabs for Eligible, Incomplete, Not Eligible; comparison drawer), `RecommendationDetailScreen`, `RecommendationExplanationScreen`, and `RecommendationComparisonScreen`.
- **Documents & OCR:** `DocumentVaultScreen` (type filter chips, card list, deletion confirmation), `DocumentUploadScreen`, `DocumentViewerModal`, and `OcrReviewScreen` (confidence score badge, editable extracted fields, raw text viewer).
- **Applications:** `ApplicationsListScreen` (filter tabs, status badges), `ApplicationWizardScreen` (4-step stepper: Scheme -> Profile Auto-fill -> Attach Vault Docs -> Declaration), `ApplicationTimelineScreen`, and `ApplicationDetailScreen`.
- **AI Copilot:** `AiCopilotScreen` and `AiAssistantScreen` (quick action suggestion pills, bilingual chat messages, and `StructuredAiResponseRenderer` with parsed scheme cards and application steps).
- **Government Services:** `GovernmentServicesScreen` (12 registry service cards, OTP connection modal, sync/disconnect actions).
- **Citizen Profile:** `CitizenProfileScreen` (completion percentage banner, demographic cards), `DemographicsEditScreen`, `AddressEditScreen`, `HouseholdMembersScreen`, and `LandDetailsScreen`.
- **Authentication:** `LanguageSelectScreen`, `OnboardingScreen`, `LoginScreen`, `RegisterScreen`, `PasswordResetScreen`, and `MfaSetupScreen`.

---

## 5. Current UI Problems

A rigorous audit of the existing codebase reveals specific structural, visual, and architectural deficiencies that the new design must resolve:

### 5.1 Excessive Card-in-Card Nesting & Monotony
- Almost every screen is built by stacking identical `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs` cards.
- On the Dashboard, 6 different widgets with vastly different functional priorities (real-time gateway connection status vs. urgent top recommended scheme vs. quick navigation links) look virtually identical, causing visual fatigue and destroying information hierarchy.

### 5.2 Disconnected Layout Shells
- While the `DashboardScreen` includes the `GovernmentHeader` and `DashboardSidebar`, screens like `/schemes`, `/documents`, `/applications`, `/profile`, and `/recommendations` independently render their own isolated top headers with a "← Back" text button.
- Navigating from the Dashboard to the Scheme Catalog abruptly causes the main sidebar to disappear, forcing the user to rely on browser history or click "← Back" to return.
- **Requirement:** The new design must enforce a unified, persistent **AppShell** where the Header and Sidebar remain visible across *all* authenticated routes.

### 5.3 Weak Information Density in Critical Areas
- The Recommendation Dashboard uses oversized cards with excessive whitespace, displaying only 2 schemes per viewport height on standard laptop screens.
- Essential eligibility criteria reasons are hidden behind multiple clicks or small subtext.
- The Document Vault displays large cards for simple file records instead of a clear, actionable checklist showing: **Required: 5 | Verified: 4 | Missing: 1**.

### 5.4 Cluttered Header Controls
- The existing header crams 6 interactive tools in a small horizontal flex container: Font Scaler (A- / A / A+), Language Switch (EN / HI), Theme Toggle (Sun/Moon), Notifications Bell, and User Profile Pill.
- On tablet and small laptop viewports (768px – 1100px), these elements wrap awkwardly or collide with the National Emblem and title.

### 5.5 Gamified Percentage Scores
- Displaying "100% Match" or "75% Match" creates a misleading impression of a commercial matching algorithm.
- Government welfare eligibility is deterministic and condition-based: a citizen is either **Eligible**, **Ineligible** (with specific criteria violations), or has an **Incomplete Profile**. The UI must reflect statutory truth, not algorithmic probability.

### 5.6 Ineffective Loading & Error States
- Skeletons currently render as large generic pulsing gray rectangles without structural correspondence to the incoming data cards.
- Error states on several pages display raw fallback text without actionable retry buttons or diagnostic context.

---

## 6. New Design Direction

### 6.1 The "National Welfare Command Center"
The redesigned BenefitOS interface must feel like an authoritative, high-integrity digital gateway developed for a modern sovereign state. It balances public-service dignity with world-class digital ergonomics.

### 6.2 Emotional & Visual Tone
- **Authoritative & Trustworthy:** Clean lines, robust typography, balanced contrast, and dignified government emblems.
- **Calm & Structured:** Muted slate and deep navy backgrounds that reduce eye fatigue during long sessions.
- **Intelligent & Clear:** Structured data layouts with clear visual demarcations, breadcrumbs, and explicit status tags.
- **Human-Centric & Accessible:** Legible bilingual text rendering, prominent action buttons, and clear next-step guidance.

### 6.3 What the Design Must NOT Look Like
- ❌ **NOT a Generic SaaS Dashboard:** No startup purple gradients, floating pastel cards, or marketing widgets.
- ❌ **NOT a ChatGPT Clone:** The AI Copilot is an integrated assistant with structured cards and checklists, not a generic empty chat window with floating sparkle icons.
- ❌ **NOT a Crypto/Fintech App:** No dark neon greens, glassmorphism blur layers, or speculative trading charts.
- ❌ **NOT Gamified:** No progress rings with congratulatory confetti, match percentages, or fake urgency badges.

---

## 7. Visual Language & Aesthetic Tokens

### 7.1 Dark-First Palette (Primary Direction)
Dark mode is the primary visual expression of the platform, optimized for clarity, battery efficiency on OLED mobile devices, and reduced ocular strain:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SURFACE LEVEL 0 (Canvas Background):    #0B0F17 (Deep Obsidian Navy)   │
│ SURFACE LEVEL 1 (Sidebar / Header):     #0F172A (Navy Slate 900)       │
│ SURFACE LEVEL 2 (Panels / Base Cards):  #1E293B (Slate 800)            │
│ SURFACE LEVEL 3 (Elevated / Modals):    #334155 (Slate 700)            │
│ BORDERS & DIVIDERS:                     #1E293B / #334155              │
│ PRIMARY BRAND ACCENT:                   #2563EB (Government Blue 600)  │
│ SECONDARY BRAND ACCENT:                 #0D9488 (Teal 600)             │
│ SAFFRON / GOLD ACCENT (Emblem/Badges):  #D97706 (Amber 600)            │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Light Mode Palette (Full Fidelity Parity)
Light mode maintains identical structural boundaries, using dignified government parchment and crisp slate borders:

```
┌────────────────────────────────────────────────────────────────────────┐
│ SURFACE LEVEL 0 (Canvas Background):    #F8FAFC (Slate 50)             │
│ SURFACE LEVEL 1 (Sidebar / Header):     #FFFFFF (Pure White)           │
│ SURFACE LEVEL 2 (Panels / Base Cards):  #FFFFFF (Pure White)           │
│ SURFACE LEVEL 3 (Elevated / Modals):    #F1F5F9 (Slate 100)            │
│ BORDERS & DIVIDERS:                     #E2E8F0 (Slate 200)            │
│ PRIMARY BRAND ACCENT:                   #1E3A8A (Government Blue 900)  │
│ SECONDARY BRAND ACCENT:                 #0F766E (Teal 700)             │
│ SAFFRON / GOLD ACCENT:                  #B45309 (Amber 700)            │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Semantic Status Palette
Every status color is paired with a distinct icon and high-contrast text:
- **Eligible / Verified / Success:**
  - Dark: BG `#064E3B` | Border `#059669` | Text `#34D399` | Icon `CheckCircle`
  - Light: BG `#ECFDF5` | Border `#A7F3D0` | Text `#065F46` | Icon `CheckCircle`
- **Incomplete Profile / Pending / Warning:**
  - Dark: BG `#451A03` | Border `#D97706` | Text `#FBBF24` | Icon `AlertTriangle`
  - Light: BG `#FFFBEB` | Border `#FDE68A` | Text `#92400E` | Icon `AlertTriangle`
- **Not Eligible / Rejected / Danger:**
  - Dark: BG `#4C0519` | Border `#E11D48` | Text `#FDA4AF` | Icon `XCircle`
  - Light: BG `#FFF1F2` | Border `#FECDD3` | Text `#9F1239` | Icon `XCircle`
- **Informational / Processing:**
  - Dark: BG `#172554` | Border `#2563EB` | Text `#93C5FD` | Icon `Info`
  - Light: BG `#EFF6FF` | Border `#BFDBFE` | Text `#1E40AF` | Icon `Info`

---

## 8. Typography System

### 8.1 Font Stack
- **Primary Latin Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Primary Devanagari (Hindi) Font:** `Noto Sans Devanagari`, `Inter`, `sans-serif`
- **Monospace / Identifier Font:** `JetBrains Mono`, `ui-monospace`, `monospace` (used for Scheme Codes, Application Numbers, Transaction IDs)

### 8.2 Typographic Hierarchy Table

| Level | Size (px / rem) | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| **Display 1** | 32px / 2.0rem | 800 (ExtraBold) | 1.2 | -0.02em | Hero welcomes, portal landing headlines |
| **Heading 1** | 24px / 1.5rem | 700 (Bold) | 1.25 | -0.015em | Page titles (e.g., "Scheme Catalog", "Document Vault") |
| **Heading 2** | 18px / 1.125rem | 700 (Bold) | 1.3 | -0.01em | Section titles, modal headers, major card groups |
| **Heading 3** | 15px / 0.9375rem | 600 (SemiBold) | 1.4 | 0 | Scheme card titles, wizard step headers |
| **Body Regular** | 14px / 0.875rem | 400 (Regular) | 1.5 | 0 | Descriptions, articles, instructions, chat messages |
| **Body Medium** | 14px / 0.875rem | 500 (Medium) | 1.5 | 0 | Active table cells, filter labels, form inputs |
| **Caption / Meta**| 12px / 0.75rem | 500 (Medium) | 1.4 | +0.01em | Timestamps, file sizes, department tags |
| **Micro / Overline**| 10px / 0.625rem | 700 (Bold) | 1.2 | +0.06em | Uppercase section overlines, status badges |

### 8.3 Devanagari Typography Rules
- Hindi text line-height must be increased by **10-15%** relative to English to accommodate matras (vowel signs above and below characters).
- Never apply font-weight `100` or `200` to Devanagari; minimum weight for readability is `400` (Regular) and `600` (SemiBold).

---

## 9. Spacing & Layout System

### 9.1 8-Point Grid Standard
All spatial relationships conform to an 8px base unit:
- `space-1` = 4px (micro gaps, icon-to-text spacing)
- `space-2` = 8px (compact padding, badge insets)
- `space-3` = 12px (standard element spacing)
- `space-4` = 16px (card interior padding on mobile)
- `space-5` = 20px (card interior padding on desktop)
- `space-6` = 24px (gap between grid cards)
- `space-8` = 32px (section separation)
- `space-12` = 48px (page margin top/bottom)

### 9.2 Responsive Breakpoints
- **Mobile (`< 768px`):** Single column canvas, full-width cards, sidebar transforms into a modal slide-out drawer with backdrop overlay.
- **Tablet (`768px – 1023px`):** Sidebar defaults to collapsed rail (64px width), 2-column card grid, header compact view.
- **Desktop (`1024px – 1439px`):** Sidebar expanded (260px width), max-content width 1200px centered, 2-3 column grids.
- **Wide Desktop (`>= 1440px`):** Sidebar expanded, max-content width 1400px, multi-column dashboard layouts.

---

## 10. Global Application Shell (AppShell)

### 10.1 Persistent Architecture
Unlike the legacy UI where screens render individual headers, the redesigned BenefitOS uses a single, persistent **AppShell** wrapper for all authenticated views:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GLOBAL GOVERNMENT HEADER                        │
│ [☰] [Emblem] BenefitOS  National Gateway   │ [A-] [A] [A+] [HI/EN] [☼] [🔔] [User] │
├───────────────┬────────────────────────────────────────────────────────┤
│               │                                                        │
│ GLOBAL        │                  MAIN CONTENT CANVAS                   │
│ SIDEBAR       │                                                        │
│               │   (Scrollable area where routes render:               │
│ • Dashboard   │    /dashboard, /schemes, /documents,                   │
│ • Copilot     │    /applications, /profile, etc.)                      │
│ • Schemes     │                                                        │
│ • Applications│                                                        │
│ • Vault       │                                                        │
│ • Services    │                                                        │
│ • Profile     │                                                        │
│ • Settings    │                                                        │
│               │                                                        │
│ [NIC Footer]  │                                                        │
└───────────────┴────────────────────────────────────────────────────────┘
```

---

## 11. Header Specification

### 11.1 Left Zone: National Identity & Branding
- **Sidebar Toggle (Hamburger Button):** 40x40px touch target with clear focus ring; toggles expanded/collapsed rail on desktop, opens drawer on mobile.
- **State Emblem of India:** Authentic Ashoka Lion Capital vector emblem in dignified monochrome gold/slate.
- **Brand Typography:**
  - Line 1: `NATIONAL WELFARE GATEWAY` (10px uppercase, font-bold, tracking-wider, text-slate-400).
  - Line 2: `BenefitOS` (18px, font-extrabold, text-blue-900 dark:text-blue-100).
  - Line 3: `सशक्त नागरिक, समृद्ध भारत` (11px, text-amber-700 dark:text-amber-400, hidden on mobile).

### 11.2 Right Zone: Utility & Citizen Account Controls
- **Accessibility Font Scaler:** Segmented 3-button control `[ A- | A | A+ ]` adjusting document root `font-size` between 14.5px, 16px, and 17.5px.
- **Language Switcher:** Toggle pill `[ English | हिंदी ]` updating Zustand locale store and triggering instant UI re-render.
- **Theme Switcher:** Single-click toggle between Dark and Light mode.
- **Notifications Bell:** Includes an active pulse indicator with unread count pill badge (e.g., `3`). Clicking opens a slide-over panel.
- **Citizen Profile Menu:** Pill component displaying user initial avatar, verified citizen badge, full name, and dropdown menu (Profile Details, Security Settings, Sign Out).

---

## 12. Sidebar Specification

### 12.1 Navigation Structure

| Item ID | Label (English) | Label (Hindi) | Icon | Route | Special Badge |
|---|---|---|---|---|---|
| `dashboard` | Dashboard | डैशबोर्ड | `Home` | `/dashboard` | — |
| `copilot` | AI Copilot | AI कोपायलट | `Sparkles` | `/ai/copilot` | `NEW` (Pill) |
| `schemes` | Scheme Catalog | योजना सूची | `Landmark` | `/schemes` | — |
| `recommendations`| Eligibility Engine | पात्रता इंजन | `CheckCircle` | `/recommendations` | `Eligible Count` |
| `applications` | Applications | मेरे आवेदन | `ClipboardList`| `/applications` | `Active Count` |
| `vault` | Document Vault | दस्तावेज़ वॉल्ट | `Folder` | `/documents` | `Missing Count` |
| `services` | Govt Services | सरकारी सेवाएं | `Building` | `/government-services` | — |
| `profile` | Citizen Profile | नागरिक प्रोफ़ाइल| `User` | `/profile` | `Completion %` |
| `notifications`| Notifications | सूचनाएं | `Bell` | `/notifications` | `Unread Count` |
| `help` | Help & Support | सहायता एवं संपर्क | `HelpCircle` | `/help` | — |
| `settings` | Portal Settings | सेटिंग्स | `Settings` | `/settings` | — |

### 12.2 States & Collapsed Rail Mode
- **Expanded Width:** 260px. Full labels, badges, and section dividers visible.
- **Collapsed Rail Width:** 64px. Centered icons with high-contrast floating tooltips on hover. State persisted in `localStorage` (`benefitos_sidebar_collapsed`).
- **Keyboard Shortcut:** `Alt + [` toggles sidebar collapse state.
- **Footer:** Official National Informatics Centre (NIC) version stamp (`v2.1.0 (PROD)`).

---

## 13. Dashboard: Citizen Welfare Command Center

The redesigned dashboard moves away from generic, unprioritized stacked cards to an authoritative 4-tier Command Center layout:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: CITIZEN CONTEXT & ELIGIBILITY STATUS BANNER                   │
│ "Namaste, Ramesh Kumar Sharma" • Profile 100% Complete • Uttar Pradesh │
│ [ 4 Schemes Eligible ]  [ ₹1,86,000 Total Est. Benefit ]  [ 0 Actions ] │
├───────────────────────────────────┬────────────────────────────────────┤
│ TIER 2: TOP RECOMMENDED SCHEME    │ TIER 3: DOCUMENT & APPLICATION     │
│ High-impact verified scheme card  │ READINESS RADAR                    │
│ • PM-KISAN (₹6,000 / Yr)          │ • Required Documents: 5/5 Ready    │
│ • Direct Apply Button             │ • Active Applications: 1 In Review │
│ • AI Guidance Button              │ • Linked Registries: Aadhaar, DBT  │
├───────────────────────────────────┴────────────────────────────────────┤
│ TIER 4: DIRECT ACTION GRID                                             │
│ [ Browse All Schemes ] [ Open AI Copilot ] [ Document Vault ] [ Track ]│
└────────────────────────────────────────────────────────────────────────┘
```

### 13.1 Tier 1: Citizen Context Banner
- Welcomes citizen by verified name and displays state residency.
- Displays 3 primary high-visibility telemetry metrics:
  1. **Eligible Schemes Count:** Large bold numeral (e.g. `4`).
  2. **Estimated Annual Financial Impact:** Formatted in INR (e.g. `₹1,86,000 / Year`).
  3. **Action Required Items:** Highlights pending document re-uploads or expired verifications.

### 13.2 Tier 2: Priority Benefit Spotlight
- Highlights the highest-value verified scheme matching the citizen's profile.
- Displays ministry name, annual payout, key qualifying reason, and two primary action buttons: `[ Apply on Official Portal ]` and `[ Ask AI Copilot ]`.

### 13.3 Tier 3: Readiness Radar
- **Document Readiness Progress:** Visual checklist showing how many mandatory documents (Aadhaar, Income Certificate, Land Record) are verified and ready in the Vault.
- **Application Status Feed:** Shows the latest status transition for active applications (e.g., `Under Department Review`).

---

## 14. Eligible Schemes & Catalog Design

### 14.1 Strict Eligibility Filtering
The scheme view provides 4 discrete filter views:
1. **ELIGIBLE (Primary Tab):** ONLY schemes where all criteria evaluate to true (`isEligible === true`).
2. **INCOMPLETE PROFILE:** Schemes where missing profile fields prevent evaluation (e.g. missing land record size or disability percent).
3. **NOT ELIGIBLE:** Schemes where citizen fails specific conditions (e.g. income exceeds ceiling or age exceeds upper bound).
4. **ALL SCHEMES:** Complete searchable government gazette.

### 14.2 Scheme Card Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ [SCHEME-CODE: PM-KISAN]                      [ CATEGORY: AGRICULTURE ] │
│                                                                        │
│ Pradhan Mantri Kisan Samman Nidhi                                      │
│ Ministry of Agriculture and Farmers Welfare, Govt of India             │
│                                                                        │
│ BENEFIT: ₹6,000 / Year (Direct Benefit Transfer in 3 Installments)     │
│                                                                        │
│ ✓ ELIGIBILITY STATUS: ELIGIBLE                                         │
│   Why you qualify: Small/marginal farmer resident of Uttar Pradesh     │
│                                                                        │
│ REQUIRED DOCUMENTS (3):                                                │
│   ✓ Aadhaar Card (Ready)   ✓ Land Record (Ready)   ✓ Bank Passbook    │
│                                                                        │
│ ────────────────────────────────────────────────────────────────────── │
│ [ View Scheme Details ]             [ Apply Online ]  [ AI Guidance ] │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 15. Scheme Details Screen

### 15.1 Progressive Disclosure Sections
1. **Header Banner:** Scheme title, official code, administrative department, central/state sponsorship tag, application deadline countdown.
2. **Key Financial & Non-Financial Benefits:** Detailed breakdown of subsidies, loan concessions, or insurance coverage.
3. **Deterministic Eligibility Rules Table:** Lists every rule attribute, comparison operator, target value, and citizen's actual value with a pass/fail indicator.
4. **Mandatory Document Checklist:** Explains required file formats, issuing authorities, and direct button to upload missing docs to the Vault.
5. **Official Application Process:** Step-by-step instructions for physical CSC kiosks or official state web portals.
6. **AI Scheme Guidance Module:** Integrated section calling the backend AI service to generate a customized, printable step-by-step application guide.

---

## 16. AI Citizen Copilot Design

### 16.1 Specialized Public Service Assistant
The Copilot is engineered specifically for citizen welfare. It is **not** an open-ended conversational bot; it operates within strict welfare guardrails:

```
┌────────────────────────────────────────────────────────────────────────┐
│ AI CITIZEN COPILOT                    [ Language: English | हिंदी ]    │
│ Context: Pradhan Mantri Kisan Samman Nidhi                             │
├────────────────────────────────────────────────────────────────────────┤
│ SUGGESTED QUERIES (Quick Action Pills):                                │
│ [ Explain why I qualify ]  [ What documents are needed? ] [ How to apply]│
├────────────────────────────────────────────────────────────────────────┤
│ CONVERSATION STREAM:                                                   │
│                                                                        │
│ [Citizen]: How do I get the ₹6,000 farmer benefit?                     │
│                                                                        │
│ [AI Copilot]:                                                          │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Verified Source: Ministry of Agriculture and Farmers Welfare       │ │
│ │                                                                    │ │
│ │ Summary: PM-KISAN provides ₹6,000 per year in 3 equal payments.   │ │
│ │                                                                    │ │
│ │ Steps to Receive Benefit:                                          │ │
│ │ 01 Verify Land Record in State Bhulekh Portal                      │ │
│ │ 02 Complete Aadhaar e-KYC on pmkisan.gov.in                        │ │
│ │ 03 Seed Bank Account with NPCI / Aadhaar DBT                       │ │
│ │                                                                    │ │
│ │ Required Documents: Aadhaar Card, Land Khatauni, Bank Passbook     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│ [ Enter your question...                                    ] [ Send ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 16.2 AI Structured Response Sections
When rendering complex guidance, the `StructuredAiResponseRenderer` parses responses into structured visual components:
- **Prerequisites & Eligibility Check:** Highlighted in green/amber containers.
- **Numbered Application Steps:** Large step indicators (`01`, `02`, `03`) with clear action titles.
- **Document Checklist:** Checkbox list with expandable details.
- **Trust Indicator:** Explicit notice stating: *"Guidance based on verified scheme data. Final sanctioning is determined by the concerned ministry."*
- **Contextual Action Buttons:** `[ Check Eligibility ]`, `[ View Required Documents ]`, `[ Official Portal Link ]`.

---

## 17. Document Vault & AI Vision OCR

### 17.1 Document Vault Management
- **Vault Summary Metric:** Displays Total Documents, Verified Count, and Pending Review Count.
- **Filter Chips:** Birth Certificate, Educational Certificate, Disability Certificate, Caste Certificate, Aadhaar, Driving Licence, Voter ID, Income Certificate, Land Record, Bank Passbook, PAN Card.
- **Security Indicator:** Encrypted local storage badge (`AES-256 / SHA-256`).

### 17.2 AI Vision OCR Review Screen
- **Confidence Score Meter:** High-visibility percentage badge (e.g. `98.4% Confidence - High Confidence`).
- **Two-Column Verification Layout:**
  - Left: Rendered document preview / image canvas.
  - Right: Editable extracted attribute fields (e.g. `NAME`, `DOB`, `GENDER`, `CERTIFICATE_NO`, `ISSUING_AUTHORITY`, `INCOME_AMOUNT`).
- **Citizen Audit Action:** `[ Confirm & Save Verified Attributes ]` saves parsed data directly to the citizen profile.

---

## 18. Applications Portal & Lifecycle Stepper

### 18.1 Supported Lifecycle States (Prisma Backend Model)
1. `DRAFT`: Saved locally or on server; editable at any time.
2. `SUBMITTED`: Dispatched to departmental welfare queue.
3. `UNDER_REVIEW`: Assigned to a verification officer.
4. `ACTION_REQUIRED`: Citizen must upload additional documentation or clarify details.
5. `APPROVED`: Benefit sanctioned.
6. `REJECTED`: Disqualified with formal explanation.
7. `WITHDRAWN`: Cancelled by applicant.

### 18.2 Application Wizard (4-Step Guided Flow)
- **Step 1: Scheme Selection:** Search and pick target welfare scheme.
- **Step 2: Profile Auto-Fill:** Review pre-populated citizen demographic, address, and income records.
- **Step 3: Attach Vault Documents:** Checkbox selection of pre-verified documents from the Vault.
- **Step 4: Self-Declaration & Submission:** Formal statutory declaration checkbox and final submission button.

---

## 19. Government Services Integration Hub

### 19.1 Implementation Status & Reality Disclosure

| Government Service Name | Category | UI Status | Actual Backend Implementation Status |
|---|---|---|---|
| **Aadhaar e-KYC Verification** | Identity | Connected / Verified | **Mock / Simulated** (NestJS stub generates mock OTP `123456`) |
| **DigiLocker Document Gateway** | Documents | Connect Account | **Mock / Simulated** (OAuth2 redirect URL stubbed) |
| **Jan Dhan / DBT Direct Benefit** | Financial | Verified | **Mock / Simulated** (DBT status check stubbed) |
| **PM-JAY ABHA Health ID** | Health | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **PM-KISAN Portal Registry** | Agriculture | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **e-Shram National Database** | Labour | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **UMANG Citizen Gateway** | Civil | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **Sarathi Vahan Driving Registry** | Transport | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **National Scholarship Portal** | Education | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **PMAY Housing Registry** | Housing | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **Mera Ration PDS Gateway** | Civil | Connect Account | **Planned / UI-Only** (No active backend integration) |
| **Poshan Tracker (WCD)** | Health | Connect Account | **Planned / UI-Only** (No active backend integration) |

> **IMPORTANT RULE:** The UI must display accurate status indicators (`Simulated Demo Gateway` or `Planned Integration`) and never deceive citizens into believing a live UIDAI / DigiLocker government connection is active when in mock mode.

---

## 20. Citizen Profile Management

### 20.1 Profile Subsections
1. **Core Demographics:** Full name, DOB, Age, Gender, Marital Status, Social Category (General/OBC/SC/ST/EWS).
2. **Occupation & Income:** Employment status (Employed/Farmer/Daily Wage/Student/Unemployed/Retired), Annual Household Income (₹), BPL Card Holder status and card number.
3. **Disability Status:** Disability type (None/Visual/Hearing/Locomotor/Intellectual/Multiple) and certified disability percentage.
4. **Residential Address:** Street, City, District, State, Pincode, Rural vs. Urban classification.
5. **Household Dependents:** Family member records (Name, Relation, Age, Gender, Income).
6. **Agricultural Land Holdings:** Land parcel records (Acreage, Land Type, Survey Number, District, State).

### 20.2 Profile Completeness Gauge
- Prominently displays completion percentage (`0%` to `100%`).
- Highlights missing fields that unlock specific welfare schemes (e.g. *"Add Land Holdings to evaluate PM-KISAN and Krishi Sinchayee schemes"*).

---

## 21. Notifications, Help & Settings

### 21.1 Notifications Center
- Categorized into: **Application Updates**, **Scheme Deadlines**, **Document Verifications**, and **System Alerts**.
- Mark-as-read individual action and bulk clear.
- Unread badge counter synchronized with header bell icon.

### 21.2 Help & Support
- Searchable FAQ covering eligibility, document requirements, and application appeals.
- Emergency government welfare helplines: `1800-115-526` (National Welfare Helpline), `1947` (Aadhaar), `14477` (National Portal).
- Feedback submission form.

### 21.3 Settings
- **Theme Selection:** `[ System Default | Dark Mode | Light Mode ]`.
- **Language Preference:** `[ English | हिंदी (Hindi) ]`.
- **Accessibility Controls:** High contrast toggle, font scaling defaults.
- **Security & Sessions:** Active sessions overview, password change, MFA toggle.

---

## 22. Status & Feedback System

Every status indicator throughout BenefitOS must combine **Icon + Text Label + Background Fill + Border**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ ELIGIBLE:              [✓ CheckCircle]  ELIGIBLE CITIZEN               │
│ INCOMPLETE PROFILE:    [▲ AlertTriangle] INCOMPLETE PROFILE (2 MISSING) │
│ NOT ELIGIBLE:          [✕ XCircle]      NOT ELIGIBLE (OVER INCOME)     │
│ VERIFIED DOCUMENT:     [🛡 ShieldCheck]  OFFICIALLY VERIFIED            │
│ PENDING VERIFICATION:  [⏳ Clock]        PENDING VERIFICATION          │
│ REJECTED DOCUMENT:     [✕ XCircle]      REJECTED (ILLEGIBLE SCAN)      │
│ DRAFT APPLICATION:     [📝 Edit]         APPLICATION DRAFT              │
│ SUBMITTED APPLICATION: [🚀 Send]         SUBMITTED TO MINISTRY          │
│ UNDER REVIEW:          [🔍 Search]       UNDER OFFICER REVIEW           │
│ ACTION REQUIRED:       [⚠ AlertCircle]  ACTION REQUIRED: RE-UPLOAD DOC │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 23. Loading, Empty & Error States

### 23.1 Structural Skeleton Loaders
- Skeletons must mirror the exact geometry of target cards (e.g. Scheme Card Skeleton shows header badge, title line, benefit box, and action buttons).
- Subtle pulse animation with high-contrast slate background.

### 23.2 Contextual Empty States
- Never show a bare "No Data" message.
- Every empty state includes:
  1. Relevant line-art icon (e.g. `FolderOpen`, `ClipboardList`).
  2. Clear explanatory headline (e.g. *"No Documents in Vault"*).
  3. Actionable subtext (e.g. *"Upload your Aadhaar or Income Certificate to enable instant scheme matching."*).
  4. Primary call-to-action button (e.g. `[ + Upload Document ]`).

### 23.3 Safe Error Boundaries
- Never expose raw stack traces, SQL errors, or NestJS exception payloads to the user.
- Friendly error cards with diagnostic context and a prominent `[ Retry Action ]` button.

---

## 24. Component Library Inventory (24 Core Components)

1. `AppHeader`: Global top bar with emblems, a11y controls, language, theme, and profile menu.
2. `AppSidebar`: Collapsible vertical navigation with active states, tooltips, and badges.
3. `Button`: Primary, Secondary, Outline, Destructive, and Ghost variants; standard sizes (`sm`, `md`, `lg`); built-in loading spinner.
4. `IconButton`: Accessible button wrapper for icon-only actions with mandatory `aria-label`.
5. `StatusBadge`: Semantic pill component (`success`, `warning`, `danger`, `info`, `primary`).
6. `Card`: Elevated container with standard borders, padding, and hover elevation states.
7. `SchemeCard`: Specialized card for welfare schemes with financial benefit highlight and eligibility tag.
8. `DocumentCard`: Specialized card for Vault files with verification badge and actions.
9. `ApplicationCard`: Application record with lifecycle status and timeline link.
10. `GovServiceCard`: Government gateway integration card with connection status.
11. `AiMessageBubble`: Formatted chat container supporting user and assistant roles.
12. `StructuredAiResponse`: Rich parser rendering scheme guides, checklists, and trust badges.
13. `Input`: Accessible text/number input with floating label, validation error, and helper text.
14. `Select`: Accessible dropdown selector with theme-aware option list.
15. `Checkbox`: Custom styled checkbox with high-contrast focus rings.
16. `Modal`: Accessible dialog with focus trap, backdrop blur, and close button.
17. `Drawer`: Slide-over panel for mobile navigation and side-by-side scheme comparisons.
18. `Tabs`: Horizontal segmented control for filtering categories and sub-views.
19. `Skeleton`: Layout-matched pulsing placeholders.
20. `LoadingSpinner`: Accessible animated spinner with descriptive status text.
21. `EmptyState`: Illustrated placeholder with primary action button.
22. `ErrorState`: Friendly error box with retry button.
23. `Timeline`: Vertical stepper illustrating application workflow progress.
24. `ThemeToggle`: Sun/moon toggle with instant DOM synchronization.

---

## 25. Complete Screen Inventory (30 Discovered Screens)

| Screen File | Route | User Goal | Key Elements | Implementation Status |
|---|---|---|---|---|
| `LanguageSelectScreen.tsx` | `/language` | Choose interface language | Language cards (English, Hindi), Save button | **Implemented** |
| `OnboardingScreen.tsx` | `/onboarding` | Understand portal features | 3-step feature carousel, Get Started button | **Implemented** |
| `LoginScreen.tsx` | `/login` | Authenticate citizen | Email/Password inputs, Forgot password, Register link | **Implemented** |
| `RegisterScreen.tsx` | `/register` | Create citizen profile | Demographic form (Age, Category, Income, State, Password) | **Implemented** |
| `PasswordResetScreen.tsx` | `/reset-password` | Recover account | Email verification, OTP confirmation, New password | **Implemented** |
| `MfaSetupScreen.tsx` | `/mfa-setup` | Configure 2FA security | QR Code / Secret key, 6-digit OTP verification | **Implemented** |
| `DashboardScreen.tsx` | `/dashboard` | Command center overview | Context banner, Top scheme, Radar stats, Quick links | **Implemented** |
| `CitizenProfileScreen.tsx`| `/profile` | View profile completeness | Completion score, Demographics, Address, Household | **Implemented** |
| `DemographicsEditScreen.tsx`| `/profile/demographics`| Edit personal details | Age, Gender, Category, Employment, Income form | **Implemented** |
| `AddressEditScreen.tsx` | `/profile/address` | Edit residential address | Street, District, State, Pincode, Rural toggle | **Implemented** |
| `HouseholdMembersScreen.tsx`| `/profile/household` | Manage family members | Member list, Add member modal, Dependent toggle | **Implemented** |
| `LandDetailsScreen.tsx` | `/profile/land` | Manage agricultural land | Parcel list, Acreage, Survey number, Land type | **Implemented** |
| `SchemeCatalogScreen.tsx` | `/schemes` | Discover all schemes | Search bar, Category chip scroll, Scheme card grid | **Implemented** |
| `SchemeDetailScreen.tsx` | `/schemes/:id` | Review full scheme rules | Benefit breakdown, Rules table, Required docs, AI guide | **Implemented** |
| `EligibilitySimulatorScreen.tsx`| `/schemes/:id/simulate`| Test rule match | Rule AST evaluation, Simulated match score | **Implemented** |
| `RecommendationDashboardScreen.tsx`| `/recommendations` | View calculated eligibility| Filter tabs (Eligible, Incomplete, Not Eligible), Compare bar | **Implemented** |
| `RecommendationDetailScreen.tsx`| `/recommendations/:id` | Inspect recommendation | Match reasons, Missing documents, Benefit payout | **Implemented** |
| `RecommendationExplanationScreen.tsx`| `/recommendations/:id/explain`| Natural language reasoning| AI explanation of rule matches, Integrity notice | **Implemented** |
| `RecommendationComparisonScreen.tsx`| `/recommendations/compare`| Compare 2-3 schemes | Side-by-side comparison matrix of benefits & rules | **Implemented** |
| `DocumentVaultScreen.tsx` | `/documents` | Manage digital documents | Category filters, Document cards, Delete dialog | **Implemented** |
| `DocumentUploadScreen.tsx`| `/documents/upload` | Add new file to vault | Drag-and-drop zone, Document type selector, Progress bar | **Implemented** |
| `DocumentViewerModal.tsx` | `/documents/:id` | View uploaded file | Full-screen image/PDF preview, OCR status | **Implemented** |
| `OcrReviewScreen.tsx` | `/documents/:id/ocr` | Verify AI vision scan | Confidence score, Editable extracted fields, Raw text | **Implemented** |
| `ApplicationsListScreen.tsx`| `/applications` | Track submitted apps | Status filter tabs, Application cards, Timeline links | **Implemented** |
| `ApplicationWizardScreen.tsx`| `/applications/new` | Multi-step application | 4-step wizard: Scheme -> Profile -> Docs -> Submit | **Implemented** |
| `ApplicationTimelineScreen.tsx`| `/applications/:id/timeline`| View workflow audit | Vertical stepper showing submission -> review -> sanction | **Implemented** |
| `ApplicationDetailScreen.tsx`| `/applications/:id` | View application record | Full form data, Attached vault docs, Review notes | **Implemented** |
| `AiCopilotScreen.tsx` | `/ai/copilot` | Dedicated AI assistant | Suggestion pills, Multilingual chat, Structured guide | **Implemented** |
| `AiAssistantScreen.tsx` | `/ai/chat` | Compact AI chat widget | Lightweight chat stream with quick actions | **Implemented** |
| `GovernmentServicesScreen.tsx`| `/government-services` | Manage official links | 12 registry service cards, OTP connection modal | **Partially Implemented (Mocks)** |

---

## 26. User Flows & Navigation Journeys

### FLOW 1: Citizen Onboarding & Profile Setup
`Registration (/register)` ➔ `Profile Auto-Creation` ➔ `Dashboard (/dashboard)` ➔ `Profile Completion (/profile)` ➔ `Instant Eligibility Calculation`.

### FLOW 2: Scheme Discovery to AI Guidance
`Dashboard` ➔ `Eligible Schemes Tab (/recommendations)` ➔ `Select Scheme (/schemes/:id)` ➔ `Review Eligibility Rules` ➔ `Generate Step-by-Step AI Guidance` ➔ `Print / Save Checklist`.

### FLOW 3: Document Upload & AI Vision OCR Verification
`Document Vault (/documents)` ➔ `Upload Document (/documents/upload)` ➔ `AI Vision OCR Scan (/documents/:id/ocr)` ➔ `Verify Extracted Demographics` ➔ `Auto-Update Citizen Profile`.

### FLOW 4: Direct Benefit Application
`Scheme Details (/schemes/:id)` ➔ `Start Application (/applications/new)` ➔ `Auto-Populate Verified Demographics` ➔ `Select Pre-Verified Vault Documents` ➔ `Sign Self-Declaration` ➔ `Track Timeline (/applications/:id/timeline)`.

---

## 27. Functional Constraints (Must Not Be Altered)

The visual redesign must strictly preserve the following backend integrations and business rules:
1. **Authentication:** Bearer JWT Access Token + Refresh Token flow via Axios interceptors.
2. **Deterministic Rules Engine:** Scheme recommendations must remain computed by `/recommendations` and `/recommendations/recalculate`.
3. **Data Minimization:** Outgoing AI prompts must only include sanitized demographic fields (`age`, `gender`, `category`, `profession`, `state`, `annualIncomeINR`).
4. **AI Response Caching:** The UI must preserve the backend SHA-256 caching headers and display cached indicators where appropriate.
5. **WebSocket Gateway:** Real-time updates via `wss://.../ws` for `guidance_started`, `guidance_cached`, `guidance_completed`, and `guidance_failed`.
6. **HTTP Fallback:** If WebSocket disconnects, the UI must seamlessly fall back to HTTP `POST /ai/scheme-instructions`.
7. **Document Storage:** Files must upload via multipart form-data to `/documents/upload` with 10MB size limit and allowed mimetypes (PDF, JPEG, PNG, WEBP).

---

## 28. Non-Negotiable Constraints for Stitch

The Stitch AI UI Generator must strictly adhere to these negative constraints:
- 🚫 **Do NOT turn BenefitOS into a generic SaaS dashboard.**
- 🚫 **Do NOT replace deterministic eligibility with AI-generated approximations.**
- 🚫 **Do NOT remove navigation tabs or existing screen routes.**
- 🚫 **Do NOT invent fake active government integrations** (clearly denote simulated or planned gateways).
- 🚫 **Do NOT add emojis to serious government UI headers or status badges.**
- 🚫 **Do NOT use neon glow effects, floating gradient blobs, or heavy glassmorphism.**
- 🚫 **Do NOT remove bilingual support (English & Hindi).**
- 🚫 **Do NOT remove light mode parity or accessibility font scaling controls.**
- 🚫 **Do NOT alter existing API endpoint contracts or data transfer object (DTO) shapes.**

---

## 29. Stitch Design Generation Instructions

When generating the new UI for BenefitOS, the design engine must:
1. **Treat this document as the single source of truth** for all visual hierarchy, components, and screen structures.
2. **Implement a unified AppShell:** The `GovernmentHeader` and `DashboardSidebar` must frame every authenticated view without disappearing across sub-pages.
3. **Elevate Information Density:** Replace repetitive, oversized card boxes with sleek, compact data rows, tables, and structured checklists.
4. **Emphasize Public Service Credibility:** Use the deep navy/slate dark palette and crisp parchment light palette with authentic Indian emblem iconography.
5. **Make Eligibility the Core Anchor:** Ensure that whether a citizen is ELIGIBLE, INCOMPLETE, or NOT ELIGIBLE is immediately obvious within 2 seconds of viewing any scheme.
6. **Design Complete Responsive Layouts:** Provide explicit, pixel-perfect layouts for Desktop (1200px+), Tablet (768px–1023px with collapsed rail), and Mobile (<768px with drawer navigation).

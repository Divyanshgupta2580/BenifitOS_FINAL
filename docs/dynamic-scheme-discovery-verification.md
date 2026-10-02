# Dynamic Scheme Discovery, 3-Year Age Eligibility & Persistent Result Caching Verification

## Architecture

The BenefitOS Scheme Recommendation and Discovery pipeline operates on a deterministic, database-driven model with strict separation between rule evaluation, persistence, presentation, and AI guidance.

```mermaid
flowchart TD
    UserLogin[Citizen Authentication / Dashboard Load] --> Profile[Fetch Persisted Citizen Profile]
    Profile --> CacheCheck{Valid Persisted Recommendations in DB?}
    CacheCheck -->|Yes: DB Cache Valid| ReturnPersisted[Return Persisted Recommendations <br/>(Zero AI / Gemini Calls)]
    CacheCheck -->|No / Profile Mutated| Catalog[Load Active Schemes from Database]
    
    Catalog --> RulesEngine[Deterministic Eligibility Evaluator]
    RulesEngine --> TimingEval{Age & Condition Evaluation}
    
    TimingEval -->|All Criteria Met| EligibleNow["ELIGIBLE (Timing: NOW, yearsUntil: 0)"]
    TimingEval -->|Age Min Blocked (1-3 Yrs) & All Other Criteria Met| FutureEligible["FUTURE_ELIGIBLE (Timing: IN_1/2/3_YEARS)"]
    TimingEval -->|Non-Age Failure / State Mismatch| NotEligible["NOT_ELIGIBLE (Timing: NOT_APPLICABLE)"]
    TimingEval -->|Missing Profile Data| Incomplete["INCOMPLETE_PROFILE (Timing: NOT_APPLICABLE)"]
    TimingEval -->|Pending KYC/Verification| NeedsVerif["NEEDS_VERIFICATION (Timing: NOT_APPLICABLE)"]
    
    EligibleNow --> Persist[Persist to DB (SchemeRecommendation Table)]
    FutureEligible --> Persist
    NotEligible --> Persist
    Incomplete --> Persist
    NeedsVerif --> Persist
    
    Persist --> FrontendUI[Dynamic Frontend UI (Grouped by Timing & Status)]
    Persist --> AICache[Optional Grounded AI Explanation (Cached per Prompt/Lang)]
```

---

## Hardcoded Scheme Name Audit

A full-codebase audit was performed across frontend components, hooks, services, controllers, engines, and AI integrations.

| File Location | Hardcoded String Found | Nature (Data Fixture vs App Logic) | Hardening Action Taken |
|---|---|---|---|
| `apps/frontend/src/components/dashboard/EligibleSchemesSection.tsx` | `code === 'PM-KISAN'`, `code?.includes('SCHOLARSHIP')` | App presentation logic | Removed code checks; refactored image selector to be 100% category-driven (`AGRICULTURE`, `EDUCATION`, `HOUSING`). |
| `apps/frontend/src/components/dashboard/EligibleSchemesSection.tsx` | `defaultSchemes = [...]` (PM-KISAN, Post-Matric) | App fallback logic | Eradicated static fallback array. Enforced dynamic backend recommendations with verified empty state. |
| `apps/frontend/src/screens/schemes/SchemeCatalogScreen.tsx` | `(e.g. PM-KISAN, PMAY, Scholarship)` | UI input placeholder | Changed to generic: `Search by scheme name, department, category or keywords...` |
| `apps/frontend/src/screens/profile/CitizenProfileScreen.tsx` | `"...for PM-KISAN qualification."` | Static UI descriptive text | Changed to: `"...for agricultural welfare schemes qualification."` |
| `apps/frontend/src/screens/profile/LandDetailsScreen.tsx` | `"...records for PM-KISAN and agrarian subsidy..."` | Static UI descriptive text | Changed to: `"...records for agricultural and agrarian welfare subsidy schemes."` |
| `apps/frontend/src/hooks/useAiChat.ts` | Hardcoded prompt strings with specific scheme names | Suggested prompts | Changed to generic discovery prompts: `What welfare schemes am I eligible for right now?`, `Which schemes will I become eligible for in the future?` |
| `apps/backend/src/cron/daily-maintenance.cron.ts` | Scheme codes (`PM-KISAN`, `PMAY-GRAMIN`, etc.) | Database Seed / Catalog Sync Data | Preserved (legitimate catalog data sync). |
| `apps/backend/src/modules/welfare/welfare.service.ts` | Initial catalog seeds | Database Seed Data | Preserved (authoritative database seed). |

---

## Dynamic Scheme Discovery

- Evaluated creation of a synthetic government scheme (`DYN-EMPOWER-2030`: *Dynamic Citizen Empowerment Fellowship 2030*) not hardcoded anywhere in the frontend or backend.
- The deterministic eligibility engine discovered the scheme dynamically, verified criteria (`STUDENT`, `Income <= 300,000`, `Age >= 18`), and generated an `ELIGIBLE` recommendation.
- **Renaming Test**: Renamed the scheme in the database repository to *Renamed National Youth Innovation Fellowship 2030*. The recommendation engine and UI immediately rendered the updated title dynamically without requiring any frontend or backend code modifications (**PASS**).

---

## Current Eligibility

- Verified that citizens satisfying 100% of mandatory conditions receive:
  - `eligibilityStatus: 'ELIGIBLE'`
  - `eligibilityTiming: 'NOW'`
  - `yearsUntilEligible: 0`
  - `isEligible: true`
  - `matchPercentage: 100`
- Only schemes with `isEligible === true` and `eligibilityStatus === 'ELIGIBLE'` appear in the "Eligible Now" dashboard section (**PASS**).

---

## Future Eligibility (Age-Only Rule Engine)

- Implemented strict 3-year future age qualification in `EligibilityEvaluatorService`:
  - `FUTURE_ELIGIBLE` is granted **if and only if**:
    1. State/residence condition is satisfied.
    2. Zero missing profile fields.
    3. Zero pending verification rules.
    4. The **only** failed condition is an age-minimum restriction (`operator: GREATER_EQUAL` or `GREATER_THAN`).
    5. The difference $D = \text{targetMinAge} - \text{citizenAge}$ is within the window $1 \le D \le 3$.
    6. At future age $\text{citizenAge} + D$, all upper age bounds ($\le \text{maxAge}$) remain satisfied.
- Results for future-eligible schemes:
  - `isEligible: false` (strictly separated from current eligible schemes).
  - `eligibilityStatus: 'FUTURE_ELIGIBLE'`
  - `eligibilityTiming: 'IN_1_YEAR' | 'IN_2_YEARS' | 'IN_3_YEARS'`
  - `yearsUntilEligible: 1 | 2 | 3`

---

## 1-Year, 2-Year, 3-Year & Boundary Tests

Tested against adult higher education grant (`minAge = 18`, `income <= 400k`, `state = UP`):

| Citizen Age | Target Minimum Age | Other Conditions | Expected Status | Actual Status | Timing | Years Until Eligible | Result |
|---|---|---|---|---|---|---|---|
| **19** | 18 | Income 200k, Student, UP | `ELIGIBLE` | `ELIGIBLE` | `NOW` | 0 | **PASS** |
| **18** | 18 | Income 200k, Student, UP | `ELIGIBLE` | `ELIGIBLE` | `NOW` | 0 | **PASS** |
| **17** | 18 | Income 200k, Student, UP | `FUTURE_ELIGIBLE` | `FUTURE_ELIGIBLE` | `IN_1_YEAR` | 1 | **PASS** |
| **16** | 18 | Income 200k, Student, UP | `FUTURE_ELIGIBLE` | `FUTURE_ELIGIBLE` | `IN_2_YEARS` | 2 | **PASS** |
| **15** | 18 | Income 200k, Student, UP | `FUTURE_ELIGIBLE` | `FUTURE_ELIGIBLE` | `IN_3_YEARS` | 3 | **PASS** |
| **14** | 18 | Income 200k, Student, UP | `NOT_ELIGIBLE` | `NOT_ELIGIBLE` | `NOT_APPLICABLE` | null | **PASS** |
| **13** | 18 | Income 200k, Student, UP | `NOT_ELIGIBLE` | `NOT_ELIGIBLE` | `NOT_APPLICABLE` | null | **PASS** |

### Maximum Age Window Tests (Scheme with $18 \le \text{Age} \le 20$):
- **Age 17**: Future age 18 satisfies $18 \le 20 \implies$ `FUTURE_ELIGIBLE` (`IN_1_YEAR`, `yearsUntilEligible = 1`) (**PASS**).
- **Age 20**: Currently within window $\implies$ `ELIGIBLE` (`NOW`, `0`) (**PASS**).
- **Age 21**: Exceeds maximum limit of $20 \implies$ `NOT_ELIGIBLE` (`NOT_APPLICABLE`, `null`) (**PASS**).

---

## Non-Age Failure Isolation Tests

Verified that non-age failures are never masked as future-eligible:

| Scenario | Age | Failing Condition | Expected Status | Actual Status | Timing | Result |
|---|---|---|---|---|---|---|
| **Non-Age Income** | 17 (1 yr away) | Income ₹800,000 (> 400,000 limit) | `NOT_ELIGIBLE` | `NOT_ELIGIBLE` | `NOT_APPLICABLE` | **PASS** |
| **Non-Age State** | 17 (1 yr away) | Resident of MP (Scheme is UP only) | `NOT_ELIGIBLE` | `NOT_ELIGIBLE` | `NOT_APPLICABLE` | **PASS** |
| **Non-Age Missing Data** | 17 (1 yr away) | `employmentStatus` is null | `INCOMPLETE_PROFILE` | `INCOMPLETE_PROFILE` | `NOT_APPLICABLE` | **PASS** |
| **Non-Age Verification** | 17 (1 yr away) | Aadhaar KYC unverified | `NEEDS_VERIFICATION` | `NEEDS_VERIFICATION` | `NOT_APPLICABLE` | **PASS** |

---

## Database Persistence & Cache Behavior

- **First Login / Dashboard Load**:
  - Authenticates user and checks `SchemeRecommendation` repository.
  - Initial evaluation runs deterministically and persists all recommendation records to the database.
  - **Gemini AI Call Count**: **0** (**PASS**).
- **Second Login / Dashboard Reload**:
  - Authenticates user and retrieves existing valid recommendations directly from the database repository.
  - **Gemini AI Call Count**: **0** (**PASS**).
- **Profile Mutation & Invalidation**:
  - Updating citizen demographics (e.g., DOB, income, state, employment) triggers `recommendationRepo.deleteForCitizen()` and `aiCacheService.invalidateForUser()`.
  - Next retrieval dynamically recalculates fresh recommendations and persists updated state (**PASS**).

---

## Gemini Call Count & Grounding

| Request / Action | AI Provider Calls Expected | AI Provider Calls Actual | Grounding & Source |
|---|---|---|---|
| First User Login | 0 | 0 | Database / Deterministic Engine |
| Dashboard Reload | 0 | 0 | Database Persisted Records |
| Navigate Schemes Tab | 0 | 0 | Database Persisted Records |
| Ask: "Why am I eligible for Scheme X?" (First time) | 1 | 1 | Sanitized Deterministic Context |
| Ask: "Why am I eligible for Scheme X?" (Repeated) | 0 (Cache Hit) | 0 (Cache Hit) | Deterministic AI Cache |
| Ask: "What will I be eligible for in 2 years?" | 1 | 1 | `futureEligibleSchemes` Payload |

---

## Gemini Failure Resilience

- Injected simulated service failure (`Error: Gemini API Service Outage - 503 Unavailable`).
- Recommendations API and dashboard continued to return all active schemes:
  - Confirmed "Eligible Now" schemes: **Available** (100% operational)
  - "Eligible in 1 Year" schemes: **Available** (100% operational)
  - "Eligible in 2 Years" schemes: **Available** (100% operational)
  - "Eligible in 3 Years" schemes: **Available** (100% operational)
- **Verdict**: Core welfare discovery and eligibility recommendations are 100% resilient to AI provider outages (**PASS**).

---

## Frontend Dynamic UI Verification

1. **Dashboard (`EligibleSchemesSection.tsx`)**:
   - Renders only confirmed `isEligible === true` schemes under "Schemes You Are Eligible For".
   - Displays a dynamic badge for `+X Future (1-3 Yrs)` when future eligible schemes exist.
   - Category-driven imagery and zero hardcoded scheme names.
2. **Recommendation Dashboard (`RecommendationDashboardScreen.tsx`)**:
   - Filter tabs: `Eligible Now (N)`, `In 1 Year (N)`, `In 2 Years (N)`, `In 3 Years (N)`, `Needs Verification (N)`, `Incomplete (N)`, `Not Eligible (N)`, `All (N)`.
   - Distinct, descriptive status badges:
     - `Eligible Now (100% Match)` (Emerald)
     - `Eligible in 1/2/3 Yr(s)` (Sky)
     - `Verification Required` (Indigo)
     - `Complete Profile` (Amber)
     - `Not Eligible` (Rose)
   - Dynamic titles and benefit amounts rendered from API response.

---

## Test Summary

| Test Suite | Assertions / Tests | Passed | Failed | Blocked |
|---|---|---|---|---|
| **Dynamic Scheme & Future Age Suite** (`test-dynamic-scheme-future-eligibility.ts`) | 56 | 56 | 0 | 0 |
| **Deterministic Accuracy Audit Suite** (`test-eligible-scheme-accuracy.ts`) | 61 | 61 | 0 | 0 |
| **Strict Eligibility Scenarios** (`test-strict-eligibility.ts`) | 25 | 25 | 0 | 0 |
| **Security & IDOR Regression Suite** (`test-security-idor.ts`) | 24 | 24 | 0 | 0 |
| **AI Minimization & Caching Benchmark** (`test-ai-performance-benchmark.ts`) | 60 | 60 | 0 | 0 |
| **All Other Monolith Suites (Registration, Reset, Personas, Cron, etc.)** | 100+ | 100+ | 0 | 0 |
| **Total Test Suites Executed** | 13 suites | 13 suites | 0 | 0 |

**Final Verification Result**: **100% PASS WITH ZERO REGRESSIONS**.

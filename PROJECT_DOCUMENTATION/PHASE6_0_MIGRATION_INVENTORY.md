# BenefitOS — Phase 6.0 Migration Inventory

## 1. Executive Summary
This document establishes the verified inventory of frontend dependencies, UI components, navigation logic, and build systems for migrating BenefitOS from an **Expo / React Native** client to a **Pure React Web Application (React DOM + TypeScript + Vite + Web Browsers)**.

---

## 2. Framework & Runtime Inventory

| Category | Current Monorepo State | Target Web State | Action Required |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React Native `0.76.6` / Expo SDK `52.0.0` | React `18.3.1` + React DOM `18.3.1` | Replace Expo/RN with React DOM |
| **Build System / Bundler** | Expo / Metro Bundler | Vite `6.x` + `@vitejs/plugin-react` | Create `vite.config.ts`, `index.html` |
| **TypeScript Version** | TypeScript `5.3.3` | TypeScript `5.7.2` | Retain & align with monorepo |
| **Routing / Navigation** | Custom State Switch inside `AppNavigator.tsx` | React Router DOM `v7` (`BrowserRouter`) | Refactor to browser URL-based routes |
| **State Management** | Zustand `5.0.3` | Zustand `5.0.3` | Retain (100% web compatible) |
| **Server State / Caching**| TanStack React Query `5.66.0` | TanStack React Query `5.66.0` | Retain (100% web compatible) |
| **Networking** | Axios `1.7.9` | Axios `1.7.9` | Retain (100% web compatible) |
| **Realtime WebSockets** | Socket.IO Client `4.8.1` | Socket.IO Client `4.8.1` | Retain (100% web compatible) |
| **Storage Service** | `@react-native-async-storage/async-storage` | Native `window.localStorage` abstraction | Replace AsyncStorage with localStorage |

---

## 3. UI Primitive Migration Mapping (React Native → Web Semantic HTML)

| React Native Primitive | Web Semantic HTML / CSS Equivalent | Files Affected |
| :--- | :--- | :--- |
| `<View>` | `<div />`, `<section />`, `<main />`, `<header />`, `<article />` | 35+ screen & UI files |
| `<Text>` | `<p />`, `<span />`, `<h1-h6 />`, `<label />` | 35+ screen & UI files |
| `<TextInput>` | `<input />`, `<textarea />` | Auth, Profile, AI, Search screens |
| `<TouchableOpacity>` | `<button />`, `<a />` | All interactive buttons & links |
| `<ScrollView>` | `<div style="overflow-y: auto" />` | Dashboard, Catalog, AI screens |
| `<FlatList>` | `<ul />` / mapped array collections | List screens (Schemes, Vault, Apps) |
| `<ActivityIndicator>` | Custom CSS Spinner / SVG Loader | Loading components & buttons |
| `<Modal>` | `<dialog />` / Accessible Web Overlay (`fixed inset-0`) | DocumentViewerModal, Confirmations |
| `<Alert.alert>` | Accessible Web Modal / Toast Banner | AI, Auth, Document screens |
| `<KeyboardAvoidingView>`| Standard CSS Flexbox / Media Query Web Layout | Form screens |
| `StyleSheet.create` | Tailwind CSS / Standard Web CSS Classes / Modules | All screens & components |

---

## 4. Source Files Inventory

### A. Files Requiring Code Refactoring (Migration Targets)
1. **Entrypoint & Navigation**:
   * `apps/frontend/App.tsx` (Wrap with BrowserRouter & Vite entry point)
   * `apps/frontend/src/navigation/AppNavigator.tsx` (Migrate to React Router DOM Routes)
2. **UI Components (`apps/frontend/src/components/ui/`)**:
   * `Badge.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx`, `LoadingSpinner.tsx`, `Skeleton.tsx`
3. **Storage & API Services (`apps/frontend/src/services/`)**:
   * `storage.service.ts` (Replace `@react-native-async-storage/async-storage` with `window.localStorage`)
   * `api-client.ts` (Update default base URL for Vite env `import.meta.env.VITE_API_URL`)
   * `websocket-client.ts` (Update URL resolution for web sockets)
4. **All Screen Components (`apps/frontend/src/screens/`)**:
   * Auth: `LanguageSelectScreen`, `LoginScreen`, `RegisterScreen`, `PasswordResetScreen`, `MfaSetupScreen`, `OnboardingScreen`
   * Dashboard: `DashboardScreen`
   * Profile: `CitizenProfileScreen`, `DemographicsEditScreen`, `AddressEditScreen`, `HouseholdMembersScreen`, `LandDetailsScreen`
   * Schemes: `SchemeCatalogScreen`, `SchemeDetailScreen`, `EligibilitySimulatorScreen`
   * Recommendations: `RecommendationDashboardScreen`, `RecommendationDetailScreen`, `RecommendationExplanationScreen`, `RecommendationComparisonScreen`
   * Documents: `DocumentVaultScreen`, `DocumentUploadScreen`, `DocumentViewerModal`, `OcrReviewScreen`
   * Applications: `ApplicationsListScreen`, `ApplicationWizardScreen`, `ApplicationTimelineScreen`, `ApplicationDetailScreen`
   * AI: `AiAssistantScreen`, `AiCopilotScreen`
   * Integrations: `GovernmentServicesScreen`

### B. Files Safe to Preserve Unchanged (Core Logic & Custom Hooks)
* All custom React Query hooks in `apps/frontend/src/hooks/` (`useCitizenProfile`, `useSchemes`, `useEligibility`, `useAiCopilot`, `useDocuments`, `useApplications`, etc.)
* API Domain Services (`ai.service.ts`, `citizen.service.ts`, `welfare.service.ts`, `document.service.ts`, `application.service.ts`, `government.service.ts`, `notification.service.ts`, `ocr.service.ts`, `recommendation.service.ts`)
* Zustand Stores (`auth.store.ts`, `language.store.ts`)
* Theme Definition (`theme/index.ts`, `colors.ts`, `spacing.ts`, `typography.ts`)

### C. Configuration Files Requiring Replacement / Deletion
* `apps/frontend/app.json` (Mobile Expo Config - to be removed)
* `apps/frontend/.env.example` (Migrate `EXPO_PUBLIC_*` to `VITE_*`)

---

## 5. Dependency Audit

### Dependencies to Remove:
* `expo`
* `expo-status-bar`
* `react-native`
* `react-native-web`
* `@react-native-async-storage/async-storage`

### Dependencies to Add:
* `react-router-dom` (Web Routing)
* `vite`, `@vitejs/plugin-react` (Web Build Tooling)

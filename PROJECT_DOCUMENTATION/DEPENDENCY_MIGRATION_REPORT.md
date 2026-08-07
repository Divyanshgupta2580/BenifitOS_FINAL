# BenefitOS Dependency Migration & Usage Classification Report

| Field | Value |
|-------|-------|
| Document Title | BenefitOS Dependency Classification & Migration Analysis Report |
| Document Number | DMR-2026-FINAL |
| Status | VERIFIED ACTIVE |
| Date | 2026-08-07 |

---

## 1. Package Usage Classification Matrix

| Package Name | Version Spec | Usage Status | Used In | Can Remove |
|--------------|--------------|--------------|---------|------------|
| `react-native` | `0.76.6` | 🔴 **ACTIVE & BLOCKING** | All 35 UI screens and component interfaces | **NO** |
| `expo` | `~52.0.0` | 🔴 **ACTIVE & BLOCKING** | Bundling & asset resolution | **NO** |
| `react-native-web` | `~0.19.13` | 🔴 **ACTIVE & BLOCKING** | Web browser DOM compilation | **NO** |
| `@react-native-async-storage/async-storage` | `^2.1.0` | 🔴 **ACTIVE & BLOCKING** | JWT token storage (`storage.service.ts`) | **NO** |
| `expo-status-bar` | `~2.0.0` | 🟢 **ACTIVE** | App status bar rendering | **NO** |
| `@tanstack/react-query` | `^5.66.0` | 🔴 **ACTIVE & BLOCKING** | Data fetching & cache management | **NO** |
| `zustand` | `^5.0.3` | 🔴 **ACTIVE & BLOCKING** | Auth & language state management | **NO** |
| `axios` | `^1.7.9` | 🔴 **ACTIVE & BLOCKING** | REST API HTTP client | **NO** |
| `socket.io-client` | `^4.8.1` | 🔴 **ACTIVE & BLOCKING** | Realtime WebSocket gateway client | **NO** |

---

## 2. Framework Migration Analysis (If Migrating to Web-Only React Vite in Future)

If a future architectural mandate requires migrating from React Native Expo to Web-only React Vite:

1. **Components Affected**: 35 UI screens and 6 reusable UI components.
2. **Primitives to Replace**:
   - `View` -> `<div>` or `<section>`
   - `Text` -> `<span>` or `<p>`
   - `TouchableOpacity` -> `<button>`
   - `ScrollView` / `FlatList` -> CSS overflow containers or `@tanstack/react-virtual`
   - `StyleSheet.create` -> Vanilla CSS / CSS Modules
   - `Alert.alert` -> Custom Modal / Toast notification component
3. **Preserved Core Libraries**: `@tanstack/react-query`, `zustand`, `axios`, `socket.io-client` remain 100% reusable without modification.

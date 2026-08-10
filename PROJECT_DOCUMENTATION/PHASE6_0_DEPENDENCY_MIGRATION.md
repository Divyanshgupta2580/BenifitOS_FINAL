# BenefitOS — Phase 6.0 Dependency Migration

## 1. Executive Summary
This document specifies all dependency changes for `apps/frontend/package.json` to complete the migration from Expo/React Native to a pure React Web application.

---

## 2. Package Changes Audit

### Packages to Remove (React Native / Expo Native Dependencies)

| Package Name | Current Version | Reason for Removal | Replacement |
| :--- | :--- | :--- | :--- |
| `expo` | `~52.0.0` | Mobile Expo runtime framework | Vite `6.x` + React DOM |
| `expo-status-bar` | `~2.0.0` | Mobile native status bar control | Native Web Browser Title & Meta Tags |
| `react-native` | `0.76.6` | Mobile Native framework | React DOM `18.3.1` |
| `react-native-web` | `~0.19.13` | Compatibility bridge for RN UI primitives | Pure HTML5 + CSS / Tailwind |
| `@react-native-async-storage/async-storage` | `^2.1.0` | Native mobile key-value storage | Native `window.localStorage` abstraction |

---

### Packages to Retain (100% Web Compatible)

| Package Name | Installed Version | Purpose / Web Compatibility |
| :--- | :--- | :--- |
| `react` | `18.3.1` | Core UI library |
| `react-dom` | `18.3.1` | Web DOM Renderer |
| `@tanstack/react-query` | `^5.66.0` | Async server state & caching |
| `axios` | `^1.7.9` | HTTP client for backend REST API |
| `socket.io-client` | `^4.8.1` | Realtime WebSockets communication |
| `zustand` | `^5.0.3` | Client state management (`auth`, `language`) |
| `typescript` | `^5.3.3` | Static type system |

---

### Packages to Add (Web Production Stack)

| Package Name | Target Version | Purpose |
| :--- | :--- | :--- |
| `react-router-dom` | `^7.1.5` | Client-side web router with URL history |
| `vite` | `^6.1.0` | High-performance Web Build Tool & Dev Server |
| `@vitejs/plugin-react` | `^4.3.4` | Vite plugin for React JSX / Fast Refresh |
| `tailwindcss` | `^3.4.17` | Utility-first CSS framework for responsive layout |
| `postcss` | `^8.5.1` | CSS processor for Tailwind |
| `autoprefixer` | `^10.4.20` | Vendor prefixing for web browser compatibility |

---

## 3. Environment Variable Strategy

| Legacy Expo Env Var | New Web Vite Env Var | Scope / Usage |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | `VITE_API_URL` | Base REST API URL (e.g., `http://localhost:4000/api/v1`) |
| `EXPO_PUBLIC_WS_URL` | `VITE_WS_URL` | Realtime WebSocket Gateway URL (e.g., `ws://localhost:4000/ws`) |

*Security Warning: No backend secrets (e.g., `JWT_SECRET`, `DATABASE_URL`) will be exposed to `VITE_*` environment variables.*

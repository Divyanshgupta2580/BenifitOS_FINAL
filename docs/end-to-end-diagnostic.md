# BenefitOS End-to-End Diagnostic

## Scope

This diagnostic records read-only repository inspection and live protocol probes performed on 2026-10-01. Browser automation was not performed, and no secrets or tokens were recorded.

## Expected flow

A new citizen registers through `POST /api/v1/auth/register`, receives an access token and an HttpOnly refresh cookie, enters the authenticated React route, loads profile and recommendation data over HTTP, connects to the Socket.IO `/ws` namespace, and can then use schemes, deterministic eligibility, AI Copilot, documents, applications, and government-services views.

## Actual flow verified so far

- The deployed health endpoint is reachable and healthy.
- A fresh registration succeeded with HTTP 201 and returned a new citizen user plus an access-token field.
- Authenticated requests for the fresh citizen succeeded:
  - `/citizens/me`: HTTP 200, response key `profile`
  - `/recommendations`: HTTP 200, 7 recommendations
  - `/documents`: HTTP 200, empty `documents` array
  - `/applications`: HTTP 200, empty `applications` array
  - `/notifications`: HTTP 200, empty `notifications` array
  - `/schemes`: HTTP 200, 7 schemes
- The repository live websocket probe initially could not start because `socket.io-client` is not resolvable from the backend script's module path. Running it with the workspace's frontend dependency path resolved that local tooling issue.
- Existing repository documentation claims a prior live websocket success, but that evidence was not independently reproduced in this pass.

## First user-facing failure under investigation

The dashboard skeleton is rendered while both the profile and recommendation React Query calls are loading. The dashboard has no visible query error or retry branch; it only switches from skeleton to content when both queries are no longer loading. The other dashboard requests are not included in this loading predicate. Therefore, a rejected or long-running profile/recommendation query can leave the user without a useful error state, while websocket connection status is a separate concern.

The Gateway Status card itself maps `CONNECTING` to the displayed Connecting state. The websocket client sets `ERROR` on `connect_error` and has a timeout, but it enables Socket.IO reconnection and does not impose a bounded dashboard-level connection state transition. HTTP dashboard queries do not depend on websocket status.

## Evidence and errors

### HTTP

- `GET https://benefitos-backend-1dq1.onrender.com/api/v1/health`: HTTP 200; database and memory health were up.
- Fresh `POST /auth/register`: HTTP 201; returned `user` and `tokens.accessToken` keys. The access token value was intentionally suppressed.
- All six fresh-citizen dashboard/scheme requests listed above returned HTTP 200.
- No 401, 403, 404, 409, 429, 500, CORS, or JSON parsing error was observed in these direct probes.

### WebSocket

- Intended production URL from frontend environment: `wss://benefitos-backend-1dq1.onrender.com/ws`.
- Frontend converts the `wss://` URL to `https://` for Socket.IO client initialization, which is the expected Socket.IO URL form; the gateway declares namespace `ws`.
- An initial local probe failed before connecting with: `Cannot find module 'socket.io-client'` from `apps/backend/src/live-ws-probe.js`.
- With `NODE_PATH=apps/frontend/node_modules`, the live probe connected to production, received `connection_ack`, subscribed to the fresh citizen's private room, and received invalid-token rejection. No deployed gateway handshake failure was observed.
- Browser smoke testing from the deployed root completed fresh registration and reached `/dashboard`; the rendered page showed dashboard data and `Gateway Status: Operational`.
- Direct browser navigation to `/register` returned HTTP 404 from the deployed static host, while the in-app Register button successfully opened the route. This remains a deployment/deep-link verification issue.

### Frontend code path

- `AppNavigator` restores auth state before protected routes render.
- `api-client.ts` attaches `Authorization: Bearer <token>` from storage and unwraps the backend transform envelope.
- Login and registration read `response.user` and `response.tokens.accessToken` after that unwrapping.
- `DashboardScreen` derives `isLoadingInitial` from `isProfileLoading && isRecsLoading` and does not render `isError` states for either query.
- Dashboard documents, applications, and notifications are fetched but do not participate in the initial skeleton decision and have no explicit empty/error presentation at this screen boundary.

## Root cause status

**Confirmed:** the dashboard loading UI has incomplete state handling: it exposes loading and success only for the primary profile/recommendation gate, with no user-facing error state or retry path. This is a real defect even though the fresh-citizen HTTP probes succeeded.

**Not yet confirmed:** the original deployed screenshot's specific cause for remaining in `CONNECTING`. The production endpoint, authenticated handshake, and rendered dashboard now pass in a fresh browser journey. The client still needs a browser-level websocket-off test, but it now exposes an exhausted-retry error state instead of remaining in `CONNECTING` indefinitely.

## Proposed targeted fix

1. Make the dashboard’s primary HTTP state explicit: loading, success, empty, and error, with a bounded retry action. Do not let a rejected profile/recommendation query present as an indefinite skeleton.
2. Make websocket connection attempts bounded at the service/UI boundary and surface `Live sync unavailable` after failure while leaving HTTP content usable. Do not claim operational status without the gateway `connect`/`connection_ack` event.
3. Add focused tests or executable checks for the dashboard error/fallback transitions and re-run frontend/backend builds plus the available backend suites.

## Verification limits

The deployed browser journey, visual responsive checks, websocket-on/off comparison, document upload, application creation, government integration truthfulness, and live AI provider/cache behavior were not independently verified in this pass. Existing claims in repository documentation are treated as historical context, not new evidence.

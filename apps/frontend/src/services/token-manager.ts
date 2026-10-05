/**
 * BenefitOS — In-Memory Token Manager
 * Strictly stores the short-lived access token in volatile memory.
 * Never persists or exposes tokens to localStorage, sessionStorage, cookies, or IndexedDB.
 */

type TokenListener = (token: string | null) => void;
const listeners = new Set<TokenListener>();

let inMemoryAccessToken: string | null = null;

export const tokenManager = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
    listeners.forEach((fn) => {
      try {
        fn(token);
      } catch (err) {
        console.warn("[TokenManager] Listener error:", err);
      }
    });
  },

  clearAccessToken(): void {
    inMemoryAccessToken = null;
    listeners.forEach((fn) => {
      try {
        fn(null);
      } catch (err) {
        console.warn("[TokenManager] Listener error:", err);
      }
    });
  },

  subscribe(listener: TokenListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

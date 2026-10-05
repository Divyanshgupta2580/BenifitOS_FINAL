import { create } from "zustand";
import axios from "axios";
import { storageService } from "../services/storage.service";
import { apiClient, getApiBaseUrl } from "../services/api-client";
import { tokenManager } from "../services/token-manager";
import { wsService } from "../services/websocket-client";
import { queryClient } from "../queryClient";

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => Promise<void>;
  setAccessToken: (accessToken: string | null) => void;
  logout: () => Promise<void>;
  loadAuthFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setAuth: async (user, accessToken, _refreshToken) => {
    queryClient.clear();
    // In-memory access token storage ONLY
    tokenManager.setAccessToken(accessToken);
    await storageService.setItem("user", JSON.stringify(user));
    // Clean up any historical persistent token remnants
    await storageService.removeItem("accessToken");
    await storageService.removeItem("access_token");
    await storageService.removeItem("refreshToken");
    set({ user, accessToken, refreshToken: null, isAuthenticated: true, error: null });
  },

  setAccessToken: (accessToken: string | null) => {
    tokenManager.setAccessToken(accessToken);
    set((state) => ({
      accessToken,
      isAuthenticated: Boolean(accessToken && state.user),
    }));
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // Ignore network errors on logout
    }
    queryClient.clear();
    try {
      wsService.disconnect();
    } catch {}
    tokenManager.clearAccessToken();
    await storageService.removeItem("user");
    await storageService.removeItem("accessToken");
    await storageService.removeItem("access_token");
    await storageService.removeItem("refreshToken");
    // Broadcast logout to other browser tabs without exposing tokens
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem("benefitos_logout_event", Date.now().toString());
      } catch {}
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, error: null });
  },

  loadAuthFromStorage: async () => {
    set({ isLoading: true });
    try {
      // 1. If in-memory access token already exists, continue with active session
      const currentToken = tokenManager.getAccessToken();
      if (currentToken && get().user) {
        set({ accessToken: currentToken, isAuthenticated: true, isLoading: false });
        return;
      }

      // 2. Perform silent refresh on startup via HttpOnly cookie
      const refreshResponse = await axios.post<{
        success?: boolean;
        data?: {
          user?: User;
          tokens?: { accessToken: string };
          accessToken?: string;
        };
        user?: User;
        tokens?: { accessToken: string };
        accessToken?: string;
      }>(
        `${getApiBaseUrl()}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const resData = refreshResponse.data?.data || refreshResponse.data;
      const newAccessToken =
        resData?.tokens?.accessToken ??
        resData?.accessToken ??
        refreshResponse.data?.tokens?.accessToken ??
        refreshResponse.data?.accessToken;

      if (newAccessToken) {
        tokenManager.setAccessToken(newAccessToken);

        let user: User | null = resData?.user ?? refreshResponse.data?.user ?? null;
        if (!user) {
          const userStr = await storageService.getItem("user");
          if (userStr) {
            try {
              user = JSON.parse(userStr);
            } catch {}
          }
        } else {
          await storageService.setItem("user", JSON.stringify(user));
        }

        // Purge any legacy storage tokens
        await storageService.removeItem("accessToken");
        await storageService.removeItem("access_token");

        set({
          user,
          accessToken: newAccessToken,
          refreshToken: null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        tokenManager.clearAccessToken();
        await storageService.removeItem("user");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      tokenManager.clearAccessToken();
      await storageService.removeItem("user");
      await storageService.removeItem("accessToken");
      await storageService.removeItem("access_token");
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Sync in-memory token updates between tokenManager and Zustand store
tokenManager.subscribe((token) => {
  const state = useAuthStore.getState();
  if (state.accessToken !== token) {
    useAuthStore.setState({
      accessToken: token,
      isAuthenticated: Boolean(token && state.user),
    });
  }
});

// Cross-tab synchronization via StorageEvent
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === "benefitos_logout_event" || (event.key === "user" && !event.newValue)) {
      tokenManager.clearAccessToken();
      queryClient.clear();
      try {
        wsService.disconnect();
      } catch {}
      useAuthStore.setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  });
}

import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  clearTokens: () => void;
}

const ACCESS_KEY = "oracle.accessToken";
const REFRESH_KEY = "oracle.refreshToken";

function getStored(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: getStored(ACCESS_KEY),
  refreshToken: getStored(REFRESH_KEY),
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACCESS_KEY, accessToken);
      window.localStorage.setItem(REFRESH_KEY, refreshToken);
    }
    set({ accessToken, refreshToken });
  },
  clearTokens: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
    }
    set({ accessToken: null, refreshToken: null });
  },
}));

"use client";

import { create } from "zustand";
import { authApi } from "@/api/authApi";
import type { User } from "@/types/auth.types";

const USER_KEY = "cv_maker_user";

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  isAuthenticated: () => boolean;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadUser(),
  accessToken: null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.login({ email, password });
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      set({ user: data.user, accessToken: data.accessToken, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      const { data } = await authApi.register({ email, password, fullName });
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      set({ user: data.user, accessToken: data.accessToken, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — backend may have already expired the cookie
    } finally {
      get().clearAuth();
    }
  },

  refresh: async () => {
    try {
      const { data } = await authApi.refresh();
      set({ accessToken: data.accessToken });
      return true;
    } catch {
      return false;
    }
  },

  isAuthenticated: () => get().accessToken !== null,

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
    set({ user: null, accessToken: null });
  },
}));

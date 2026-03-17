import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, Permission } from "@/config/rbac";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

/**
 * Lo que devuelve el backend en /auth/login y /auth/refresh.
 * `permissions` es el array real que el frontend usa para RBAC —
 * no se recalcula nada localmente.
 */
export interface AuthPayload {
  user: User;
  permissions: Permission[];
  accessToken: string;
  refreshToken?: string;
}

interface AuthState {
  user: User | null;
  permissions: Permission[];
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (payload: AuthPayload) => void;
  setToken: (token: string) => void;
  logout: () => void;

  // Helpers RBAC — comparan contra el array que vino del backend
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: ({ user, permissions, accessToken, refreshToken }) =>
        set({
          user,
          permissions,
          token: accessToken,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        }),

      setToken: (token) => set({ token }),

      logout: () =>
        set({
          user: null,
          permissions: [],
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      // Chequea si el usuario tiene UN permiso específico
      can: (permission) => get().permissions.includes(permission),

      // Chequea si el usuario tiene AL MENOS UNO de los permisos
      canAny: (permissions) =>
        permissions.some((p) => get().permissions.includes(p)),

      // Chequea si el usuario tiene TODOS los permisos
      canAll: (permissions) =>
        permissions.every((p) => get().permissions.includes(p)),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

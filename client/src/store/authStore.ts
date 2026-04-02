import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, Permission } from "@/config/rbac";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface User {
  uuid: string;       // identificador público — nunca el id interno
  nombre: string;
  username: string;
  email: string;
  roles: Role[];      // array — un usuario puede tener varios roles
  avatar?: string;
}

/**
 * Lo que devuelve el backend en /auth/login y /auth/register.
 * `permissions` es el array real que el frontend usa para RBAC.
 */
export interface AuthPayload {
  user: User;
  permissions: Permission[];
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  permissions: Permission[];
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (payload: AuthPayload) => void;
  setToken: (token: string, refreshToken?: string) => void;
  logout: () => void;

  // Helpers RBAC
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
          refreshToken,
          isAuthenticated: true,
        }),

      // Usado por el interceptor de axios tras un refresh exitoso
      setToken: (token, refreshToken) =>
        set((state) => ({
          token,
          ...(refreshToken ? { refreshToken } : {}),
          isAuthenticated: true,
        })),

      logout: () =>
        set({
          user: null,
          permissions: [],
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      can: (permission) => get().permissions.includes(permission),
      canAny: (permissions) => permissions.some((p) => get().permissions.includes(p)),
      canAll: (permissions) => permissions.every((p) => get().permissions.includes(p)),
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
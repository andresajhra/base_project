import type { AuthPayload } from "@/store/authStore";

// ─── Usuarios de prueba ───────────────────────────────────────────────────────
// Cada usuario tiene un set de permisos distinto para probar el RBAC completo.

export const MOCK_USERS: Record<string, AuthPayload> = {
  "admin@demo.com": {
    user: {
      id: "1",
      name: "Admin Demo",
      email: "admin@demo.com",
      role: "admin",
      avatar: "",
    },
    permissions: [
      "dashboard:view",
      "users:view",
      "users:create",
      "users:edit",
      "users:delete",
      "reports:view",
      "reports:export",
      "settings:view",
      "settings:edit",
      "audit:view",
    ],
    accessToken: "mock-token-admin",
    refreshToken: "mock-refresh-admin",
  },

  "manager@demo.com": {
    user: {
      id: "2",
      name: "Manager Demo",
      email: "manager@demo.com",
      role: "manager",
      avatar: "",
    },
    permissions: [
      "dashboard:view",
      "users:view",
      "users:create",
      "users:edit",
      "reports:view",
      "reports:export",
      "settings:view",
    ],
    accessToken: "mock-token-manager",
    refreshToken: "mock-refresh-manager",
  },

  "analyst@demo.com": {
    user: {
      id: "3",
      name: "Analyst Demo",
      email: "analyst@demo.com",
      role: "analyst",
      avatar: "",
    },
    permissions: [
      "dashboard:view",
      "reports:view",
      "reports:export",
    ],
    accessToken: "mock-token-analyst",
    refreshToken: "mock-refresh-analyst",
  },

  "viewer@demo.com": {
    user: {
      id: "4",
      name: "Viewer Demo",
      email: "viewer@demo.com",
      role: "viewer",
      avatar: "",
    },
    permissions: [
      "dashboard:view",
      "reports:view",
    ],
    accessToken: "mock-token-viewer",
    refreshToken: "mock-refresh-viewer",
  },
};

// Contraseña válida para todos los usuarios mock
export const MOCK_PASSWORD = "demo1234";

export async function mockLogin(
  email: string,
  password: string
): Promise<AuthPayload> {
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 600));

  const payload = MOCK_USERS[email];

  if (!payload || password !== MOCK_PASSWORD) {
    throw new Error("Credenciales inválidas");
  }

  return payload;
}

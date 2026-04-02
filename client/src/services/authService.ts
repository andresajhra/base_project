import api from "@/lib/axios";
import { mockLogin } from "./auth.mock";
import type { AuthPayload } from "@/store/authStore";
import { env } from "@/config/env";

// ─── Flag de mock ─────────────────────────────────────────────────────────────
const USE_MOCK = env.useMock === "true";

// identifier puede ser email o username
export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginService(
  credentials: LoginCredentials
): Promise<AuthPayload> {
  if (USE_MOCK) {
    return mockLogin(credentials.identifier, credentials.password);
  }

  const { data } = await api.post<{ success: boolean; data: AuthPayload }>(
    "/auth/login",
    credentials
  );
  return data.data;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutService(refreshToken: string): Promise<void> {
  // Si falla no bloqueamos el logout del frontend
  try {
    await api.post("/auth/logout", { refreshToken });
  } catch {
    // silencioso — el store se limpia igual
  }
}

// ─── Logout all sessions ──────────────────────────────────────────────────────
export async function logoutAllService(refreshToken: string): Promise<void> {
  try {
    await api.post("/auth/logout-all", { refreshToken });
  } catch {
    // silencioso
  }
}

// ─── Refresh token ────────────────────────────────────────────────────────────
export async function refreshTokenService(
  refreshToken: string
): Promise<RefreshResponse> {
  const { data } = await api.post<{ success: boolean; data: RefreshResponse }>(
    "/auth/refresh",
    { refreshToken }
  );
  return data.data;
}
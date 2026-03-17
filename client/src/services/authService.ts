import api from "@/lib/axios";
import { mockLogin } from "./auth.mock";
import type { AuthPayload } from "@/store/authStore";
import { env } from "@/config/env";

// ─── Flag de mock ─────────────────────────────────────────────────────────────
// Activa el mock en .env.local con: VITE_USE_MOCK=true
// En producción o cuando el backend esté listo, elimina la variable o ponla en false.
const USE_MOCK = env.useMock === "true";

export interface LoginCredentials {
  email: string;
  password: string;
}

// ─── Auth service ─────────────────────────────────────────────────────────────
// Único punto de contacto para autenticación.
// El resto de la app (useAuth, store) no sabe si está hablando con el mock o la API real.

export async function loginService(
  credentials: LoginCredentials
): Promise<AuthPayload> {
  if (USE_MOCK) {
    return mockLogin(credentials.email, credentials.password);
  }

  const { data } = await api.post<AuthPayload>("/auth/login", credentials);
  return data;
}

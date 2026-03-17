import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/authStore";
import type { Permission } from "@/config/rbac";

// ─── PublicRoute ──────────────────────────────────────────────────────────────
interface PublicRouteProps {
  redirectTo?: string;
}

export function PublicRoute({ redirectTo = "/dashboard" }: PublicRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
interface ProtectedRouteProps {
  redirectTo?: string;
}

export function ProtectedRoute({ redirectTo = "/login" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ─── AuthorizedRoute ──────────────────────────────────────────────────────────
// Ahora compara contra el array `permissions` que vino del backend,
// no contra un mapa estático local.
interface AuthorizedRouteProps {
  /** Permiso único requerido */
  permission?: Permission;
  /** O una lista: el usuario debe tener AL MENOS UNO */
  anyOf?: Permission[];
  /** O una lista: el usuario debe tener TODOS */
  allOf?: Permission[];
  fallback?: string;
}

export function AuthorizedRoute({
  permission,
  anyOf,
  allOf,
  fallback = "/403",
}: AuthorizedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const can = useAuthStore((s) => s.can);
  const canAny = useAuthStore((s) => s.canAny);
  const canAll = useAuthStore((s) => s.canAll);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const authorized =
    (permission ? can(permission) : true) &&
    (anyOf?.length ? canAny(anyOf) : true) &&
    (allOf?.length ? canAll(allOf) : true);

  if (!authorized) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

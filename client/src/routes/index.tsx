import { createBrowserRouter, RouterProvider } from "react-router";
import { PublicRoute, ProtectedRoute, AuthorizedRoute } from "./guards";

// Layouts
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Public pages
import { LoginPage } from "@/pages/auth/LoginPage";

// Protected pages
import { DashboardHome } from "@/pages/dashboard/DashboardHome";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";

// Authorized pages (RBAC)
import { UsersListPage } from "@/pages/users/UsersListPage";
import { UsersCreatePage } from "@/pages/users/UsersCreatePage";
import { UsersRolesPage } from "@/pages/users/UsersRolesPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { ReportsExportPage } from "@/pages/reports/ReportsExportPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { SettingsSecurityPage } from "@/pages/settings/SettingsSecurityPage";

// Error pages
import { NotFoundPage } from "@/pages/errors/NotFoundPage";
import { ForbiddenPage } from "@/pages/errors/ForbiddenPage";

const router = createBrowserRouter([
  // ─── Rutas públicas (solo sin sesión) ──────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/", element: <LoginPage /> },
    ],
  },

  // ─── Rutas de error (siempre accesibles) ───────────────────────────────────
  { path: "/403", element: <ForbiddenPage /> },
  { path: "*", element: <NotFoundPage /> },

  // ─── Rutas protegidas (requieren autenticación) ────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Accesibles para cualquier usuario autenticado
          { path: "/dashboard", element: <DashboardHome /> },
          { path: "/dashboard/profile", element: <ProfilePage /> },

          // ─── Usuarios (RBAC) ───────────────────────────────────────────────
          {
            element: <AuthorizedRoute permission="users:view" />,
            children: [
              { path: "/dashboard/users", element: <UsersListPage /> },
            ],
          },
          {
            element: <AuthorizedRoute permission="users:create" />,
            children: [
              { path: "/dashboard/users/create", element: <UsersCreatePage /> },
            ],
          },
          {
            element: <AuthorizedRoute permission="users:edit" />,
            children: [
              { path: "/dashboard/users/roles", element: <UsersRolesPage /> },
            ],
          },

          // ─── Reportes (RBAC) ───────────────────────────────────────────────
          {
            element: <AuthorizedRoute permission="reports:view" />,
            children: [
              { path: "/dashboard/reports", element: <ReportsPage /> },
            ],
          },
          {
            element: <AuthorizedRoute permission="reports:export" />,
            children: [
              { path: "/dashboard/reports/export", element: <ReportsExportPage /> },
            ],
          },

          // ─── Configuración (RBAC) ──────────────────────────────────────────
          {
            element: <AuthorizedRoute permission="settings:view" />,
            children: [
              { path: "/dashboard/settings", element: <SettingsPage /> },
            ],
          },
          {
            element: <AuthorizedRoute permission="settings:edit" />,
            children: [
              { path: "/dashboard/settings/security", element: <SettingsSecurityPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

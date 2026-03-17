import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  FileText,
  UserCog,
  Bell,
  Database,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "./rbac";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  permission?: Permission;
  /** Soporta N niveles de anidamiento recursivo */
  children?: NavItem[];
  badge?: string | number;
}

export interface NavSection {
  id: string;
  /** Título visible en modo expandido. Si es undefined → solo separador */
  title?: string;
  items: NavItem[];
  /** Permiso mínimo para ver la sección completa (opcional) */
  permission?: Permission;
}

/** Entrada del menú: puede ser un item suelto o una sección agrupada */
export type NavEntry = NavItem | NavSection;

/** Type guard para distinguir sección de item */
export function isNavSection(entry: NavEntry): entry is NavSection {
  return "items" in entry;
}

// ─── Definición del menú con secciones ────────────────────────────────────────

export const NAV_ENTRIES: NavEntry[] = [
  // ── Sección: General ───────────────────────────────────────────────────────
  {
    id: "section-general",
    title: "General",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        permission: "dashboard:view",
      },
      {
        id: "notifications",
        label: "Notificaciones",
        icon: Bell,
        href: "/dashboard/notifications",
        permission: "dashboard:view",
        badge: 3,
      },
    ],
  },

  // ── Sección: Gestión ───────────────────────────────────────────────────────
  {
    id: "section-management",
    title: "Gestión",
    items: [
      {
        id: "users",
        label: "Usuarios",
        icon: Users,
        permission: "users:view",
        children: [
          {
            id: "users-list",
            label: "Lista de usuarios",
            href: "/dashboard/users",
            permission: "users:view",
            icon: Users,
          },
          {
            id: "users-create",
            label: "Crear usuario",
            href: "/dashboard/users/create",
            permission: "users:create",
            icon: UserCog,
          },
          {
            id: "users-access",
            label: "Control de acceso",
            icon: ShieldCheck,
            permission: "users:edit",
            children: [
              {
                id: "users-roles",
                label: "Roles y permisos",
                href: "/dashboard/users/roles",
                permission: "users:edit",
                icon: ShieldCheck,
              },
              {
                id: "users-audit",
                label: "Auditoría de accesos",
                href: "/dashboard/users/audit",
                permission: "audit:view",
                icon: Database,
              },
            ],
          },
        ],
      },
      {
        id: "reports",
        label: "Reportes",
        icon: BarChart3,
        permission: "reports:view",
        children: [
          {
            id: "reports-overview",
            label: "Resumen",
            href: "/dashboard/reports",
            permission: "reports:view",
            icon: Activity,
          },
          {
            id: "reports-export",
            label: "Exportar datos",
            href: "/dashboard/reports/export",
            permission: "reports:export",
            icon: FileText,
          },
        ],
      },
    ],
  },

  // ── Sección: Sistema (sin título → solo separador) ─────────────────────────
  {
    id: "section-system",
    title: "Sistema",
    items: [
      {
        id: "audit",
        label: "Auditoría",
        icon: Database,
        href: "/dashboard/audit",
        permission: "audit:view",
      },
      {
        id: "settings",
        label: "Configuración",
        icon: Settings,
        permission: "settings:view",
        children: [
          {
            id: "settings-general",
            label: "General",
            href: "/dashboard/settings",
            permission: "settings:view",
            icon: Settings,
          },
          {
            id: "settings-security",
            label: "Seguridad",
            href: "/dashboard/settings/security",
            permission: "settings:edit",
            icon: ShieldCheck,
          },
        ],
      },
    ],
  },
];

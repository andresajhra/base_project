import { NavLink, useLocation } from "react-router";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebarStore";
import { useAuthStore } from "@/store/authStore";
import { NAV_ENTRIES, isNavSection, type NavItem, type NavSection } from "@/config/menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

// ─── Sidebar principal ────────────────────────────────────────────────────────
export function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore();
  const can = useAuthStore((s) => s.can);
  const user = useAuthStore((s) => s.user);

  const visibleEntries = NAV_ENTRIES.filter((entry) => {
    if (isNavSection(entry)) {
      if (entry.permission && !can(entry.permission)) return false;
      return entry.items.some((item) => !item.permission || can(item.permission));
    }
    return !entry.permission || can(entry.permission);
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-40",
        "bg-card border-r border-border",
        "flex flex-col",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo / Marca — toggle usa <div role="button"> para no conflictar */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-border shrink-0",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <span className="font-semibold text-foreground text-sm tracking-tight truncate">
            Mi Dashboard
          </span>
        )}
        {/* 
          No usamos <button> aquí porque este div vive dentro del <aside>
          y algunos wrappers de Tooltip podrían estar activos en el árbol.
          div + role="button" es semánticamente correcto y evita anidamiento.
        */}
        <div
          role="button"
          tabIndex={0}
          onClick={toggle}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(); }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer select-none"
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5">
        <TooltipProvider delayDuration={0}>
          {visibleEntries.map((entry, index) =>
            isNavSection(entry) ? (
              <SidebarSection key={entry.id} section={entry} isFirst={index === 0} />
            ) : (
              <div key={entry.id} className="px-2">
                <SidebarItem item={entry} depth={0} />
              </div>
            )
          )}
        </TooltipProvider>
      </nav>

      {/* Footer */}
      {user && (
        <div
          className={cn(
            "border-t border-border p-3 shrink-0",
            isCollapsed ? "flex justify-center" : "flex items-center gap-3"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

// ─── Sección ──────────────────────────────────────────────────────────────────
interface SidebarSectionProps {
  section: NavSection;
  isFirst: boolean;
}

function SidebarSection({ section, isFirst }: SidebarSectionProps) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const can = useAuthStore((s) => s.can);

  const visibleItems = section.items.filter(
    (item) => !item.permission || can(item.permission)
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="px-2">
      {!isFirst && (
        <div className={cn("flex items-center gap-2 mb-1", isCollapsed ? "px-1 mt-3" : "mt-4")}>
          <div className="flex-1 h-px bg-border" />
          {!isCollapsed && section.title && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 whitespace-nowrap">
              {section.title}
            </span>
          )}
          {!isCollapsed && section.title && <div className="flex-1 h-px bg-border" />}
        </div>
      )}
      {isFirst && !isCollapsed && section.title && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 px-3 mb-1.5">
          {section.title}
        </p>
      )}
      <div className="space-y-0.5">
        {visibleItems.map((item) => (
          <SidebarItem key={item.id} item={item} depth={0} />
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isDescendantActive(item: NavItem, pathname: string): boolean {
  if (item.href && pathname === item.href) return true;
  return item.children?.some((child) => isDescendantActive(child, pathname)) ?? false;
}

/**
 * Árbol de links dentro del Tooltip en modo colapsado.
 * Solo usa <NavLink> (→ <a>) y <div>, nunca <button>,
 * para evitar cualquier anidamiento con el trigger.
 */
function CollapsedTooltipTree({ items }: { items: NavItem[] }) {
  const can = useAuthStore((s) => s.can);
  const visibleItems = items.filter((i) => !i.permission || can(i.permission));

  return (
    <>
      {visibleItems.map((item) =>
        item.href && !item.children?.length ? (
          <NavLink
            key={item.id}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 text-xs px-2 py-1 rounded hover:bg-accent",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )
            }
          >
            {item.icon && <item.icon className="w-3 h-3 shrink-0" />}
            {item.label}
          </NavLink>
        ) : (
          <div key={item.id} className="pl-2 border-l border-border mt-0.5">
            <p className="text-xs font-medium text-foreground px-2 py-0.5">{item.label}</p>
            {item.children && <CollapsedTooltipTree items={item.children} />}
          </div>
        )
      )}
    </>
  );
}

// ─── SidebarItem — componente recursivo ───────────────────────────────────────
interface SidebarItemProps {
  item: NavItem;
  depth: number;
}

function SidebarItem({ item, depth }: SidebarItemProps) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const { toggleItem, isItemExpanded } = useSidebarStore();
  const can = useAuthStore((s) => s.can);
  const location = useLocation();

  const hasChildren = !!item.children?.length;
  const isExpanded = isItemExpanded(item.id);
  const isAnyChildActive = isDescendantActive(item, location.pathname);

  const visibleChildren = item.children?.filter(
    (child) => !child.permission || can(child.permission)
  );

  const baseClasses =
    "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors";
  const activeClasses = "bg-accent text-foreground font-medium";
  const inactiveClasses = "text-muted-foreground hover:bg-accent hover:text-foreground";

  // ── Modo colapsado — solo nivel raíz ──────────────────────────────────────
  if (isCollapsed && depth === 0) {
    const triggerClasses = cn(
      baseClasses,
      "justify-center cursor-pointer select-none",
      isAnyChildActive || (item.href && location.pathname === item.href)
        ? activeClasses
        : inactiveClasses
    );

    const icon = item.icon ? <item.icon className="w-4 h-4 shrink-0" /> : null;

    // Hoja: usa NavLink → <a>, sin conflicto con TooltipTrigger → <button>
    if (!hasChildren && item.href) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to={item.href} className={({ isActive }) =>
              cn(baseClasses, "justify-center", isActive ? activeClasses : inactiveClasses)
            }>
              {icon}
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    // Grupo: TooltipTrigger sin asChild → renderiza su propio <button>.
    // El contenido del trigger NO debe ser otro <button> ni elemento interactivo.
    // Pasamos el icono directamente como hijo del Trigger (que ya es el <button>).
    return (
      <Tooltip>
        <TooltipTrigger
          onClick={() => toggleItem(item.id)}
          className={triggerClasses}
        >
          {icon}
        </TooltipTrigger>
        <TooltipContent side="right" className="flex flex-col gap-0.5 p-2 min-w-[160px]">
          <p className="font-medium text-xs mb-1 px-2">{item.label}</p>
          {visibleChildren && <CollapsedTooltipTree items={visibleChildren} />}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Niveles depth > 0 no se renderizan en modo colapsado
  if (isCollapsed && depth > 0) return null;

  // ── Modo expandido — hoja ──────────────────────────────────────────────────
  if (!hasChildren && item.href) {
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(baseClasses, isActive ? activeClasses : inactiveClasses)
        }
      >
        {item.icon && (
          <item.icon className={cn("shrink-0", depth === 0 ? "w-4 h-4" : "w-3.5 h-3.5")} />
        )}
        <span className="truncate flex-1">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
            {item.badge}
          </Badge>
        )}
      </NavLink>
    );
  }

  // ── Modo expandido — grupo colapsable ──────────────────────────────────────
  // Este <button> está en modo expandido donde NO hay TooltipTrigger activo,
  // así que no puede haber anidamiento.
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleItem(item.id)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleItem(item.id); }}
        className={cn(
          baseClasses,
          "cursor-pointer select-none",
          isAnyChildActive || isExpanded ? activeClasses : inactiveClasses
        )}
      >
        {item.icon && (
          <item.icon
            className={cn(
              "shrink-0 transition-colors",
              depth === 0 ? "w-4 h-4" : "w-3.5 h-3.5",
              isAnyChildActive ? "text-primary" : ""
            )}
          />
        )}
        <span className="truncate flex-1 text-left">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {item.badge}
          </Badge>
        )}
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className="border-l border-border mt-0.5 space-y-0.5 py-0.5"
          style={{ marginLeft: `${(depth + 1) * 12}px`, paddingLeft: "8px" }}
        >
          {visibleChildren?.map((child) => (
            <SidebarItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

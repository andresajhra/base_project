import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useSidebarStore } from "@/store/sidebarStore";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden transition-all duration-300",
          isCollapsed ? "ml-[64px]" : "ml-[240px]"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

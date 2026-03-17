import { useNavigate } from "react-router";
import { LogOut, User, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 shrink-0 z-30">
      <div className="flex items-center gap-2">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2">
        {/* 
          Notificaciones: div role="button" en lugar de <Button> de shadcn
          para evitar cualquier <button> anidado si este componente se usa
          dentro de otros triggers en el futuro.
        */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/dashboard/notifications"); }}
          onClick={() => navigate("/dashboard/notifications")}
          className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer select-none"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px]"
          >
            3
          </Badge>
        </div>

        {/*
          DropdownMenuTrigger SIN asChild — es el propio <button> de Radix.
          Avatar va directo adentro como contenido, no como otro elemento interactivo.
          Esto elimina completamente el anidamiento <button><button>.
        */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="w-fit text-xs capitalize">
                  {user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
              <User className="w-4 h-4 mr-2" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">Dashboard</span>
    </nav>
  );
}

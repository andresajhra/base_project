import { ArrowLeft, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
// ─── 403 ──────────────────────────────────────────────────────────────────────
export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8">
      <ShieldX className="w-16 h-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-lg text-muted-foreground">Sin permisos</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        No tienes los permisos necesarios para acceder a este recurso.
        Contacta a tu administrador si crees que es un error.
      </p>
      <Button onClick={() => navigate("/dashboard")} variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Ir al dashboard
      </Button>
    </div>
  );
}

import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SearchX } from "lucide-react";

// ─── 404 ──────────────────────────────────────────────────────────────────────
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8">
      <SearchX className="w-16 h-16 text-muted-foreground" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg text-muted-foreground">Página no encontrada</p>
      <p className="text-sm text-muted-foreground max-w-sm">
        La ruta que intentas acceder no existe o fue eliminada.
      </p>
      <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Volver atrás
      </Button>
    </div>
  );
}


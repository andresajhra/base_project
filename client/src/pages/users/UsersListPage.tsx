import { useHealthStatus } from "@/hooks/queries/useHealth";


export function UsersListPage() {
  const { data, isLoading, isError } = useHealthStatus();
  
  if(isLoading) return <div>Cargando estado del sistema...</div>;
  if(isError) return <div>Error al cargar el estado del sistema.</div>;
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold"><pre>{data ? JSON.stringify(data) : 'Sin datos'}</pre></h1>
      <p className="text-muted-foreground">Lista de todos los usuarios del sistema.</p>
    </div>
  );
}

export function UsersCreatePage() {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Crear Usuario</h1><p className="text-muted-foreground">Formulario de creación de usuario.</p></div>;
}

export function UsersRolesPage() {
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Roles y Permisos</h1><p className="text-muted-foreground">Gestión de roles del sistema.</p></div>;
}

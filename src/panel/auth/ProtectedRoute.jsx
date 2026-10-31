import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { safeRedirectPath } from "./validation";

/** Pantalla de carga centrada con la paleta de la marca mientras Firebase resuelve la sesión. */
export function AuthLoading() {
  return (
    <div className="panel flex min-h-dvh items-center justify-center bg-background" role="status" aria-label="Verificando sesión">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-body-sm text-muted-foreground">Verificando tu sesión…</p>
      </div>
    </div>
  );
}

/** Solo deja pasar a usuarios con sesión. Si no la tienen, los envía a /login recordando la ruta de origen. */
export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;

  if (!user) {
    const origin = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect_to=${encodeURIComponent(origin)}`} replace />;
  }

  return children ?? <Outlet />;
}

/** Para login, registro y recuperación: un usuario con sesión activa va directo a su destino. */
export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();

  if (isLoading) return <AuthLoading />;

  if (user) return <Navigate to={safeRedirectPath(searchParams.get("redirect_to"))} replace />;

  return <Outlet />;
}

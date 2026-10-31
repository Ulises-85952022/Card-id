import { AppLayout } from "@panel/components/layout/AppLayout";
import { PublicCardLayout } from "@panel/components/layout/PublicCardLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@panel/auth/ProtectedRoute";
import Login from "@panel/pages/auth/Login";
import Register from "@panel/pages/auth/Register";
import ForgotPassword from "@panel/pages/auth/ForgotPassword";
import ResetPassword from "@panel/pages/auth/ResetPassword";
import Dashboard from "@panel/pages/Dashboard";
import Cards from "@panel/pages/Cards";
import CardBuilder from "@panel/pages/CardBuilder";
import Catalogs from "@panel/pages/Catalogs";
import Vault from "@panel/pages/Vault";
import Analytics from "@panel/pages/Analytics";
import Settings from "@panel/pages/Settings";
import PublicCard from "@panel/pages/public/PublicCard";

/**
 * Rutas del panel net carID AI. Conviven con la tarjeta digital de Ulises, que sigue
 * en "/" con ?card=slug; cualquier ruta que no esté aquí cae en esa tarjeta.
 */
export const panelRoutes = [
  {
    // Solo login, registro y recuperación: con sesión activa se redirige al panel
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
    ],
  },
  // Llega desde el enlace del correo; no depende de la sesión
  { path: "/reset-password", element: <ResetPassword /> },
  {
    // Rutas privadas: sin sesión, ProtectedRoute manda a /login
    element: (
      <ProtectedRoute>
        <div className="panel">
          <AppLayout />
        </div>
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/cards", element: <Cards /> },
      { path: "/cards/builder", element: <CardBuilder /> },
      { path: "/catalogs", element: <Catalogs /> },
      { path: "/vault", element: <Vault /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/settings", element: <Settings /> },
    ],
  },
  {
    // Aislado del panel: no monta sidebar ni header
    path: "/c",
    element: (
      <div className="panel">
        <PublicCardLayout />
      </div>
    ),
    children: [{ path: ":prospectSlug", element: <PublicCard /> }],
  },
];

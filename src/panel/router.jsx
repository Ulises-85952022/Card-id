import { Navigate } from "react-router-dom";
import { AppLayout } from "@panel/components/layout/AppLayout";
import { PublicCardLayout } from "@panel/components/layout/PublicCardLayout";
import Dashboard from "@panel/pages/Dashboard";
import Cards from "@panel/pages/Cards";
import CardBuilder from "@panel/pages/CardBuilder";
import Catalogs from "@panel/pages/Catalogs";
import Vault from "@panel/pages/Vault";
import Analytics from "@panel/pages/Analytics";
import Settings from "@panel/pages/Settings";
import NotFound from "@panel/pages/NotFound";
import PublicCard from "@panel/pages/public/PublicCard";

/**
 * Rutas del panel net carID AI. Se montan junto a la tarjeta digital de Ulises
 * (que sigue en "/" con ?card=slug), así que todo el panel vive bajo /app y las
 * tarjetas compartidas bajo /c.
 */
export const panelRoutes = [
  {
    path: "/app",
    element: (
      <div className="panel">
        <AppLayout />
      </div>
    ),
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "cards", element: <Cards /> },
      { path: "cards/builder", element: <CardBuilder /> },
      { path: "catalogs", element: <Catalogs /> },
      { path: "vault", element: <Vault /> },
      { path: "analytics", element: <Analytics /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <NotFound /> },
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

import { LayoutDashboard, IdCard, Wand2, LibraryBig, LockKeyhole, ChartNoAxesCombined, Settings } from "lucide-react";

/** Fuente única de verdad para el sidebar y los títulos de cada sección. */
export const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/cards", label: "Tarjetas", icon: IdCard, end: true },
  { to: "/cards/builder", label: "Builder", icon: Wand2, badge: "AI" },
  { to: "/catalogs", label: "Catálogos", icon: LibraryBig },
  { to: "/vault", label: "Bóveda de precios", icon: LockKeyhole },
  { to: "/analytics", label: "Analítica", icon: ChartNoAxesCombined },
];

export const secondaryNav = [{ to: "/settings", label: "Ajustes", icon: Settings }];

/** Plan mostrado en el sidebar (estático hasta conectar facturación). */
export const currentPlan = { name: "Pro", cardsUsed: 12, cardsLimit: 50 };

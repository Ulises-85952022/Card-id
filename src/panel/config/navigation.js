import { LayoutDashboard, IdCard, Wand2, LibraryBig, LockKeyhole, ChartNoAxesCombined, Settings } from "lucide-react";

/** Fuente única de verdad para el sidebar y los títulos de cada sección. */
export const mainNav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/cards", label: "Tarjetas", icon: IdCard, end: true },
  { to: "/app/cards/builder", label: "Builder", icon: Wand2, badge: "AI" },
  { to: "/app/catalogs", label: "Catálogos", icon: LibraryBig },
  { to: "/app/vault", label: "Bóveda de precios", icon: LockKeyhole },
  { to: "/app/analytics", label: "Analítica", icon: ChartNoAxesCombined },
];

export const secondaryNav = [{ to: "/app/settings", label: "Ajustes", icon: Settings }];

/** Plan mostrado en el sidebar (estático hasta conectar facturación). */
export const currentPlan = { name: "Pro", cardsUsed: 12, cardsLimit: 50 };

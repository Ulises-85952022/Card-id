import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@panel/lib/utils";
import { TooltipProvider } from "@panel/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@panel/components/ui/sheet";
import { SidebarContent } from "./SidebarContent";
import { Header } from "./Header";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Cierra el drawer móvil al cambiar de ruta
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-dvh overflow-hidden bg-background">
        {/* Sidebar escritorio */}
        <aside
          className={cn(
            "hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 ease-out md:block",
            collapsed ? "w-sidebar-collapsed" : "w-sidebar"
          )}
        >
          <SidebarContent collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        </aside>

        {/* Drawer móvil */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 md:hidden">
            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
            <SheetDescription className="sr-only">Secciones de net carID AI</SheetDescription>
            <div className="pt-safe h-full bg-sidebar">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Columna principal con scroll independiente */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onOpenMobileNav={() => setMobileOpen(true)} />
          <main id="contenido" className="scrollbar-thin flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-safe sm:px-6 sm:py-8 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

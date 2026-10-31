import { Outlet } from "react-router-dom";
import { LogoMark } from "./Logo";

/**
 * Layout público para tarjetas compartidas por WhatsApp o LinkedIn.
 * Sin sidebar, header ni dependencias del panel: columna única pensada primero para móvil.
 */
export function PublicCardLayout() {
  return (
    <div className="min-h-dvh bg-muted/60">
      <main className="pt-safe mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6 sm:py-10">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="pb-safe mt-8 flex items-center justify-center gap-1.5 text-caption text-muted-foreground">
          <LogoMark className="size-4" />
          Tarjeta creada con net carID AI
        </footer>
      </main>
    </div>
  );
}

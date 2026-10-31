import { useState } from "react";
import { Bell, ChevronsUpDown, LogOut, Menu, Moon, Search, Sun, User, CreditCard, Building2, BellOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@panel/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@panel/components/ui/dropdown-menu";
import { cn } from "@panel/lib/utils";

/* Datos de ejemplo hasta conectar Base44 */
const sampleProspects = [
  { slug: "aceros-del-bajio", name: "Aceros del Bajío", industry: "Distribución industrial" },
  { slug: "grupo-alfa", name: "Grupo Alfa", industry: "Manufactura" },
  { slug: "logistica-norte", name: "Logística del Norte", industry: "Transporte" },
];

function ProspectSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full max-w-xs items-center gap-2.5 rounded-xl border border-input bg-card px-3 text-left text-body-sm shadow-sm transition-colors hover:bg-accent"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-muted-foreground">Ir a un prospecto…</span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Prospectos recientes</DropdownMenuLabel>
        {sampleProspects.map((p) => (
          <DropdownMenuItem key={p.slug} asChild>
            <Link to={`/c/${p.slug}`} {...(import.meta.env.VITE_PREVIEW ? {} : { target: "_blank", rel: "noreferrer" })}>
              <Building2 />
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="truncate text-caption text-muted-foreground">{p.industry}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2.5 py-1.5 text-caption text-muted-foreground">La búsqueda se habilita al conectar la base de datos.</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="size-[1.125rem]" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-success ring-2 ring-background" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <BellOff className="size-4 text-muted-foreground" />
          </div>
          <p className="text-body-sm font-medium">Sin notificaciones</p>
          <p className="text-caption text-muted-foreground">Aquí verás cuando un prospecto abra tu tarjeta o haga clic en WhatsApp.</p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ProfileMenu() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const toggleTheme = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition-colors hover:bg-accent" aria-label="Menú de perfil">
          <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-caption font-bold text-secondary-foreground">UD</span>
          <span className="hidden text-left lg:block">
            <span className="block text-body-sm font-semibold leading-tight">Usuario demo</span>
            <span className="block text-caption leading-tight text-muted-foreground">Administrador</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/app/settings"><User /> Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/settings"><CreditCard /> Facturación</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); toggleTheme(); }}>
          {dark ? <Sun /> : <Moon />} {dark ? "Tema claro" : "Tema oscuro"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive disabled>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header({ onOpenMobileNav, className }) {
  return (
    <header className={cn("sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8", className)}>
      <Button variant="ghost" size="icon" className="-ml-2 md:hidden" onClick={onOpenMobileNav} aria-label="Abrir menú">
        <Menu className="size-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <ProspectSwitcher />
      </div>
      <div className="flex items-center gap-1">
        <Notifications />
        <ProfileMenu />
      </div>
    </header>
  );
}

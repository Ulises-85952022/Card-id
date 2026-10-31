import { NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { cn } from "@panel/lib/utils";
import { mainNav, secondaryNav, currentPlan } from "@panel/config/navigation";
import { Logo } from "./Logo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@panel/components/ui/tooltip";

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-body-sm font-medium text-sidebar-muted transition-colors",
          "hover:bg-sidebar-active hover:text-sidebar-foreground focus-visible:ring-offset-sidebar",
          isActive && "bg-sidebar-active text-sidebar-foreground",
          collapsed && "justify-center px-0"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-2 h-6 w-[3px] rounded-r-full bg-primary" aria-hidden="true" />}
          <Icon className={cn("size-[1.125rem] shrink-0", isActive && "text-primary")} strokeWidth={2} />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && item.badge && (
            <span className="ml-auto rounded-md bg-ai/15 px-1.5 py-0.5 text-[0.6875rem] font-bold text-ai">{item.badge}</span>
          )}
          {collapsed && item.badge && <span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-ai" aria-hidden="true" />}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function PlanIndicator({ collapsed }) {
  const pct = Math.round((currentPlan.cardsUsed / currentPlan.cardsLimit) * 100);
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-ai/15 text-ai" tabIndex={0}>
            <Sparkles className="size-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          Plan {currentPlan.name} · {currentPlan.cardsUsed}/{currentPlan.cardsLimit} tarjetas
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-active/60 p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-body-sm font-semibold text-sidebar-foreground">
          <Sparkles className="size-3.5 text-ai" />
          Plan {currentPlan.name}
        </span>
        <span className="text-caption text-sidebar-muted">{pct}%</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sidebar-border" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Uso de tarjetas">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-ai" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-caption text-sidebar-muted">
        {currentPlan.cardsUsed} de {currentPlan.cardsLimit} tarjetas activas
      </p>
    </div>
  );
}

/** Contenido del sidebar, compartido por la versión de escritorio y el drawer móvil. */
export function SidebarContent({ collapsed = false, onToggleCollapse, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-16 shrink-0 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-0")}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Principal">
        {mainNav.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border px-3 py-4">
        {secondaryNav.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
        <PlanIndicator collapsed={collapsed} />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-xl px-3 text-caption font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground",
              collapsed && "justify-center px-0"
            )}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && "Contraer menú"}
          </button>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Construction } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { Button } from "@panel/components/ui/button";
import { Badge } from "@panel/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@panel/components/ui/card";
import { Skeleton } from "@panel/components/ui/skeleton";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@panel/components/ui/dialog";

/**
 * Estado provisional de una sección: título, descripción, acción principal
 * y un esqueleto que anticipa el contenido real.
 *
 * layout: "metrics" | "grid" | "editor" | "table" | "form"
 */
export function PlaceholderPage({ title, description, icon: Icon, action, actionVariant = "default", layout = "grid", upcoming = [], children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader
        title={title}
        description={description}
        actions={
          action && (
            <Button variant={actionVariant} onClick={() => setOpen(true)}>
              {action.icon && <action.icon />}
              {action.label}
            </Button>
          )
        }
      />

      {children}

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start gap-4 space-y-0 border-b bg-muted/40">
          {Icon && (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-border">
              <Icon className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Sección en construcción</CardTitle>
              <Badge variant="muted"><Construction /> Placeholder</Badge>
            </div>
            <CardDescription className="mt-1">
              La estructura visual está lista. Datos, autenticación e IA se conectan en las siguientes etapas.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <SkeletonLayout layout={layout} />
          {upcoming.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <p className="text-body-sm font-semibold">Lo que vivirá aquí</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {upcoming.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-body-sm text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{action?.label}</DialogTitle>
            <DialogDescription>Esta acción se habilita cuando conectemos la base de datos y el motor de IA.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Entendido</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkeletonLayout({ layout }) {
  switch (layout) {
    case "metrics":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-xl border p-4">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      );
    case "editor":
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="mx-auto w-full max-w-[280px] rounded-[2rem] border-8 border-muted p-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="mt-[-2rem] flex justify-center"><Skeleton className="size-16 rounded-full ring-4 ring-card" /></div>
            <Skeleton className="mx-auto mt-3 h-4 w-32" />
            <Skeleton className="mx-auto mt-2 h-3 w-24" />
            <div className="mt-5 space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      );
    case "table":
      return (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border p-3.5">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            </div>
          ))}
        </div>
      );
    case "form":
      return (
        <div className="max-w-xl space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      );
    default:
      return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ))}
        </div>
      );
  }
}

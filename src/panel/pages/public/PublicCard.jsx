import { useParams } from "react-router-dom";
import { MessageCircle, Phone, Mail, FileText } from "lucide-react";
import { Button } from "@panel/components/ui/button";
import { Skeleton } from "@panel/components/ui/skeleton";

/** Placeholder de la tarjeta pública. Se alimentará desde Base44 por prospectSlug. */
export default function PublicCard() {
  const { prospectSlug } = useParams();
  const prospectName = prospectSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <article className="overflow-hidden rounded-3xl bg-card shadow-xl ring-1 ring-border">
      <div className="h-28 bg-gradient-to-br from-primary to-ai" />
      <div className="px-6 pb-6">
        <div className="-mt-10 flex size-20 items-center justify-center rounded-2xl bg-card text-h3 font-extrabold text-primary shadow-md ring-4 ring-card">
          NC
        </div>
        <h1 className="mt-4 text-h2">Propuesta para {prospectName}</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">Tarjeta personalizada · contenido provisional</p>

        <div className="mt-6 grid gap-2.5">
          <Button variant="success" size="lg" className="w-full"><MessageCircle /> Escribir por WhatsApp</Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="outline" size="lg"><Phone /> Llamar</Button>
            <Button variant="outline" size="lg"><Mail /> Correo</Button>
          </div>
          <Button variant="secondary" size="lg" className="w-full"><FileText /> Ver catálogo</Button>
        </div>

        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </article>
  );
}

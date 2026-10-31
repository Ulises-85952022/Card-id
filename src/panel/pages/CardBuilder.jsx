import { Wand2, Sparkles } from "lucide-react";
import { PlaceholderPage } from "@panel/components/shared/PlaceholderPage";
import { Badge } from "@panel/components/ui/badge";

export default function CardBuilder() {
  return (
    <PlaceholderPage
      title="Builder"
      description="Diseña la tarjeta y deja que Scrape & Tailor la adapte al sitio web de tu prospecto."
      icon={Wand2}
      action={{ label: "Adaptar con IA", icon: Sparkles }}
      actionVariant="ai-magic"
      layout="editor"
      upcoming={[
        "Pegar la URL del prospecto para extraer su contexto",
        "Propuesta de mensaje y servicios ajustados a su giro",
        "Vista previa móvil en tiempo real",
        "Publicar y generar el enlace /c/prospecto",
      ]}
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant="ai"><Sparkles /> Motor Scrape & Tailor</Badge>
        <Badge variant="outline">Vista previa móvil</Badge>
      </div>
    </PlaceholderPage>
  );
}

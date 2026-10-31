import { ChartNoAxesCombined } from "lucide-react";
import { PlaceholderPage } from "@panel/components/shared/PlaceholderPage";
import { Tabs, TabsList, TabsTrigger } from "@panel/components/ui/tabs";

export default function Analytics() {
  return (
    <PlaceholderPage
      title="Analítica"
      description="Visitas y clics de tus tarjetas en tiempo real."
      icon={ChartNoAxesCombined}
      layout="metrics"
      upcoming={[
        "Visitas por tarjeta y por prospecto",
        "Clics en WhatsApp, llamada, correo y catálogo",
        "Tiempo en la tarjeta y secciones más vistas",
        "Embudo de visita a cotización",
      ]}
    >
      <Tabs defaultValue="7d">
        <TabsList>
          <TabsTrigger value="24h">24 h</TabsTrigger>
          <TabsTrigger value="7d">7 días</TabsTrigger>
          <TabsTrigger value="30d">30 días</TabsTrigger>
        </TabsList>
      </Tabs>
    </PlaceholderPage>
  );
}

import { LayoutDashboard, Plus } from "lucide-react";
import { PlaceholderPage } from "@panel/components/shared/PlaceholderPage";

export default function Dashboard() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Resumen de tus tarjetas, visitas de prospectos y cotizaciones en curso."
      icon={LayoutDashboard}
      action={{ label: "Nueva tarjeta", icon: Plus }}
      layout="metrics"
      upcoming={[
        "Visitas totales y prospectos únicos de la semana",
        "Clics en WhatsApp y solicitudes de cotización",
        "Tarjetas con mayor interacción",
        "Actividad reciente por prospecto",
      ]}
    />
  );
}

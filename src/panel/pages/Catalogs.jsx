import { LibraryBig, Plus } from "lucide-react";
import { PlaceholderPage } from "@panel/components/shared/PlaceholderPage";

export default function Catalogs() {
  return (
    <PlaceholderPage
      title="Catálogos"
      description="Organiza tus servicios y productos para mostrarlos dentro de cada tarjeta."
      icon={LibraryBig}
      action={{ label: "Nuevo catálogo", icon: Plus }}
      layout="grid"
      upcoming={[
        "Servicios con foto, descripción y ficha técnica",
        "Categorías y orden personalizado",
        "Elegir qué catálogo ve cada prospecto",
        "Botón de cotizar por artículo",
      ]}
    />
  );
}

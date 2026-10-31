import { LockKeyhole, Upload } from "lucide-react";
import { PlaceholderPage } from "@panel/components/shared/PlaceholderPage";

export default function Vault() {
  return (
    <PlaceholderPage
      title="Bóveda de precios"
      description="Comparte listas de precios protegidas con contraseña y controla quién las abre."
      icon={LockKeyhole}
      action={{ label: "Subir lista de precios", icon: Upload }}
      layout="table"
      upcoming={[
        "Listas por cliente o por nivel de precio",
        "Contraseña y fecha de expiración por enlace",
        "Registro de quién abrió cada lista y cuándo",
        "Revocar acceso en cualquier momento",
      ]}
    />
  );
}

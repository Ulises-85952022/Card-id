import { Settings as SettingsIcon, Palette, CreditCard, User } from "lucide-react";
import { PlaceholderPage } from "@panel/components/shared/PlaceholderPage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@panel/components/ui/tabs";
import { Input } from "@panel/components/ui/input";

export default function Settings() {
  return (
    <PlaceholderPage
      title="Ajustes"
      description="Tu perfil, la marca blanca de tus tarjetas y la facturación."
      icon={SettingsIcon}
      layout="form"
      upcoming={[
        "Datos de perfil y empresa",
        "Logo, colores y dominio propio (marca blanca)",
        "Plan, método de pago y facturas",
        "Miembros del equipo",
      ]}
    >
      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil"><User /> Perfil</TabsTrigger>
          <TabsTrigger value="marca"><Palette /> Marca blanca</TabsTrigger>
          <TabsTrigger value="facturacion"><CreditCard /> Facturación</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil" className="max-w-md space-y-2">
          <label htmlFor="nombre" className="text-body-sm font-medium">Nombre visible</label>
          <Input id="nombre" placeholder="Tu nombre y cargo" disabled />
        </TabsContent>
        <TabsContent value="marca" className="text-body-sm text-muted-foreground">
          Configuración de logo, colores y dominio.
        </TabsContent>
        <TabsContent value="facturacion" className="text-body-sm text-muted-foreground">
          Plan actual y método de pago.
        </TabsContent>
      </Tabs>
    </PlaceholderPage>
  );
}

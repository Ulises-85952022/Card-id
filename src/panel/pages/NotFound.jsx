import { Link } from "react-router-dom";
import { Button } from "@panel/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <p className="text-h1 text-primary">404</p>
      <h1 className="mt-2 text-h3">Esta página no existe</h1>
      <p className="mt-2 max-w-sm text-body-sm text-muted-foreground">Revisa la dirección o vuelve al dashboard.</p>
      <Button asChild className="mt-6">
        <Link to="/app/dashboard">Ir al dashboard</Link>
      </Button>
    </div>
  );
}

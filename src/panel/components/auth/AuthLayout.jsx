import { Sparkles } from "lucide-react";
import { Logo } from "@panel/components/layout/Logo";

/**
 * Pantalla dividida: en desktop, un lado visual oscuro con la propuesta de valor;
 * en móvil, solo el formulario con el logotipo arriba.
 */
export function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="panel min-h-dvh bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Acentos de marca: índigo y violeta AI sobre fondo slate/zinc */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 size-[32rem] rounded-full bg-brand-indigo/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 right-0 size-[28rem] rounded-full bg-ai/25 blur-3xl"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:48px_48px]" aria-hidden="true" />

        <div className="relative">
          <Logo className="text-white" />
        </div>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-caption font-semibold text-white/90 backdrop-blur">
            <Sparkles className="size-3.5 text-ai-strong" aria-hidden="true" />
            Para consultores y agencias B2B
          </span>
          <h2 className="mt-6 text-h1 text-white xl:text-[2.75rem] xl:leading-[3.25rem]">
            Tarjetas B2B hiperpersonalizadas en 30 segundos con IA
          </h2>
          <p className="mt-4 text-body text-slate-400">
            Crea una propuesta para cada prospecto, compártela por WhatsApp o LinkedIn y mide quién la abre.
          </p>
        </div>

        <p className="relative text-caption text-slate-500">© net carID AI</p>
      </aside>

      <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <header>
            <h1 className="text-h2 text-foreground">{title}</h1>
            {description && <p className="mt-2 text-body-sm text-muted-foreground">{description}</p>}
          </header>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 border-t pt-6 text-center text-body-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

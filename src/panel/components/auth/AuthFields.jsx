import { useId, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@panel/components/ui/input";
import { Button } from "@panel/components/ui/button";
import { cn } from "@panel/lib/utils";

/** Campo con etiqueta, mensaje de error debajo y estados accesibles. */
export function Field({ label, error, hint, children, className }) {
  const id = useId();
  const messageId = `${id}-message`;
  const child = typeof children === "function" ? children({ id, messageId, invalid: Boolean(error) }) : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-body-sm font-medium text-foreground">
        {label}
      </label>
      {child}
      {error ? (
        <p id={messageId} className="flex items-start gap-1.5 text-caption text-destructive" role="alert">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="text-caption text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Campo de texto conectado a Field: marca aria-invalid y aria-describedby automáticamente. */
export function TextField({ label, error, hint, ...inputProps }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, messageId, invalid }) => (
        <Input
          id={id}
          aria-invalid={invalid}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(invalid && "border-destructive focus-visible:border-destructive")}
          {...inputProps}
        />
      )}
    </Field>
  );
}

/** Contraseña con botón para mostrar u ocultar el texto. */
export function PasswordField({ label, error, hint, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, messageId, invalid }) => (
        <div className="relative">
          <Input
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={invalid}
            aria-describedby={error || hint ? messageId : undefined}
            className={cn("pr-11", invalid && "border-destructive focus-visible:border-destructive")}
            {...inputProps}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={visible}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      )}
    </Field>
  );
}

/** Indicador de fuerza: barra de 3 segmentos y la lista de requisitos que se marcan al cumplirse. */
export function PasswordStrength({ strength }) {
  const { score, label, rules } = strength;
  const segmentColor = ["bg-destructive", "bg-ai", "bg-success"][Math.max(score - 1, 0)];
  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((segment) => (
          <span key={segment} className={cn("h-1.5 flex-1 rounded-full bg-muted transition-colors", score >= segment && segmentColor)} />
        ))}
      </div>
      <p className="text-caption text-muted-foreground">
        Fuerza de la contraseña: <span className="font-semibold text-foreground">{label || "—"}</span>
      </p>
      <ul className="grid gap-1 sm:grid-cols-2">
        {rules.map((rule) => (
          <li key={rule.id} className={cn("flex items-center gap-1.5 text-caption", rule.met ? "text-success" : "text-muted-foreground")}>
            <CheckCircle2 className={cn("size-3.5 shrink-0", rule.met ? "opacity-100" : "opacity-40")} aria-hidden="true" />
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Aviso en línea para errores y confirmaciones del servidor (equivale a un toast fijo en el formulario). */
export function AuthAlert({ tone = "error", children }) {
  const isError = tone === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-body-sm",
        isError ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-success/30 bg-success-soft text-foreground"
      )}
    >
      <Icon className={cn("mt-px size-4 shrink-0", isError ? "text-destructive" : "text-success")} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/** Botón de Google con el logotipo oficial. */
export function GoogleButton({ loading, disabled, onClick, label = "Continuar con Google" }) {
  return (
    <Button type="button" variant="outline" size="lg" className="w-full" onClick={onClick} disabled={disabled || loading}>
      {loading ? <Loader2 className="animate-spin" /> : <GoogleMark />}
      {label}
    </Button>
  );
}

function GoogleMark() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.2s2.69-6.2 6-6.2c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.8 3.18 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.66 0 9.4-3.98 9.4-9.58 0-.64-.07-1.13-.16-1.62H12z" />
    </svg>
  );
}

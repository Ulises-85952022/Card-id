import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@panel/components/ui/button";
import { AuthLayout } from "@panel/components/auth/AuthLayout";
import { AuthAlert, PasswordField, PasswordStrength } from "@panel/components/auth/AuthFields";
import { useAuth } from "@panel/auth/AuthContext";
import { getAuthErrorMessage, INVALID_LINK } from "@panel/auth/authMessages";
import { getPasswordStrength, validateConfirmation, validateNewPassword } from "@panel/auth/validation";

const REDIRECT_DELAY_MS = 3000;

/**
 * Llega desde el enlace del correo (?mode=resetPassword&oobCode=…). Verifica el enlace
 * antes de mostrar el formulario y, al guardar, manda a iniciar sesión.
 */
export default function ResetPassword() {
  const { verifyResetCode, updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [phase, setPhase] = useState(oobCode && (!mode || mode === "resetPassword") ? "checking" : "invalid");
  const [email, setEmail] = useState("");
  const [values, setValues] = useState({ password: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (phase !== "checking") return undefined;
    let active = true;
    verifyResetCode(oobCode)
      .then((resetEmail) => {
        if (!active) return;
        setEmail(resetEmail);
        setPhase("form");
      })
      .catch(() => {
        if (active) setPhase("invalid");
      });
    return () => {
      active = false;
    };
  }, [oobCode]);

  useEffect(() => {
    if (phase !== "done") return undefined;
    const timer = setTimeout(() => navigate("/login", { replace: true }), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase, navigate]);

  const errors = {
    password: validateNewPassword(values.password),
    confirmPassword: validateConfirmation(values.confirmPassword, values.password),
  };
  const visibleError = (field) => (submitted || touched[field] ? errors[field] : "");
  const hasErrors = Boolean(errors.password || errors.confirmPassword);
  const strength = getPasswordStrength(values.password);

  const update = (field) => (e) => {
    setServerError("");
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };
  const touch = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
    if (hasErrors) return;
    setBusy(true);
    try {
      await updatePassword(values.password, { oobCode });
      setPhase("done");
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
      if (error?.code === "auth/invalid-action-code" || error?.code === "auth/expired-action-code") setPhase("invalid");
    } finally {
      setBusy(false);
    }
  };

  if (phase === "checking") {
    return (
      <AuthLayout title="Verificando enlace" description="Un momento, estamos revisando tu enlace de recuperación.">
        <div className="flex items-center gap-3 text-body-sm text-muted-foreground" role="status">
          <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
          Verificando…
        </div>
      </AuthLayout>
    );
  }

  if (phase === "invalid") {
    return (
      <AuthLayout
        title="Enlace no válido"
        description="Este enlace ya se usó o caducó."
        footer={
          <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
            Solicitar un nuevo enlace
          </Link>
        }
      >
        <AuthAlert>{INVALID_LINK}</AuthAlert>
      </AuthLayout>
    );
  }

  if (phase === "done") {
    return (
      <AuthLayout title="Contraseña actualizada" description="Ya puedes iniciar sesión con tu contraseña nueva.">
        <div className="space-y-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success ring-1 ring-success/20">
            <CheckCircle2 className="size-6" aria-hidden="true" />
          </div>
          <AuthAlert tone="success">Te llevaremos a iniciar sesión en unos segundos.</AuthAlert>
          <Button size="lg" className="w-full" onClick={() => navigate("/login", { replace: true })}>
            Ir a iniciar sesión
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crea una contraseña nueva" description={`Para la cuenta ${email}.`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && <AuthAlert>{serverError}</AuthAlert>}

        <div className="space-y-3">
          <PasswordField
            label="Nueva contraseña"
            name="password"
            autoComplete="new-password"
            value={values.password}
            onChange={update("password")}
            onBlur={touch("password")}
            error={visibleError("password")}
          />
          {values.password && <PasswordStrength strength={strength} />}
        </div>

        <PasswordField
          label="Confirmar nueva contraseña"
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update("confirmPassword")}
          onBlur={touch("confirmPassword")}
          error={visibleError("confirmPassword")}
        />

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Actualizando…" : "Actualizar contraseña"}
        </Button>
      </form>
    </AuthLayout>
  );
}

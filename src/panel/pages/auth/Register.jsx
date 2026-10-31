import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@panel/components/ui/button";
import { AuthLayout } from "@panel/components/auth/AuthLayout";
import { AuthAlert, GoogleButton, PasswordField, PasswordStrength, TextField } from "@panel/components/auth/AuthFields";
import { useAuth } from "@panel/auth/AuthContext";
import { getAuthErrorMessage } from "@panel/auth/authMessages";
import {
  getPasswordStrength,
  validateConfirmation,
  validateEmail,
  validateNewPassword,
  validateRequired,
} from "@panel/auth/validation";

const EMPTY_VALUES = { fullName: "", companyName: "", email: "", password: "", confirmPassword: "", terms: false };

export default function Register() {
  const { signUpWithPassword, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect_to");
  const loginHref = redirectParam ? `/login?redirect_to=${encodeURIComponent(redirectParam)}` : "/login";

  const [values, setValues] = useState(EMPTY_VALUES);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(null); // "password" | "google" | null
  const [serverError, setServerError] = useState("");

  const errors = {
    fullName: validateRequired(values.fullName, "Escribe tu nombre completo."),
    companyName: validateRequired(values.companyName, "Escribe el nombre de tu consultora o empresa."),
    email: validateEmail(values.email),
    password: validateNewPassword(values.password),
    confirmPassword: validateConfirmation(values.confirmPassword, values.password),
    terms: values.terms ? "" : "Acepta los términos de servicio para continuar.",
  };
  const visibleError = (field) => (submitted || touched[field] ? errors[field] : "");
  const hasErrors = Object.values(errors).some(Boolean);
  const strength = getPasswordStrength(values.password);

  const update = (field) => (e) => {
    setServerError("");
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
  };
  const touch = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
    if (hasErrors) return;
    setBusy("password");
    try {
      // Al crear la cuenta, PublicOnlyRoute lleva al usuario a su panel y esta pantalla se desmonta
      await signUpWithPassword(values.email, values.password, {
        fullName: values.fullName,
        companyName: values.companyName,
      });
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
      setBusy(null);
    }
  };

  const handleGoogle = async () => {
    setServerError("");
    setBusy("google");
    try {
      await signInWithGoogle();
    } catch (error) {
      if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        setServerError(getAuthErrorMessage(error));
      }
      setBusy(null);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta gratis"
      description="Para consultores y agencias que venden bandas, correas y soluciones industriales."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to={loginHref} className="font-semibold text-primary hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && <AuthAlert>{serverError}</AuthAlert>}

        <TextField
          label="Nombre completo"
          name="fullName"
          autoComplete="name"
          placeholder="Ana García López"
          value={values.fullName}
          onChange={update("fullName")}
          onBlur={touch("fullName")}
          error={visibleError("fullName")}
        />

        <TextField
          label="Nombre de tu consultora o empresa"
          name="companyName"
          autoComplete="organization"
          placeholder="Consultora Industrial del Bajío"
          value={values.companyName}
          onChange={update("companyName")}
          onBlur={touch("companyName")}
          error={visibleError("companyName")}
        />

        <TextField
          label="Correo electrónico corporativo"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@empresa.com"
          value={values.email}
          onChange={update("email")}
          onBlur={touch("email")}
          error={visibleError("email")}
        />

        <div className="space-y-3">
          <PasswordField
            label="Contraseña"
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
          label="Confirmar contraseña"
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={update("confirmPassword")}
          onBlur={touch("confirmPassword")}
          error={visibleError("confirmPassword")}
        />

        <div className="space-y-1.5">
          <label className="flex items-start gap-3 text-body-sm text-foreground">
            <input
              type="checkbox"
              name="terms"
              checked={values.terms}
              onChange={update("terms")}
              onBlur={touch("terms")}
              aria-invalid={Boolean(visibleError("terms"))}
              aria-describedby={visibleError("terms") ? "terms-error" : undefined}
              className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary"
            />
            <span>
              Acepto los <span className="font-semibold text-primary">términos de servicio</span> y la política de privacidad.
            </span>
          </label>
          {visibleError("terms") && (
            <p id="terms-error" role="alert" className="text-caption text-destructive">
              {errors.terms}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
          {busy === "password" ? "Creando cuenta…" : "Crear cuenta gratis"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t" />
        </div>
        <p className="relative mx-auto w-fit bg-background px-3 text-caption uppercase tracking-wide text-muted-foreground">o</p>
      </div>

      <GoogleButton loading={busy === "google"} disabled={busy !== null} onClick={handleGoogle} label="Registrarme con Google" />
    </AuthLayout>
  );
}

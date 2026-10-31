import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@panel/components/ui/button";
import { AuthLayout } from "@panel/components/auth/AuthLayout";
import { AuthAlert, GoogleButton, PasswordField, TextField } from "@panel/components/auth/AuthFields";
import { useAuth } from "@panel/auth/AuthContext";
import { getAuthErrorMessage } from "@panel/auth/authMessages";
import { validateEmail, validateLoginPassword } from "@panel/auth/validation";

export default function Login() {
  const { signInWithPassword, signInWithGoogle } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect_to");
  const registerHref = redirectParam ? `/register?redirect_to=${encodeURIComponent(redirectParam)}` : "/register";

  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(null); // "password" | "google" | null
  const [serverError, setServerError] = useState("");

  const errors = { email: validateEmail(values.email), password: validateLoginPassword(values.password) };
  const visibleError = (field) => (submitted || touched[field] ? errors[field] : "");
  const hasErrors = Boolean(errors.email || errors.password);

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
    setBusy("password");
    try {
      // Al iniciar sesión, PublicOnlyRoute lleva al usuario a su destino y esta pantalla se desmonta
      await signInWithPassword(values.email, values.password);
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
      // Cerrar la ventana de Google no es un error para el usuario
      if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        setServerError(getAuthErrorMessage(error));
      }
      setBusy(null);
    }
  };

  return (
    <AuthLayout
      title="Inicia sesión"
      description="Entra a tu panel para gestionar tus tarjetas y prospectos."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to={registerHref} className="font-semibold text-primary hover:underline">
            Regístrate aquí
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && <AuthAlert>{serverError}</AuthAlert>}

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

        <PasswordField
          label="Contraseña"
          name="password"
          autoComplete="current-password"
          value={values.password}
          onChange={update("password")}
          onBlur={touch("password")}
          error={visibleError("password")}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-body-sm font-semibold text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy !== null}>
          {busy === "password" ? "Iniciando sesión…" : "Iniciar Sesión"}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t" />
        </div>
        <p className="relative mx-auto w-fit bg-background px-3 text-caption uppercase tracking-wide text-muted-foreground">o</p>
      </div>

      <GoogleButton loading={busy === "google"} disabled={busy !== null} onClick={handleGoogle} />
    </AuthLayout>
  );
}

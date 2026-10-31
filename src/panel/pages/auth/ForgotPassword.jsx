import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@panel/components/ui/button";
import { AuthLayout } from "@panel/components/auth/AuthLayout";
import { AuthAlert, TextField } from "@panel/components/auth/AuthFields";
import { useAuth } from "@panel/auth/AuthContext";
import { getAuthErrorMessage } from "@panel/auth/authMessages";
import { validateEmail } from "@panel/auth/validation";

export default function ForgotPassword() {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [serverError, setServerError] = useState("");

  const emailError = validateEmail(email);
  const visibleError = submitted || touched ? emailError : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
    if (emailError) return;
    setBusy(true);
    try {
      await sendPasswordResetEmail(email);
      setSentTo(email.trim());
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const resend = () => {
    setSentTo("");
    setSubmitted(false);
    setTouched(false);
  };

  if (sentTo) {
    return (
      <AuthLayout
        title="Revisa tu correo"
        description={`Si ${sentTo} tiene una cuenta, te enviamos un enlace para crear una contraseña nueva.`}
        footer={
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" /> Volver a iniciar sesión
          </Link>
        }
      >
        <div className="space-y-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success ring-1 ring-success/20">
            <Mail className="size-6" aria-hidden="true" />
          </div>
          <AuthAlert tone="success">
            El enlace expira en una hora. Si no aparece, revisa la carpeta de spam.
          </AuthAlert>
          <Button variant="outline" size="lg" className="w-full" onClick={resend}>
            Usar otro correo
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recupera tu contraseña"
      description="Escribe el correo con el que te registraste y te enviaremos un enlace para crear una contraseña nueva."
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && <AuthAlert>{serverError}</AuthAlert>}

        <TextField
          label="Correo electrónico registrado"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => {
            setServerError("");
            setEmail(e.target.value);
          }}
          onBlur={() => setTouched(true)}
          error={visibleError}
        />

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Enviando enlace…" : "Enviar enlace de recuperación"}
        </Button>
      </form>
    </AuthLayout>
  );
}

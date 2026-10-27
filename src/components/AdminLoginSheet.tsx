import React, { useState } from 'react';
import { ShieldCheck, LogOut, Eye, EyeOff, Check } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { Sheet } from './Sheet';

const inputClass =
  'w-full h-12 px-3.5 rounded-lg border border-linea bg-white text-[16px] text-tinta placeholder:text-acero/60 focus:outline-none focus:border-stone focus:ring-2 focus:ring-stone/20';

/** Pantalla de acceso: correo y contraseña de Firebase; solo editan las cuentas registradas en `admins`. */
export const AdminLoginSheet: React.FC = () => {
  const { isLoginOpen, setIsLoginOpen, adminStatus, authEmail, signInWithEmail, resetAdminPassword, setIsAdminMode } =
    useAppConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isLoginOpen || adminStatus === 'admin') return null;

  const close = () => setIsLoginOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setBusy(true);
    const msg = await signInWithEmail(email, password);
    setBusy(false);
    if (msg) setError(msg);
  };

  const handleReset = async () => {
    setError('');
    setNotice('');
    if (!email.trim()) {
      setError('Escribe tu correo arriba y vuelve a tocar "Olvidé mi contraseña".');
      return;
    }
    const msg = await resetAdminPassword(email);
    if (msg) setError(msg);
    else setNotice(`Si ${email.trim()} tiene cuenta, te llegará un correo para crear una contraseña nueva.`);
  };

  // Sesión iniciada con una cuenta que no está en la lista de administradores
  if (adminStatus === 'not-admin') {
    return (
      <Sheet title="Sin permiso de edición" onClose={close}>
        <p className="text-[15px] text-tinta">
          La cuenta <span className="font-semibold">{authEmail}</span> no está registrada como administradora de esta tarjeta.
        </p>
        <p className="mt-2 text-[14px] text-acero">
          Agrega ese correo en minúsculas a la colección <span className="font-semibold">admins</span> de Firestore, o entra con otra cuenta.
        </p>
        <button
          type="button"
          onClick={() => setIsAdminMode(false)}
          className="mt-5 w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-linea hover:border-tinta text-tinta text-[16px] font-semibold"
        >
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
      </Sheet>
    );
  }

  const checking = adminStatus === 'checking' && !!authEmail;

  return (
    <Sheet title="Entrar como administrador" onClose={close}>
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-stone shrink-0 mt-0.5" />
        <p className="text-[15px] text-tinta">Solo las cuentas autorizadas pueden editar esta tarjeta.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <div>
          <label htmlFor="admin-email" className="text-[15px] font-medium text-tinta">
            Correo
          </label>
          <input
            id="admin-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputClass} mt-1.5`}
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="text-[15px] font-medium text-tinta">
            Contraseña
          </label>
          <div className="relative mt-1.5">
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center text-acero hover:text-tinta"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-[14px] text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-[14px] text-wa flex items-start gap-1.5">
            <Check className="w-4 h-4 mt-0.5 shrink-0" /> {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || checking}
          className="w-full h-12 rounded-xl bg-stone hover:bg-stone-hondo text-white text-[16px] font-semibold disabled:opacity-60"
        >
          {checking ? 'Verificando permisos…' : busy ? 'Entrando…' : 'Entrar'}
        </button>
        <button type="button" onClick={handleReset} className="w-full h-10 text-[14px] font-semibold text-stone hover:underline">
          Olvidé mi contraseña
        </button>
      </form>
    </Sheet>
  );
};

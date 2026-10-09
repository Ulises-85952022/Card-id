import React, { useState } from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { Sheet } from './Sheet';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6-2.74-6-6.2s2.69-6.2 6-6.2c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.8 3.18 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.66 0 9.4-3.98 9.4-9.58 0-.64-.07-1.13-.16-1.62H12z" />
  </svg>
);

/** Pantalla de acceso: solo cuentas de Google registradas en la colección `admins` pueden editar. */
export const AdminLoginSheet: React.FC = () => {
  const { isLoginOpen, setIsLoginOpen, adminStatus, authEmail, signInAsAdmin, setIsAdminMode } = useAppConfig();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isLoginOpen || adminStatus === 'admin') return null;

  const handleSignIn = async () => {
    setError('');
    setBusy(true);
    const msg = await signInAsAdmin();
    setBusy(false);
    if (msg) setError(msg);
  };

  const close = () => setIsLoginOpen(false);

  // Sesión iniciada con una cuenta sin permiso
  if (adminStatus === 'not-admin') {
    return (
      <Sheet title="Sin permiso de edición" onClose={close}>
        <p className="text-[15px] text-tinta">
          La cuenta <span className="font-semibold">{authEmail}</span> no está registrada como administradora de esta tarjeta.
        </p>
        <p className="mt-2 text-[14px] text-acero">
          Entra con la cuenta autorizada, o pide que se agregue tu correo a la lista de administradores en Firebase.
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
        <p className="text-[15px] text-tinta">
          Para editar la tarjeta, entra con tu cuenta de Google. Solo las cuentas autorizadas pueden hacer cambios.
        </p>
      </div>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={busy || checking}
        className="mt-5 w-full h-12 inline-flex items-center justify-center gap-2.5 rounded-xl border border-linea hover:border-tinta bg-white text-tinta text-[16px] font-semibold disabled:opacity-60"
      >
        <GoogleIcon />
        {checking ? 'Verificando permisos…' : busy ? 'Abriendo Google…' : 'Continuar con Google'}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-red-700">
          {error}
        </p>
      )}
    </Sheet>
  );
};

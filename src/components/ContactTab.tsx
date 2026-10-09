import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';

export const ContactTab: React.FC = () => {
  const { profile } = useAppConfig();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // El portapapeles no está disponible; no hay nada que mostrar
    }
  };

  const zone = profile.coverageZone || profile.location || 'México';
  const email = profile.workEmail || profile.email;

  const rows = [
    {
      id: 'c-phone',
      label: 'Celular',
      value: profile.phoneDisplay || profile.phoneRaw,
      href: `tel:${profile.phoneRaw}`,
      copy: profile.phoneRaw,
    },
    {
      id: 'c-email',
      label: 'Correo',
      value: email,
      href: `mailto:${email}`,
      copy: email,
    },
    {
      id: 'c-zone',
      label: 'Zona',
      value: zone,
      href: `https://maps.google.com/?q=${encodeURIComponent(profile.location || zone)}`,
      external: true,
      copy: zone,
    },
  ];

  return (
    <section aria-labelledby="h-contacto" className="px-5 sm:px-6">
      <h2 id="h-contacto" className="text-[20px] font-semibold text-tinta mb-1">
        Contacto
      </h2>
      <ul className="divide-y divide-linea border-y border-linea">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center gap-3">
            <a
              href={row.href}
              target={row.external ? '_blank' : undefined}
              rel={row.external ? 'noopener noreferrer' : undefined}
              className="flex-1 min-w-0 py-3.5 grid grid-cols-[68px_1fr] items-baseline gap-2 group"
            >
              <span className="text-[14px] text-acero">{row.label}</span>
              <span className="text-[16px] font-medium text-tinta truncate group-hover:text-stone group-hover:underline underline-offset-2">
                {row.value}
              </span>
            </a>
            <button
              type="button"
              onClick={() => handleCopy(row.id, row.copy)}
              className="shrink-0 w-10 h-10 -mr-2 inline-flex items-center justify-center rounded-md text-acero hover:text-tinta hover:bg-niebla"
              aria-label={`Copiar ${row.label.toLowerCase()}`}
              title="Copiar"
            >
              {copiedId === row.id ? <Check className="w-4 h-4 text-wa" /> : <Copy className="w-4 h-4" />}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[14px] text-acero">Atiendo de lunes a viernes, de 8:00 a 18:00 (hora del centro).</p>
    </section>
  );
};

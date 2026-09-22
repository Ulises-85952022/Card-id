import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { preconnectUrl } from '../utils/linkOptimizer';

export const ContactTab: React.FC = () => {
  const { profile } = useAppConfig();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore
    }
  };

  const firstName = profile.name.trim().split(' ')[0] || 'Hola';
  const websiteUrl = profile.companyWebsite || profile.corporateUrl || profile.brandsUrl || '';
  const websiteDisplay = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'Sitio Web';

  const contactList = [
    {
      id: 'c-whatsapp',
      label: 'WhatsApp Directo',
      val: `+${profile.whatsappNumber}`,
      href: `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(`Hola ${firstName}, me comunico desde tu tarjeta digital ejecutiva de ${profile.company}`)}`,
      isExternal: true,
      iconType: 'wa',
      copyValue: `+${profile.whatsappNumber}`,
    },
    {
      id: 'c-phone',
      label: 'Línea Telefónica Móvil',
      val: profile.phoneDisplay || profile.phoneRaw,
      href: `tel:${profile.phoneRaw}`,
      isExternal: false,
      iconType: 'phone',
      copyValue: profile.phoneRaw,
    },
    {
      id: 'c-email',
      label: 'Correo Electrónico',
      val: profile.email,
      href: `mailto:${profile.email}?subject=${encodeURIComponent(`Contacto Ejecutivo · ${profile.company}`)}`,
      isExternal: false,
      iconType: 'mail',
      copyValue: profile.email,
    },
    {
      id: 'c-zone',
      label: 'Zona de Cobertura / Ubicación',
      val: profile.coverageZone || profile.location || 'México',
      href: `https://maps.google.com/?q=${encodeURIComponent(profile.coverageZone || profile.location || 'México')}`,
      isExternal: true,
      iconType: 'pin',
      copyValue: profile.coverageZone || profile.location || 'México',
    },
    ...(websiteUrl ? [{
      id: 'c-portal',
      label: `Página Web · ${profile.company}`,
      val: websiteDisplay,
      href: websiteUrl,
      isExternal: true,
      iconType: 'globe',
      copyValue: websiteUrl,
    }] : []),
  ];

  return (
    <div id="tab-content-contacto" className="space-y-2.5 animate-in fade-in duration-200">
      {contactList.map((item) => (
        <a
          key={item.id}
          id={item.id}
          href={item.href}
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
          onMouseEnter={() => item.isExternal && preconnectUrl(item.href)}
          onTouchStart={() => item.isExternal && preconnectUrl(item.href)}
          className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.07] hover:border-cyan-500/35 transition-all duration-150"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Icon box */}
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center flex-shrink-0 text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105 transition-transform">
              {item.iconType === 'wa' && (
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.953 1.179-.176.2-.351.226-.652.075-.3-.15-1.267-.467-2.414-1.488-.893-.796-1.496-1.778-1.671-2.079-.176-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.234-.244-.588-.493-.508-.677-.518l-.577-.01c-.2 0-.526.075-.802.376s-1.054 1.029-1.054 2.509c0 1.48 1.079 2.909 1.23 3.11 0.15.2 2.122 3.24 5.14 4.543.718.31 1.279.495 1.716.634.722.23 1.378.197 1.898.119.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.201-.577-.351z" />
                </svg>
              )}
              {item.iconType === 'phone' && <Phone className="w-4.5 h-4.5 text-cyan-400" />}
              {item.iconType === 'mail' && <Mail className="w-4.5 h-4.5 text-teal-300" />}
              {item.iconType === 'pin' && <MapPin className="w-4.5 h-4.5 text-cyan-400" />}
              {item.iconType === 'globe' && <Globe className="w-4.5 h-4.5 text-sky-400" />}
            </div>

            {/* Labels */}
            <div className="min-w-0 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                {item.label}
              </div>
              <div className="text-sm font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors truncate">
                {item.val}
              </div>
            </div>
          </div>

          {/* Quick copy / chevron */}
          <div className="flex items-center gap-1 pl-2">
            <button
              type="button"
              onClick={(e) => handleCopy(item.id, item.copyValue, e)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Copiar datos"
              aria-label="Copiar"
            >
              {copiedId === item.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              )}
            </button>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </a>
      ))}

      {/* Corporate info banner */}
      <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900/60 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 flex-shrink-0 mt-0.5">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-white text-xs">Horario de Atención Industrial</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Lunes a Viernes: 08:00 - 18:00 (CST) · Soporte para emergencias de línea en planta vía WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
};

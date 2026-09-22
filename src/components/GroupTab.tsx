import React from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { preconnectUrl } from '../utils/linkOptimizer';
import {
  Globe,
  ExternalLink,
  Building2,
  FileText,
  CalendarCheck,
  Sparkles,
  Layers,
  ArrowUpRight,
  Edit2,
} from 'lucide-react';

interface GroupTabProps {
  onOpenQuote: (brandId?: string) => void;
  onOpenAdmin?: () => void;
}

export const GroupTab: React.FC<GroupTabProps> = ({ onOpenQuote, onOpenAdmin }) => {
  const { profile, isAdminMode } = useAppConfig();

  const websiteUrl =
    profile.companyWebsite || profile.corporateUrl || profile.brandsUrl || 'https://ammega.com/';
  const displayHost = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const websiteSummaryText =
    profile.websiteSummary ||
    'Portal web corporativo con catálogo interactivo de soluciones, especificaciones técnicas de ingeniería, hojas de datos y herramientas de selección para la industria.';

  const companyDesc =
    profile.companyDescription ||
    profile.bio ||
    'Líder en soluciones integrales para la industria, tecnología aplicada y servicio especializado.';

  return (
    <div id="tab-content-web" className="space-y-3.5 animate-in fade-in duration-200 text-left">
      {/* Main Corporate & Website Card */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-cyan-950/40 via-[#0e222c] to-[#07151b] border border-cyan-500/30 relative overflow-hidden shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Company Name */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>{profile.company}</span>
          </div>

          {isAdminMode && onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Editar Web</span>
            </button>
          )}
        </div>

        {profile.companyTagline && (
          <h3 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] tracking-tight">
            {profile.companyTagline}
          </h3>
        )}

        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
          {companyDesc}
        </p>

        {/* Website Direct Link Block */}
        <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Página Web Oficial</span>
          </div>
          <div className="text-xs text-white font-mono truncate mb-2.5 selection:bg-cyan-500">
            {websiteUrl}
          </div>

          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => preconnectUrl(websiteUrl)}
            onTouchStart={() => preconnectUrl(websiteUrl)}
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-[0.98] w-full"
          >
            <span>Visitar {displayHost}</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Website Summary Block */}
      <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08] space-y-2.5">
        <div className="flex items-center gap-2 text-cyan-400">
          <FileText className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Resumen del Sitio Web y Catálogo
          </h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {websiteSummaryText}
        </p>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 gap-2 pt-1.5">
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300">
            <span className="text-emerald-400 font-bold block mb-0.5">✓ Catálogo y Fichas</span>
            Acceso directo a especificaciones técnicas y documentación
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300">
            <span className="text-cyan-400 font-bold block mb-0.5">✓ Atención Directa</span>
            Asesoría comercial personalizada y cotizaciones
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onOpenQuote()}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-600 hover:to-cyan-600 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98]"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Solicitar Cotización o Asesoría en Línea</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { GROUP_METRICS, USER_PROFILE } from '../data';
import { SmartBrandLogo } from './logos/SmartBrandLogo';
import { ShieldCheck, Award, Factory, Users, Globe2, ExternalLink, CalendarCheck } from 'lucide-react';

interface GroupTabProps {
  onOpenQuote: (brandId?: string) => void;
}

export const GroupTab: React.FC<GroupTabProps> = ({ onOpenQuote }) => {
  return (
    <div id="tab-content-grupo" className="space-y-3.5 animate-in fade-in duration-200">
      {/* Main Corporate Card */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-teal-950/50 via-[#0e222c] to-[#07151b] border border-cyan-500/30 text-center relative overflow-hidden shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Ammega Brand Header */}
        <div className="bg-white rounded-2xl py-2 px-4 inline-flex items-center justify-center shadow-md mb-3 border border-white/20">
          <SmartBrandLogo brandId="ammega" className="h-7 w-auto" whiteBg={true} />
        </div>

        <h3 className="text-base font-bold text-white font-['Space_Grotesk'] tracking-tight">
          The Power of Motion
        </h3>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          Líder mundial uniendo la ingeniería y tecnología de las marcas más prestigiosas en bandas transportadoras, transmisión de potencia síncrona y mangueras industriales.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-left">
          {GROUP_METRICS.map((stat, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-center"
            >
              <div className="text-lg font-bold text-cyan-300 font-['Space_Grotesk']">
                {stat.value}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action Link */}
        <a
          href={USER_PROFILE.corporateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-cyan-200 text-xs font-bold transition-colors w-full"
        >
          <span>Conocer más sobre el Grupo AMMEGA</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Local Presence & Service in Mexico */}
      <div className="rounded-2xl p-4 bg-white/[0.03] border border-white/[0.08] space-y-2.5 text-left">
        <div className="flex items-center gap-2 text-cyan-400">
          <Factory className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Soporte Directo en México
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Contamos con centros de servicio técnico, inventario local, talleres de vulcanizado y empalme en sitio, atendiendo de manera prioritaria el corredor industrial de <strong>Guadalajara, Jalisco, el Bajío y Occidente</strong>.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300">
            <span className="text-emerald-400 font-bold block">✓ Ensamble Rápido</span>
            Vulcanizado y corte a medida local
          </div>
          <div className="p-2 rounded-xl bg-black/30 border border-white/5 text-[11px] text-slate-300">
            <span className="text-cyan-400 font-bold block">✓ Visitas Técnicas</span>
            Levantamientos en líneas de planta
          </div>
        </div>

        {/* Request Plant Visit CTA */}
        <button
          type="button"
          onClick={() => onOpenQuote()}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-600 hover:to-cyan-600 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98]"
        >
          <CalendarCheck className="w-4 h-4" />
          Agendar Asesoría o Visita Técnica
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { BrandInfo } from '../types';
import { SmartBrandLogo, BrandLogoId } from './logos/SmartBrandLogo';
import {
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Plus,
  Tag,
  ArrowUpRight,
  Settings2,
} from 'lucide-react';

interface BrandsTabProps {
  onOpenQuote: (brandId: string) => void;
}

export const BrandsTab: React.FC<BrandsTabProps> = ({ onOpenQuote }) => {
  const { profile, brands, openAdminWithBrand, isAdminMode } = useAppConfig();
  const [expandedBrand, setExpandedBrand] = useState<string | null>('ammeraal');

  const toggleExpand = (id: string) => {
    setExpandedBrand((prev) => (prev === id ? null : id));
  };

  const renderLogo = (brand: BrandInfo) => {
    if (brand.logoUrl) {
      return (
        <img
          src={brand.logoUrl}
          alt={brand.name}
          className="h-6 w-auto max-w-[110px] object-contain"
        />
      );
    }
    if (brand.id === 'ammeraal' || brand.id === 'megadyne' || brand.id === 'jason' || brand.id === 'ammega') {
      return <SmartBrandLogo brandId={brand.id as BrandLogoId} className="h-6" whiteBg={true} />;
    }
    return <span className="text-xs font-bold text-slate-800 tracking-tight">{brand.name}</span>;
  };

  const sectionTitle = profile.projectsSectionTitle || 'Proyectos';

  return (
    <div id="tab-content-proyectos" className="space-y-3.5 animate-in fade-in duration-200">
      {/* Introduction note */}
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs text-slate-300 font-medium">
          {sectionTitle} y Especialidades de <span className="text-cyan-300 font-semibold">{profile.company}</span>
        </p>

        {isAdminMode && (
          <button
            type="button"
            onClick={() => openAdminWithBrand()}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 hover:underline transition-colors"
            title="Abrir menú para administrar proyectos y líneas"
          >
            <Settings2 className="w-3 h-3" />
            <span>Gestionar {sectionTitle}</span>
          </button>
        )}
      </div>

      {/* Brand Cards List */}
      <div className="space-y-3">
        {brands.map((brand) => {
          const isExpanded = expandedBrand === brand.id;
          const subcategories = brand.subcategories || [];

          return (
            <div
              key={brand.id}
              id={`brand-card-${brand.id}`}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/35 overflow-hidden transition-all duration-200"
            >
              {/* Header bar */}
              <div
                onClick={() => toggleExpand(brand.id)}
                className="p-3.5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-white/[0.02] to-transparent hover:bg-white/[0.05] transition-colors"
              >
                {/* Logo in white pill */}
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-xl py-1 px-2.5 shadow-sm inline-flex items-center justify-center border border-white/20">
                    {renderLogo(brand)}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 uppercase tracking-wider">
                    {brand.categoryPill}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                    {subcategories.length} subcat.
                  </span>
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-white"
                    aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 pb-4 pt-1">
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {brand.description}
                </p>

                {/* Subcategories Section (The requested feature: title, description, link) */}
                <div className="mt-3.5 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>Líneas y Subcategorías</span>
                    </div>

                    {isAdminMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAdminWithBrand(brand.id);
                        }}
                        className="text-[10px] py-0.5 px-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 font-semibold inline-flex items-center gap-1 transition-colors"
                        title="Agregar o editar subcategorías para esta marca"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Agregar / Modificar</span>
                      </button>
                    )}
                  </div>

                  {/* Subcategories list cards */}
                  <div className="space-y-2">
                    {subcategories.slice(0, isExpanded ? undefined : 2).map((sub) => (
                      <div
                        key={sub.id}
                        className="p-2.5 rounded-xl bg-black/30 border border-white/[0.08] hover:border-cyan-500/35 transition-all text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white text-xs">
                              {sub.title}
                            </span>
                            {sub.badge && (
                              <span className="text-[9px] font-semibold py-0.5 px-1.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300">
                                {sub.badge}
                              </span>
                            )}
                          </div>

                          {sub.linkUrl && (
                            <a
                              href={sub.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-0.5 shrink-0 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md hover:bg-cyan-500/20 transition-all"
                            >
                              <span>Ver</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>
                    ))}

                    {!isExpanded && subcategories.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setExpandedBrand(brand.id)}
                        className="w-full text-center py-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        + Ver {subcategories.length - 2} subcategorías más...
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable industries */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Sectores Clave en México
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {brand.industries.map((ind, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium"
                        >
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom action buttons */}
                <div className="mt-3.5 pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenQuote(brand.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition-colors"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5 text-cyan-400" />
                    Cotizar {brand.name.split(' ')[0]}
                  </button>

                  <a
                    href={brand.catalogUrl || brand.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                    title="Sitio Oficial"
                  >
                    <span>Catálogo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

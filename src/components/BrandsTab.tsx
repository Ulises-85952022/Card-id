import React, { useState } from 'react';
import { ChevronDown, ExternalLink, Settings2 } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { BrandInfo } from '../types';
import { SmartBrandLogo, BrandLogoId } from './logos/SmartBrandLogo';

const KNOWN_LOGOS = ['ammeraal', 'megadyne', 'jason', 'ammega'];

export const BrandsTab: React.FC = () => {
  const { profile, brands, openAdminWithBrand, isAdminMode } = useAppConfig();
  const [expanded, setExpanded] = useState<string | null>(null);

  const firstName = profile.name.trim().split(' ')[0] || '';

  const renderLogo = (brand: BrandInfo) => {
    if (brand.logoUrl) {
      return <img src={brand.logoUrl} alt={brand.name} className="h-5 w-auto max-w-[96px] object-contain" />;
    }
    if (KNOWN_LOGOS.includes(brand.id)) {
      return <SmartBrandLogo brandId={brand.id as BrandLogoId} className="h-5" whiteBg={true} />;
    }
    return <span className="text-[14px] font-semibold text-tinta">{brand.name}</span>;
  };

  const quoteUrl = (brand: BrandInfo) =>
    `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(
      `Hola ${firstName}, quiero cotizar ${brand.name}. Lo necesito para: `
    )}`;

  return (
    <section aria-labelledby="h-marcas" className="px-5 sm:px-6">
      <div className="flex items-baseline justify-between mb-1">
        <h2 id="h-marcas" className="font-cond font-semibold text-[21px] text-tinta">
          Lo que manejo
        </h2>
        {isAdminMode && (
          <button
            type="button"
            onClick={() => openAdminWithBrand()}
            className="text-[14px] text-banda inline-flex items-center gap-1 hover:underline"
          >
            <Settings2 className="w-4 h-4" /> Editar
          </button>
        )}
      </div>

      <ul className="border-y border-linea divide-y divide-linea">
        {brands.map((brand) => {
          const isOpen = expanded === brand.id;
          const subs = brand.subcategories || [];
          const panelId = `panel-${brand.id}`;
          return (
            <li key={brand.id} id={`brand-card-${brand.id}`}>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : brand.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full py-3.5 flex items-center gap-3 text-left"
              >
                <span className="w-[108px] h-9 shrink-0 rounded-md border border-linea bg-white flex items-center justify-center px-2">
                  {renderLogo(brand)}
                </span>
                <span className="flex-1 min-w-0 text-[15px] leading-snug text-tinta">{brand.category}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-acero transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div id={panelId} className="pb-5">
                  <p className="text-[15px] leading-relaxed text-acero max-w-[60ch]">{brand.description}</p>

                  {subs.length > 0 && (
                    <ul className="mt-4 space-y-3">
                      {subs.map((sub) => (
                        <li key={sub.id} className="pl-3 border-l-2 border-banda/30">
                          {sub.linkUrl ? (
                            <a
                              href={sub.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[15px] font-semibold text-tinta hover:text-banda hover:underline underline-offset-2 inline-flex items-center gap-1"
                            >
                              {sub.title}
                              <ExternalLink className="w-3.5 h-3.5 text-acero" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className="text-[15px] font-semibold text-tinta">{sub.title}</span>
                          )}
                          <p className="text-[14px] leading-relaxed text-acero mt-0.5">{sub.description}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  {brand.industries?.length > 0 && (
                    <p className="mt-4 text-[14px] text-acero">
                      <span className="text-tinta font-medium">Sectores: </span>
                      {brand.industries.join(', ')}.
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={quoteUrl(brand)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-4 inline-flex items-center rounded-lg bg-tinta hover:bg-black text-white text-[15px] font-semibold"
                    >
                      Cotizar {brand.name.split(' ')[0]}
                    </a>
                    {(brand.catalogUrl || brand.officialUrl) && (
                      <a
                        href={brand.catalogUrl || brand.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-11 px-4 inline-flex items-center gap-1.5 rounded-lg border border-linea hover:border-tinta text-tinta text-[15px] font-semibold"
                      >
                        Ver catálogo <ExternalLink className="w-4 h-4" aria-hidden="true" />
                      </a>
                    )}
                    {isAdminMode && (
                      <button
                        type="button"
                        onClick={() => openAdminWithBrand(brand.id)}
                        className="h-11 px-3 text-[14px] text-banda hover:underline"
                      >
                        Editar líneas
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

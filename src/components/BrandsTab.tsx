import React, { useRef, useState } from 'react';
import { ArrowUpRight, Settings2 } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { BrandInfo } from '../types';
import { SmartBrandLogo, BrandLogoId } from './logos/SmartBrandLogo';
import { QuoteSheet } from './QuoteSheet';

const KNOWN_LOGOS = ['ammeraal', 'megadyne', 'jason', 'ammega'];

export const BrandsTab: React.FC = () => {
  const { profile, brands, openAdminWithBrand, isAdminMode } = useAppConfig();
  const [active, setActive] = useState(0);
  const [quoteBrand, setQuoteBrand] = useState<BrandInfo | null>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const renderLogo = (brand: BrandInfo) => {
    if (brand.logoUrl) return <img src={brand.logoUrl} alt={brand.name} className="h-5 w-auto max-w-[110px] object-contain" />;
    if (KNOWN_LOGOS.includes(brand.id)) return <SmartBrandLogo brandId={brand.id as BrandLogoId} className="h-5" whiteBg={true} />;
    return <span className="text-[14px] font-semibold text-tinta">{brand.name}</span>;
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.firstElementChild) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12;
    setActive(Math.round(el.scrollLeft / w));
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    const child = el?.children[i] as HTMLElement | undefined;
    if (el && child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft - 20, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="h-marcas">
      <div className="px-5 sm:px-6 flex items-baseline justify-between mb-3">
        <h2 id="h-marcas" className="text-[20px] font-semibold text-tinta">
          Líneas de producto
        </h2>
        {isAdminMode ? (
          <button type="button" onClick={() => openAdminWithBrand()} className="text-[14px] text-stone inline-flex items-center gap-1 hover:underline">
            <Settings2 className="w-4 h-4" /> Editar
          </button>
        ) : (
          <span className="text-[14px] text-acero" aria-hidden="true">
            {active + 1} de {brands.length}
          </span>
        )}
      </div>

      <ul
        ref={trackRef}
        onScroll={onScroll}
        className="carrusel flex gap-3 overflow-x-auto px-5 sm:px-6 scroll-px-5 sm:scroll-px-6 pb-1"
        aria-label="Marcas"
      >
        {brands.map((brand) => {
          const subs = (brand.subcategories || []).slice(0, 3);
          return (
            <li
              key={brand.id}
              id={`brand-card-${brand.id}`}
              className="shrink-0 w-[84%] rounded-2xl bg-niebla border border-linea p-4 flex flex-col"
            >
              <div className="flex items-center gap-3">
                <span className="h-9 px-2.5 rounded-lg bg-white border border-linea flex items-center justify-center">
                  {renderLogo(brand)}
                </span>
              </div>
              <h3 className="mt-3 text-[17px] font-semibold leading-snug text-tinta">{brand.category}</h3>
              <p className="mt-1 text-[14px] leading-relaxed text-acero line-clamp-3">{brand.description}</p>

              {subs.length > 0 && (
                <p className="mt-4 text-[13px] font-semibold text-stone">Catálogos</p>
              )}
              {subs.length > 0 && (
                <ul className="mt-1 divide-y divide-linea border-y border-linea">
                  {subs.map((sub) => (
                    <li key={sub.id}>
                      {sub.linkUrl ? (
                        <a
                          href={sub.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 flex items-center justify-between gap-2 text-[14px] font-medium text-tinta hover:text-stone"
                        >
                          <span className="truncate">{sub.title}</span>
                          <ArrowUpRight className="w-4 h-4 shrink-0 text-acero" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="py-2.5 block text-[14px] font-medium text-tinta truncate">{sub.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuoteBrand(brand)}
                  className="flex-1 h-11 inline-flex items-center justify-center rounded-lg bg-stone hover:bg-stone-hondo text-white text-[15px] font-semibold"
                >
                  Cotizar
                </button>
                {(brand.officialUrl || brand.catalogUrl) && (
                  <a
                    href={brand.officialUrl || brand.catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-11 inline-flex items-center justify-center gap-1 rounded-lg border border-linea bg-white hover:border-stone text-tinta text-[15px] font-semibold"
                  >
                    Sitio web <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                )}
              </div>
              {isAdminMode && (
                <button type="button" onClick={() => openAdminWithBrand(brand.id)} className="mt-2 text-[13px] text-stone hover:underline self-start">
                  Editar líneas
                </button>
              )}
            </li>
          );
        })}
        <li aria-hidden="true" className="shrink-0 w-2" />
      </ul>

      <div className="mt-2 flex justify-center">
        {brands.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ver ${b.name}`}
            aria-current={i === active}
            className="p-2.5"
          >
            <span className={`block h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-stone' : 'w-1.5 bg-linea'}`} />
          </button>
        ))}
      </div>

      {quoteBrand && <QuoteSheet brand={quoteBrand} onClose={() => setQuoteBrand(null)} />}
    </section>
  );
};

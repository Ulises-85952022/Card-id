import React, { useState } from 'react';
import ammegaLogo from '../../assets/logos/ammega.png';
import ammeraalLogo from '../../assets/logos/ammeraal.png';
import megadyneLogo from '../../assets/logos/megadyne.png';
import jasonLogo from '../../assets/logos/jason.png';

export type BrandLogoId = 'ammega' | 'ammeraal' | 'megadyne' | 'jason';

interface SmartBrandLogoProps {
  brandId: BrandLogoId;
  className?: string;
  whiteBg?: boolean;
  alt?: string;
}

/** Logotipos oficiales tomados del portafolio de productos AMMEGA (09.2025) */
const OFFICIAL_LOGOS: Record<BrandLogoId, string> = {
  ammega: ammegaLogo,
  ammeraal: ammeraalLogo,
  megadyne: megadyneLogo,
  jason: jasonLogo,
};

const BRAND_NAMES: Record<BrandLogoId, string> = {
  ammega: 'AMMEGA Group',
  ammeraal: 'Ammeraal Beltech',
  megadyne: 'Megadyne',
  jason: 'Jason',
};

/**
 * Muestra el logotipo oficial de la marca. La imagen va empaquetada en el código, así que se ve
 * desde el primer cuadro, sin depender de rutas de /public. Si por algo no carga, muestra el
 * nombre de la marca en texto; nunca dibuja una imitación del logotipo.
 */
export const SmartBrandLogo: React.FC<SmartBrandLogoProps> = ({
  brandId,
  className = 'h-6 w-auto',
  whiteBg = true,
  alt,
}) => {
  const [failed, setFailed] = useState(false);
  const src = OFFICIAL_LOGOS[brandId];

  if (failed || !src) {
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap text-sm font-semibold tracking-tight ${
          whiteBg ? 'text-slate-900' : 'text-white'
        } ${className}`}
      >
        {BRAND_NAMES[brandId]}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt || BRAND_NAMES[brandId]}
      onError={() => setFailed(true)}
      className={`block w-auto max-w-none object-contain shrink-0 ${className}`}
    />
  );
};

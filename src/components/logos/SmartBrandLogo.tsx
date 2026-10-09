import React, { useState, useEffect } from 'react';

export type BrandLogoId = 'ammega' | 'ammeraal' | 'megadyne' | 'jason';

interface SmartBrandLogoProps {
  brandId: BrandLogoId;
  className?: string;
  whiteBg?: boolean;
  alt?: string;
}

const BRAND_FILE_CANDIDATES: Record<BrandLogoId, string[]> = {
  ammega: [
    '/logos/ammega.png',
    '/logos/ammega.svg',
    '/logos/ammega.jpg',
    '/ammega.png',
    './logos/ammega.png',
    './ammega.png',
  ],
  ammeraal: [
    '/logos/ammeraal.png',
    '/logos/ammeraal.svg',
    '/logos/ammeraal.jpg',
    '/ammeraal.png',
    './logos/ammeraal.png',
    './ammeraal.png',
  ],
  megadyne: [
    '/logos/megadyne.png',
    '/logos/megadyne.svg',
    '/logos/megadyne.jpg',
    '/megadyne.png',
    './logos/megadyne.png',
    './megadyne.png',
  ],
  jason: [
    '/logos/jason.png',
    '/logos/jason.svg',
    '/logos/jason.jpg',
    '/jason.png',
    './logos/jason.png',
    './jason.png',
  ],
};

const BRAND_NAMES: Record<BrandLogoId, string> = {
  ammega: 'AMMEGA Group',
  ammeraal: 'Ammeraal Beltech',
  megadyne: 'Megadyne',
  jason: 'Jason Industrial',
};

/**
 * SmartBrandLogo:
 * Solo muestra archivos de logo oficiales colocados en /public/logos/.
 * Si no hay archivo, muestra el nombre de la marca en texto plano.
 * Nunca dibuja una imitación del logotipo.
 */
export const SmartBrandLogo: React.FC<SmartBrandLogoProps> = ({
  brandId,
  className = 'h-6 w-auto',
  whiteBg = true,
  alt,
}) => {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasImageLoaded, setHasImageLoaded] = useState(false);
  const [hasFailedAllImages, setHasFailedAllImages] = useState(false);

  const candidates = BRAND_FILE_CANDIDATES[brandId] || [];
  const currentSrc = candidates[candidateIndex];

  // Reset when brandId changes
  useEffect(() => {
    setCandidateIndex(0);
    setHasImageLoaded(false);
    setHasFailedAllImages(false);
  }, [brandId]);

  const handleImageError = () => {
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasFailedAllImages(true);
    }
  };

  const handleImageLoad = () => {
    setHasImageLoaded(true);
  };

  // Sin archivo oficial: nombre de la marca en texto, nunca una imitación del logo
  if (hasFailedAllImages || !currentSrc) {
    return renderTextFallback(brandId, className, whiteBg);
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <img
        src={currentSrc}
        alt={alt || BRAND_NAMES[brandId]}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`max-h-full max-w-full object-contain transition-opacity duration-150 ${
          hasImageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

function renderTextFallback(brandId: BrandLogoId, className: string, whiteBg: boolean) {
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

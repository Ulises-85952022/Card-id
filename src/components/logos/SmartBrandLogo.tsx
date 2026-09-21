import React, { useState, useEffect } from 'react';
import { AmmegaLogo } from './AmmegaLogo';
import { AmmeraalLogo } from './AmmeraalLogo';
import { MegadyneLogo } from './MegadyneLogo';
import { JasonLogo } from './JasonLogo';

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
 * Automatically checks for user-uploaded logo files in /logos/{name}.png, /public/{name}.png, etc.
 * If the image exists in GitHub/repository, it renders the exact uploaded file.
 * If not found or error, it seamlessly renders the clean SVG vector rendition.
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

  // If all file paths failed (or no file yet in repo), show the crisp vector logo
  if (hasFailedAllImages || !currentSrc) {
    return renderVectorFallback(brandId, className, whiteBg);
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Hidden during load or error, displayed when successfully loaded */}
      <img
        src={currentSrc}
        alt={alt || BRAND_NAMES[brandId]}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`max-h-full max-w-full object-contain transition-opacity duration-150 ${
          hasImageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
        }`}
      />

      {/* While loading or before confirmation, show vector fallback */}
      {!hasImageLoaded && renderVectorFallback(brandId, className, whiteBg)}
    </div>
  );
};

function renderVectorFallback(brandId: BrandLogoId, className: string, whiteBg: boolean) {
  switch (brandId) {
    case 'ammega':
      return <AmmegaLogo className={className} whiteBg={whiteBg} />;
    case 'ammeraal':
      return <AmmeraalLogo className={className} />;
    case 'megadyne':
      return <MegadyneLogo className={className} />;
    case 'jason':
      return <JasonLogo className={className} />;
    default:
      return null;
  }
}

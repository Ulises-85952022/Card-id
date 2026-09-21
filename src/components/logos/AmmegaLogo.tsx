import React from 'react';

interface LogoProps {
  className?: string;
  whiteBg?: boolean;
  color?: string;
}

/**
 * High-fidelity vector rendition of the official AMMEGA corporate logo (amega.png):
 * - Slanted italic bold geometric typography (-14° skew)
 * - Distinctive interlocking double 'M' where the 2nd M is offset lower and descends below baseline
 * - Clean knockout separator gap ensuring high contrast
 * - Deep teal brand color (#00575d)
 */
export const AmmegaLogo: React.FC<LogoProps> = ({
  className = 'h-7 w-auto',
  whiteBg = true,
  color,
}) => {
  const brandColor = color || (whiteBg ? '#00575d' : '#00a8b5');
  const gapColor = whiteBg ? '#ffffff' : '#0f1d24';

  return (
    <svg
      viewBox="0 0 380 114"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AMMEGA Group"
    >
      <g transform="skewX(-14) translate(26, 6)">
        {/* Letter 1: 'A' */}
        <path
          d="M12 78 L36 18 H52 L76 78 H60 L54 61 H33 L27 78 H12 Z M39 47 H49 L44 32 Z"
          fill={brandColor}
        />

        {/* Letter 2: First 'M' (Cap to Baseline) */}
        <path
          d="M82 78 V18 H99 L117 52 L135 18 H152 V78 H137 V34 L121 63 H113 L97 34 V78 H82 Z"
          fill={brandColor}
        />

        {/* Knockout gap around dropped Second 'M' for the signature AMMEGA interlocking effect */}
        <path
          d="M130 99 V41 H146 L160 68 L174 41 H190 V99 H174 V63 L164 83 H156 L146 63 V99 H130 Z"
          stroke={gapColor}
          strokeWidth="7"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* Letter 3: Dropped Second 'M' (Signature AMMEGA mark descending below baseline) */}
        <path
          d="M130 99 V41 H146 L160 68 L174 41 H190 V99 H174 V63 L164 83 H156 L146 63 V99 H130 Z"
          fill={brandColor}
        />

        {/* Letter 4: 'E' */}
        <path
          d="M198 78 V18 H236 V30 H213 V42 H232 V54 H213 V66 H236 V78 H198 Z"
          fill={brandColor}
        />

        {/* Letter 5: 'G' */}
        <path
          d="M275 44 H258 V55 H277 C275 66 268 72 258 72 C245 72 236 61 236 48 C236 35 245 24 258 24 C267 24 274 29 277 36 L289 29 C283 19 272 13 258 13 C238 13 222 28 222 48 C222 68 238 83 258 83 C273 83 286 74 290 59 V44 H275 Z"
          fill={brandColor}
        />

        {/* Letter 6: Final 'A' */}
        <path
          d="M296 78 L320 18 H336 L360 78 H344 L338 61 H317 L311 78 H296 Z M323 47 H333 L328 32 Z"
          fill={brandColor}
        />
      </g>
    </svg>
  );
};

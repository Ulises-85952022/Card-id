import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
}

export const MegadyneLogo: React.FC<LogoProps> = ({
  className = 'h-6 w-auto'
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Megadyne MD Shield Badge */}
      <svg
        viewBox="0 0 70 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto flex-shrink-0"
        aria-label="Megadyne Emblem"
      >
        {/* Top 3 circular pulley teeth */}
        <circle cx="35" cy="14" r="9" stroke="#E11D48" strokeWidth="4" fill="white" />
        <circle cx="16" cy="27" r="9" stroke="#E11D48" strokeWidth="4" fill="white" />
        <circle cx="54" cy="27" r="9" stroke="#E11D48" strokeWidth="4" fill="white" />
        {/* Shield body */}
        <path
          d="M8 32 H62 V64 C62 76 48 83 35 83 C22 83 8 76 8 64 Z"
          fill="#E11D48"
        />
        {/* 'M' inside shield */}
        <text
          x="35"
          y="54"
          fill="white"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="18"
          textAnchor="middle"
        >
          M
        </text>
        {/* 'D' inside shield */}
        <text
          x="35"
          y="74"
          fill="white"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="18"
          textAnchor="middle"
        >
          D
        </text>
      </svg>
      {/* Bold Italic Brand Text */}
      <span className="font-sans font-black italic tracking-tighter text-[#E11D48] text-sm sm:text-base select-none whitespace-nowrap">
        MEGADYNE
      </span>
    </div>
  );
};

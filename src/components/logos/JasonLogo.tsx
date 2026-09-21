import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
}

export const JasonLogo: React.FC<LogoProps> = ({
  className = 'h-6 w-auto'
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* JASON emblem: circular maroon badge with spiral J */}
      <svg
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto flex-shrink-0"
        aria-label="Jason Emblem"
      >
        <circle cx="30" cy="30" r="28" fill="#991B1B" />
        <path
          d="M32 12 H39 V34 C39 41 34 46 27 46 C20 46 15 41 15 35 C15 29 20 25 26 26 L27 32 C23 32 21 34 21 37 C21 39 23 41 27 41 C30 41 32 39 32 35 V12 Z"
          fill="white"
        />
      </svg>
      {/* Brand Text */}
      <span className="font-sans font-black tracking-tight text-slate-900 text-sm sm:text-base select-none whitespace-nowrap flex items-center">
        JASON
        <span className="text-[9px] align-super ml-0.5 font-bold text-slate-500">®</span>
      </span>
    </div>
  );
};

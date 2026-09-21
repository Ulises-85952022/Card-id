import React from 'react';

interface LogoProps {
  className?: string;
  height?: number | string;
}

export const AmmeraalLogo: React.FC<LogoProps> = ({
  className = 'h-6 w-auto'
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 100 85"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto flex-shrink-0"
        aria-label="Ammeraal Beltech Emblem"
      >
        {/* Left top blue ribbon arm */}
        <path
          d="M32 5 L8 28 C3 33 3 45 8 52 L36 78 C41 83 50 83 55 78 L65 68 L48 52 L26 31 L45 13 L32 5 Z"
          fill="#2563EB"
        />
        {/* Upper right blue return band */}
        <path
          d="M48 5 L82 24 C89 28 92 37 88 45 L72 78 L58 78 L74 48 L48 5 Z"
          fill="#1D4ED8"
        />
        {/* Inner folded grey band facing */}
        <path
          d="M45 13 L65 68 L48 52 L36 39 L45 13 Z"
          fill="#CBD5E1"
        />
        {/* Dark inner fold accent */}
        <path
          d="M26 31 L48 52 L45 13 Z"
          fill="#94A3B8"
        />
      </svg>
      <span className="font-sans font-black italic tracking-tight text-slate-900 text-sm sm:text-base select-none whitespace-nowrap">
        Ammeraal <span className="font-extrabold not-italic">Beltech</span>
      </span>
    </div>
  );
};

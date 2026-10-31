import { useId } from "react";
import { cn } from "@panel/lib/utils";

/** Monograma: una tarjeta de presentación dentro de un cuadro índigo→violeta. */
export function LogoMark({ className }) {
  const gid = `ncid-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gid})`} />
      <rect x="7" y="10" width="18" height="12" rx="2.5" fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="12.5" cy="16" r="2" fill="#fff" />
      <path d="M17 14.5h5M17 17.5h3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ collapsed = false, className }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!collapsed && (
        <span className="text-[1.0625rem] font-bold tracking-tight">
          net carID <span className="font-extrabold text-ai">AI</span>
        </span>
      )}
    </div>
  );
}

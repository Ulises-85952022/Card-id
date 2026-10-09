import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Hoja inferior en móvil, diálogo centrado en escritorio. Cierra con Escape o tocando fuera. */
export const Sheet: React.FC<SheetProps> = ({ title, subtitle, onClose, children, footer }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-tinta/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full sm:max-w-[440px] max-h-[92dvh] flex flex-col bg-white rounded-t-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-3 border-b border-linea">
          <div className="min-w-0">
            <h3 className="text-[20px] font-semibold text-tinta">{title}</h3>
            {subtitle && <p className="text-[14px] text-acero mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -mr-2 shrink-0 inline-flex items-center justify-center rounded-md text-acero hover:bg-niebla hover:text-tinta"
            aria-label="Cerrar"
            autoFocus
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5"
          style={footer ? undefined : { paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          {children}
        </div>
        {footer && (
          <div
            className="px-5 sm:px-6 pt-3 border-t border-linea bg-white rounded-b-2xl"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

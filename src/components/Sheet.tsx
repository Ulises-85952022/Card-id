import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Hoja inferior en móvil, diálogo centrado en escritorio. Cierra con Escape o tocando fuera. */
export const Sheet: React.FC<SheetProps> = ({ title, onClose, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-tinta/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full sm:max-w-[400px] bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cond font-semibold text-[21px] text-tinta">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -mr-2 inline-flex items-center justify-center rounded-md text-acero hover:bg-concreto hover:text-tinta"
            aria-label="Cerrar"
            autoFocus
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

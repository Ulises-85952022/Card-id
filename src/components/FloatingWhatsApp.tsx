import React, { useState } from 'react';
import { useAppConfig } from '../context/ConfigContext';
import { preconnectUrl } from '../utils/linkOptimizer';

export const FloatingWhatsApp: React.FC = () => {
  const { profile } = useAppConfig();
  const [showTooltip, setShowTooltip] = useState(false);

  const waUrl = `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${profile.name.split(' ')[0] || ''}, me comunico desde tu tarjeta digital ${profile.company ? `de ${profile.company}` : ''} para solicitar información técnica.`
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-[#0e222c] text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-xl border border-cyan-500/30 whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150">
          ¿En qué podemos ayudarte?
        </div>
      )}

      {/* Floating button */}
      <a
        id="btn-floating-whatsapp"
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => {
          setShowTooltip(true);
          preconnectUrl('https://wa.me');
        }}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => preconnectUrl('https://wa.me')}
        className="w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:scale-110 active:scale-95 transition-all duration-150"
        aria-label="Contactar por WhatsApp directo"
      >
        <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.953 1.179-.176.2-.351.226-.652.075-.3-.15-1.267-.467-2.414-1.488-.893-.796-1.496-1.778-1.671-2.079-.176-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.234-.244-.588-.493-.508-.677-.518l-.577-.01c-.2 0-.526.075-.802.376s-1.054 1.029-1.054 2.509c0 1.48 1.079 2.909 1.23 3.11 0.15.2 2.122 3.24 5.14 4.543.718.31 1.279.495 1.716.634.722.23 1.378.197 1.898.119.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.201-.577-.351z" />
        </svg>
      </a>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Mail, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
  role: string;
  company: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url,
  name,
  role,
  company,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Tarjeta digital de contacto: ${name} · ${role} en ${company}.\nSoluciones en bandas transportadoras, correas y mangueras industriales.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} · ${role}`,
          text: shareText,
          url,
        });
        onClose();
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopy();
    }
  };

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText}\n${url}`
  )}`;

  const emailShareUrl = `mailto:?subject=${encodeURIComponent(
    `Contacto: ${name} · ${company}`
  )}&body=${encodeURIComponent(`${shareText}\n\nEnlace: ${url}`)}`;

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="share-modal-card"
        className="relative w-full max-w-sm rounded-3xl bg-[#0f1d24] border border-cyan-500/30 p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-share-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
          <Share2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
          Compartir Tarjeta Digital
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Envía los datos de contacto y catálogo de {name} directamente a tus contactos.
        </p>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <a
            id="btn-share-whatsapp"
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all hover:scale-[1.02]"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-300">WhatsApp</span>
          </a>

          <a
            id="btn-share-email"
            href={emailShareUrl}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 transition-all hover:scale-[1.02]"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-sky-300">Correo</span>
          </a>
        </div>

        {/* Copy Link Row */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2 text-left mb-4">
          <div className="flex-1 truncate text-xs text-cyan-200/90 font-mono px-1">
            {url}
          </div>
          <button
            id="btn-copy-share-url"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 text-xs font-semibold transition-all flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Native share button if supported */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            id="btn-native-share-trigger"
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
          >
            Opciones del Sistema Operativo
          </button>
        )}
      </div>
    </div>
  );
};

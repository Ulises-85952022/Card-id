import React, { useState } from 'react';
import { Copy, Check, Mail, Share2 } from 'lucide-react';
import { Sheet } from './Sheet';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
  role: string;
  company: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, name, role, company }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const shareText = `${name}, ${role} en ${company}. Bandas transportadoras, correas y mangueras industriales.`;
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin acceso al portapapeles
    }
  };

  const handleNative = async () => {
    try {
      await navigator.share({ title: name, text: shareText, url });
      onClose();
    } catch {
      // Cancelado por el usuario
    }
  };

  const rowClass =
    'w-full h-12 px-4 inline-flex items-center gap-3 rounded-lg border border-linea hover:border-tinta text-tinta text-[16px] font-semibold';

  return (
    <Sheet title="Compartir tarjeta" onClose={onClose}>
      <div className="space-y-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={rowClass}
        >
          <Share2 className="w-5 h-5 text-wa" /> Enviar por WhatsApp
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(`Contacto: ${name}`)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`}
          className={rowClass}
        >
          <Mail className="w-5 h-5 text-acero" /> Enviar por correo
        </a>
        <button type="button" onClick={handleCopy} className={rowClass}>
          {copied ? <Check className="w-5 h-5 text-wa" /> : <Copy className="w-5 h-5 text-acero" />}
          {copied ? 'Enlace copiado' : 'Copiar enlace'}
        </button>
        {canNativeShare && (
          <button type="button" onClick={handleNative} className={rowClass}>
            <Share2 className="w-5 h-5 text-acero" /> Más opciones
          </button>
        )}
      </div>
    </Sheet>
  );
};

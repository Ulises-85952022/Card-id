import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, ExternalLink, QrCode } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, url, name }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: {
          dark: '#005762',
          light: '#ffffff',
        },
      })
        .then((data) => setQrDataUrl(data))
        .catch((err) => console.error(err));
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${name.replace(/\s+/g, '_')}_AMMEGA.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="qr-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="qr-modal-card"
        className="relative w-full max-w-sm rounded-3xl bg-[#0f1d24] border border-cyan-500/30 p-6 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="btn-close-qr-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3 border border-cyan-500/20">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
          Código QR de Contacto
        </h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Escanea para abrir la tarjeta digital de {name} en cualquier dispositivo móvil.
        </p>

        {/* QR container */}
        <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto border-4 border-cyan-400/30">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Código QR para ${name}`}
              className="w-52 h-52 object-contain block mx-auto rounded-lg"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
              Generando código QR...
            </div>
          )}
        </div>

        {/* URL chip with copy */}
        <div className="mt-5 flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2 text-left">
          <div className="flex-1 truncate text-xs text-cyan-200/90 font-mono px-1">
            {url}
          </div>
          <button
            id="btn-copy-qr-url"
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

        {/* Action button */}
        <div className="mt-4 flex gap-2">
          <button
            id="btn-download-qr-img"
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Descargar Imagen QR
          </button>
        </div>
      </div>
    </div>
  );
};

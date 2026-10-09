import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import { Sheet } from './Sheet';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  name: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, url, name }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(url, { width: 480, margin: 1, color: { dark: '#172026', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Sheet title="Código QR" onClose={onClose}>
      <p className="text-[15px] text-acero mb-4">Pide a la otra persona que lo escanee con la cámara de su celular.</p>
      <div className="aspect-square w-full max-w-[280px] mx-auto">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`Código QR de la tarjeta de ${name}`} className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-concreto rounded-lg" aria-hidden="true" />
        )}
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={!qrDataUrl}
        className="mt-5 w-full h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-linea hover:border-tinta text-tinta text-[16px] font-semibold disabled:opacity-50"
      >
        <Download className="w-5 h-5" /> Descargar imagen
      </button>
    </Sheet>
  );
};

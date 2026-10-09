import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { UserPlus, Phone, Mail, Share2, Camera, Check, RotateCw, Download } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { SmartBrandLogo } from './logos/SmartBrandLogo';
import { downloadVCard } from '../utils/vcard';
import { AvatarModal } from './AvatarModal';
import { CompanyLogoModal } from './CompanyLogoModal';
import { compressImage } from '../utils/imageCompressor';
import { preconnectUrl } from '../utils/linkOptimizer';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.08c-.24.68-1.42 1.3-1.96 1.38-.5.07-1.13.1-1.83-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.31 1.42.29.14.46.12.62-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
  </svg>
);

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

/* ------------------------------------------------------------------ */
/* Tarjeta física: frente con datos, reverso con QR                    */
/* ------------------------------------------------------------------ */

interface WalletCardProps {
  publicUrl: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({ publicUrl }) => {
  const { profile, updateProfile, isAdminMode } = useAppConfig();
  const [flipped, setFlipped] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [qr, setQr] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(profile.name);
  const avatarSrc = profile.avatarUrl || '/avatar.png';

  useEffect(() => {
    QRCode.toDataURL(publicUrl, { width: 420, margin: 0, color: { dark: '#003d45', light: '#ffffff' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [publicUrl]);

  // Inclinación solo con cursor fino; en el celular basta con tocar para voltear
  const canTilt =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleMove = (e: React.PointerEvent) => {
    if (!canTilt || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const el = cardRef.current.style;
    el.setProperty('--ry', `${(px - 0.5) * 14}deg`);
    el.setProperty('--rx', `${(0.5 - py) * 10}deg`);
    el.setProperty('--gx', `${px * 100}%`);
    el.setProperty('--gy', `${py * 100}%`);
    if (!tracking) setTracking(true);
  };

  const resetTilt = () => {
    if (!cardRef.current) return;
    const el = cardRef.current.style;
    el.setProperty('--ry', '0deg');
    el.setProperty('--rx', '0deg');
    setTracking(false);
  };

  // Pegar una imagen con Ctrl+V cambia la foto solo en modo administrador
  const saveAvatar = async (dataUrlOrFile: string | File) => {
    try {
      const optimized = await compressImage(dataUrlOrFile, { maxWidth: 440, maxHeight: 440, quality: 0.85 });
      setAvatarFailed(false);
      updateProfile({ avatarUrl: optimized });
    } catch {
      if (typeof dataUrlOrFile === 'string') updateProfile({ avatarUrl: dataUrlOrFile });
    }
  };

  useEffect(() => {
    if (!isAdminMode) return;
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) await saveAvatar(blob);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAdminMode]);

  const downloadQr = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = `QR_${profile.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const logo = profile.companyLogoUrl ? (
    <img src={profile.companyLogoUrl} alt={profile.company} className="h-6 w-auto max-w-[110px] object-contain" />
  ) : profile.company?.toLowerCase().includes('ammega') ? (
    <SmartBrandLogo brandId="ammega" className="h-6 w-auto" whiteBg={true} />
  ) : (
    <span className="text-[13px] font-semibold text-tinta">{profile.company}</span>
  );

  return (
    <div className="px-5 pt-6 pb-16 sm:pt-10">
      <div className="tarjeta-escena tarjeta-entrada">
        <div
          ref={cardRef}
          className={`tarjeta ${flipped ? 'volteada' : ''} ${tracking ? 'siguiendo' : ''}`}
          onClick={() => setFlipped((f) => !f)}
          onPointerMove={handleMove}
          onPointerLeave={resetTilt}
        >
          {/* FRENTE */}
          <div className="cara cara-frente text-white" aria-hidden={flipped}>
            <div className="absolute inset-0 p-[6%] flex flex-col">
              <div className="flex items-start justify-between">
                {isAdminMode ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLogoModalOpen(true);
                    }}
                    className="bg-white rounded-md py-1.5 px-2 flex items-center"
                    title="Cambiar logotipo"
                  >
                    {logo}
                  </button>
                ) : (
                  <div className="bg-white rounded-md py-1.5 px-2 flex items-center">{logo}</div>
                )}

                <div className="relative">
                  <div className="w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-[14px] overflow-hidden ring-2 ring-white/25 bg-stone-noche">
                    {!avatarFailed ? (
                      <img
                        src={avatarSrc}
                        alt=""
                        onError={() => setAvatarFailed(true)}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center ancho-expandido font-bold text-[20px] text-navajo">
                        {initials}
                      </div>
                    )}
                  </div>
                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAvatarModalOpen(true);
                      }}
                      className="absolute -bottom-2 -left-2 p-1.5 rounded-full bg-white text-stone shadow"
                      aria-label="Cambiar foto"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-auto">
                <p className="ancho-expandido font-bold text-[clamp(20px,6.2vw,27px)] leading-[1.05] tracking-[-0.01em]">
                  {profile.name}
                </p>
                <p className="mt-1.5 text-[15px] font-medium text-navajo">{profile.title}</p>
                <p className="mt-0.5 text-[13px] text-white/75 truncate">{profile.division || profile.company}</p>
              </div>
            </div>
            {/* Línea de guía de la banda, en el verde lima corporativo */}
            <div className="absolute left-0 right-0 bottom-0 h-[5px] bg-lima" />
          </div>

          {/* REVERSO */}
          <div className="cara cara-reverso" aria-hidden={!flipped}>
            <div className="absolute inset-0 p-[6%] flex items-center gap-[6%]">
              <div className="h-full aspect-square shrink-0">
                {qr ? (
                  <img src={qr} alt={`Código QR de la tarjeta de ${profile.name}`} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-niebla rounded-lg" />
                )}
              </div>
              <div className="min-w-0 flex flex-col h-full justify-center">
                <p className="ancho-expandido font-bold text-[17px] leading-tight text-stone">Escanea y guárdame</p>
                <p className="mt-1.5 text-[13px] leading-snug text-acero">
                  Apunta la cámara del celular al código para abrir esta tarjeta.
                </p>
                <button
                  type="button"
                  onClick={downloadQr}
                  className="mt-3 self-start inline-flex items-center gap-1.5 text-[13px] font-semibold text-stone hover:underline"
                  tabIndex={flipped ? 0 : -1}
                >
                  <Download className="w-4 h-4" /> Descargar QR
                </button>
              </div>
            </div>
            <div className="absolute left-0 right-0 bottom-0 h-[5px] bg-stone" />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="mt-5 mx-auto flex items-center gap-2 text-[14px] text-white/80 hover:text-white"
        aria-pressed={flipped}
      >
        <RotateCw className="w-4 h-4 text-lima" />
        {flipped ? 'Toca la tarjeta para volver al frente' : 'Toca la tarjeta para ver mi código QR'}
      </button>

      {isAdminMode && (
        <>
          <AvatarModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            currentAvatar={profile.avatarUrl || ''}
            initials={initials}
            onSaveAvatar={saveAvatar}
            onResetAvatar={() => {
              updateProfile({ avatarUrl: '' });
              setAvatarFailed(false);
            }}
          />
          <CompanyLogoModal
            isOpen={isLogoModalOpen}
            onClose={() => setIsLogoModalOpen(false)}
            currentLogoUrl={profile.companyLogoUrl}
            companyName={profile.company}
            onSaveLogo={(url: string) => updateProfile({ companyLogoUrl: url })}
            onResetLogo={() => updateProfile({ companyLogoUrl: '' })}
          />
        </>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Acciones rápidas                                                    */
/* ------------------------------------------------------------------ */

export const QuickActions: React.FC<{ onOpenShare: () => void }> = ({ onOpenShare }) => {
  const { profile } = useAppConfig();
  const [saved, setSaved] = useState(false);
  const firstName = profile.name.trim().split(' ')[0] || '';
  const email = profile.workEmail || profile.email;

  const handleSave = () => {
    downloadVCard(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tile =
    'h-[68px] flex flex-col items-center justify-center gap-1 rounded-xl border border-linea bg-white hover:border-stone text-[13px] font-semibold text-tinta transition-colors';

  return (
    <div className="px-5 sm:px-6">
      <button
        id="btn-guardar-contacto"
        type="button"
        onClick={handleSave}
        className="w-full h-[54px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-stone hover:bg-stone-hondo active:translate-y-px text-white text-[17px] font-semibold transition-colors"
      >
        {saved ? (
          <>
            <Check className="w-5 h-5 text-navajo" /> Contacto guardado
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" /> Guardar contacto
          </>
        )}
      </button>

      <div className="mt-2.5 grid grid-cols-4 gap-2">
        <a
          href={`https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(`Hola ${firstName}, te escribo desde tu tarjeta digital.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onPointerEnter={() => preconnectUrl('https://wa.me')}
          className={tile}
        >
          <WhatsAppIcon className="w-[22px] h-[22px] text-wa" />
          WhatsApp
        </a>
        <a href={`tel:${profile.phoneRaw}`} className={tile}>
          <Phone className="w-5 h-5 text-stone" />
          Llamar
        </a>
        <a href={`mailto:${email}`} className={tile}>
          <Mail className="w-5 h-5 text-stone" />
          Correo
        </a>
        <button type="button" onClick={onOpenShare} className={tile}>
          <Share2 className="w-5 h-5 text-stone" />
          Compartir
        </button>
      </div>
    </div>
  );
};

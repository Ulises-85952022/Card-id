import React, { useState, useEffect } from 'react';
import { UserPlus, QrCode, Share2, Phone, Camera, Check } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { SmartBrandLogo } from './logos/SmartBrandLogo';
import { downloadVCard } from '../utils/vcard';
import { AvatarModal } from './AvatarModal';
import { CompanyLogoModal } from './CompanyLogoModal';
import { compressImage } from '../utils/imageCompressor';
import { preconnectUrl } from '../utils/linkOptimizer';

interface ProfileHeroProps {
  onOpenQr: () => void;
  onOpenShare: () => void;
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.08c-.24.68-1.42 1.3-1.96 1.38-.5.07-1.13.1-1.83-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.66.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.31 1.42.29.14.46.12.62-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
  </svg>
);

export const ProfileHero: React.FC<ProfileHeroProps> = ({ onOpenQr, onOpenShare }) => {
  const { profile, updateProfile, isAdminMode } = useAppConfig();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const saveAvatar = async (dataUrlOrFile: string | File) => {
    try {
      const optimized = await compressImage(dataUrlOrFile, { maxWidth: 440, maxHeight: 440, quality: 0.85 });
      setAvatarFailed(false);
      updateProfile({ avatarUrl: optimized });
      showNotification('Foto guardada');
    } catch {
      if (typeof dataUrlOrFile === 'string') {
        updateProfile({ avatarUrl: dataUrlOrFile });
        showNotification('Foto guardada');
      }
    }
  };

  // Pegar una imagen con Ctrl+V solo cambia la foto en modo administrador
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

  const handleSaveContact = () => {
    downloadVCard(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const firstName = profile.name.trim().split(' ')[0] || '';
  const initials = profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
  const avatarSrc = profile.avatarUrl || '/avatar.png';
  const showPhoto = !avatarFailed;

  const waUrl = `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${firstName}, te escribo desde tu tarjeta digital.`
  )}`;

  const companyLine = [profile.company, profile.division].filter(Boolean).join(', ');

  const renderCompanyLogo = () => {
    if (profile.companyLogoUrl) {
      return <img src={profile.companyLogoUrl} alt={profile.company} className="h-5 w-auto max-w-[120px] object-contain" />;
    }
    if (profile.company?.toLowerCase().includes('ammega')) {
      return <SmartBrandLogo brandId="ammega" className="h-5 w-auto" whiteBg={true} />;
    }
    return <span className="text-sm font-semibold text-tinta">{profile.company}</span>;
  };

  return (
    <div>
      {/* Franja de banda modular con el logotipo */}
      <div className="banda-modular relative h-[104px]">
        <div className="absolute top-4 right-4">
          {isAdminMode ? (
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="bg-white rounded-md py-1.5 px-2.5 flex items-center"
              title="Cambiar logotipo"
            >
              {renderCompanyLogo()}
            </button>
          ) : (
            <div className="bg-white rounded-md py-1.5 px-2.5 flex items-center">{renderCompanyLogo()}</div>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-6">
        {/* Foto: se monta sobre el borde de la franja */}
        <div className="relative -mt-11 mb-4 w-[88px] h-[88px]">
          <div className="w-full h-full rounded-xl overflow-hidden bg-tinta ring-4 ring-white">
            {showPhoto ? (
              <img
                src={avatarSrc}
                alt={profile.name}
                onError={() => setAvatarFailed(true)}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-cond font-bold text-[30px] tracking-wide"
                aria-label={profile.name}
              >
                {initials}
              </div>
            )}
          </div>
          {isAdminMode && (
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-white border border-linea text-acero shadow"
              aria-label="Cambiar foto"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {toast && (
          <p role="status" className="mb-3 text-sm text-wa flex items-center gap-1.5">
            <Check className="w-4 h-4" /> {toast}
          </p>
        )}

        <h1 className="font-cond font-bold text-[32px] leading-[1.05] tracking-[-0.01em] text-tinta">
          {profile.name}
        </h1>
        <p className="mt-1.5 text-[17px] font-medium text-tinta">{profile.title}</p>
        <p className="mt-0.5 text-[15px] text-acero">{companyLine}</p>

        {/* Acción dominante */}
        <button
          id="btn-guardar-contacto"
          type="button"
          onClick={handleSaveContact}
          className="mt-6 w-full h-[52px] inline-flex items-center justify-center gap-2.5 rounded-lg bg-banda hover:bg-banda-oscuro active:translate-y-px text-white text-[17px] font-semibold transition-colors"
        >
          {savedSuccess ? (
            <>
              <Check className="w-5 h-5" /> Contacto guardado
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" /> Guardar contacto
            </>
          )}
        </button>

        {/* Acciones secundarias */}
        <div className="mt-2.5 grid grid-cols-[1fr_1fr_48px_48px] gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={() => preconnectUrl('https://wa.me')}
            className="h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-linea bg-white hover:border-wa text-wa text-[16px] font-semibold transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" /> WhatsApp
          </a>
          <a
            href={`tel:${profile.phoneRaw}`}
            className="h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-linea bg-white hover:border-tinta text-tinta text-[16px] font-semibold transition-colors"
          >
            <Phone className="w-[18px] h-[18px]" /> Llamar
          </a>
          <button
            id="btn-open-qr"
            type="button"
            onClick={onOpenQr}
            className="h-12 inline-flex items-center justify-center rounded-lg border border-linea bg-white hover:border-tinta text-tinta transition-colors"
            aria-label="Mostrar código QR"
            title="Código QR"
          >
            <QrCode className="w-5 h-5" />
          </button>
          <button
            id="btn-open-share"
            type="button"
            onClick={onOpenShare}
            className="h-12 inline-flex items-center justify-center rounded-lg border border-linea bg-white hover:border-tinta text-tinta transition-colors"
            aria-label="Compartir tarjeta"
            title="Compartir"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isAdminMode && (
        <>
          <AvatarModal
            isOpen={isAvatarModalOpen}
            onClose={() => setIsAvatarModalOpen(false)}
            currentAvatar={profile.avatarUrl || (avatarFailed ? "" : avatarSrc)}
            initials={initials}
            onSaveAvatar={saveAvatar}
            onResetAvatar={() => {
              updateProfile({ avatarUrl: '' });
              setAvatarFailed(false);
              showNotification('Foto restablecida');
            }}
          />
          <CompanyLogoModal
            isOpen={isLogoModalOpen}
            onClose={() => setIsLogoModalOpen(false)}
            currentLogoUrl={profile.companyLogoUrl}
            companyName={profile.company}
            onSaveLogo={(url: string) => {
              updateProfile({ companyLogoUrl: url });
              showNotification('Logotipo actualizado');
            }}
            onResetLogo={() => {
              updateProfile({ companyLogoUrl: '' });
              showNotification('Logotipo restablecido');
            }}
          />
        </>
      )}
    </div>
  );
};

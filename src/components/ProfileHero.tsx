import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Globe,
  UserPlus,
  QrCode,
  Share2,
  Phone,
  Camera,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { SmartBrandLogo } from './logos/SmartBrandLogo';
import { downloadVCard } from '../utils/vcard';
import { AvailabilityStatus } from '../types';
import { AvatarModal } from './AvatarModal';

interface ProfileHeroProps {
  onOpenQr: () => void;
  onOpenShare: () => void;
  onQuickWhatsApp: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  onOpenQr,
  onOpenShare,
  onQuickWhatsApp,
}) => {
  const { profile, updateProfile } = useAppConfig();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [status, setStatus] = useState<AvailabilityStatus>(profile.status || 'disponible');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);
  const [avatarToast, setAvatarToast] = useState<string | null>(null);

  // Initialize with persisted avatar if available or local public file
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ammega_user_avatar');
    }
    return null;
  });

  // Candidates for avatar: checks local files (/avatar.png, etc.) then fallback
  const avatarCandidates = [
    '/avatar.png',
    '/avatar.jpg',
    '/ulises.png',
    './avatar.png',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  ];
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Clipboard paste support: if user copies image and presses Ctrl+V, set as avatar
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                const dataUrl = event.target.result as string;
                saveAvatar(dataUrl);
                showNotification('Foto pegada desde portapapeles');
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const showNotification = (msg: string) => {
    setAvatarToast(msg);
    setTimeout(() => setAvatarToast(null), 3500);
  };

  const saveAvatar = (dataUrl: string) => {
    setCustomAvatarUrl(dataUrl);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ammega_user_avatar', dataUrl);
      } catch {
        // quota handled safely
      }
    }
    showNotification('Foto de perfil actualizada con éxito');
  };

  const resetAvatar = () => {
    setCustomAvatarUrl(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ammega_user_avatar');
    }
    showNotification('Foto restablecida');
  };

  const handleSaveContact = () => {
    downloadVCard(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAvatarFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsAvatarDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          saveAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentAvatar = customAvatarUrl || avatarCandidates[avatarIndex];

  return (
    <div className="flex flex-col">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between mb-5">
        {/* Left: Brand Capsule */}
        <div className="bg-white py-2 px-4 rounded-full shadow-lg shadow-black/40 flex items-center justify-center border border-white/30 hover:scale-[1.02] transition-transform">
          <SmartBrandLogo brandId="ammega" className="h-6 sm:h-7 w-auto" whiteBg={true} />
        </div>

        {/* Right: Status Badge with pulse dot & toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 text-[11px] font-bold py-1.5 px-3 rounded-full uppercase tracking-wider transition-all select-none"
            title="Cambiar estado de disponibilidad"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              {status === 'disponible'
                ? 'Disponible'
                : status === 'en-reunion'
                ? 'En Reunión'
                : 'En Campo'}
            </span>
          </button>

          {/* Quick status dropdown */}
          {showStatusMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-[#0e222c] border border-cyan-500/30 shadow-2xl p-1.5 z-30 text-xs text-left">
              <button
                onClick={() => {
                  setStatus('disponible');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/10 text-emerald-300 font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Disponible
              </button>
              <button
                onClick={() => {
                  setStatus('en-reunion');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/10 text-amber-300 font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                En Reunión
              </button>
              <button
                onClick={() => {
                  setStatus('en-campo');
                  setShowStatusMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-white/10 text-cyan-300 font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                En Campo / Planta
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Hero Section */}
      <section className="flex flex-col items-center text-center mb-5">
        {/* Avatar Wrapper matching Image 1.png */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsAvatarDragOver(true);
          }}
          onDragLeave={() => setIsAvatarDragOver(false)}
          onDrop={handleAvatarFileDrop}
          className="relative group mb-3.5"
        >
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className={`w-[110px] h-[110px] rounded-[26px] p-0.5 bg-gradient-to-tr from-cyan-400 via-teal-500 to-cyan-300 shadow-[0_10px_25px_rgba(0,168,181,0.35)] overflow-hidden transition-all duration-200 group-hover:scale-[1.03] cursor-pointer ${
              isAvatarDragOver ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#07151b]' : ''
            }`}
            title="Haz clic o arrastra tu foto aquí para cambiarla"
          >
            <img
              src={currentAvatar}
              alt={profile.name}
              onError={() => {
                if (!customAvatarUrl && avatarIndex < avatarCandidates.length - 1) {
                  setAvatarIndex((prev) => prev + 1);
                }
              }}
              className={`w-full h-full object-cover object-top rounded-[24px] bg-[#0f1d24] ${
                !customAvatarUrl && avatarIndex === avatarCandidates.length - 1
                  ? 'grayscale contrast-125 brightness-95'
                  : ''
              }`}
            />
          </div>

          {/* Edit photo button */}
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#0a1820] border border-cyan-400/70 text-cyan-300 hover:text-white shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95"
            title="Cambiar foto de perfil (subir, arrastrar o pegar)"
            aria-label="Cambiar foto de perfil"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subtle customize photo prompt */}
        {!customAvatarUrl && (
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="mb-2 text-[11px] text-cyan-400/80 hover:text-cyan-300 font-medium inline-flex items-center gap-1 hover:underline transition-colors"
          >
            <Camera className="w-3 h-3" />
            <span>Haz clic para poner tu foto</span>
          </button>
        )}

        {/* Quick toast notification */}
        {avatarToast && (
          <div className="mb-2 py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
            <Check className="w-3 h-3 text-emerald-400" />
            {avatarToast}
          </div>
        )}

        {/* User Name */}
        <h1 className="text-xl sm:text-2xl font-bold text-white font-['Space_Grotesk'] tracking-tight mb-1.5">
          {profile.name}
        </h1>

        {/* User Role Badge */}
        <div className="inline-flex items-center gap-1.5 bg-cyan-500/15 border border-cyan-500/35 text-cyan-200 text-xs font-bold py-1 px-3.5 rounded-full mb-2 tracking-wide shadow-sm">
          <Briefcase className="w-3.5 h-3.5 text-cyan-300" />
          <span>{profile.title}</span>
        </div>

        {/* User Company Subtext */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <Globe className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
          <span className="truncate">
            {profile.company} · {profile.division}
          </span>
        </div>
      </section>

      {/* Quick Action Grid (3 items: WhatsApp, Llamar, Portal) matching Image 1.png */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={onQuickWhatsApp}
          className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/[0.04] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/35 transition-all active:scale-[0.97]"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.953 1.179-.176.2-.351.226-.652.075-.3-.15-1.267-.467-2.414-1.488-.893-.796-1.496-1.778-1.671-2.079-.176-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.234-.244-.588-.493-.508-.677-.518l-.577-.01c-.2 0-.526.075-.802.376s-1.054 1.029-1.054 2.509c0 1.48 1.079 2.909 1.23 3.11 0.15.2 2.122 3.24 5.14 4.543.718.31 1.279.495 1.716.634.722.23 1.378.197 1.898.119.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.201-.577-.351z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-emerald-300">
            WhatsApp
          </span>
        </button>

        {/* Llamar */}
        <a
          href={`tel:${profile.phoneRaw}`}
          className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/[0.04] hover:bg-cyan-500/15 border border-white/[0.08] hover:border-cyan-500/35 transition-all active:scale-[0.97]"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Phone className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-cyan-300">
            Llamar
          </span>
        </a>

        {/* Portal */}
        <a
          href={profile.brandsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/[0.04] hover:bg-teal-500/15 border border-white/[0.08] hover:border-teal-500/35 transition-all active:scale-[0.97]"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Globe className="w-4.5 h-4.5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-teal-300">
            Portal
          </span>
        </a>
      </div>

      {/* Save Contact & Quick Share Row matching Image 1.png */}
      <div className="flex items-center gap-2 mb-4">
        {/* Main CTA: Guardar en Contactos */}
        <button
          id="btn-guardar-contacto"
          type="button"
          onClick={handleSaveContact}
          className="flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#005762] via-[#008794] to-[#06b6d4] hover:brightness-110 text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,87,98,0.45)] active:scale-[0.98] transition-all"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>¡Contacto Guardado!</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Guardar en Contactos</span>
            </>
          )}
        </button>

        {/* QR Button */}
        <button
          id="btn-open-qr"
          type="button"
          onClick={onOpenQr}
          title="Ver código QR"
          className="w-12 h-12 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-[0.95] flex-shrink-0"
        >
          <QrCode className="w-5 h-5" />
        </button>

        {/* Share Button */}
        <button
          id="btn-open-share"
          type="button"
          onClick={onOpenShare}
          title="Compartir tarjeta"
          className="w-12 h-12 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-[0.95] flex-shrink-0"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Avatar Management Modal */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentAvatar}
        onSaveAvatar={saveAvatar}
        onResetAvatar={resetAvatar}
      />
    </div>
  );
};

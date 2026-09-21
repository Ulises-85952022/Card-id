import React, { useState } from 'react';
import { ActiveTab } from './types';
import { ConfigProvider, useAppConfig } from './context/ConfigContext';
import { ProfileHero } from './components/ProfileHero';
import { TabsNav } from './components/TabsNav';
import { ContactTab } from './components/ContactTab';
import { BrandsTab } from './components/BrandsTab';
import { GroupTab } from './components/GroupTab';
import { QrModal } from './components/QrModal';
import { ShareModal } from './components/ShareModal';
import { QuoteModal } from './components/QuoteModal';
import { AdminModal } from './components/AdminModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AmmegaLogo } from './components/logos/AmmegaLogo';
import { Smartphone, Monitor, Sparkles, SlidersHorizontal, Settings } from 'lucide-react';

function AppContent() {
  const {
    profile,
    isAdminOpen,
    setIsAdminOpen,
    adminInitialBrandId,
    openAdminWithBrand,
    isAdminMode,
    setIsAdminMode,
    toggleAdminMode,
  } = useAppConfig();
  const [activeTab, setActiveTab] = useState<ActiveTab>('contacto');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteBrandId, setQuoteBrandId] = useState<string | undefined>(undefined);
  const [deviceMode, setDeviceMode] = useState<'phone' | 'wide'>('phone');
  const [secretClickCount, setSecretClickCount] = useState(0);

  const handleSecretClick = () => {
    setSecretClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        toggleAdminMode();
        return 0;
      }
      return next;
    });
    setTimeout(() => setSecretClickCount(0), 1200);
  };

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://ammega.com/brands/';

  const handleOpenQuote = (brandId?: string) => {
    setQuoteBrandId(brandId);
    setIsQuoteOpen(true);
  };

  const handleQuickWhatsApp = () => {
    const waUrl = `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(
      `Hola ${profile.name.split(' ')[0] || 'Ulises'}, me comunico desde tu tarjeta digital AMMEGA para solicitar información técnica.`
    )}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#07151b] text-slate-100 flex flex-col justify-center items-center py-6 px-3 sm:px-6 relative overflow-x-hidden font-['Inter',sans-serif]">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-900/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-teal-900/15 rounded-full blur-[100px]" />
      </div>

      {/* Top utility bar */}
      <header className="relative z-10 w-full max-w-[430px] flex items-center justify-between px-2 mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="bg-white/95 px-2.5 py-1 rounded-full shadow-sm flex items-center justify-center border border-white/40">
            <AmmegaLogo className="h-3.5 w-auto" whiteBg={true} />
          </div>
          <span className="flex items-center gap-1 text-cyan-400 font-semibold tracking-wide text-xs">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            Digital ID
          </span>
        </div>

        {/* View toggle & Admin button (Admin only visible when ?admin=1) */}
        <div className="flex items-center gap-1.5">
          {/* Admin Menu Trigger Button - Only shown when ?admin=1 */}
          {isAdminMode && (
            <button
              type="button"
              onClick={() => openAdminWithBrand(undefined)}
              className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-100 border border-cyan-500/40 transition-all text-[11px] font-semibold shadow-sm active:scale-95 animate-in fade-in"
              title="Panel de Administrador: Configurar marcas, subcategorías y datos"
            >
              <SlidersHorizontal className="w-3 h-3 text-cyan-300" />
              <span>Admin</span>
            </button>
          )}

          {/* View toggle (mobile card frame or expanded) */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => setDeviceMode('phone')}
              className={`p-1 px-2.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-colors ${
                deviceMode === 'phone'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista Móvil"
            >
              <Smartphone className="w-3 h-3" />
              <span>Móvil</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('wide')}
              className={`p-1 px-2.5 rounded-full text-[11px] font-medium flex items-center gap-1 transition-colors ${
                deviceMode === 'wide'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Vista Amplia"
            >
              <Monitor className="w-3 h-3" />
              <span>Amplia</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Card Shell matching Image 1.png exactly */}
      <main
        id="digital-card-container"
        className={`relative z-10 w-full ${
          deviceMode === 'phone' ? 'max-w-[430px]' : 'max-w-[560px]'
        } bg-[#0f1d24]/90 backdrop-blur-2xl border border-[rgba(0,168,181,0.22)] rounded-[28px] p-5 sm:p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(0,168,181,0.2)] transition-all duration-300`}
      >
        {/* Profile Hero section (Header, Avatar, Name, Role, Actions, Save Contact) */}
        <ProfileHero
          onOpenQr={() => setIsQrOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          onQuickWhatsApp={handleQuickWhatsApp}
        />

        {/* Tab Navigation */}
        <TabsNav activeTab={activeTab} onChangeTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'contacto' && <ContactTab />}
        {activeTab === 'marcas' && <BrandsTab onOpenQuote={handleOpenQuote} />}
        {activeTab === 'grupo' && <GroupTab onOpenQuote={handleOpenQuote} />}

        {/* Footer with copyright & conditional admin controls */}
        <footer className="mt-5 pt-3 border-t border-white/[0.06] text-center space-y-2">
          {isAdminMode && (
            <div className="flex items-center justify-center gap-2 animate-in fade-in">
              <button
                type="button"
                onClick={() => openAdminWithBrand(undefined)}
                className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium hover:underline cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Panel de Configuración (Modo Admin)</span>
              </button>
              <span className="text-slate-600 text-xs">·</span>
              <button
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="text-[10px] text-slate-400 hover:text-red-300 transition-colors underline"
                title="Ocultar modo administrador y volver a vista pública"
              >
                Salir de Admin
              </button>
            </div>
          )}
          <p
            onClick={handleSecretClick}
            className="text-[10px] text-slate-500 font-medium select-none cursor-default"
            title={isAdminMode ? 'Modo Administrador Activo' : undefined}
          >
            AMMEGA Group © {new Date().getFullYear()} · Ammeraal Beltech · Megadyne · Jason Hose Solutions
          </p>
        </footer>
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Modals */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={currentUrl}
        name={profile.name}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={currentUrl}
        name={profile.name}
        role={profile.title}
        company={profile.company}
      />

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => {
          setIsQuoteOpen(false);
          setQuoteBrandId(undefined);
        }}
        initialBrandId={quoteBrandId}
      />

      {/* Admin Configuration Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        initialBrandId={adminInitialBrandId}
      />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

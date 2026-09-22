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
import { CardParticles } from './components/CardParticles';
import { Settings } from 'lucide-react';

function AppContent() {
  const {
    currentCard,
    profile,
    isLoading,
    isAdminOpen,
    setIsAdminOpen,
    adminInitialBrandId,
    openAdminWithBrand,
    isAdminMode,
    setIsAdminMode,
  } = useAppConfig();
  const [activeTab, setActiveTab] = useState<ActiveTab>('contacto');
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteBrandId, setQuoteBrandId] = useState<string | undefined>(undefined);

  // Generate clean public card URL without ?admin parameter for clients & QR codes
  const publicClientUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?card=${currentCard.slug}`
      : 'https://ammega.com/brands/';

  const handleOpenQuote = (brandId?: string) => {
    setQuoteBrandId(brandId);
    setIsQuoteOpen(true);
  };

  const handleQuickWhatsApp = () => {
    const waUrl = `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(
      `Hola ${profile.name.split(' ')[0] || ''}, me comunico desde tu tarjeta digital ${profile.company ? `de ${profile.company}` : ''} para solicitar información.`
    )}`;
    window.open(waUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07151b] text-slate-100 flex flex-col justify-center items-center p-6">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-xs font-semibold text-cyan-400">Cargando tarjeta digital...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07151b] text-slate-100 flex flex-col justify-center items-center py-6 px-3 sm:px-6 relative overflow-x-hidden font-['Inter',sans-serif]">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-900/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-teal-900/15 rounded-full blur-[100px]" />
      </div>

      {/* Main Card Shell */}
      <main
        id="digital-card-container"
        className="relative z-10 w-full max-w-[440px] bg-[#0f1d24]/90 backdrop-blur-2xl border border-[rgba(0,168,181,0.22)] rounded-[28px] p-5 sm:p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(0,168,181,0.2)] transition-all duration-300 overflow-hidden"
      >
        {/* Subtle Ambient Particle Animation */}
        <CardParticles />

        {/* Foreground Content Shell */}
        <div className="relative z-10">
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
          {(activeTab === 'proyectos' || activeTab === 'marcas') && (
            <BrandsTab onOpenQuote={handleOpenQuote} />
          )}
          {(activeTab === 'web' || activeTab === 'grupo') && (
            <GroupTab
              onOpenQuote={handleOpenQuote}
              onOpenAdmin={() => openAdminWithBrand(undefined)}
            />
          )}
        </div>
      </main>

      {/* Floating WhatsApp Action Button */}
      <FloatingWhatsApp />

      {/* Floating Admin Button - Only shown when in Admin Mode (?admin=1) */}
      {isAdminMode && (
        <aside className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#0c1b22]/95 border border-cyan-500/40 p-1.5 px-3 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in">
          <button
            type="button"
            onClick={() => openAdminWithBrand(undefined)}
            className="flex items-center gap-1.5 text-xs text-cyan-300 font-semibold hover:text-white"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin</span>
          </button>
          <span className="text-slate-600 text-xs">·</span>
          <button
            type="button"
            onClick={() => setIsAdminMode(false)}
            className="text-[10px] text-slate-400 hover:text-rose-300 underline"
            title="Ocultar modo administrador"
          >
            Salir
          </button>
        </aside>
      )}

      {/* Modals */}
      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        url={publicClientUrl}
        name={profile.name}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={publicClientUrl}
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

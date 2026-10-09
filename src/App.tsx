import React, { useState } from 'react';
import { ArrowUpRight, Settings } from 'lucide-react';
import { ConfigProvider, useAppConfig } from './context/ConfigContext';
import { WalletCard, QuickActions } from './components/ProfileHero';
import { ContactTab } from './components/ContactTab';
import { BrandsTab } from './components/BrandsTab';
import { ShareModal } from './components/ShareModal';
import { AdminModal } from './components/AdminModal';

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
  const [isShareOpen, setIsShareOpen] = useState(false);

  const publicClientUrl =
    typeof window !== 'undefined' && window.location.protocol.startsWith('http') && !window.location.hostname.includes('claude')
      ? `${window.location.origin}${window.location.pathname}?card=${currentCard.slug}`
      : `https://cardwebid.vercel.app/?card=${currentCard.slug}`;

  const websiteUrl = profile.companyWebsite || profile.corporateUrl || profile.brandsUrl || '';
  const websiteHost = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (isLoading) {
    return (
      <div className="cartera min-h-screen flex items-center justify-center text-white/80 text-[15px]" role="status">
        Cargando tarjeta…
      </div>
    );
  }

  return (
    <div className="cartera min-h-screen">
      <div className="mx-auto w-full max-w-[460px]">
        <WalletCard publicUrl={publicClientUrl} />

        {/* Hoja blanca que sube sobre la cartera */}
        <main
          id="digital-card-container"
          className="relative -mt-8 bg-white rounded-t-[28px] sm:rounded-[28px] sm:mb-10 pt-7 shadow-[0_-12px_40px_-16px_rgba(0,0,0,0.45)]"
          style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
        >
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-linea sm:hidden" aria-hidden="true" />

          <QuickActions onOpenShare={() => setIsShareOpen(true)} />

          <div className="mt-10 space-y-10">
            <ContactTab />
            <BrandsTab />
          </div>

          {websiteUrl && (
            <footer className="mt-10 mx-5 sm:mx-6 pt-6 border-t border-linea">
              <p className="text-[14px] leading-relaxed text-acero max-w-[60ch]">{profile.companyDescription || profile.bio}</p>
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[15px] font-semibold text-stone hover:underline underline-offset-2"
              >
                {websiteHost} <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </footer>
          )}
        </main>
      </div>

      {isAdminMode && (
        <aside className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-stone-noche text-white py-2 px-4 rounded-full shadow-lg text-[14px]">
          <button type="button" onClick={() => openAdminWithBrand(undefined)} className="inline-flex items-center gap-1.5 font-semibold">
            <Settings className="w-4 h-4" /> Admin
          </button>
          <button type="button" onClick={() => setIsAdminMode(false)} className="text-white/70 hover:text-white underline">
            Salir
          </button>
        </aside>
      )}

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={publicClientUrl}
        name={profile.name}
        role={profile.title}
        company={profile.company}
      />
      {isAdminMode && (
        <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} initialBrandId={adminInitialBrandId} />
      )}
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

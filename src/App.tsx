import React, { useState } from 'react';
import { ExternalLink, Settings } from 'lucide-react';
import { ConfigProvider, useAppConfig } from './context/ConfigContext';
import { ProfileHero } from './components/ProfileHero';
import { ContactTab } from './components/ContactTab';
import { BrandsTab } from './components/BrandsTab';
import { QrModal } from './components/QrModal';
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
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const publicClientUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?card=${currentCard.slug}`
      : 'https://cardwebid.vercel.app/';

  const websiteUrl = profile.companyWebsite || profile.corporateUrl || profile.brandsUrl || '';
  const websiteHost = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-acero text-[15px]" role="status">
        Cargando tarjeta…
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:py-10 sm:px-6 flex justify-center">
      <main
        id="digital-card-container"
        className="w-full max-w-[440px] bg-white sm:rounded-2xl sm:shadow-[0_1px_2px_rgba(23,32,38,0.06),0_12px_32px_-12px_rgba(23,32,38,0.18)] overflow-hidden pb-8"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <ProfileHero onOpenQr={() => setIsQrOpen(true)} onOpenShare={() => setIsShareOpen(true)} />

        <div className="mt-9 space-y-9">
          <ContactTab />
          <BrandsTab />
        </div>

        {websiteUrl && (
          <footer className="mt-9 px-5 sm:px-6">
            <p className="text-[14px] leading-relaxed text-acero max-w-[60ch]">
              {profile.companyDescription || profile.bio}
            </p>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-semibold text-banda hover:underline underline-offset-2"
            >
              {websiteHost} <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </footer>
        )}
      </main>

      {isAdminMode && (
        <aside className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-tinta text-white py-2 px-4 rounded-full shadow-lg text-[14px]">
          <button type="button" onClick={() => openAdminWithBrand(undefined)} className="inline-flex items-center gap-1.5 font-semibold">
            <Settings className="w-4 h-4" /> Admin
          </button>
          <button type="button" onClick={() => setIsAdminMode(false)} className="text-white/70 hover:text-white underline">
            Salir
          </button>
        </aside>
      )}

      <QrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={publicClientUrl} name={profile.name} />
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

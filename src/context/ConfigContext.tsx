import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppConfig, BrandInfo, BrandSubcategory, UserProfile, DigitalCard } from '../types';
import { USER_PROFILE, BRANDS } from '../data';
import {
  getAllCards,
  getCardBySlug,
  saveCardToCloud,
  deleteCardFromCloud,
  getDefaultAdminCard,
  slugify,
} from '../lib/cardsService';
import { testFirestoreConnection } from '../lib/firebase';

interface ConfigContextType {
  // Current active card data
  currentCard: DigitalCard;
  profile: UserProfile;
  brands: BrandInfo[];
  activeSlug: string;
  isLoading: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'saved' | 'error';
  lastCloudSavedAt: string | null;

  // Updating active card
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateBrand: (brandId: string, partial: Partial<BrandInfo>) => void;
  addSubcategory: (brandId: string, subcategory: Omit<BrandSubcategory, 'id'>) => void;
  updateSubcategory: (brandId: string, subcategoryId: string, partial: Partial<BrandSubcategory>) => void;
  deleteSubcategory: (brandId: string, subcategoryId: string) => void;
  saveCurrentCard: () => Promise<{ success: boolean; error?: string }>;

  // Multi-card platform management (for Admin)
  cardsList: DigitalCard[];
  refreshCardsList: () => Promise<void>;
  switchActiveCard: (slugOrId: string) => Promise<void>;
  createCard: (cardData: {
    slug: string;
    name: string;
    title: string;
    division?: string;
    email: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; card?: DigitalCard; error?: string }>;
  removeCard: (cardId: string) => Promise<{ success: boolean; error?: string }>;

  // Admin UI controls
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  openAdminWithBrand: (brandId?: string) => void;
  adminInitialBrandId?: string;
  isAdminMode: boolean;
  setIsAdminMode: (enabled: boolean) => void;
  toggleAdminMode: () => void;

  // Reset & Helpers
  resetToDefaults: () => void;
  exportJson: () => string;
  importJson: (jsonText: string) => { success: boolean; error?: string };
}

const STORAGE_KEY_PREFIX = 'ammega_card_local_';
const ADMIN_SESSION_KEY = 'ammega_admin_authenticated';

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Helper to get slug from URL
function getSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('card') || params.get('c') || params.get('id') || null;
}

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Test connection on mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Admin mode detection (?admin=1 or sessionStorage)
  const [isAdminMode, setIsAdminModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const adminParam = params.get('admin');
        if (adminParam === '1' || adminParam === 'true') {
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          return true;
        }
        if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
          return true;
        }
      } catch (e) {
        // ignore
      }
    }
    return false;
  });

  const setIsAdminMode = (enabled: boolean) => {
    setIsAdminModeState(enabled);
    if (typeof window !== 'undefined') {
      try {
        if (enabled) {
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        } else {
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
          const url = new URL(window.location.href);
          url.searchParams.delete('admin');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };

  // Instant Cache Reader: ensures 0-second load time when opening any link
  const getInitialCard = (): { card: DigitalCard; isLoaded: boolean } => {
    if (typeof window === 'undefined') {
      return { card: getDefaultAdminCard(), isLoaded: false };
    }
    const targetSlug = getSlugFromUrl() || 'ulises-hernandez';
    try {
      const local = localStorage.getItem(STORAGE_KEY_PREFIX + targetSlug);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && parsed.profile) {
          const standaloneAvatar = localStorage.getItem('ammega_user_avatar');
          if (standaloneAvatar && !parsed.profile.avatarUrl) {
            parsed.profile.avatarUrl = standaloneAvatar;
          }
          return { card: parsed, isLoaded: true };
        }
      }
    } catch (e) {
      // ignore
    }

    // Default primary admin is pre-compiled for instant display
    if (targetSlug === 'ulises-hernandez' || !targetSlug) {
      const defaultAdmin = getDefaultAdminCard();
      try {
        const standaloneAvatar = localStorage.getItem('ammega_user_avatar');
        if (standaloneAvatar) {
          defaultAdmin.profile.avatarUrl = standaloneAvatar;
        }
      } catch (e) {}
      return { card: defaultAdmin, isLoaded: true };
    }

    return { card: getDefaultAdminCard(), isLoaded: false };
  };

  // State: instantly initialized so user never sees an unnecessary loading screen
  const [initialCache] = useState(getInitialCard);
  const [currentCard, setCurrentCard] = useState<DigitalCard>(initialCache.card);
  const [cardsList, setCardsList] = useState<DigitalCard[]>([initialCache.card]);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCache.isLoaded);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [lastCloudSavedAt, setLastCloudSavedAt] = useState<string | null>(null);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialBrandId, setAdminInitialBrandId] = useState<string | undefined>(undefined);

  // Load active card based on URL slug or default
  const loadActiveCard = useCallback(async (slugToLoad?: string) => {
    const targetSlug = slugToLoad || getSlugFromUrl() || 'ulises-hernandez';

    // Synchronously check local storage so we never block UI with a spinner
    let hasLocal = false;
    try {
      const local = localStorage.getItem(STORAGE_KEY_PREFIX + targetSlug);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && parsed.profile) {
          setCurrentCard(parsed);
          hasLocal = true;
        }
      }
    } catch {}

    if (targetSlug === 'ulises-hernandez') {
      hasLocal = true;
    }

    if (!hasLocal) {
      setIsLoading(true);
    }

    try {
      // Fetch from Firestore in background (accelerated by memory cache & timeout)
      const cardFromCloud = await getCardBySlug(targetSlug);
      if (cardFromCloud) {
        let finalCard = cardFromCloud;

        // Check if local backup had a saved avatar not yet synced to cloud
        try {
          const localBackup = localStorage.getItem(STORAGE_KEY_PREFIX + targetSlug);
          if (localBackup) {
            const parsed = JSON.parse(localBackup);
            if (parsed.profile?.avatarUrl && !cardFromCloud.profile?.avatarUrl) {
              finalCard = {
                ...cardFromCloud,
                profile: { ...cardFromCloud.profile, avatarUrl: parsed.profile.avatarUrl },
              };
              saveCardToCloud(finalCard).catch(() => {});
            }
          }

          // Check standalone avatar cache
          const standaloneAvatar = localStorage.getItem('ammega_user_avatar');
          if (standaloneAvatar && !finalCard.profile.avatarUrl) {
            finalCard = {
              ...finalCard,
              profile: { ...finalCard.profile, avatarUrl: standaloneAvatar },
            };
            saveCardToCloud(finalCard).catch(() => {});
          }
        } catch (e) {
          // ignore parsing error
        }

        setCurrentCard(finalCard);

        // Keep local backups in sync
        try {
          localStorage.setItem(STORAGE_KEY_PREFIX + finalCard.slug, JSON.stringify(finalCard));
          if (finalCard.profile.avatarUrl) {
            localStorage.setItem('ammega_user_avatar', finalCard.profile.avatarUrl);
          }
        } catch (e) {
          // ignore
        }
      } else {
        // Check local storage backup
        const local = localStorage.getItem(STORAGE_KEY_PREFIX + targetSlug);
        if (local) {
          try {
            const parsedCard = JSON.parse(local);
            setCurrentCard(parsedCard);
            // Sync local card to cloud
            saveCardToCloud(parsedCard).catch(() => {});
          } catch (e) {
            setCurrentCard(getDefaultAdminCard());
          }
        } else {
          // If neither exists, load default admin
          const defaultAdmin = getDefaultAdminCard();
          // Check if standalone avatar exists to restore
          try {
            const standaloneAvatar = localStorage.getItem('ammega_user_avatar');
            if (standaloneAvatar) {
              defaultAdmin.profile.avatarUrl = standaloneAvatar;
            }
          } catch (e) {}

          setCurrentCard(defaultAdmin);
          // Seed cloud with default admin card if target was admin
          if (targetSlug === 'ulises-hernandez') {
            await saveCardToCloud(defaultAdmin);
          }
        }
      }
    } catch (err) {
      console.warn('Error in loadActiveCard:', err);
      // Fallback to local storage if network failed
      try {
        const local = localStorage.getItem(STORAGE_KEY_PREFIX + targetSlug);
        if (local) {
          setCurrentCard(JSON.parse(local));
        } else {
          setCurrentCard(getDefaultAdminCard());
        }
      } catch {
        setCurrentCard(getDefaultAdminCard());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all cards for admin directory
  const refreshCardsList = useCallback(async () => {
    try {
      const all = await getAllCards();
      setCardsList(all);
    } catch (e) {
      console.error('Failed to load cards list:', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadActiveCard();
    refreshCardsList();
  }, [loadActiveCard, refreshCardsList]);

  // Derived profile and brands for backward compatibility with existing components
  const profile = currentCard.profile;
  const brands = currentCard.brands;

  // Update current profile in state, localStorage and auto-sync to Firestore
  const updateProfile = (partial: Partial<UserProfile>) => {
    setCurrentCard((prev) => {
      const updated: DigitalCard = {
        ...prev,
        profile: { ...prev.profile, ...partial },
        updatedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + updated.slug, JSON.stringify(updated));
        if (partial.avatarUrl !== undefined) {
          if (partial.avatarUrl) {
            localStorage.setItem('ammega_user_avatar', partial.avatarUrl);
          } else {
            localStorage.removeItem('ammega_user_avatar');
          }
        }
      } catch (e) {
        console.warn('LocalStorage quota warning:', e);
      }

      // Auto-sync in background to Firestore cloud
      saveCardToCloud(updated).catch((err) => {
        console.warn('Auto-save card to Firestore warning:', err);
      });

      return updated;
    });
  };

  // Update brand in state, localStorage and auto-sync
  const updateBrand = (brandId: string, partial: Partial<BrandInfo>) => {
    setCurrentCard((prev) => {
      const updated: DigitalCard = {
        ...prev,
        brands: prev.brands.map((b) => (b.id === brandId ? { ...b, ...partial } : b)),
        updatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + updated.slug, JSON.stringify(updated));
      } catch (e) {}
      saveCardToCloud(updated).catch(() => {});
      return updated;
    });
  };

  // Add subcategory in state
  const addSubcategory = (brandId: string, subcategory: Omit<BrandSubcategory, 'id'>) => {
    const newId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullSubcategory: BrandSubcategory = {
      ...subcategory,
      id: newId,
    };
    setCurrentCard((prev) => ({
      ...prev,
      brands: prev.brands.map((b) => {
        if (b.id !== brandId) return b;
        const currentSubs = b.subcategories || [];
        return {
          ...b,
          subcategories: [...currentSubs, fullSubcategory],
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Update subcategory in state
  const updateSubcategory = (
    brandId: string,
    subcategoryId: string,
    partial: Partial<BrandSubcategory>
  ) => {
    setCurrentCard((prev) => ({
      ...prev,
      brands: prev.brands.map((b) => {
        if (b.id !== brandId) return b;
        const currentSubs = b.subcategories || [];
        return {
          ...b,
          subcategories: currentSubs.map((s) =>
            s.id === subcategoryId ? { ...s, ...partial } : s
          ),
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Delete subcategory in state
  const deleteSubcategory = (brandId: string, subcategoryId: string) => {
    setCurrentCard((prev) => ({
      ...prev,
      brands: prev.brands.map((b) => {
        if (b.id !== brandId) return b;
        const currentSubs = b.subcategories || [];
        return {
          ...b,
          subcategories: currentSubs.filter((s) => s.id !== subcategoryId),
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Save current active card to Cloud Firestore
  const saveCurrentCard = async (): Promise<{ success: boolean; error?: string }> => {
    setCloudSyncStatus('syncing');
    try {
      const result = await saveCardToCloud(currentCard);
      if (result.success) {
        setCloudSyncStatus('saved');
        setLastCloudSavedAt(new Date().toLocaleTimeString());
        // Backup to localStorage
        localStorage.setItem(STORAGE_KEY_PREFIX + currentCard.slug, JSON.stringify(currentCard));
        // Refresh cards directory
        await refreshCardsList();
        setTimeout(() => setCloudSyncStatus('idle'), 3500);
        return { success: true };
      } else {
        setCloudSyncStatus('error');
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setCloudSyncStatus('error');
      return { success: false, error: err?.message || 'Error al conectar con la base de datos' };
    }
  };

  // Create a new digital card
  const createCard = async (data: {
    slug: string;
    name: string;
    title: string;
    division?: string;
    email: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; card?: DigitalCard; error?: string }> => {
    try {
      const cleanSlug = slugify(data.slug || data.name);
      if (!cleanSlug) {
        return { success: false, error: 'El identificador/slug no puede estar vacío.' };
      }

      // Check if slug already exists
      const existing = await getCardBySlug(cleanSlug);
      if (existing) {
        return { success: false, error: `Ya existe una tarjeta con el enlace "${cleanSlug}". Elige otro identificador.` };
      }

      const newCard: DigitalCard = {
        id: cleanSlug,
        slug: cleanSlug,
        isPrimaryAdmin: false,
        profile: {
          ...USER_PROFILE,
          name: data.name.trim(),
          title: data.title.trim(),
          division: data.division?.trim() || USER_PROFILE.division,
          email: data.email.trim(),
          workEmail: data.email.trim(),
          phoneDisplay: data.phone?.trim() || USER_PROFILE.phoneDisplay,
          phoneRaw: (data.phone || USER_PROFILE.phoneRaw).replace(/\D/g, ''),
          whatsappNumber: (data.whatsappNumber || data.phone || USER_PROFILE.whatsappNumber).replace(/\D/g, ''),
          location: data.address?.trim() || USER_PROFILE.location,
          avatarUrl: data.avatarUrl?.trim() || '',
        },
        brands: JSON.parse(JSON.stringify(BRANDS)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await saveCardToCloud(newCard);
      if (result.success) {
        await refreshCardsList();
        return { success: true, card: newCard };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al crear la tarjeta' };
    }
  };

  // Remove a card
  const removeCard = async (cardId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const card = cardsList.find((c) => c.id === cardId || c.slug === cardId);
      if (card?.isPrimaryAdmin || card?.slug === 'ulises-hernandez') {
        return { success: false, error: 'No se puede eliminar la tarjeta principal del Administrador.' };
      }

      const res = await deleteCardFromCloud(cardId);
      if (res.success) {
        await refreshCardsList();
        if (currentCard.id === cardId || currentCard.slug === cardId) {
          await loadActiveCard('ulises-hernandez');
        }
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al eliminar' };
    }
  };

  // Switch active card
  const switchActiveCard = async (slugOrId: string) => {
    const cleanSlug = slugify(slugOrId);
    // Update browser URL query parameter without full reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('card', cleanSlug);
      window.history.pushState({}, '', url.toString());
    }
    await loadActiveCard(cleanSlug);
  };

  // Reset current card to factory default
  const resetToDefaults = () => {
    const def = getDefaultAdminCard();
    setCurrentCard(def);
  };

  const exportJson = () => {
    return JSON.stringify(currentCard, null, 2);
  };

  const importJson = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'El archivo no contiene un formato JSON válido.' };
      }
      if (parsed.profile) {
        setCurrentCard((prev) => ({
          ...prev,
          profile: { ...prev.profile, ...parsed.profile },
          brands: Array.isArray(parsed.brands) ? parsed.brands : prev.brands,
          updatedAt: new Date().toISOString(),
        }));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al procesar JSON' };
    }
  };

  const openAdminWithBrand = (brandId?: string) => {
    setAdminInitialBrandId(brandId);
    setIsAdminOpen(true);
  };

  return (
    <ConfigContext.Provider
      value={{
        currentCard,
        profile,
        brands,
        activeSlug: currentCard.slug,
        isLoading,
        cloudSyncStatus,
        lastCloudSavedAt,
        updateProfile,
        updateBrand,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        saveCurrentCard,
        cardsList,
        refreshCardsList,
        switchActiveCard,
        createCard,
        removeCard,
        isAdminOpen,
        setIsAdminOpen,
        openAdminWithBrand,
        adminInitialBrandId,
        isAdminMode,
        setIsAdminMode,
        toggleAdminMode,
        resetToDefaults,
        exportJson,
        importJson,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within a ConfigProvider');
  }
  return context;
};

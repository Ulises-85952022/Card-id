import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, BrandInfo, BrandSubcategory, UserProfile } from '../types';
import { USER_PROFILE, BRANDS } from '../data';

interface ConfigContextType {
  profile: UserProfile;
  brands: BrandInfo[];
  updateProfile: (partial: Partial<UserProfile>) => void;
  updateBrand: (brandId: string, partial: Partial<BrandInfo>) => void;
  addSubcategory: (brandId: string, subcategory: Omit<BrandSubcategory, 'id'>) => void;
  updateSubcategory: (brandId: string, subcategoryId: string, partial: Partial<BrandSubcategory>) => void;
  deleteSubcategory: (brandId: string, subcategoryId: string) => void;
  resetToDefaults: () => void;
  exportJson: () => string;
  importJson: (jsonText: string) => { success: boolean; error?: string };
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  openAdminWithBrand: (brandId?: string) => void;
  adminInitialBrandId?: string;
  isAdminMode: boolean;
  setIsAdminMode: (enabled: boolean) => void;
  toggleAdminMode: () => void;
}

const STORAGE_KEY = 'ammega_digital_card_config_v2';
const ADMIN_SESSION_KEY = 'ammega_admin_authenticated';

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect if admin mode should be active (?admin=1 or ?admin=true or active session)
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
        // ignore storage errors
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
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: AppConfig = JSON.parse(saved);
          if (parsed.profile) {
            return { ...USER_PROFILE, ...parsed.profile };
          }
        }
      } catch (err) {
        console.error('Failed to load profile from localStorage', err);
      }
    }
    return USER_PROFILE;
  });

  const [brands, setBrands] = useState<BrandInfo[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: AppConfig = JSON.parse(saved);
          if (Array.isArray(parsed.brands) && parsed.brands.length > 0) {
            return parsed.brands;
          }
        }
      } catch (err) {
        console.error('Failed to load brands from localStorage', err);
      }
    }
    return BRANDS;
  });

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialBrandId, setAdminInitialBrandId] = useState<string | undefined>(undefined);

  // Persist to localStorage whenever profile or brands change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const payload: AppConfig = {
          profile,
          brands,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.error('Failed to persist to localStorage', err);
      }
    }
  }, [profile, brands]);

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const updateBrand = (brandId: string, partial: Partial<BrandInfo>) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, ...partial } : b))
    );
  };

  const addSubcategory = (brandId: string, subcategory: Omit<BrandSubcategory, 'id'>) => {
    const newId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullSubcategory: BrandSubcategory = {
      ...subcategory,
      id: newId,
    };
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id !== brandId) return b;
        const currentSubs = b.subcategories || [];
        return {
          ...b,
          subcategories: [...currentSubs, fullSubcategory],
        };
      })
    );
  };

  const updateSubcategory = (
    brandId: string,
    subcategoryId: string,
    partial: Partial<BrandSubcategory>
  ) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id !== brandId) return b;
        const currentSubs = b.subcategories || [];
        return {
          ...b,
          subcategories: currentSubs.map((s) =>
            s.id === subcategoryId ? { ...s, ...partial } : s
          ),
        };
      })
    );
  };

  const deleteSubcategory = (brandId: string, subcategoryId: string) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id !== brandId) return b;
        const currentSubs = b.subcategories || [];
        return {
          ...b,
          subcategories: currentSubs.filter((s) => s.id !== subcategoryId),
        };
      })
    );
  };

  const resetToDefaults = () => {
    setProfile(USER_PROFILE);
    setBrands(BRANDS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('ammega_user_avatar');
    }
  };

  const exportJson = () => {
    const payload: AppConfig = {
      profile,
      brands,
      lastUpdated: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  const importJson = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'El archivo no contiene un formato JSON válido.' };
      }
      if (parsed.profile) {
        setProfile({ ...USER_PROFILE, ...parsed.profile });
      }
      if (Array.isArray(parsed.brands)) {
        setBrands(parsed.brands);
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
        profile,
        brands,
        updateProfile,
        updateBrand,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        resetToDefaults,
        exportJson,
        importJson,
        isAdminOpen,
        setIsAdminOpen,
        openAdminWithBrand,
        adminInitialBrandId,
        isAdminMode,
        setIsAdminMode,
        toggleAdminMode,
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

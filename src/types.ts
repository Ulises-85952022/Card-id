export interface BrandSubcategory {
  id: string;
  title: string;
  description: string;
  linkUrl?: string;
  badge?: string;
}

export interface BrandInfo {
  id: string;
  name: string;
  category: string;
  categoryPill: string;
  color: string;
  description: string;
  keyProducts: string[];
  industries: string[];
  officialUrl: string;
  catalogUrl: string;
  badge: string;
  logoUrl?: string;
  subcategories?: BrandSubcategory[];
}

export interface UserProfile {
  name: string;
  title: string;
  division: string;
  company: string;
  companyTagline: string;
  phoneDisplay: string;
  phoneRaw: string;
  whatsappNumber: string;
  email: string;
  workEmail: string;
  coverageZone: string;
  brandsUrl: string;
  corporateUrl: string;
  location: string;
  bio: string;
  status: 'disponible' | 'en-reunion' | 'en-campo';
  avatarUrl?: string;
}

export interface AppConfig {
  profile: UserProfile;
  brands: BrandInfo[];
  lastUpdated?: string;
}

export interface DigitalCard {
  id: string;
  slug: string;
  isPrimaryAdmin?: boolean;
  profile: UserProfile;
  brands: BrandInfo[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CardSummary {
  id: string;
  slug: string;
  name: string;
  title: string;
  email: string;
  whatsappNumber: string;
  isPrimaryAdmin?: boolean;
  updatedAt?: string;
}

export interface ContactChannel {
  id: string;
  title: string;
  value: string;
  actionUrl: string;
  icon: string;
  isExternal?: boolean;
  copyable?: boolean;
}

export type ActiveTab = 'contacto' | 'marcas' | 'grupo' | 'cotizador';

export type AvailabilityStatus = 'disponible' | 'en-reunion' | 'en-campo';

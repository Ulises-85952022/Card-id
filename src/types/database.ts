/**
 * Modelo de datos de net carID AI sobre Firestore.
 *
 * Los nombres de campo siguen el esquema en snake_case. Las colecciones llevan el prefijo
 * `saas_` porque `cards` ya la usa la tarjeta digital en producción (ver cardsService.ts).
 *
 * Convenciones:
 * - `id` es un UUID v4 (crypto.randomUUID). En `saas_profiles` el id es el uid de Firebase Auth.
 * - Las referencias (`user_id`, `card_id`, …) son UUID que apuntan al `id` del documento padre.
 *   Firestore no tiene claves foráneas: la integridad se aplica en `src/lib/db/` (cascadas)
 *   y en `firestore.rules` (permisos sobre el padre).
 * - Las fechas se guardan como Timestamp de Firestore y se leen como ISO 8601 (`ISODateTime`).
 */

export type UUID = string;
/** Fecha y hora en ISO 8601 con zona horaria, p. ej. "2026-10-31T15:04:05.000Z". */
export type ISODateTime = string;
/** Teléfono en formato internacional E.164, p. ej. "+5213312345678". */
export type E164Phone = string;

// ---------- Enumeraciones ----------

export const PROFILE_ROLES = ['consultant', 'agency_admin', 'agency_member'] as const;
export type ProfileRole = (typeof PROFILE_ROLES)[number];

export const PLAN_TIERS = ['consultant', 'agency'] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const QUOTE_STATUSES = ['new', 'contacted', 'in_negotiation', 'closed', 'discarded'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const ANALYTICS_EVENT_TYPES = [
  'page_view',
  'service_expanded',
  'vip_unlocked',
  'quote_submitted',
  'whatsapp_clicked',
  'calendar_clicked',
  'vcard_downloaded',
] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

// ---------- Campos JSONB estructurados ----------

export interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  fontPreference: string;
  showWatermark: boolean;
}

export interface ContactSettings {
  whatsappNumber: E164Phone | null;
  defaultWhatsAppMessage: string;
  email: string | null;
  calendarUrl: string | null;
  linkedinUrl: string | null;
}

export interface VipPriceItem {
  serviceId: UUID;
  amount: string;
  currency: string;
  note: string | null;
}

export interface VipVaultContent {
  confidentialPricing: VipPriceItem[];
  /** URLs de PDFs de propuesta, en Storage. */
  proposalPdfs: string[];
  privateNotes: string;
}

export type AnalyticsDevice = 'mobile' | 'tablet' | 'desktop';

export interface AnalyticsEventMetadata {
  serviceId?: UUID;
  device?: AnalyticsDevice;
  /** Segundos que la persona estuvo en la página. */
  timeOnPage?: number;
}

// ---------- Tablas ----------

export interface Profile {
  id: UUID;
  email: string;
  full_name: string;
  company_name: string | null;
  role: ProfileRole;
  plan_tier: PlanTier;
  avatar_url: string | null;
  whatsapp_number: E164Phone | null;
  /** Perfil de la agencia a la que pertenece esta subcuenta; null si es independiente. */
  agency_id: UUID | null;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Card {
  id: UUID;
  user_id: UUID;
  /** Identificador público único (ver saas_slugs). */
  slug: string;
  title: string;
  headline: string;
  bio: string | null;
  branding_settings: BrandingSettings;
  contact_settings: ContactSettings;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

export interface Service {
  id: UUID;
  card_id: UUID;
  title: string;
  description: string;
  /** Texto libre: "Desde $1,500 USD" o "A consultar". */
  price_estimate: string | null;
  icon_or_image_url: string | null;
  /** Si es true, el servicio y su precio solo se muestran dentro de la bóveda VIP. */
  is_vip_only: boolean;
  order_index: number;
  created_at: ISODateTime;
}

export interface Testimonial {
  id: UUID;
  card_id: UUID;
  client_name: string;
  client_role_company: string;
  industry: string;
  quote: string;
  result_metric: string | null;
  created_at: ISODateTime;
}

export interface ProspectLink {
  id: UUID;
  card_id: UUID;
  prospect_company_name: string;
  prospect_website_url: string | null;
  prospect_industry: string | null;
  /** Ruta pública única, p. ej. "mi-tarjeta/empresa-prospecto-xyz". Ver saas_slugs. */
  unique_slug: string;
  tailored_headline: string;
  tailored_bio: string | null;
  selected_service_ids: UUID[];
  selected_testimonial_ids: UUID[];
  vip_vault_enabled: boolean;
  is_active: boolean;
  created_at: ISODateTime;
  updated_at: ISODateTime;
}

/**
 * Datos sensibles de un enlace de prospecto. Viven en su propio documento (mismo id que el
 * prospect_link) porque `saas_prospect_links` es legible públicamente y no puede guardar
 * el hash de la contraseña ni la lista de precios confidenciales.
 */
export interface ProspectLinkSecret {
  /** Igual al id del prospect_link. */
  id: UUID;
  prospect_link_id: UUID;
  card_id: UUID;
  vip_vault_password_hash: string | null;
  vip_vault_content: VipVaultContent | null;
  updated_at: ISODateTime;
}

export interface Quote {
  id: UUID;
  card_id: UUID;
  prospect_link_id: UUID | null;
  prospect_name: string;
  prospect_email: string;
  prospect_phone: E164Phone | null;
  company_name: string | null;
  requested_service_ids: UUID[];
  message: string | null;
  status: QuoteStatus;
  created_at: ISODateTime;
}

export interface AnalyticsEvent {
  id: UUID;
  card_id: UUID;
  prospect_link_id: UUID | null;
  event_type: AnalyticsEventType;
  metadata: AnalyticsEventMetadata;
  /** Hash anonimizado de la IP; sirve solo para contar visitantes únicos. */
  ip_hash: string | null;
  created_at: ISODateTime;
}

/** Índice de unicidad para `slug` (tarjetas) y `unique_slug` (prospectos). */
export interface SlugIndex {
  /** El propio slug es el id del documento. */
  id: string;
  kind: 'card' | 'prospect_link';
  ref_id: UUID;
  user_id: UUID;
}

// ---------- Tipos de escritura ----------

type ManagedFields = 'created_at' | 'updated_at';

/** Campos que la base de datos asigna sola: id opcional, fechas automáticas. */
type WithOptionalId<T> = Omit<T, 'id' | ManagedFields> & { id?: UUID };

export type ProfileInsert = WithOptionalId<Profile> & Partial<Pick<Profile, 'role' | 'plan_tier' | 'company_name' | 'avatar_url' | 'whatsapp_number' | 'agency_id'>>;
/** El id y el correo los fija Firebase Auth; ni el rol, ni el plan, ni la agencia se cambian desde el cliente. */
export type ProfileUpdate = Partial<Pick<Profile, 'full_name' | 'company_name' | 'avatar_url' | 'whatsapp_number'>>;

export type CardInsert = WithOptionalId<Card> & Partial<Pick<Card, 'bio' | 'is_active'>>;
export type CardUpdate = Partial<Pick<Card, 'title' | 'headline' | 'bio' | 'branding_settings' | 'contact_settings' | 'is_active'>>;

export type ServiceInsert = WithOptionalId<Service> & Partial<Pick<Service, 'price_estimate' | 'icon_or_image_url' | 'is_vip_only' | 'order_index'>>;
export type ServiceUpdate = Partial<Omit<Service, 'id' | 'card_id' | 'created_at'>>;

export type TestimonialInsert = WithOptionalId<Testimonial> & Partial<Pick<Testimonial, 'result_metric'>>;
export type TestimonialUpdate = Partial<Omit<Testimonial, 'id' | 'card_id' | 'created_at'>>;

export type ProspectLinkInsert = WithOptionalId<ProspectLink> &
  Partial<Pick<ProspectLink, 'prospect_website_url' | 'prospect_industry' | 'tailored_bio' | 'selected_service_ids' | 'selected_testimonial_ids' | 'vip_vault_enabled' | 'is_active'>>;
export type ProspectLinkUpdate = Partial<Omit<ProspectLink, 'id' | 'card_id' | 'unique_slug' | 'created_at'>>;

export type ProspectLinkSecretInsert = Omit<ProspectLinkSecret, 'updated_at'>;
export type ProspectLinkSecretUpdate = Partial<Pick<ProspectLinkSecret, 'vip_vault_password_hash' | 'vip_vault_content'>>;

export type QuoteInsert = WithOptionalId<Quote> & Partial<Pick<Quote, 'prospect_link_id' | 'prospect_phone' | 'company_name' | 'message' | 'status'>>;
/** Solo el dueño de la tarjeta cambia el estado de una cotización. */
export type QuoteUpdate = Partial<Pick<Quote, 'status'>>;

export type AnalyticsEventInsert = WithOptionalId<AnalyticsEvent> &
  Partial<Pick<AnalyticsEvent, 'prospect_link_id' | 'metadata' | 'ip_hash'>>;

// ---------- Tipos auxiliares de servicio ----------

/** Nombre de cada colección en Firestore. */
export const COLLECTIONS = {
  profiles: 'saas_profiles',
  cards: 'saas_cards',
  services: 'saas_services',
  testimonials: 'saas_testimonials',
  prospectLinks: 'saas_prospect_links',
  prospectLinkSecrets: 'saas_prospect_link_secrets',
  quotes: 'saas_quotes',
  analyticsEvents: 'saas_analytics_events',
  slugs: 'saas_slugs',
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Errores de la capa de datos con un código estable para la interfaz. */
export type DbErrorCode =
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'UNAUTHENTICATED'
  | 'NETWORK'
  | 'VALIDATION'
  | 'CONFLICT'
  | 'UNKNOWN';

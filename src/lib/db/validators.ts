import {
  ANALYTICS_EVENT_TYPES,
  PLAN_TIERS,
  PROFILE_ROLES,
  QUOTE_STATUSES,
  type AnalyticsEventInsert,
  type CardInsert,
  type ProfileInsert,
  type ProspectLinkInsert,
  type QuoteInsert,
  type ServiceInsert,
  type TestimonialInsert,
} from '../../types/database';

/**
 * Validación de tipos en tiempo de ejecución. TypeScript no protege los datos que llegan
 * de formularios o del navegador, así que cada inserción pasa por aquí antes de escribir.
 * Cada función devuelve la lista de errores en español (vacía si todo es válido).
 */

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Slug de prospecto: "slug-de-tarjeta/empresa-prospecto". */
export const PROSPECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const MAX_TEXT = 2000;
const MAX_NAME = 120;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function requiredText(value: unknown, label: string, max = MAX_TEXT): string | null {
  if (typeof value !== 'string' || value.trim() === '') return `${label} es obligatorio.`;
  if (value.length > max) return `${label} no puede tener más de ${max} caracteres.`;
  return null;
}

function optionalText(value: unknown, label: string, max = MAX_TEXT): string | null {
  if (value === null || value === undefined || value === '') return null;
  return requiredText(value, label, max);
}

function optionalE164(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  return typeof value === 'string' && E164_PATTERN.test(value) ? null : `${label} debe estar en formato internacional, p. ej. +5213312345678.`;
}

function optionalUrl(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' || url.protocol === 'http:' ? null : `${label} debe empezar con http o https.`;
  } catch {
    return `${label} no es una URL válida.`;
  }
}

function collect(...checks: Array<string | null>): string[] {
  return checks.filter((message): message is string => message !== null);
}

export function validateProfileInsert(input: ProfileInsert): string[] {
  return collect(
    requiredText(input.email, 'El correo', 254),
    input.email && !EMAIL_PATTERN.test(input.email) ? 'El correo no es válido.' : null,
    requiredText(input.full_name, 'El nombre completo', MAX_NAME),
    input.role !== undefined && !PROFILE_ROLES.includes(input.role) ? 'El rol no es válido.' : null,
    input.plan_tier !== undefined && !PLAN_TIERS.includes(input.plan_tier) ? 'El plan no es válido.' : null,
    input.agency_id !== undefined && input.agency_id !== null && !isUuid(input.agency_id) ? 'El identificador de agencia no es válido.' : null,
    optionalE164(input.whatsapp_number, 'El WhatsApp'),
    optionalUrl(input.avatar_url, 'La foto de perfil')
  );
}

export function validateCardInsert(input: CardInsert): string[] {
  const errors = collect(
    !isUuid(input.user_id) ? 'El usuario de la tarjeta no es válido.' : null,
    typeof input.slug !== 'string' || !SLUG_PATTERN.test(input.slug) ? 'El enlace de la tarjeta solo admite letras minúsculas, números y guiones.' : null,
    requiredText(input.title, 'El título', MAX_NAME),
    requiredText(input.headline, 'La propuesta de valor')
  );
  const branding = input.branding_settings;
  if (!branding) errors.push('Faltan los ajustes de marca.');
  else if (branding.primaryColor && !HEX_COLOR_PATTERN.test(branding.primaryColor)) errors.push('El color principal debe ser hexadecimal, p. ej. #4F46E5.');
  else if (branding.accentColor && !HEX_COLOR_PATTERN.test(branding.accentColor)) errors.push('El color de acento debe ser hexadecimal, p. ej. #8B5CF6.');
  const contact = input.contact_settings;
  if (!contact) errors.push('Faltan los datos de contacto.');
  else {
    const phone = optionalE164(contact.whatsappNumber, 'El WhatsApp de contacto');
    if (phone) errors.push(phone);
    const calendar = optionalUrl(contact.calendarUrl, 'El enlace de calendario');
    if (calendar) errors.push(calendar);
    const linkedin = optionalUrl(contact.linkedinUrl, 'El enlace de LinkedIn');
    if (linkedin) errors.push(linkedin);
  }
  return errors;
}

export function validateServiceInsert(input: ServiceInsert): string[] {
  return collect(
    !isUuid(input.card_id) ? 'La tarjeta del servicio no es válida.' : null,
    requiredText(input.title, 'El título del servicio', MAX_NAME),
    requiredText(input.description, 'La descripción del servicio'),
    input.order_index !== undefined && (!Number.isInteger(input.order_index) || input.order_index < 0) ? 'El orden debe ser un entero mayor o igual a 0.' : null,
    optionalUrl(input.icon_or_image_url, 'La imagen del servicio')
  );
}

export function validateTestimonialInsert(input: TestimonialInsert): string[] {
  return collect(
    !isUuid(input.card_id) ? 'La tarjeta del caso no es válida.' : null,
    requiredText(input.client_name, 'El nombre del cliente', MAX_NAME),
    requiredText(input.client_role_company, 'El cargo y la empresa del cliente', MAX_NAME),
    requiredText(input.industry, 'La industria', MAX_NAME),
    requiredText(input.quote, 'La cita del cliente')
  );
}

export function validateProspectLinkInsert(input: ProspectLinkInsert): string[] {
  return collect(
    !isUuid(input.card_id) ? 'La tarjeta del prospecto no es válida.' : null,
    requiredText(input.prospect_company_name, 'El nombre de la empresa', MAX_NAME),
    typeof input.unique_slug !== 'string' || !PROSPECT_SLUG_PATTERN.test(input.unique_slug)
      ? 'El enlace del prospecto debe tener la forma "tarjeta/empresa", con letras minúsculas, números y guiones.'
      : null,
    requiredText(input.tailored_headline, 'El titular para el prospecto'),
    optionalUrl(input.prospect_website_url, 'El sitio web del prospecto'),
    input.selected_service_ids !== undefined && !Array.isArray(input.selected_service_ids) ? 'Los servicios seleccionados deben ser una lista.' : null,
    input.selected_service_ids?.some((id) => !isUuid(id)) ? 'Hay un servicio seleccionado con un identificador no válido.' : null,
    input.selected_testimonial_ids?.some((id) => !isUuid(id)) ? 'Hay un caso de éxito seleccionado con un identificador no válido.' : null
  );
}

export function validateQuoteInsert(input: QuoteInsert): string[] {
  return collect(
    !isUuid(input.card_id) ? 'La tarjeta de la cotización no es válida.' : null,
    requiredText(input.prospect_name, 'Tu nombre', MAX_NAME),
    requiredText(input.prospect_email, 'Tu correo', 254),
    input.prospect_email && !EMAIL_PATTERN.test(input.prospect_email) ? 'Escribe un correo válido.' : null,
    optionalE164(input.prospect_phone, 'El teléfono'),
    optionalText(input.company_name, 'El nombre de la empresa', MAX_NAME),
    optionalText(input.message, 'El mensaje', 2000),
    input.status !== undefined && !QUOTE_STATUSES.includes(input.status) ? 'El estado de la cotización no es válido.' : null,
    input.requested_service_ids?.some((id) => !isUuid(id)) ? 'Hay un servicio solicitado con un identificador no válido.' : null
  );
}

export function validateAnalyticsEventInsert(input: AnalyticsEventInsert): string[] {
  return collect(
    !isUuid(input.card_id) ? 'La tarjeta del evento no es válida.' : null,
    !ANALYTICS_EVENT_TYPES.includes(input.event_type) ? 'El tipo de evento no es válido.' : null,
    input.metadata?.serviceId !== undefined && !isUuid(input.metadata.serviceId) ? 'El servicio del evento no es válido.' : null
  );
}

export function validateProfileUpdate(patch: { full_name?: string; company_name?: string | null; avatar_url?: string | null; whatsapp_number?: string | null }): string[] {
  return collect(
    patch.full_name !== undefined ? requiredText(patch.full_name, 'El nombre completo', MAX_NAME) : null,
    patch.company_name !== undefined ? optionalText(patch.company_name, 'El nombre de la empresa', MAX_NAME) : null,
    patch.avatar_url !== undefined ? optionalUrl(patch.avatar_url, 'La foto de perfil') : null,
    patch.whatsapp_number !== undefined ? optionalE164(patch.whatsapp_number, 'El WhatsApp') : null
  );
}

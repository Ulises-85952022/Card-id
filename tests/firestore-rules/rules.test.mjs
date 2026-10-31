import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';

const A = 'uid-consultor-a', B = 'uid-consultor-b', C = 'uid-agencia-admin', M = 'uid-miembro-agencia';
const CARD_A = '11111111-1111-4111-8111-111111111111';
const CARD_A_OFF = '22222222-2222-4222-8222-222222222222';
const CARD_B = '33333333-3333-4333-8333-333333333333';
const SVC_PUB = 'aaaaaaaa-0000-4000-8000-000000000001';
const SVC_VIP = 'aaaaaaaa-0000-4000-8000-000000000002';
const LINK = 'bbbbbbbb-0000-4000-8000-000000000001';
const QUOTE = 'cccccccc-0000-4000-8000-000000000001';
const EVENT = 'dddddddd-0000-4000-8000-000000000001';
const CARD_M = '44444444-4444-4444-8444-444444444444';
const now = new Date();

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-carid',
    firestore: { host: '127.0.0.1', port: 8181, rules: readFileSync('firestore.rules', 'utf8') },
  });
});
after(async () => env.cleanup());

const seed = async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const agency = 'eeeeeeee-0000-4000-8000-00000000000e';
    await setDoc(doc(db, 'saas_profiles', A), { email: 'a@x.mx', full_name: 'A', company_name: null, role: 'consultant', plan_tier: 'consultant', avatar_url: null, whatsapp_number: null, agency_id: null, created_at: now, updated_at: now });
    await setDoc(doc(db, 'saas_profiles', B), { email: 'b@x.mx', full_name: 'B', company_name: null, role: 'consultant', plan_tier: 'consultant', avatar_url: null, whatsapp_number: null, agency_id: null, created_at: now, updated_at: now });
    await setDoc(doc(db, 'saas_profiles', C), { email: 'c@x.mx', full_name: 'C', company_name: null, role: 'agency_admin', plan_tier: 'agency', avatar_url: null, whatsapp_number: null, agency_id: agency, created_at: now, updated_at: now });
    await setDoc(doc(db, 'saas_profiles', M), { email: 'm@x.mx', full_name: 'M', company_name: null, role: 'agency_member', plan_tier: 'agency', avatar_url: null, whatsapp_number: null, agency_id: agency, created_at: now, updated_at: now });
    const card = (user_id, slug, is_active) => ({ user_id, slug, title: 'Estrategia', headline: 'Propuesta', bio: null, branding_settings: { primaryColor: '#4F46E5', accentColor: '#8B5CF6', logoUrl: null, fontPreference: 'archivo', showWatermark: false }, contact_settings: { whatsappNumber: null, defaultWhatsAppMessage: '', email: null, calendarUrl: null, linkedinUrl: null }, is_active, created_at: now, updated_at: now });
    await setDoc(doc(db, 'saas_cards', CARD_A), card(A, 'ulises-a', true));
    await setDoc(doc(db, 'saas_cards', CARD_A_OFF), card(A, 'ulises-off', false));
    await setDoc(doc(db, 'saas_cards', CARD_B), card(B, 'otro-b', true));
    await setDoc(doc(db, 'saas_cards', CARD_M), card(M, 'miembro-m', false));
    await setDoc(doc(db, 'saas_services', SVC_PUB), { card_id: CARD_A, title: 'Bandas', description: 'Transportadoras', price_estimate: 'A consultar', icon_or_image_url: null, is_vip_only: false, order_index: 0, created_at: now });
    await setDoc(doc(db, 'saas_services', SVC_VIP), { card_id: CARD_A, title: 'Precio VIP', description: 'Confidencial', price_estimate: '$1', icon_or_image_url: null, is_vip_only: true, order_index: 1, created_at: now });
    await setDoc(doc(db, 'saas_prospect_links', LINK), { card_id: CARD_A, prospect_company_name: 'Acme', prospect_website_url: null, prospect_industry: null, unique_slug: 'ulises-a/acme', tailored_headline: 'H', tailored_bio: null, selected_service_ids: [SVC_PUB], selected_testimonial_ids: [], vip_vault_enabled: true, is_active: true, created_at: now, updated_at: now });
    await setDoc(doc(db, 'saas_prospect_link_secrets', LINK), { prospect_link_id: LINK, card_id: CARD_A, vip_vault_password_hash: 'hash', vip_vault_content: { confidentialPricing: [], proposalPdfs: [], privateNotes: '' }, updated_at: now });
    await setDoc(doc(db, 'saas_slugs', 'ulises-a'), { kind: 'card', ref_id: CARD_A, user_id: A });
    await setDoc(doc(db, 'saas_quotes', QUOTE), { card_id: CARD_A, prospect_link_id: null, prospect_name: 'Ana', prospect_email: 'ana@acme.mx', prospect_phone: null, company_name: null, requested_service_ids: [SVC_PUB], message: null, status: 'new', created_at: now });
    await setDoc(doc(db, 'saas_analytics_events', EVENT), { card_id: CARD_A, prospect_link_id: null, event_type: 'page_view', metadata: {}, ip_hash: null, created_at: now });
  });
};

const anon = () => env.unauthenticatedContext().firestore();
const as = (uid, email) => env.authenticatedContext(uid, { email }).firestore();
const newQuote = (cardId, extra = {}) => ({ card_id: cardId, prospect_link_id: null, prospect_name: 'Luis', prospect_email: 'luis@acme.mx', prospect_phone: null, company_name: null, requested_service_ids: [], message: 'Hola', status: 'new', created_at: serverTimestamp(), ...extra });

beforeEach(seed);

test('consultor no lee ni modifica tarjetas de otro usuario', async () => {
  const b = as(B, 'b@x.mx');
  await assertFails(getDoc(doc(b, 'saas_cards', CARD_A_OFF)));
  await assertFails(updateDoc(doc(b, 'saas_cards', CARD_A), { title: 'Robada' }));
  await assertFails(deleteDoc(doc(b, 'saas_cards', CARD_A)));
  await assertFails(setDoc(doc(b, 'saas_services', 'ffffffff-0000-4000-8000-000000000009'), { card_id: CARD_A, title: 'Intruso', description: 'x', is_vip_only: false, order_index: 0, created_at: now }));
  await assertSucceeds(getDoc(doc(b, 'saas_cards', CARD_B)));
});

test('visitante anónimo lee tarjeta y servicios públicos activos, nada más', async () => {
  const x = anon();
  await assertSucceeds(getDoc(doc(x, 'saas_cards', CARD_A)));
  await assertFails(getDoc(doc(x, 'saas_cards', CARD_A_OFF)));
  await assertSucceeds(getDoc(doc(x, 'saas_services', SVC_PUB)));
  await assertFails(getDoc(doc(x, 'saas_services', SVC_VIP)));
  await assertSucceeds(getDoc(doc(x, 'saas_prospect_links', LINK)));
  await assertFails(getDoc(doc(x, 'saas_prospect_link_secrets', LINK)));
  await assertFails(getDoc(doc(x, 'saas_slugs', 'ulises-a')));
});

test('secretos de la bóveda solo para el dueño', async () => {
  await assertSucceeds(getDoc(doc(as(A, 'a@x.mx'), 'saas_prospect_link_secrets', LINK)));
  await assertFails(getDoc(doc(as(C, 'c@x.mx'), 'saas_prospect_link_secrets', LINK)));
  await assertFails(getDoc(doc(as(B, 'b@x.mx'), 'saas_prospect_link_secrets', LINK)));
});

test('cotizaciones: anónimo inserta, solo el dueño lee y solo cambia el estado', async () => {
  const x = anon();
  await assertSucceeds(setDoc(doc(x, 'saas_quotes', 'cccccccc-0000-4000-8000-000000000002'), newQuote(CARD_A)));
  await assertFails(setDoc(doc(x, 'saas_quotes', 'cccccccc-0000-4000-8000-000000000003'), newQuote(CARD_A, { status: 'closed' })));
  await assertFails(setDoc(doc(x, 'saas_quotes', 'cccccccc-0000-4000-8000-000000000004'), newQuote(CARD_A_OFF)));
  await assertFails(getDoc(doc(x, 'saas_quotes', QUOTE)));
  await assertSucceeds(getDoc(doc(as(A, 'a@x.mx'), 'saas_quotes', QUOTE)));
  await assertFails(getDoc(doc(as(B, 'b@x.mx'), 'saas_quotes', QUOTE)));
  const owner = as(A, 'a@x.mx');
  await assertSucceeds(updateDoc(doc(owner, 'saas_quotes', QUOTE), { status: 'contacted' }));
  await assertFails(updateDoc(doc(owner, 'saas_quotes', QUOTE), { prospect_name: 'Editado' }));
  await assertFails(updateDoc(doc(as(B, 'b@x.mx'), 'saas_quotes', QUOTE), { status: 'closed' }));
});

test('analíticas: anónimo inserta, solo el dueño o su agencia leen', async () => {
  const x = anon();
  await assertSucceeds(setDoc(doc(x, 'saas_analytics_events', 'dddddddd-0000-4000-8000-000000000002'), { card_id: CARD_A, prospect_link_id: LINK, event_type: 'whatsapp_clicked', metadata: { device: 'mobile' }, ip_hash: 'h', created_at: serverTimestamp() }));
  await assertFails(setDoc(doc(x, 'saas_analytics_events', 'dddddddd-0000-4000-8000-000000000003'), { card_id: CARD_A, prospect_link_id: null, event_type: 'inventado', metadata: {}, created_at: serverTimestamp() }));
  await assertFails(getDoc(doc(x, 'saas_analytics_events', EVENT)));
  await assertSucceeds(getDoc(doc(as(A, 'a@x.mx'), 'saas_analytics_events', EVENT)));
  await assertFails(getDoc(doc(as(B, 'b@x.mx'), 'saas_analytics_events', EVENT)));
  await assertFails(updateDoc(doc(as(A, 'a@x.mx'), 'saas_analytics_events', EVENT), { event_type: 'page_view' }));
});

test('perfiles: el usuario no puede escalar su rol, plan ni agencia', async () => {
  const a = as(A, 'a@x.mx');
  await assertSucceeds(updateDoc(doc(a, 'saas_profiles', A), { full_name: 'Ana García' }));
  await assertFails(updateDoc(doc(a, 'saas_profiles', A), { role: 'agency_admin' }));
  await assertFails(updateDoc(doc(a, 'saas_profiles', A), { plan_tier: 'agency' }));
  await assertFails(updateDoc(doc(a, 'saas_profiles', A), { agency_id: 'eeeeeeee-0000-4000-8000-00000000000e' }));
  await assertFails(getDoc(doc(as(B, 'b@x.mx'), 'saas_profiles', A)));
});

test('perfiles: alta solo como consultor independiente con su propio correo', async () => {
  const n = as('uid-nuevo', 'nuevo@x.mx');
  const base = { email: 'nuevo@x.mx', full_name: 'Nuevo', company_name: null, role: 'consultant', plan_tier: 'consultant', avatar_url: null, whatsapp_number: null, agency_id: null, created_at: serverTimestamp(), updated_at: serverTimestamp() };
  await assertSucceeds(setDoc(doc(n, 'saas_profiles', 'uid-nuevo'), base));
  await assertFails(setDoc(doc(as('uid-otro', 'otro@x.mx'), 'saas_profiles', 'uid-otro'), { ...base, email: 'nuevo@x.mx' }));
  await assertFails(setDoc(doc(as('uid-pillo', 'pillo@x.mx'), 'saas_profiles', 'uid-pillo'), { ...base, email: 'pillo@x.mx', role: 'agency_admin' }));
});

test('agencia: el administrador lee perfiles y tarjetas privadas de su agencia, nadie más', async () => {
  await assertSucceeds(getDoc(doc(as(C, 'c@x.mx'), 'saas_profiles', M)));
  await assertFails(getDoc(doc(as(C, 'c@x.mx'), 'saas_profiles', B)));
  await assertSucceeds(getDoc(doc(as(C, 'c@x.mx'), 'saas_cards', CARD_M)));
  await assertSucceeds(getDoc(doc(as(M, 'm@x.mx'), 'saas_cards', CARD_M)));
  await assertFails(getDoc(doc(as(B, 'b@x.mx'), 'saas_cards', CARD_M)));
  await assertFails(getDoc(doc(anon(), 'saas_cards', CARD_M)));
  // A es consultor independiente: ni el administrador de la agencia ni el miembro lo ven
  await assertFails(getDoc(doc(as(C, 'c@x.mx'), 'saas_cards', CARD_A_OFF)));
  await assertFails(getDoc(doc(as(M, 'm@x.mx'), 'saas_cards', CARD_A_OFF)));
});

test('slugs únicos: no se puede reservar un slug ya tomado', async () => {
  await assertFails(setDoc(doc(as(B, 'b@x.mx'), 'saas_slugs', 'ulises-a'), { kind: 'card', ref_id: CARD_B, user_id: B }));
  await assertSucceeds(setDoc(doc(as(B, 'b@x.mx'), 'saas_slugs', 'otro-libre'), { kind: 'card', ref_id: CARD_B, user_id: B }));
});

test('tarjetas: el dueño no puede cambiar el propietario ni el slug', async () => {
  const a = as(A, 'a@x.mx');
  await assertFails(updateDoc(doc(a, 'saas_cards', CARD_A), { user_id: B }));
  await assertFails(updateDoc(doc(a, 'saas_cards', CARD_A), { slug: 'robado' }));
  await assertSucceeds(updateDoc(doc(a, 'saas_cards', CARD_A), { headline: 'Nueva propuesta' }));
});

test('listado público: consulta por slug activo funciona sin sesión', async () => {
  await assertSucceeds(getDocs(query(collection(anon(), 'saas_cards'), where('slug', '==', 'ulises-a'), where('is_active', '==', true))));
});

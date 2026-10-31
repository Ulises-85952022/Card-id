import type { User as AuthUser } from 'firebase/auth';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { COLLECTIONS, type Profile, type ProfileInsert, type ProfileUpdate } from '../../types/database';
import { DbError, assertValid, guard } from './errors';
import { validateProfileInsert, validateProfileUpdate } from './validators';
import { getOptionalDocument, getRequiredDocument, mapDocument, updateDocument } from './client';

/** Campos que el cliente nunca cambia: los fija Firebase Auth o el propio sistema. */
export const PROFILE_CLIENT_EDITABLE_FIELDS = ['full_name', 'company_name', 'avatar_url', 'whatsapp_number'] as const;

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new DbError('UNAUTHENTICATED');
  return uid;
}

/** Nombre provisional si el usuario no lo dio: la parte del correo antes del @. */
function fallbackName(email: string): string {
  return email.split('@')[0] || 'Consultor';
}

/** Perfil del usuario con sesión, o `null` si todavía no se ha sincronizado. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const uid = requireUid();
  return getOptionalDocument<Profile>(COLLECTIONS.profiles, uid);
}

/** Igual que `getCurrentProfile`, pero lanza `NOT_FOUND` si el perfil no existe. */
export async function getCurrentProfileOrThrow(): Promise<Profile> {
  return getRequiredDocument<Profile>(COLLECTIONS.profiles, requireUid());
}

/** Actualiza nombre, empresa, foto o WhatsApp del perfil propio. Las reglas bloquean el resto de campos. */
export async function updateProfile(patch: ProfileUpdate): Promise<Profile> {
  const uid = requireUid();
  assertValid(validateProfileUpdate(patch));

  const allowed = Object.fromEntries(
    PROFILE_CLIENT_EDITABLE_FIELDS.filter((field) => field in patch).map((field) => [field, patch[field]])
  );
  await updateDocument(COLLECTIONS.profiles, uid, allowed);
  return getRequiredDocument<Profile>(COLLECTIONS.profiles, uid);
}

/** Construye el perfil inicial a partir del usuario de Firebase Auth. */
function buildInitialProfile(user: AuthUser, extra: { fullName?: string; companyName?: string }): ProfileInsert {
  if (!user.email) throw new DbError('VALIDATION', 'La cuenta necesita un correo para crear el perfil.');
  return {
    id: user.uid,
    email: user.email,
    full_name: extra.fullName?.trim() || user.displayName?.trim() || fallbackName(user.email),
    company_name: extra.companyName?.trim() || null,
    role: 'consultant',
    plan_tier: 'consultant',
    avatar_url: user.photoURL ?? null,
    whatsapp_number: null,
    agency_id: null,
  };
}

/**
 * Crea el perfil del usuario si no existe y completa los datos que quedaron vacíos.
 * Es idempotente: se puede llamar en cada inicio de sesión sin duplicar nada.
 *
 * Se llama justo después del registro (con nombre y empresa) y también al entrar, por si la
 * cuenta se creó antes de tener perfil. La transacción evita dos perfiles en carreras.
 */
export async function ensureProfile(user: AuthUser, extra: { fullName?: string; companyName?: string } = {}): Promise<Profile> {
  const initial = buildInitialProfile(user, extra);
  assertValid(validateProfileInsert(initial));
  const ref = doc(db, COLLECTIONS.profiles, user.uid);

  await guard(() =>
    runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        const { id: _id, ...fields } = initial;
        transaction.set(ref, { ...fields, created_at: serverTimestamp(), updated_at: serverTimestamp() });
        return;
      }
      const current = mapDocument<Profile>(snap.id, snap.data());
      const patch: Record<string, unknown> = {};
      if (extra.companyName?.trim() && !current.company_name) patch.company_name = extra.companyName.trim();
      if (extra.fullName?.trim() && current.full_name === fallbackName(user.email ?? '')) patch.full_name = extra.fullName.trim();
      if (Object.keys(patch).length > 0) transaction.update(ref, { ...patch, updated_at: serverTimestamp() });
    })
  );

  return getRequiredDocument<Profile>(COLLECTIONS.profiles, user.uid);
}

/** Sincroniza el perfil del usuario actual; pensado para llamarse tras iniciar sesión. */
export async function syncCurrentProfile(extra: { fullName?: string; companyName?: string } = {}): Promise<Profile> {
  const user = auth.currentUser;
  if (!user) throw new DbError('UNAUTHENTICATED');
  return ensureProfile(user, extra);
}

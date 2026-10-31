import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type DocumentReference,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CollectionName, ISODateTime, UUID } from '../../types/database';
import { DbError, guard, MESSAGES } from './errors';

/**
 * Operaciones base sobre Firestore. Ningún método devuelve `null` por error: si falta un
 * registro, `getRequiredDocument` lanza `NOT_FOUND`. Solo `getOptionalDocument` devuelve
 * `null`, y lo hace a propósito, cuando la ausencia es un resultado normal.
 */

/** Firestore máximo 500 operaciones por lote; dejamos margen. */
const BATCH_LIMIT = 400;

type ManagedTimestamp = 'created_at' | 'updated_at';

function toIsoDate(value: unknown): ISODateTime {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  // Escritura local pendiente: el servidor todavía no devuelve la fecha definitiva
  return new Date().toISOString();
}

/** Convierte un documento de Firestore en el tipo de la tabla, con fechas ISO y el id. */
export function mapDocument<T>(id: string, data: DocumentData): T {
  const mapped: Record<string, unknown> = { ...data };
  for (const field of ['created_at', 'updated_at'] as const) {
    if (field in data) mapped[field] = toIsoDate(data[field]);
  }
  return { ...mapped, id } as T;
}

export function collectionRef(name: CollectionName) {
  return collection(db, name);
}

export function documentRef(name: CollectionName, id: string): DocumentReference {
  return doc(db, name, id);
}

/** Lee un documento que debe existir. Lanza `NOT_FOUND` si no existe. */
export function getRequiredDocument<T>(name: CollectionName, id: UUID | string): Promise<T> {
  return guard(async () => {
    const snap = await getDoc(documentRef(name, id));
    if (!snap.exists()) throw new DbError('NOT_FOUND', MESSAGES.NOT_FOUND);
    return mapDocument<T>(snap.id, snap.data());
  });
}

/** Lee un documento que puede no existir. Devuelve `null` solo cuando no existe. */
export function getOptionalDocument<T>(name: CollectionName, id: UUID | string): Promise<T | null> {
  return guard(async () => {
    const snap = await getDoc(documentRef(name, id));
    return snap.exists() ? mapDocument<T>(snap.id, snap.data()) : null;
  });
}

/** Consulta una colección con filtros, orden y límite. Devuelve lista vacía si no hay coincidencias. */
export function queryDocuments<T>(name: CollectionName, constraints: QueryConstraint[] = []): Promise<T[]> {
  return guard(async () => {
    const snap = await getDocs(query(collectionRef(name), ...constraints));
    return snap.docs.map((document) => mapDocument<T>(document.id, document.data()));
  });
}

/**
 * Crea un documento con id UUID y fechas automáticas. Devuelve el registro sin volver a leerlo,
 * porque las visitas anónimas (cotizaciones, analíticas) no pueden leer lo que escriben.
 */
export function createDocument<T>(
  name: CollectionName,
  id: UUID,
  data: Record<string, unknown>,
  managed: ManagedTimestamp[] = ['created_at']
): Promise<T> {
  return guard(async () => {
    const stamps = Object.fromEntries(managed.map((field) => [field, serverTimestamp()]));
    await setDoc(documentRef(name, id), { ...data, ...stamps });
    const now = new Date().toISOString();
    const estimated = Object.fromEntries(managed.map((field) => [field, now]));
    return mapDocument<T>(id, { ...data, ...estimated });
  });
}

/** Actualiza campos de un documento existente. Si se indica `updated_at`, lo renueva. */
export function updateDocument(
  name: CollectionName,
  id: UUID,
  patch: Record<string, unknown>,
  { touchUpdatedAt = true }: { touchUpdatedAt?: boolean } = {}
): Promise<void> {
  return guard(async () => {
    const stamps = touchUpdatedAt ? { updated_at: serverTimestamp() } : {};
    await updateDoc(documentRef(name, id), { ...patch, ...stamps });
  });
}

export function deleteDocument(name: CollectionName, id: UUID): Promise<void> {
  return guard(() => deleteDoc(documentRef(name, id)));
}

/** Borra en lotes todos los documentos que cumplen los filtros. Devuelve cuántos borró. */
export function deleteWhere(name: CollectionName, constraints: QueryConstraint[]): Promise<number> {
  return guard(async () => {
    const snap = await getDocs(query(collectionRef(name), ...constraints));
    let deleted = 0;
    for (let start = 0; start < snap.docs.length; start += BATCH_LIMIT) {
      const batch = writeBatch(db);
      snap.docs.slice(start, start + BATCH_LIMIT).forEach((document) => batch.delete(document.ref));
      await batch.commit();
      deleted += Math.min(BATCH_LIMIT, snap.docs.length - start);
    }
    return deleted;
  });
}

/** Actualiza en lotes los documentos que cumplen los filtros. Devuelve cuántos actualizó. */
export function updateWhere(name: CollectionName, constraints: QueryConstraint[], patch: Record<string, unknown>): Promise<number> {
  return guard(async () => {
    const snap = await getDocs(query(collectionRef(name), ...constraints));
    let updated = 0;
    for (let start = 0; start < snap.docs.length; start += BATCH_LIMIT) {
      const batch = writeBatch(db);
      snap.docs.slice(start, start + BATCH_LIMIT).forEach((document) => batch.update(document.ref, patch));
      await batch.commit();
      updated += Math.min(BATCH_LIMIT, snap.docs.length - start);
    }
    return updated;
  });
}

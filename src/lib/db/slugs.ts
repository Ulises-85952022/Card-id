import { COLLECTIONS, type SlugIndex, type UUID } from '../../types/database';
import { createDocument, deleteDocument } from './client';
import { DbError, guard } from './errors';
import { PROSPECT_SLUG_PATTERN, SLUG_PATTERN } from './validators';

/**
 * Los slugs deben ser únicos entre todas las tarjetas y prospectos. Firestore no tiene
 * restricciones únicas, así que cada slug reserva un documento en `saas_slugs` cuyo id es
 * el propio slug. Las reglas no permiten crear un documento que ya existe, y eso garantiza
 * la unicidad aunque dos personas lo intenten a la vez.
 *
 * Un slug de prospecto contiene "/", que no puede ir en un id de Firestore, así que se guarda
 * con "__" en su lugar. Los slugs de tarjeta no admiten "_", así que no hay colisiones.
 */
export function slugDocId(slug: string): string {
  return slug.replace('/', '__');
}

export function isValidCardSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function isValidProspectSlug(slug: string): boolean {
  return PROSPECT_SLUG_PATTERN.test(slug);
}

/**
 * Reserva un slug para una tarjeta o un enlace de prospecto. Lanza `CONFLICT` si ya existe.
 * Las reglas responden "permiso denegado" tanto si el slug está tomado como si el usuario no
 * puede reservarlo; en ambos casos el mensaje para el usuario es el mismo.
 */
export function reserveSlug(slug: string, kind: SlugIndex['kind'], refId: UUID, userId: UUID): Promise<SlugIndex> {
  return guard(async () => {
    try {
      return await createDocument<SlugIndex>(
        COLLECTIONS.slugs,
        slugDocId(slug),
        { kind, ref_id: refId, user_id: userId },
        []
      );
    } catch (error) {
      if (error instanceof DbError && error.code === 'PERMISSION_DENIED') {
        throw new DbError('CONFLICT', 'Ese enlace ya está en uso. Elige otro.', { cause: error });
      }
      throw error;
    }
  });
}

/** Libera un slug, por ejemplo al borrar la tarjeta o el prospecto que lo usaba. */
export function releaseSlug(slug: string): Promise<void> {
  return deleteDocument(COLLECTIONS.slugs, slugDocId(slug));
}

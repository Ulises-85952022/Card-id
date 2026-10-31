import { where } from 'firebase/firestore';
import { COLLECTIONS, type ProspectLink, type UUID } from '../../types/database';
import { deleteDocument, deleteWhere, queryDocuments, updateWhere } from './client';
import { guard } from './errors';

/**
 * Equivalente a `ON DELETE CASCADE` y `ON DELETE SET NULL` de la especificación.
 * Firestore no tiene claves foráneas, así que estas funciones recorren los hijos y los borran
 * en lotes. Los lotes no son una transacción única: si la operación se corta a la mitad,
 * repetirla termina el trabajo (cada paso filtra lo que aún existe).
 *
 * El orden importa: los hijos se borran antes que el padre, porque las reglas de Firestore
 * permiten borrar un hijo solo si la tarjeta todavía existe y pertenece al usuario.
 */

/** Borra un enlace de prospecto con sus datos sensibles, analíticas y slug reservado. */
export async function deleteProspectLinkCascade(linkId: UUID): Promise<void> {
  return guard(async () => {
    // quotes.prospect_link_id: ON DELETE SET NULL (la cotización se conserva)
    await updateWhere(COLLECTIONS.quotes, [where('prospect_link_id', '==', linkId)], { prospect_link_id: null });
    await deleteWhere(COLLECTIONS.analyticsEvents, [where('prospect_link_id', '==', linkId)]);
    await deleteWhere(COLLECTIONS.prospectLinkSecrets, [where('prospect_link_id', '==', linkId)]);
    await deleteWhere(COLLECTIONS.slugs, [where('ref_id', '==', linkId)]);
    await deleteDocument(COLLECTIONS.prospectLinks, linkId);
  });
}

/** Borra una tarjeta y todo lo que depende de ella (ON DELETE CASCADE). */
export async function deleteCardCascade(cardId: UUID): Promise<void> {
  return guard(async () => {
    const links = await queryDocuments<ProspectLink>(COLLECTIONS.prospectLinks, [where('card_id', '==', cardId)]);
    for (const link of links) {
      await deleteProspectLinkCascade(link.id);
    }
    await deleteWhere(COLLECTIONS.services, [where('card_id', '==', cardId)]);
    await deleteWhere(COLLECTIONS.testimonials, [where('card_id', '==', cardId)]);
    await deleteWhere(COLLECTIONS.quotes, [where('card_id', '==', cardId)]);
    await deleteWhere(COLLECTIONS.analyticsEvents, [where('card_id', '==', cardId)]);
    await deleteWhere(COLLECTIONS.slugs, [where('ref_id', '==', cardId)]);
    await deleteDocument(COLLECTIONS.cards, cardId);
  });
}

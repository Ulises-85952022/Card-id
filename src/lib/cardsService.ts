import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { DigitalCard, CardSummary, UserProfile, BrandInfo } from '../types';
import { USER_PROFILE, BRANDS } from '../data';

const CARDS_COLLECTION = 'cards';
const DEFAULT_ADMIN_SLUG = 'ulises-hernandez';

// Helper to convert Firestore doc to DigitalCard
function docToCard(docData: any, id: string): DigitalCard {
  return {
    id,
    slug: docData.slug || id,
    isPrimaryAdmin: !!docData.isPrimaryAdmin,
    profile: { ...USER_PROFILE, ...(docData.profile || {}) },
    brands: Array.isArray(docData.brands) && docData.brands.length > 0 ? docData.brands : BRANDS,
    createdAt: docData.createdAt || new Date().toISOString(),
    updatedAt: docData.updatedAt || new Date().toISOString(),
  };
}

// Get the default initial admin card
export function getDefaultAdminCard(): DigitalCard {
  return {
    id: DEFAULT_ADMIN_SLUG,
    slug: DEFAULT_ADMIN_SLUG,
    isPrimaryAdmin: true,
    profile: { ...USER_PROFILE },
    brands: JSON.parse(JSON.stringify(BRANDS)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Fetch all cards for the admin directory
export async function getAllCards(): Promise<DigitalCard[]> {
  try {
    const colRef = collection(db, CARDS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Seed default card
      const defaultCard = getDefaultAdminCard();
      await saveCardToCloud(defaultCard);
      return [defaultCard];
    }
    const list: DigitalCard[] = [];
    snap.forEach((d) => {
      list.push(docToCard(d.data(), d.id));
    });
    // Sort: primary admin first, then alphabetical by name
    return list.sort((a, b) => {
      if (a.isPrimaryAdmin) return -1;
      if (b.isPrimaryAdmin) return 1;
      return a.profile.name.localeCompare(b.profile.name);
    });
  } catch (error) {
    console.warn('Error fetching all cards from Firestore:', error);
    return [getDefaultAdminCard()];
  }
}

// Fetch a single card by slug (e.g. 'ulises-hernandez' or custom slug)
export async function getCardBySlug(slug: string): Promise<DigitalCard | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();
  try {
    // Try by ID first
    const docRef = doc(db, CARDS_COLLECTION, cleanSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return docToCard(snap.data(), snap.id);
    }

    // Otherwise query by slug field
    const q = query(collection(db, CARDS_COLLECTION), where('slug', '==', cleanSlug));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      return docToCard(first.data(), first.id);
    }

    return null;
  } catch (error) {
    console.warn(`Error fetching card with slug ${cleanSlug}:`, error);
    return null;
  }
}

// Save or update a card in Firestore
export async function saveCardToCloud(card: DigitalCard): Promise<{ success: boolean; error?: string }> {
  try {
    const id = card.id || card.slug;
    const docRef = doc(db, CARDS_COLLECTION, id);
    const payload = {
      id,
      slug: card.slug,
      name: card.profile?.name || '',
      title: card.profile?.title || '',
      division: card.profile?.division || '',
      company: card.profile?.company || 'AMMEGA Group',
      email: card.profile?.email || '',
      phone: card.profile?.phoneDisplay || card.profile?.phoneRaw || '',
      whatsappNumber: card.profile?.whatsappNumber || '',
      isPrimaryAdmin: !!card.isPrimaryAdmin,
      profile: card.profile,
      brands: card.brands,
      createdAt: card.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('Failed to save card to Firestore:', err);
    return { success: false, error: err?.message || 'Error al guardar en la nube' };
  }
}

// Delete a card from Firestore
export async function deleteCardFromCloud(cardId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, CARDS_COLLECTION, cardId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete card:', err);
    return { success: false, error: err?.message || 'Error al eliminar tarjeta' };
  }
}

// Helper to generate a clean URL slug from a person's name
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

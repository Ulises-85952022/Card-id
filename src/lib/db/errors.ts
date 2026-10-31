import { FirebaseError } from 'firebase/app';
import type { DbErrorCode } from '../../types/database';

/** Error de la capa de datos. `code` es estable; `message` ya está en español para el usuario. */
export class DbError extends Error {
  readonly code: DbErrorCode;

  constructor(code: DbErrorCode, message: string = MESSAGES[code], options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DbError';
    this.code = code;
  }
}

export const MESSAGES: Record<DbErrorCode, string> = {
  NOT_FOUND: 'No encontramos ese registro.',
  PERMISSION_DENIED: 'No tienes permiso para realizar esta acción.',
  UNAUTHENTICATED: 'Inicia sesión para continuar.',
  NETWORK: 'Hubo un problema de conexión. Intenta nuevamente.',
  VALIDATION: 'Revisa los datos e intenta de nuevo.',
  CONFLICT: 'Ya existe un registro con esos datos.',
  UNKNOWN: 'Hubo un problema al procesar la solicitud. Intenta nuevamente.',
};

/** Códigos de error de Firestore que traducimos a `DbErrorCode`. */
const FIRESTORE_CODES: Record<string, DbErrorCode> = {
  'permission-denied': 'PERMISSION_DENIED',
  unauthenticated: 'UNAUTHENTICATED',
  unavailable: 'NETWORK',
  'deadline-exceeded': 'NETWORK',
  'not-found': 'NOT_FOUND',
  'already-exists': 'CONFLICT',
  aborted: 'CONFLICT',
};

export function toDbError(error: unknown): DbError {
  if (error instanceof DbError) return error;
  const code = error instanceof FirebaseError ? (FIRESTORE_CODES[error.code] ?? 'UNKNOWN') : 'UNKNOWN';
  return new DbError(code, undefined, { cause: error });
}

/**
 * Interceptor de operaciones: cualquier fallo sale como `DbError`, nunca como un error
 * crudo de Firebase ni como `null` silencioso.
 */
export async function guard<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toDbError(error);
  }
}

/** Lanza `VALIDATION` con todos los errores de un formulario, si los hay. */
export function assertValid(errors: string[]): void {
  if (errors.length > 0) throw new DbError('VALIDATION', errors.join(' '));
}

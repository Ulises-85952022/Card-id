/** Mensajes de error de Firebase Auth traducidos al español para el usuario final. */

export const GENERIC_ERROR = "Hubo un problema al procesar la solicitud. Intenta nuevamente.";
export const INVALID_CREDENTIALS = "Correo o contraseña no válidos.";
export const DUPLICATE_EMAIL = "Ya existe una cuenta registrada con este correo electrónico.";
export const INVALID_LINK = "El enlace ya no es válido. Solicita uno nuevo para restablecer tu contraseña.";

const MESSAGES = {
  "auth/invalid-credential": INVALID_CREDENTIALS,
  "auth/wrong-password": INVALID_CREDENTIALS,
  "auth/user-not-found": INVALID_CREDENTIALS,
  "auth/invalid-email": INVALID_CREDENTIALS,
  "auth/email-already-in-use": DUPLICATE_EMAIL,
  "auth/weak-password": "La contraseña es demasiado débil.",
  "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  "auth/invalid-action-code": INVALID_LINK,
  "auth/expired-action-code": INVALID_LINK,
  "auth/requires-recent-login": "Por seguridad, vuelve a iniciar sesión e intenta de nuevo.",
};

export function getAuthErrorMessage(error) {
  return MESSAGES[error?.code] ?? GENERIC_ERROR;
}

/**
 * Validaciones de formularios. Cada función devuelve el mensaje de error en español
 * o "" si el valor es válido. Se evalúan en cada cambio, así que el error aparece
 * en tiempo real una vez que el campo fue tocado o se intentó enviar.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRequired(value, message) {
  return value.trim() ? "" : message;
}

export function validateEmail(value) {
  if (!value.trim()) return "Escribe tu correo electrónico.";
  return EMAIL_PATTERN.test(value.trim()) ? "" : "Escribe un correo válido, por ejemplo nombre@empresa.com.";
}

export function validateLoginPassword(value) {
  return value ? "" : "Escribe tu contraseña.";
}

/** Requisitos de la contraseña nueva: 8 caracteres, al menos un número y un carácter especial. */
export const PASSWORD_RULES = [
  { id: "length", label: "Mínimo 8 caracteres", test: (v) => v.length >= 8 },
  { id: "number", label: "Al menos un número", test: (v) => /\d/.test(v) },
  { id: "special", label: "Al menos un carácter especial (! @ # $ …)", test: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

export function validateNewPassword(value) {
  if (!value) return "Escribe una contraseña.";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/\d/.test(value)) return "Incluye al menos un número.";
  if (!/[^A-Za-z0-9\s]/.test(value)) return "Incluye al menos un carácter especial (por ejemplo ! @ # $).";
  return "";
}

export function validateConfirmation(value, password) {
  if (!value) return "Confirma tu contraseña.";
  return value === password ? "" : "Las contraseñas no coinciden.";
}

/** Fuerza de 0 a 3 según cuántos requisitos cumple la contraseña. */
export function getPasswordStrength(value) {
  const score = PASSWORD_RULES.filter((rule) => rule.test(value)).length;
  const labels = ["Muy débil", "Débil", "Aceptable", "Fuerte"];
  return { score, label: value ? labels[Math.min(score, 3)] : "", rules: PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(value) })) };
}

/** Solo acepta rutas internas para `redirect_to`, evitando redirecciones a otros sitios. */
export function safeRedirectPath(value, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

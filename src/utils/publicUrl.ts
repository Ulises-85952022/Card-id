/** Enlace público de una tarjeta. Fuera del dominio real (vista previa) usa el de Vercel. */
export function getPublicCardUrl(slug: string): string {
  if (
    typeof window !== 'undefined' &&
    window.location.protocol.startsWith('http') &&
    !window.location.hostname.includes('claude')
  ) {
    return `${window.location.origin}${window.location.pathname}?card=${slug}`;
  }
  return `https://cardwebid.vercel.app/?card=${slug}`;
}

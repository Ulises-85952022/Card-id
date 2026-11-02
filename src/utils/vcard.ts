import { USER_PROFILE } from '../data';
import { UserProfile } from '../types';

/** Escapa texto según RFC 6350 (la coma y el punto y coma separan valores en vCard). */
function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function generateVCardString(customProfile?: UserProfile, quoteUrl?: string): string {
  const p = customProfile || USER_PROFILE;
  const nameParts = p.name.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || 'Ulises';

  // Enlaces con etiqueta (itemN + X-ABLabel) para que el contacto muestre un nombre
  // claro junto a cada enlace, en vez de un campo "página web" sin contexto.
  const siteUrl = p.companyWebsite || p.brandsUrl || p.corporateUrl || '';
  const links: { url: string; label: string }[] = [];
  if (quoteUrl) links.push({ url: quoteUrl, label: 'Catálogos y tarjeta digital' });
  if (siteUrl && siteUrl !== quoteUrl) links.push({ url: siteUrl, label: 'Sitio AMMEGA' });

  const note =
    `${p.title} en ${p.company}.` +
    (p.companyDescription ? ` ${p.companyDescription}` : '') +
    ` WhatsApp: ${p.whatsappNumber}` +
    (quoteUrl ? `. Catálogos y tarjeta digital: ${quoteUrl}` : '');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(lastName)};${esc(firstName)};;;`,
    `FN:${esc(p.name)}`,
    `ORG:${esc(p.company)};${esc(p.division || 'Belting & Industrial Solutions')}`,
    `TITLE:${esc(p.title)}`,
    `TEL;TYPE=CELL,VOICE,PREF:${p.phoneRaw}`,
    `EMAIL;TYPE=INTERNET,PREF:${p.email}`,
    ...links.flatMap((link, i) => [
      `item${i + 1}.URL;TYPE=WORK:${link.url}`,
      `item${i + 1}.X-ABLabel:${esc(link.label)}`,
    ]),
    `ADR;TYPE=WORK:;;${esc(p.coverageZone || p.location || '')};;;;`,
    `NOTE:${esc(note)}`,
    'END:VCARD',
  ];

  return lines.join('\r\n') + '\r\n';
}

export function downloadVCard(customProfile?: UserProfile, quoteUrl?: string): void {
  const vcardText = generateVCardString(customProfile, quoteUrl);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `${(customProfile?.name || 'Ulises_Hernandez').replace(/\s+/g, '_')}_AMMEGA.vcf`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

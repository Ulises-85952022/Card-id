import { USER_PROFILE } from '../data';
import { UserProfile } from '../types';

export function generateVCardString(customProfile?: UserProfile): string {
  const p = customProfile || USER_PROFILE;
  const nameParts = p.name.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || 'Ulises';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${p.name}`,
    `ORG:${p.company};${p.division || 'Belting & Industrial Solutions'}`,
    `TITLE:${p.title}`,
    `TEL;TYPE=CELL,VOICE,PREF:${p.phoneRaw}`,
    `EMAIL;TYPE=INTERNET,PREF:${p.email}`,
    `URL;TYPE=WORK:${p.companyWebsite || p.brandsUrl || p.corporateUrl || ''}`,
    `ADR;TYPE=WORK:;;${p.coverageZone || p.location || ''};;;;`,
    `NOTE:${p.title} en ${p.company}.${p.companyDescription ? ' ' + p.companyDescription : ''} WhatsApp: ${p.whatsappNumber}`,
    'END:VCARD',
  ];

  return lines.join('\r\n');
}

export function downloadVCard(customProfile?: UserProfile): void {
  const vcardText = generateVCardString(customProfile);
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

/**
 * Documentos por línea de producto. Van en el código (archivos en /public/docs o enlaces
 * externos), no en Firestore, así que no se mezclan con lo que se edita desde el panel.
 * El portafolio vive en Google Drive: para actualizarlo, reemplaza el archivo en Drive
 * conservando el mismo enlace (Administrar versiones), o cambia aquí la URL.
 */
export interface BrandDocument {
  title: string;
  description: string;
  url: string;
  meta: string;
}

export const BRAND_DOCUMENTS: Record<string, BrandDocument[]> = {
  ammeraal: [
    {
      title: 'Portafolio de productos AMMEGA',
      description:
        'Catálogo completo con fichas técnicas: bandas sintéticas, modulares, ZipLink, RAPPLON, homogéneas, teflón, filtrantes, fabricaciones especiales y uniones.',
      url: 'https://drive.google.com/file/d/1-B0Kix4wezkZGs6RzHKQHqsVPRLV85Ph/view?usp=sharing',
      meta: 'PDF · 41 págs. · 08.2026 · Google Drive',
    },
    {
      title: 'Guía para configurar tu banda',
      description:
        'Esquemas para configurar tu banda (perforaciones, perfiles, empujadores, olanes y loops), cómo medir una banda instalada, guías lado polea y tipos de unión. Llénala y envíala con tu cotización.',
      url: '/docs/guia-configuracion-bandas.pdf',
      meta: 'PDF · 5 págs.',
    },
  ],
  megadyne: [
    {
      title: 'Esquema de medidas de bandas síncronas',
      description:
        'Guía rápida para identificar una banda dentada (paso, longitud, ancho y tipo de diente), esquema de medidas, medidas estándar imperiales y métricas (STD, HTB, RPP) y datos de la transmisión. Llénala y envíala con tu cotización.',
      url: '/docs/esquema-medidas-bandas-sincronas.pdf',
      meta: 'PDF · 5 págs.',
    },
  ],
};

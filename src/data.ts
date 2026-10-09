import { BrandInfo, ContactChannel, UserProfile } from './types';

export const USER_PROFILE: UserProfile = {
  name: 'Ulises Hernández',
  title: 'Key Account Manager',
  division: 'Belting & Industrial Solutions',
  company: 'AMMEGA Group',
  companyTagline: 'The Power of Motion',
  companyDescription: 'Líder global en soluciones integrales de bandas de transporte, transmisión de potencia síncrona y conducción de fluidos para la industria alimentaria, manufactura y automotriz.',
  companyWebsite: 'https://ammega.com/',
  websiteSummary: 'Catálogo y portal oficial con soluciones de ingeniería en bandas transportadoras sintéticas (Ammeraal Beltech), correas de transmisión (Megadyne) y mangueras industriales (Jason Industrial).',
  projectsSectionTitle: 'Proyectos',
  phoneDisplay: '(33) 1618 0902',
  phoneRaw: '+523316180902',
  whatsappNumber: '523316180902',
  email: 'Ulises.fraile@ammega.com',
  coverageZone: 'Guadalajara / Occidente & Bajío · México',
  brandsUrl: 'https://ammega.com/brands/',
  corporateUrl: 'https://ammega.com/',
  location: 'Guadalajara, Jalisco, México',
  bio: 'Especialista en soluciones integrales para transporte de materiales, transmisión de potencia síncrona y conducción de fluidos para la industria manufacturera, alimentaria y automotriz en la región Occidente y Bajío.',
  status: 'disponible',
};

/**
 * Sube este número cada vez que cambies las marcas oficiales: las tarjetas guardadas en la nube
 * con una versión anterior se actualizan solas al abrirse.
 */
export const BRANDS_VERSION = 2;

export const BRANDS: BrandInfo[] = [
  {
    id: 'ammeraal',
    name: 'Ammeraal Beltech',
    category: 'Bandas Transportadoras',
    categoryPill: 'Conveying',
    color: '#2563eb',
    badge: 'Bandas transportadoras y de proceso',
    description:
      'Diseño, fabricación y mantenimiento de bandas transportadoras y de proceso de alto rendimiento, para 14 industrias y estándares de higiene cada vez más exigentes.',
    keyProducts: ['Bandas modulares', 'Bandas sintéticas', 'Bandas homogéneas Soliflex'],
    subcategories: [
      {
        id: 'ab-modulares',
        title: 'Bandas Modulares',
        description:
          'Accionamiento positivo, bajo ruido y larga duración. Se arman en patrón de ladrillo a casi cualquier largo y ancho, con accesorios para cada aplicación.',
        linkUrl: 'https://bit.ly/3IcqWMk?r=qr',
      },
      {
        id: 'ab-sinteticas',
        title: 'Bandas Sintéticas',
        description:
          'Tela recubierta de polímero para transporte y procesamiento, desde trabajos ligeros hasta pesados.',
        linkUrl: 'https://bit.ly/45fjLvi?r=qr',
      },
      {
        id: 'ab-homogeneas',
        title: 'Bandas Homogéneas Soliflex',
        description:
          'Plástico homogéneo que no se deshilacha, fácil de limpiar y con menor riesgo de contaminación en alimentos.',
        linkUrl: 'https://bit.ly/4f9LVLK?r=qr',
      },
    ],
    industries: ['Alimentos y bebidas', 'Logística', 'Empaque', 'Aeropuertos', 'Tabaco'],
    officialUrl: 'https://www.ammeraalbeltech.com/es/',
    catalogUrl: 'https://www.ammeraalbeltech.com/es/',
  },
  {
    id: 'megadyne',
    name: 'Megadyne',
    category: 'Transmisión de Potencia',
    categoryPill: 'Power Transmission',
    color: '#e11d48',
    badge: 'Correas sincrónicas y en V',
    description:
      'Correas de transmisión en V y sincrónicas de poliuretano y caucho. Fabricante n.º 1 de poliuretano en el mundo, con poleas, cadenas y acoples.',
    keyProducts: ['Correas sincrónicas MEGASYNC', 'Correas abiertas MEGALINEAR', 'Correas en V y Poly V'],
    subcategories: [
      {
        id: 'mg-megasync',
        title: 'Correas Sincrónicas MEGASYNC',
        description:
          'Perfiles HTD, STD, RPP y RPC, dientes simples o dobles, sinfín o abiertas. Operan de –40 °C a +120 °C sin retensionado.',
        linkUrl: 'https://bit.ly/4ndWz7m?r=qr',
      },
      {
        id: 'mg-megalinear',
        title: 'Correas Sincrónicas Abiertas MEGALINEAR',
        description:
          'Poliuretano termoplástico en rollos abiertos o empalmadas, con refuerzo de acero o Kevlar, en medidas métricas e imperiales.',
        linkUrl: 'https://bit.ly/47ScnYK?r=qr',
      },
      {
        id: 'mg-v',
        title: 'Correas en V Multi-Plus y Poly V',
        description:
          'Emparejadas de fábrica, antiestáticas y resistentes al aceite y al calor bajo norma ARPM.',
        linkUrl: 'https://bit.ly/3I4Bfly?r=qr',
      },
    ],
    industries: ['Automatización', 'Automotriz', 'Cerámica y vidrio', 'Madera', 'Impresión'],
    officialUrl: 'https://megadynegroup.com/',
    catalogUrl: 'https://megadynegroup.com/',
  },
  {
    id: 'jason',
    name: 'Jason',
    category: 'Mangueras y Conexiones',
    categoryPill: 'Fluid Power',
    color: '#991b1b',
    badge: 'Mangueras industriales e hidráulicas',
    description:
      'Mangueras industriales e hidráulicas, acoples y equipos de ensamble, con más de seis décadas en el mercado americano.',
    keyProducts: ['Mangueras hidráulicas y conexiones', 'Mangueras industriales y acoplamientos'],
    subcategories: [
      {
        id: 'jh-hidraulicas',
        title: 'Mangueras Hidráulicas y Conexiones',
        description:
          'Mangueras R1 a R17 e isobáricas, con conexiones de 1 y 2 piezas para crimpado y acoples que muerden hasta el alambre.',
        linkUrl: 'https://bit.ly/4m8Fril?r=qr',
      },
      {
        id: 'jh-industriales',
        title: 'Mangueras Industriales y Acoplamientos',
        description:
          'Caucho, PVC, NBR, EPDM y PU para succión y descarga de aire, agua, vapor, alimentos y materiales, con acoples Cam-Lock, niples y abrazaderas.',
        linkUrl: 'https://bit.ly/4lGKWFe?r=qr',
      },
    ],
    industries: ['Petróleo', 'Minería', 'Construcción', 'Alimentos', 'Manufactura'],
    officialUrl: 'https://jasonindustrial.com/',
    catalogUrl: 'https://jasonindustrial.com/',
  },
];

export const GROUP_METRICS = [
  { value: '40+', label: 'Países Atendidos' },
  { value: '190+', label: 'Instalaciones Globales' },
  { value: '50+', label: 'Industrias' },
  { value: '6,000+', label: 'Expertos en Movimiento' },
];

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'wa-direct',
    title: 'WhatsApp Business Directo',
    value: '+52 33 1618 0902',
    actionUrl:
      'https://wa.me/523316180902?text=Hola%20Ulises%2C%20me%20comunico%20desde%20tu%20tarjeta%20digital%20AMMEGA%20para%20cotizar%20soluciones',
    icon: 'whatsapp',
    isExternal: true,
  },
  {
    id: 'phone',
    title: 'Línea Telefónica Móvil',
    value: '(33) 1618 0902',
    actionUrl: 'tel:+523316180902',
    icon: 'phone',
    isExternal: false,
  },
  {
    id: 'email',
    title: 'Correo Corporativo',
    value: 'Ulises.fraile@ammega.com',
    actionUrl: 'mailto:Ulises.fraile@ammega.com?subject=Consulta%20T%C3%A9cnica%20-%20Soluciones%20AMMEGA',
    icon: 'mail',
    isExternal: false,
  },
  {
    id: 'coverage',
    title: 'Zona de Cobertura',
    value: 'Guadalajara / Occidente & Bajío · México',
    actionUrl: 'https://maps.google.com/?q=Guadalajara,Jalisco,Mexico',
    icon: 'map-pin',
    isExternal: true,
  },
  {
    id: 'portal',
    title: 'Sitio Oficial de Marcas',
    value: 'ammega.com/brands',
    actionUrl: 'https://ammega.com/brands/',
    icon: 'globe',
    isExternal: true,
  },
];

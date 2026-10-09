/**
 * Formularios de cotización por línea de producto.
 * Cada campo lleno se incluye en el mensaje de WhatsApp; los vacíos se omiten.
 */

export type QuoteField = { msg?: string } & (
  | { id: string; label: string; type: 'chips'; options: string[]; hint?: string }
  | { id: string; label: string; type: 'multi'; options: string[]; hint?: string }
  | {
      id: string;
      label: string;
      type: 'text' | 'number';
      unit?: string;
      placeholder?: string;
      hint?: string;
      half?: boolean;
      required?: boolean;
      inputMode?: 'decimal' | 'numeric' | 'text';
    }
  | { id: string; label: string; type: 'textarea'; placeholder?: string }
);

export interface QuoteSection {
  title: string;
  /** Encabezado dentro del mensaje de WhatsApp */
  msgTitle: string;
  fields: QuoteField[];
}

/** Datos de quien solicita: iguales para todas las líneas */
export const CONTACT_SECTION: QuoteSection = {
  title: 'Tus datos',
  msgTitle: 'Contacto',
  fields: [
    { id: 'nombre', label: 'Nombre', type: 'text', required: true, half: true, placeholder: 'Tu nombre' },
    { id: 'empresa', label: 'Empresa', type: 'text', required: true, half: true, placeholder: 'Empresa' },
    { id: 'planta', msg: 'Planta', label: 'Ciudad o planta', type: 'text', placeholder: 'Ej. Planta El Salto, Jalisco' },
    { id: 'urgencia', msg: 'Urgencia', label: '¿Para cuándo lo necesitas?', type: 'chips', options: ['Línea detenida', 'Esta semana', 'Planeado'] },
  ],
};

/** Cierre común: cantidad, referencia actual y campo libre */
export const CLOSING_SECTION: QuoteSection = {
  title: 'Detalles',
  msgTitle: 'Detalles',
  fields: [
    { id: 'cantidad', msg: 'Cantidad', label: 'Cantidad de piezas', type: 'number', inputMode: 'numeric', half: true, placeholder: '1' },
    {
      id: 'codigo',
      label: 'Código actual',
      type: 'text',
      half: true,
      placeholder: 'Si lo tienes',
      hint: 'La marcación impresa en la pieza que vas a reemplazar',
    },
    { id: 'notas', msg: 'Notas', label: 'Algo más que deba saber', type: 'textarea', placeholder: 'Medidas especiales, fotos que enviarás, condiciones de la línea…' },
  ],
};

export const QUOTE_FORMS: Record<string, QuoteSection> = {
  ammeraal: {
    title: 'La banda',
    msgTitle: 'Especificaciones',
    fields: [
      {
        id: 'tipo',
        label: 'Tipo de banda',
        type: 'chips',
        options: ['Sintética PVC / PU', 'Modular plástica', 'Homogénea (Soliflex)', 'No estoy seguro'],
      },
      { id: 'ancho', label: 'Ancho', type: 'number', unit: 'mm', half: true, inputMode: 'decimal' },
      {
        id: 'largo',
        label: 'Largo',
        type: 'number',
        unit: 'mm',
        half: true,
        inputMode: 'decimal',
        hint: 'Largo total de la banda cerrada',
      },
      { id: 'espesor', label: 'Espesor', type: 'number', unit: 'mm', half: true, inputMode: 'decimal' },
      {
        id: 'rodillo',
        msg: 'Diámetro rodillo mínimo',
        label: 'Rodillo más chico',
        type: 'number',
        unit: 'mm',
        half: true,
        inputMode: 'decimal',
        hint: 'Diámetro; define qué tan flexible debe ser',
      },
      {
        id: 'union',
        label: 'Tipo de unión',
        type: 'chips',
        options: ['Sinfín vulcanizada', 'Grapas mecánicas', 'ZipLink', 'Abierta en rollo', 'No sé'],
      },
      { id: 'producto', msg: 'Transporta', label: '¿Qué transporta?', type: 'text', placeholder: 'Ej. pollo crudo, cajas, pan, piezas metálicas' },
      {
        id: 'condiciones',
        msg: 'Condiciones',
        label: 'Condiciones del producto',
        type: 'multi',
        options: ['Grado alimenticio', 'Húmedo o con lavado', 'Aceites o grasas', 'Abrasivo', 'Caliente', 'Congelado'],
        hint: 'Marca todas las que apliquen',
      },
      { id: 'recorrido', label: 'Recorrido', type: 'chips', options: ['Horizontal', 'Inclinado', 'Con curvas'] },
    ],
  },

  megadyne: {
    title: 'La banda de transmisión',
    msgTitle: 'Especificaciones',
    fields: [
      {
        id: 'tipo',
        label: 'Tipo de banda',
        type: 'chips',
        options: ['Sincrónica (MEGASYNC)', 'Abierta (MEGALINEAR)', 'En V', 'Poly V', 'No estoy seguro'],
      },
      { id: 'material', label: 'Material', type: 'chips', options: ['Poliuretano', 'Hule / neopreno', 'No sé'] },
      { id: 'construccion', label: 'Construcción', type: 'chips', options: ['Cerrada (sinfín)', 'Abierta (por metro)'] },
      { id: 'perfil', label: 'Perfil o paso', type: 'text', placeholder: 'Ej. HTD 8M, T10, AT10, B, SPZ' },
      { id: 'ancho', label: 'Ancho', type: 'number', unit: 'mm', half: true, inputMode: 'decimal' },
      {
        id: 'largo',
        label: 'Largo o dientes',
        type: 'text',
        half: true,
        placeholder: 'Ej. 1200 mm o 150 dientes',
      },
      { id: 'refuerzo', label: 'Refuerzo', type: 'chips', options: ['Acero', 'Kevlar', 'Poliéster', 'No sé'] },
      { id: 'maquina', msg: 'Máquina', label: '¿En qué máquina va?', type: 'text', placeholder: 'Ej. empacadora, transportador de rodillos, elevador' },
      { id: 'poleas', msg: 'Requiere poleas', label: '¿También necesitas poleas?', type: 'chips', options: ['Sí', 'No'] },
    ],
  },

  jason: {
    title: 'La manguera y sus conexiones',
    msgTitle: 'Especificaciones',
    fields: [
      {
        id: 'tipo',
        label: 'Tipo de manguera',
        type: 'chips',
        options: ['Hidráulica', 'Industrial', 'No estoy seguro'],
      },
      {
        id: 'norma',
        msg: 'Norma',
        label: 'Norma o tipo',
        type: 'text',
        placeholder: 'Ej. SAE 100R2, 2SN, R12, succión y descarga',
        hint: 'Viene impresa a lo largo de la manguera',
      },
      { id: 'fluido', msg: 'Conduce', label: '¿Qué conduce?', type: 'text', placeholder: 'Ej. aceite hidráulico, aire, agua, vapor, cemento' },
      {
        id: 'diametro',
        label: 'Diámetro interior',
        type: 'text',
        unit: 'pulg',
        half: true,
        inputMode: 'text',
        placeholder: 'Ej. 1/2',
      },
      { id: 'largo', label: 'Largo', type: 'number', unit: 'm', half: true, inputMode: 'decimal' },
      { id: 'presion', label: 'Presión de trabajo', type: 'number', unit: 'psi', half: true, inputMode: 'decimal' },
      { id: 'temperatura', label: 'Temperatura', type: 'number', unit: '°C', half: true, inputMode: 'decimal' },
      {
        id: 'conexiones',
        label: 'Conexiones',
        type: 'chips',
        options: ['Sin conexiones', 'Hidráulicas crimpadas', 'Cam-Lock', 'Roscada (NPT / JIC)', 'Otra'],
      },
      { id: 'ensamble', msg: 'Entrega', label: 'Entrega', type: 'chips', options: ['Solo manguera', 'Ensamble armado'] },
    ],
  },
};

/** Respaldo para marcas nuevas agregadas desde el panel de administración */
export const GENERIC_FORM: QuoteSection = {
  title: 'El producto',
    msgTitle: 'Especificaciones',
  fields: [
    { id: 'producto', msg: 'Producto', label: '¿Qué necesitas?', type: 'text', placeholder: 'Describe el producto' },
    { id: 'medidas', label: 'Medidas', type: 'text', placeholder: 'Ancho, largo, diámetro…' },
  ],
};

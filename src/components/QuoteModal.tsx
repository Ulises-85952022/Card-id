import React, { useState } from 'react';
import { X, Send, Calculator, AlertCircle } from 'lucide-react';
import { BRANDS, USER_PROFILE } from '../data';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrandId?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  initialBrandId,
}) => {
  const [selectedBrand, setSelectedBrand] = useState(
    initialBrandId || BRANDS[0].id
  );
  const [inquiryType, setInquiryType] = useState('cotizacion');
  const [urgency, setUrgency] = useState('media');
  const [plantLocation, setPlantLocation] = useState('');
  const [details, setDetails] = useState('');
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');

  if (!isOpen) return null;

  const currentBrand = BRANDS.find((b) => b.id === selectedBrand) || BRANDS[0];

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const brandName = currentBrand.name;
    const typeLabel =
      inquiryType === 'reemplazo'
        ? 'Reemplazo Urgente de Banda/Correa/Manguera'
        : inquiryType === 'nueva-linea'
        ? 'Nueva Línea / Proyecto'
        : 'Cotización General de Producto';

    const urgencyLabel =
      urgency === 'alta' ? '🚨 URGENTE (Línea detenida)' : urgency === 'media' ? 'Media (Esta semana)' : 'Planificada';

    const msg = [
      `*SOLICITUD TÉCNICA - AMMEGA*`,
      `*De:* ${contactName || 'Cliente Industrial'}${companyName ? ` (${companyName})` : ''}`,
      `*Planta / Ubicación:* ${plantLocation || 'Occidente / Bajío'}`,
      `*Marca de Interés:* ${brandName}`,
      `*Tipo:* ${typeLabel}`,
      `*Prioridad:* ${urgencyLabel}`,
      details ? `*Detalles:* ${details}` : '',
      `\n_Enviado desde la tarjeta digital de Ulises Hernández_`,
    ]
      .filter(Boolean)
      .join('\n');

    const waUrl = `https://wa.me/${USER_PROFILE.whatsappNumber}?text=${encodeURIComponent(
      msg
    )}`;
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <div
      id="quote-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="quote-modal-card"
        className="relative w-full max-w-md my-6 rounded-3xl bg-[#0f1d24] border border-cyan-500/30 p-6 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-quote-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Solicitud de Asesoría & Cotización
            </h3>
            <p className="text-xs text-slate-400">
              Atención técnica directa con Ulises Hernández
            </p>
          </div>
        </div>

        <form onSubmit={handleSendWhatsApp} className="space-y-3.5">
          {/* Brand selector */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-300 uppercase mb-1.5">
              Marca o Solución
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBrand(b.id)}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                    selectedBrand === b.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {b.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Company */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                Tu Nombre
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ing. Carlos Pérez"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                Empresa
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Grupo Industrial"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              Ciudad / Parque Industrial
            </label>
            <input
              type="text"
              value={plantLocation}
              onChange={(e) => setPlantLocation(e.target.value)}
              placeholder="Ej. El Salto, Zapopan, León, Silao, Querétaro"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('alta')}
                className={`py-1.5 px-2 text-center rounded-xl text-[11px] font-bold border transition-all ${
                  urgency === 'alta'
                    ? 'bg-rose-500/25 border-rose-500 text-rose-300'
                    : 'bg-black/30 border-white/10 text-slate-400'
                }`}
              >
                🚨 Urgente
              </button>
              <button
                type="button"
                onClick={() => setUrgency('media')}
                className={`py-1.5 px-2 text-center rounded-xl text-[11px] font-bold border transition-all ${
                  urgency === 'media'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                    : 'bg-black/30 border-white/10 text-slate-400'
                }`}
              >
                Media
              </button>
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-1.5 px-2 text-center rounded-xl text-[11px] font-bold border transition-all ${
                  urgency === 'normal'
                    ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300'
                    : 'bg-black/30 border-white/10 text-slate-400'
                }`}
              >
                Planificada
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">
              Descripción del Requerimiento / Medidas
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Ej. Reemplazo de banda modular plástica ancho 450mm o correa dentada HTD 8M..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            ></textarea>
          </div>

          {/* Send via WhatsApp */}
          <button
            type="submit"
            id="btn-submit-quote-whatsapp"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Enviar Solicitud por WhatsApp a Ulises
          </button>
        </form>
      </div>
    </div>
  );
};

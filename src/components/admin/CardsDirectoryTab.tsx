import React, { useState } from 'react';
import { useAppConfig } from '../../context/ConfigContext';
import { DigitalCard } from '../../types';
import {
  Plus,
  Link,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit3,
  UserCheck,
  Sparkles,
  Search,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { slugify } from '../../lib/cardsService';

interface CardsDirectoryTabProps {
  onSelectEditCard: (slug: string) => void;
  onShowToast: (msg: string) => void;
}

export const CardsDirectoryTab: React.FC<CardsDirectoryTabProps> = ({
  onSelectEditCard,
  onShowToast,
}) => {
  const {
    cardsList,
    currentCard,
    switchActiveCard,
    createCard,
    removeCard,
    refreshCardsList,
  } = useAppConfig();

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Form for creating new card
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('Ingeniero de Ventas y Aplicaciones');
  const [newDivision, setNewDivision] = useState('Belting & Fluid Power Solutions');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+52 442 227 0000');
  const [newAddress, setNewAddress] = useState('Parque Industrial Querétaro / Ciudad de México');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-slugify when name changes
  const handleNameChange = (val: string) => {
    setNewName(val);
    if (!newSlug || newSlug === slugify(newName)) {
      setNewSlug(slugify(val));
    }
  };

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const publicUrl = `${origin}${path}?card=${slug}`;

    navigator.clipboard.writeText(publicUrl);
    setCopiedSlug(slug);
    onShowToast(`Enlace copiado: ?card=${slug}`);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim() || !newEmail.trim()) {
      onShowToast('Por favor completa nombre, identificador de link y correo.');
      return;
    }

    setIsSubmitting(true);
    const res = await createCard({
      name: newName,
      slug: newSlug,
      title: newTitle,
      division: newDivision,
      email: newEmail,
      phone: newPhone,
      whatsappNumber: newPhone.replace(/\D/g, ''),
      address: newAddress,
    });
    setIsSubmitting(false);

    if (res.success && res.card) {
      onShowToast(`¡Tarjeta "${res.card.profile.name}" creada con éxito!`);
      setIsCreating(false);
      setNewName('');
      setNewSlug('');
      setNewEmail('');
      // Switch to editing the newly created card
      switchActiveCard(res.card.slug);
    } else {
      onShowToast(res.error || 'Error al crear tarjeta');
    }
  };

  const handleDeleteCard = async (card: DigitalCard) => {
    if (card.isPrimaryAdmin || card.slug === 'ulises-hernandez') {
      onShowToast('No se puede eliminar la tarjeta principal del Administrador.');
      return;
    }
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la tarjeta de "${card.profile.name}" (${card.slug})?`
    );
    if (!confirmed) return;

    const res = await removeCard(card.id);
    if (res.success) {
      onShowToast('Tarjeta eliminada correctamente');
    } else {
      onShowToast(res.error || 'Error al eliminar');
    }
  };

  const filteredCards = cardsList.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.profile.name.toLowerCase().includes(term) ||
      c.slug.toLowerCase().includes(term) ||
      c.profile.title.toLowerCase().includes(term) ||
      c.profile.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top action banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Plataforma Multi-Tarjetas AMMEGA
          </h3>
          <p className="text-xs text-slate-300">
            Crea links personalizados para ejecutivos, asesores o sucursales con guardado en la nube.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="py-1.5 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isCreating ? 'Cancelar' : 'Crear Nueva Tarjeta'}</span>
        </button>
      </div>

      {/* Creation form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-4 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Nueva Tarjeta de Presentación Digital
            </h4>
            <span className="text-[11px] text-slate-400">Guarda en Firestore</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Ing. Carlos Mendoza"
                className="w-full bg-[#081318] border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Identificador de Link (Slug URL) *
              </label>
              <div className="flex items-center">
                <span className="px-2 py-2 bg-white/5 border border-r-0 border-white/15 rounded-l-xl text-slate-400 text-[11px]">
                  ?card=
                </span>
                <input
                  type="text"
                  required
                  value={newSlug}
                  onChange={(e) => setNewSlug(slugify(e.target.value))}
                  placeholder="carlos-mendoza"
                  className="w-full bg-[#081318] border border-white/15 rounded-r-xl px-3 py-2 text-cyan-300 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Cargo o Puesto Profesional
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Asesor Técnico Comercial"
                className="w-full bg-[#081318] border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                División Corporativa
              </label>
              <input
                type="text"
                value={newDivision}
                onChange={(e) => setNewDivision(e.target.value)}
                placeholder="Ej: Belting & Fluid Power Solutions"
                className="w-full bg-[#081318] border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="carlos.mendoza@ammega.com"
                className="w-full bg-[#081318] border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full bg-[#081318] border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Ubicación / Planta
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Parque Industrial Querétaro / Ciudad de México"
                className="w-full bg-[#081318] border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-1.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              {isSubmitting ? 'Guardando en la nube...' : 'Publicar Tarjeta'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Counter bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, enlace o correo..."
            className="w-full bg-[#071318] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <span className="text-[11px] text-slate-400 whitespace-nowrap">
          {cardsList.length} {cardsList.length === 1 ? 'tarjeta' : 'tarjetas'} en la nube
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
        {filteredCards.map((card) => {
          const isSelected = currentCard.slug === card.slug;
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const path = typeof window !== 'undefined' ? window.location.pathname : '/';
          const cardUrl = `${origin}${path}?card=${card.slug}`;

          return (
            <div
              key={card.id || card.slug}
              className={`p-3 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400/50 shadow-[0_0_15px_rgba(0,168,181,0.15)]'
                  : 'bg-white/[0.03] border-white/[0.08] hover:border-cyan-500/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Info */}
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-teal-800 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                    {card.profile.name.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white">{card.profile.name}</h4>
                      {card.isPrimaryAdmin && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                          Admin Principal
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
                          Viendo ahora
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{card.profile.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-cyan-400/90 font-mono mt-0.5">
                      <span>?card={card.slug}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{card.profile.email}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(card.slug)}
                    className="py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title="Copiar enlace público para clientes"
                  >
                    {copiedSlug === card.slug ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>Copiar link</span>
                      </>
                    )}
                  </button>

                  {/* Switch to this card */}
                  {!isSelected ? (
                    <button
                      type="button"
                      onClick={() => switchActiveCard(card.slug)}
                      className="py-1 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      title="Cargar esta tarjeta en la vista previa"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Cargar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectEditCard(card.slug)}
                      className="py-1 px-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                      title="Editar datos de esta tarjeta"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  )}

                  {/* Delete (only for non-admin cards) */}
                  {!card.isPrimaryAdmin && card.slug !== 'ulises-hernandez' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredCards.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-xs">
            No se encontraron tarjetas que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};

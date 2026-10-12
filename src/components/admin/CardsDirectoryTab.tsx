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
  Camera,
} from 'lucide-react';
import { slugify } from '../../lib/cardsService';
import { BusinessCardScannerModal } from '../BusinessCardScannerModal';
import { ScannedCardData } from '../../types';

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Form for creating new card
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('Ingeniero de Ventas y Aplicaciones');
  const [newDivision, setNewDivision] = useState('Belting & Fluid Power Solutions');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+52 442 227 0000');
  const [newAddress, setNewAddress] = useState('Parque Industrial Querétaro / Ciudad de México');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyScannedToNew = (data: ScannedCardData) => {
    setIsCreating(true);
    if (data.name) {
      setNewName(data.name);
      setNewSlug(slugify(data.name));
    }
    if (data.title) setNewTitle(data.title);
    if (data.division) setNewDivision(data.division);
    if (data.email) setNewEmail(data.email);
    if (data.phone) setNewPhone(data.phone);
    if (data.location) setNewAddress(data.location);
    onShowToast('¡Tarjeta escaneada con éxito! Revisa los datos y pulsa "Crear Tarjeta y Guardar".');
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-niebla border border-linea">
        <div>
          <h3 className="text-sm font-bold text-tinta flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-stone" />
            Plataforma Multi-Tarjetas AMMEGA
          </h3>
          <p className="text-xs text-tinta">
            Crea links personalizados para ejecutivos, asesores o sucursales con guardado en la nube.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-stone hover:brightness-110 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="Escanear tarjeta física con la cámara o subir imagen"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Escanear Tarjeta (IA)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="py-1.5 px-3.5 rounded-xl bg-stone hover:bg-stone-hondo text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreating ? 'Cancelar' : 'Crear Manual'}</span>
          </button>
        </div>
      </div>

      {/* Creation form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-4 rounded-2xl bg-niebla border border-stone/30 space-y-3 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-linea pb-2">
            <h4 className="text-xs font-bold text-stone uppercase tracking-wider">
              Nueva Tarjeta de Presentación Digital
            </h4>
            <span className="text-[11px] text-acero">Guarda en Firestore</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-tinta font-semibold mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Ing. Carlos Mendoza"
                className="w-full bg-niebla border border-linea rounded-xl px-3 py-2 text-tinta placeholder:text-acero focus:border-stone focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-tinta font-semibold mb-1">
                Identificador de Link (Slug URL) *
              </label>
              <div className="flex items-center">
                <span className="px-2 py-2 bg-niebla border border-r-0 border-linea rounded-l-xl text-acero text-[11px]">
                  ?card=
                </span>
                <input
                  type="text"
                  required
                  value={newSlug}
                  onChange={(e) => setNewSlug(slugify(e.target.value))}
                  placeholder="carlos-mendoza"
                  className="w-full bg-niebla border border-linea rounded-r-xl px-3 py-2 text-stone placeholder:text-acero focus:border-stone focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-tinta font-semibold mb-1">
                Cargo o Puesto Profesional
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ej: Asesor Técnico Comercial"
                className="w-full bg-niebla border border-linea rounded-xl px-3 py-2 text-tinta placeholder:text-acero focus:border-stone focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-tinta font-semibold mb-1">
                División Corporativa
              </label>
              <input
                type="text"
                value={newDivision}
                onChange={(e) => setNewDivision(e.target.value)}
                placeholder="Ej: Belting & Fluid Power Solutions"
                className="w-full bg-niebla border border-linea rounded-xl px-3 py-2 text-tinta placeholder:text-acero focus:border-stone focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-tinta font-semibold mb-1">
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="carlos.mendoza@ammega.com"
                className="w-full bg-niebla border border-linea rounded-xl px-3 py-2 text-tinta placeholder:text-acero focus:border-stone focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-tinta font-semibold mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full bg-niebla border border-linea rounded-xl px-3 py-2 text-tinta placeholder:text-acero focus:border-stone focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-tinta font-semibold mb-1">
                Ubicación / Planta
              </label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Parque Industrial Querétaro / Ciudad de México"
                className="w-full bg-niebla border border-linea rounded-xl px-3 py-2 text-tinta placeholder:text-acero focus:border-stone focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="py-1.5 px-3 rounded-xl bg-niebla hover:bg-niebla text-tinta text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-1.5 px-4 rounded-xl bg-stone hover:bg-stone-hondo disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              {isSubmitting ? 'Guardando en la nube...' : 'Publicar Tarjeta'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Counter bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-acero" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, enlace o correo..."
            className="w-full bg-niebla border border-linea rounded-xl pl-8 pr-3 py-1.5 text-xs text-tinta placeholder:text-acero focus:outline-none focus:border-stone"
          />
        </div>
        <span className="text-[11px] text-acero whitespace-nowrap">
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
                  ? 'bg-lima/25 border-stone shadow-md'
                  : 'bg-white border-linea hover:border-stone/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Info */}
                <div className="flex items-start gap-2.5">
                  {card.profile.avatarUrl ? (
                    <img
                      src={card.profile.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover object-top border border-linea shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-stone text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                      {card.profile.name.charAt(0) || 'A'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-tinta">{card.profile.name}</h4>
                      {card.isPrimaryAdmin && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-navajo border border-linea text-tinta">
                          Admin Principal
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-lima border border-stone/40 text-stone">
                          Viendo ahora
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-acero">{card.profile.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-stone font-mono mt-0.5">
                      <span>?card={card.slug}</span>
                      <span className="text-acero">•</span>
                      <span className="text-acero">{card.profile.email}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyLink(card.slug)}
                    className="py-1 px-2.5 rounded-lg bg-niebla hover:bg-niebla text-stone border border-linea text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title="Copiar enlace público para clientes"
                  >
                    {copiedSlug === card.slug ? (
                      <>
                        <Check className="w-3 h-3 text-wa" />
                        <span className="text-wa">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone" />
                        <span>Copiar link</span>
                      </>
                    )}
                  </button>

                  {/* Ver la tarjeta pública tal como la ven los clientes */}
                  <a
                    href={cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-2.5 rounded-lg bg-white hover:bg-niebla text-stone border border-linea text-[11px] font-medium flex items-center gap-1 transition-colors"
                    title="Abrir la tarjeta pública"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Ver</span>
                  </a>

                  {/* Editar: carga esta tarjeta y abre sus datos */}
                  <button
                    type="button"
                    onClick={() => onSelectEditCard(card.slug)}
                    className="py-1 px-3 rounded-lg bg-stone hover:bg-stone-hondo text-white text-[12px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                    title="Editar los datos de esta tarjeta"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  {/* Delete (only for non-admin cards) */}
                  {!card.isPrimaryAdmin && card.slug !== 'ulises-hernandez' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
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
          <div className="text-center py-6 text-acero text-xs">
            No se encontraron tarjetas que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Card Scanner Modal for Directory */}
      <BusinessCardScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onApplyData={handleApplyScannedToNew}
      />
    </div>
  );
};

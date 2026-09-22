import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  RotateCcw,
  Download,
  Upload,
  Check,
  Tag,
  Building2,
  User,
  Sliders,
  Layers,
  FileText,
  AlertCircle,
  Copy,
  Users,
  Cloud,
  ChevronDown,
  Camera,
  Sparkles,
} from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { BrandSubcategory, DigitalCard, ScannedCardData } from '../types';
import { CardsDirectoryTab } from './admin/CardsDirectoryTab';
import { BusinessCardScannerModal } from './BusinessCardScannerModal';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrandId?: string;
}

type AdminTab = 'directorio' | 'perfil' | 'subcategorias' | 'exportar';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  initialBrandId,
}) => {
  const {
    currentCard,
    profile,
    brands,
    updateProfile,
    updateBrand,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    saveCurrentCard,
    cardsList,
    switchActiveCard,
    resetToDefaults,
    exportJson,
    importJson,
    setIsAdminMode,
    cloudSyncStatus,
    lastCloudSavedAt,
  } = useAppConfig();

  const [activeTab, setActiveTab] = useState<AdminTab>(initialBrandId ? 'subcategorias' : 'directorio');
  const [selectedBrandId, setSelectedBrandId] = useState<string>(
    initialBrandId || (brands[0]?.id ?? 'ammeraal')
  );

  // Subcategory form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [subTitle, setSubTitle] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subLinkUrl, setSubLinkUrl] = useState('');
  const [subBadge, setSubBadge] = useState('');

  // Profile form state (synced with active profile)
  const [profileForm, setProfileForm] = useState(profile);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleApplyScannedData = (data: ScannedCardData) => {
    setProfileForm((prev) => ({
      ...prev,
      name: data.name || prev.name,
      title: data.title || prev.title,
      company: data.company || prev.company,
      companyDescription: data.companyDescription || prev.companyDescription,
      division: data.division || prev.division,
      email: data.email || prev.email,
      phoneDisplay: data.phone || prev.phoneDisplay,
      phoneRaw: data.phone ? data.phone.replace(/[^\d+]/g, '') : prev.phoneRaw,
      whatsappNumber: data.whatsapp ? data.whatsapp.replace(/\D/g, '') : prev.whatsappNumber,
      companyWebsite: data.website || prev.companyWebsite,
      corporateUrl: data.website || prev.corporateUrl,
      location: data.location || prev.location,
    }));
    showToast('¡Datos de tarjeta extraídos y aplicados con éxito!');
  };

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  useEffect(() => {
    if (initialBrandId) {
      setSelectedBrandId(initialBrandId);
      setActiveTab('subcategorias');
    }
  }, [initialBrandId]);

  useEffect(() => {
    setProfileForm(currentCard.profile);
  }, [currentCard]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];
  const subcategories = selectedBrand?.subcategories || [];

  const handleOpenAddForm = () => {
    setEditingSubId(null);
    setSubTitle('');
    setSubDescription('');
    setSubLinkUrl('');
    setSubBadge('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (sub: BrandSubcategory) => {
    setEditingSubId(sub.id);
    setSubTitle(sub.title);
    setSubDescription(sub.description);
    setSubLinkUrl(sub.linkUrl || '');
    setSubBadge(sub.badge || '');
    setIsFormOpen(true);
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !subDescription.trim()) {
      showToast('Por favor completa el título y la descripción');
      return;
    }

    if (editingSubId) {
      updateSubcategory(selectedBrand.id, editingSubId, {
        title: subTitle.trim(),
        description: subDescription.trim(),
        linkUrl: subLinkUrl.trim() || undefined,
        badge: subBadge.trim() || undefined,
      });
      showToast('Subcategoría actualizada. Guardando en la nube...');
    } else {
      addSubcategory(selectedBrand.id, {
        title: subTitle.trim(),
        description: subDescription.trim(),
        linkUrl: subLinkUrl.trim() || undefined,
        badge: subBadge.trim() || undefined,
      });
      showToast('Subcategoría agregada. Guardando en la nube...');
    }

    setIsFormOpen(false);
    setEditingSubId(null);

    // Auto-persist to cloud
    await saveCurrentCard();
  };

  const handleDeleteSub = async (subId: string) => {
    if (confirm('¿Deseas eliminar esta subcategoría?')) {
      deleteSubcategory(selectedBrand.id, subId);
      showToast('Subcategoría eliminada. Guardando...');
      await saveCurrentCard();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    const res = await saveCurrentCard();
    if (res.success) {
      showToast('¡Datos guardados con éxito en la nube (Firestore)!');
    } else {
      showToast(res.error || 'Error al guardar en la nube');
    }
  };

  const handleSaveAllToCloud = async () => {
    updateProfile(profileForm);
    const res = await saveCurrentCard();
    if (res.success) {
      showToast('¡Todo guardado en la nube (Firestore)!');
    } else {
      showToast(res.error || 'Error al guardar');
    }
  };

  const handleDownloadConfig = () => {
    const jsonStr = exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ammega-card-${currentCard.slug}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo descargado');
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportJson());
    showToast('Configuración copiada al portapapeles');
  };

  const handleApplyImport = () => {
    if (!importText.trim()) return;
    const res = importJson(importText.trim());
    if (res.success) {
      showToast('Configuración importada exitosamente');
      setShowImportBox(false);
      setImportText('');
      saveCurrentCard();
    } else {
      alert(`Error al importar: ${res.error}`);
    }
  };

  const handleReset = () => {
    if (confirm('¿Restablecer esta tarjeta a sus valores predeterminados de AMMEGA?')) {
      resetToDefaults();
      showToast('Valores restablecidos');
      saveCurrentCard();
    }
  };

  return (
    <div
      id="admin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[94vh] rounded-[28px] bg-[#0c1a20] border border-cyan-500/30 shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] leading-tight">
                  Panel Administrador AMMEGA
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5" />
                  Cloud Firestore
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Crea enlaces, gestiona tarjetas corporativas y guarda en la nube
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Save Cloud Button */}
            <button
              type="button"
              onClick={handleSaveAllToCloud}
              disabled={cloudSyncStatus === 'syncing'}
              className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              title="Guardar todos los cambios en Firestore"
            >
              {cloudSyncStatus === 'syncing' ? (
                <>
                  <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : cloudSyncStatus === 'saved' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Nube</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                onClose();
              }}
              className="py-1.5 px-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-[11px] font-medium transition-all hidden sm:inline-flex"
              title="Ocultar modo administrador y volver a la vista pública de clientes"
            >
              Salir de Admin
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Card Bar (shows what card is currently active) */}
        <div className="px-5 py-2 bg-cyan-950/20 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Tarjeta activa:</span>
            <span className="font-bold text-cyan-300">{currentCard.profile.name}</span>
            <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
              ?card={currentCard.slug}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Cambiar:</span>
            <select
              value={currentCard.slug}
              onChange={(e) => switchActiveCard(e.target.value)}
              className="bg-[#071318] border border-white/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {cardsList.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.profile.name} ({c.slug})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 py-1.5 px-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5" />
            {toastMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#09151b] px-4 pt-2 gap-1.5 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('directorio')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'directorio'
                ? 'border-cyan-400 text-cyan-300 bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tarjetas y Enlaces</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">
              {cardsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'perfil'
                ? 'border-cyan-400 text-cyan-300 bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Datos de la Tarjeta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subcategorias')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'subcategorias'
                ? 'border-cyan-400 text-cyan-300 bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{profileForm.projectsSectionTitle || 'Proyectos y Líneas'}</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">
              {subcategories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exportar')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'exportar'
                ? 'border-cyan-400 text-cyan-300 bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Acceso y Respaldo</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: DIRECTORIO DE TARJETAS Y ENLACES */}
          {activeTab === 'directorio' && (
            <CardsDirectoryTab
              onSelectEditCard={(slug) => {
                switchActiveCard(slug);
                setActiveTab('perfil');
              }}
              onShowToast={showToast}
            />
          )}

          {/* TAB 2: DATOS DEL PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-4">
              {/* Business Card Scanner AI Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/60 to-teal-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Escanear Tarjeta de Presentación Física (IA)</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Toma una foto a la tarjeta física para autocompletar nombre, empresa, puesto, web y teléfono.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Escanear Tarjeta</span>
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Editando perfil de: </span>
                    <span className="font-bold text-white">{currentCard.profile.name}</span>
                  </div>
                  <span className="text-cyan-400 font-mono text-[11px]">
                    Enlace: ?card={currentCard.slug}
                  </span>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Puesto / Título *
                  </label>
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, title: e.target.value })
                    }
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    División Corporativa
                  </label>
                  <input
                    type="text"
                    value={profileForm.division}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, division: e.target.value })
                    }
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Empresa / Grupo
                  </label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, company: e.target.value })
                    }
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Teléfono (Formato Visual)
                  </label>
                  <input
                    type="text"
                    value={profileForm.phoneDisplay}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phoneDisplay: e.target.value })
                    }
                    placeholder="(33) 1618 0902"
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Número WhatsApp (con código de país, ej: 523316180902)
                  </label>
                  <input
                    type="text"
                    value={profileForm.whatsappNumber}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, whatsappNumber: e.target.value })
                    }
                    placeholder="523316180902"
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Correo Electrónico Único *
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    placeholder="contacto@empresa.com"
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              {/* Ficha Empresarial y Presencia Web (Genérico) */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ficha Empresarial y Presencia Web</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Página Web Oficial (URL)
                    </label>
                    <input
                      type="url"
                      value={profileForm.companyWebsite || ''}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, companyWebsite: e.target.value })
                      }
                      placeholder="https://empresa.com"
                      className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Título de Sección de Proyectos
                    </label>
                    <input
                      type="text"
                      value={profileForm.projectsSectionTitle || 'Proyectos'}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, projectsSectionTitle: e.target.value })
                      }
                      placeholder="Proyectos (o Marcas / Soluciones)"
                      className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      ¿A qué se dedican? (Giro y Actividad de la Empresa)
                    </label>
                    <textarea
                      value={profileForm.companyDescription || ''}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, companyDescription: e.target.value })
                      }
                      rows={2}
                      placeholder="Ej: Fabricación de bandas transportadoras inteligentes, correas de transmisión y componentes de potencia para la industria pesada..."
                      className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Resumen del Sitio Web y Catálogo
                    </label>
                    <textarea
                      value={profileForm.websiteSummary || ''}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, websiteSummary: e.target.value })
                      }
                      rows={2}
                      placeholder="Ej: Catálogo interactivo de productos, calculadoras de ingeniería, fichas técnicas y asistencia técnica..."
                      className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Dirección Física / Ubicación de Planta
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, location: e.target.value })
                    }
                    placeholder="Planta Tlalnepantla / Querétaro / Guadalajara"
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    URL de Fotografía / Avatar
                  </label>
                  <input
                    type="text"
                    value={profileForm.avatarUrl || ''}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, avatarUrl: e.target.value })
                    }
                    placeholder="https://... o deja vacío para foto default"
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Zona de Cobertura
                </label>
                <input
                  type="text"
                  value={profileForm.coverageZone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, coverageZone: e.target.value })
                  }
                  className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Biografía / Extracto Profesional
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Guardar en Firestore
                </button>
              </div>
            </form>
          </div>
        )}

          {/* TAB 3: MARCAS Y SUBCATEGORÍAS */}
          {activeTab === 'subcategorias' && (
            <div className="space-y-4">
              {/* Brand Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Selecciona la marca para gestionar sus subcategorías:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBrandId(b.id);
                        setIsFormOpen(false);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                        selectedBrandId === b.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      {b.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header and Add Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedBrand.name}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {subcategories.length} subcategorías registradas
                  </p>
                </div>

                {!isFormOpen && (
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Subcategoría</span>
                  </button>
                )}
              </div>

              {/* Subcategory form */}
              {isFormOpen && (
                <form
                  onSubmit={handleSaveSubcategory}
                  className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-3 animate-in fade-in duration-150 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-cyan-300">
                      {editingSubId ? 'Editar Subcategoría' : 'Nueva Subcategoría'} ({selectedBrand.name.split(' ')[0]})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Título de la Línea / Producto *
                      </label>
                      <input
                        type="text"
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                        placeholder="Ej: Bandas de Poliuretano MegaLinear"
                        className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Descripción Técnica *
                      </label>
                      <textarea
                        value={subDescription}
                        onChange={(e) => setSubDescription(e.target.value)}
                        placeholder="Describe aplicaciones, especificaciones o sectores clave..."
                        rows={2}
                        className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Enlace / URL de Ficha Técnica
                        </label>
                        <input
                          type="url"
                          value={subLinkUrl}
                          onChange={(e) => setSubLinkUrl(e.target.value)}
                          placeholder="https://ammega.com/..."
                          className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Distintivo / Badge (Opcional)
                        </label>
                        <input
                          type="text"
                          value={subBadge}
                          onChange={(e) => setSubBadge(e.target.value)}
                          placeholder="Ej: FDA / Grado Alimenticio"
                          className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Guardar y Sincronizar
                    </button>
                  </div>
                </form>
              )}

              {/* Subcategories list */}
              <div className="space-y-2">
                {subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/30 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{sub.title}</span>
                        {sub.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {sub.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {sub.description}
                      </p>
                      {sub.linkUrl && (
                        <a
                          href={sub.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
                        >
                          <span>{sub.linkUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditForm(sub)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSub(sub.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESO Y RESPALDO */}
          {activeTab === 'exportar' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">
                    Persistencia en la Nube (Google Cloud Firestore)
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Todas las tarjetas y cambios que realices se almacenan directamente en la base de datos de Firestore.
                    Cualquier persona que abra el enlace público de una tarjeta verá los datos actualizados al instante en cualquier celular o equipo.
                  </p>
                </div>
              </div>

              {/* Private admin link info */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <h5 className="font-bold text-cyan-300 text-xs">
                  Tu Enlace Privado de Administrador
                </h5>
                <p className="text-[11px] text-slate-300">
                  Para ingresar como administrador en cualquier dispositivo sin que tus clientes vean el botón:
                </p>
                <div className="flex items-center gap-2 bg-[#071318] p-2 rounded-xl border border-white/10 font-mono text-[11px] text-cyan-300">
                  <span className="truncate flex-1">
                    {typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''}?admin=1
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const url = (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '') + '?admin=1';
                      navigator.clipboard.writeText(url);
                      showToast('Enlace de admin copiado');
                    }}
                    className="p-1 px-2 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-[10px] font-bold shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadConfig}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.08] text-left transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Descargar Respaldo JSON</div>
                    <div className="text-[10px] text-slate-400">
                      Copia local de seguridad de esta tarjeta
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.08] text-left transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">Copiar al Portapapeles</div>
                    <div className="text-[10px] text-slate-400">
                      Copia todo el JSON para compartir
                    </div>
                  </div>
                </button>
              </div>

              {/* Import box toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportBox(!showImportBox)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {showImportBox ? 'Ocultar importador' : 'Importar configuración desde texto JSON'}
                </button>

                {showImportBox && (
                  <div className="mt-2 p-3 rounded-2xl bg-black/40 border border-white/15 space-y-2">
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Pega aquí el código JSON de respaldo..."
                      rows={4}
                      className="w-full bg-[#0a151a] border border-white/15 rounded-xl p-2.5 text-[11px] font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyImport}
                      className="py-1.5 px-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95"
                    >
                      Aplicar y Guardar en la Nube
                    </button>
                  </div>
                )}
              </div>

              {/* Reset to factory button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-300 text-xs">
                    Restablecer valores iniciales
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Vuelve a la configuración de fábrica de AMMEGA
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restablecer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Business Card Scanner Modal */}
        <BusinessCardScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onApplyData={handleApplyScannedData}
        />
      </div>
    </div>
  );
};

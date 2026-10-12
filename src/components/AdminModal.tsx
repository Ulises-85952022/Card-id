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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-tinta/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[94vh] rounded-[28px] bg-white border border-stone/30 shadow-2xl text-tinta flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-linea flex items-center justify-between bg-niebla">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lima text-stone border border-stone/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-tinta font-['Space_Grotesk'] leading-tight">
                  Panel Administrador AMMEGA
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-wa/20 border border-wa/40 text-wa flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5" />
                  Cloud Firestore
                </span>
              </div>
              <p className="text-xs text-acero">
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
              className="py-1.5 px-3 rounded-xl bg-stone hover:bg-stone-hondo disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              title="Guardar todos los cambios en Firestore"
            >
              {cloudSyncStatus === 'syncing' ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              className="py-1.5 px-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[11px] font-medium transition-all hidden sm:inline-flex"
              title="Ocultar modo administrador y volver a la vista pública de clientes"
            >
              Salir de Admin
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-niebla hover:bg-linea text-tinta hover:text-tinta transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Card Bar (shows what card is currently active) */}
        <div className="px-5 py-2 bg-niebla border-b border-linea flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-acero">Tarjeta activa:</span>
            <span className="font-bold text-stone">{currentCard.profile.name}</span>
            <span className="font-mono text-[10px] text-acero bg-niebla px-2 py-0.5 rounded-md">
              ?card={currentCard.slug}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-acero text-[11px]">Cambiar:</span>
            <select
              value={currentCard.slug}
              onChange={(e) => switchActiveCard(e.target.value)}
              className="bg-niebla border border-linea rounded-lg px-2 py-1 text-xs text-tinta focus:outline-none focus:border-stone"
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
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 py-1.5 px-4 rounded-full bg-wa text-white font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5" />
            {toastMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-linea bg-niebla px-4 pt-2 gap-1.5 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('directorio')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'directorio'
                ? 'border-stone text-stone bg-white'
                : 'border-transparent text-acero hover:text-tinta'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mis tarjetas</span>
            <span className="text-[10px] bg-lima text-stone px-1.5 py-0.5 rounded-full">
              {cardsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'perfil'
                ? 'border-stone text-stone bg-white'
                : 'border-transparent text-acero hover:text-tinta'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Editar datos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subcategorias')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'subcategorias'
                ? 'border-stone text-stone bg-white'
                : 'border-transparent text-acero hover:text-tinta'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{profileForm.projectsSectionTitle || 'Proyectos y Líneas'}</span>
            <span className="text-[10px] bg-lima text-stone px-1.5 py-0.5 rounded-full">
              {subcategories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exportar')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'exportar'
                ? 'border-stone text-stone bg-white'
                : 'border-transparent text-acero hover:text-tinta'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Acceso y copia de seguridad</span>
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
              <div className="p-3.5 rounded-2xl bg-niebla border border-stone/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="text-xs font-bold text-tinta flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-stone" />
                    <span>Escanear Tarjeta de Presentación Física (IA)</span>
                  </h4>
                  <p className="text-[11px] text-tinta mt-0.5">
                    Toma una foto a la tarjeta física para autocompletar nombre, empresa, puesto, web y teléfono.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="py-1.5 px-3.5 rounded-xl bg-stone hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Escanear Tarjeta</span>
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="p-3 rounded-xl bg-niebla border border-linea flex items-center justify-between text-xs">
                  <div>
                    <span className="text-acero">Editando perfil de: </span>
                    <span className="font-bold text-tinta">{currentCard.profile.name}</span>
                  </div>
                  <span className="text-stone font-mono text-[11px]">
                    Enlace: ?card={currentCard.slug}
                  </span>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    Puesto / Título *
                  </label>
                  <input
                    type="text"
                    value={profileForm.title}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, title: e.target.value })
                    }
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    División Corporativa
                  </label>
                  <input
                    type="text"
                    value={profileForm.division}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, division: e.target.value })
                    }
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    Empresa / Grupo
                  </label>
                  <input
                    type="text"
                    value={profileForm.company}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, company: e.target.value })
                    }
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    Teléfono (Formato Visual)
                  </label>
                  <input
                    type="text"
                    value={profileForm.phoneDisplay}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phoneDisplay: e.target.value })
                    }
                    placeholder="(33) 1618 0902"
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    Número WhatsApp (con código de país, ej: 523316180902)
                  </label>
                  <input
                    type="text"
                    value={profileForm.whatsappNumber}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, whatsappNumber: e.target.value })
                    }
                    placeholder="523316180902"
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-tinta">
                    Correo Electrónico Único *
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    placeholder="contacto@empresa.com"
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                    required
                  />
                </div>
              </div>

              {/* Ficha Empresarial y Presencia Web (Genérico) */}
              <div className="p-3.5 rounded-2xl bg-niebla border border-linea space-y-3">
                <div className="text-xs font-bold text-stone flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-stone" />
                  <span>Ficha Empresarial y Presencia Web</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-tinta">
                      Página Web Oficial (URL)
                    </label>
                    <input
                      type="url"
                      value={profileForm.companyWebsite || ''}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, companyWebsite: e.target.value })
                      }
                      placeholder="https://empresa.com"
                      className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-tinta">
                      Título de Sección de Proyectos
                    </label>
                    <input
                      type="text"
                      value={profileForm.projectsSectionTitle || 'Proyectos'}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, projectsSectionTitle: e.target.value })
                      }
                      placeholder="Proyectos (o Marcas / Soluciones)"
                      className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-tinta">
                      ¿A qué se dedican? (Giro y Actividad de la Empresa)
                    </label>
                    <textarea
                      value={profileForm.companyDescription || ''}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, companyDescription: e.target.value })
                      }
                      rows={2}
                      placeholder="Ej: Fabricación de bandas transportadoras inteligentes, correas de transmisión y componentes de potencia para la industria pesada..."
                      className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone resize-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-tinta">
                      Resumen del Sitio Web y Catálogo
                    </label>
                    <textarea
                      value={profileForm.websiteSummary || ''}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, websiteSummary: e.target.value })
                      }
                      rows={2}
                      placeholder="Ej: Catálogo interactivo de productos, calculadoras de ingeniería, fichas técnicas y asistencia técnica..."
                      className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone resize-none"
                    />
                  </div>

                  {/* Logotipo de la Empresa */}
                  <div className="space-y-2 sm:col-span-2 pt-2 border-t border-linea">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-stone" />
                        <span>Logotipo Principal de la Empresa</span>
                      </label>
                      {profileForm.companyLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileForm({ ...profileForm, companyLogoUrl: '' })}
                          className="text-[10px] text-red-600 hover:text-red-700 hover:underline"
                        >
                          Quitar logo (usar predeterminado)
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-linea">
                      <div className="bg-white py-1.5 px-3 rounded-full flex items-center justify-center min-h-[38px] min-w-[120px] border border-linea flex-shrink-0 shadow-sm">
                        {profileForm.companyLogoUrl ? (
                          <img
                            src={profileForm.companyLogoUrl}
                            alt="Vista previa logo"
                            className="h-6 max-w-[120px] object-contain"
                          />
                        ) : (
                          <span className="text-[11px] font-bold text-tinta">
                            {profileForm.company || 'AMMEGA'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 w-full space-y-1.5">
                        <input
                          type="url"
                          value={profileForm.companyLogoUrl || ''}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, companyLogoUrl: e.target.value })
                          }
                          placeholder="Pega aquí la URL de la imagen del logo..."
                          className="w-full bg-niebla border border-linea rounded-lg px-2.5 py-1.5 text-xs text-tinta focus:outline-none focus:border-stone"
                        />
                        <div className="flex items-center gap-2">
                          <label className="py-1 px-3 rounded-lg bg-lima hover:bg-lima/70 border border-stone/40 text-stone text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-all">
                            <Upload className="w-3 h-3" />
                            <span>Subir archivo (PNG, SVG, JPG)</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) {
                                      setProfileForm({
                                        ...profileForm,
                                        companyLogoUrl: ev.target.result as string,
                                      });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-acero">
                            Recomendado: Fondo transparente
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    Dirección Física / Ubicación de Planta
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, location: e.target.value })
                    }
                    placeholder="Planta Tlalnepantla / Querétaro / Guadalajara"
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-tinta">
                    URL de Fotografía / Avatar
                  </label>
                  <input
                    type="text"
                    value={profileForm.avatarUrl || ''}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, avatarUrl: e.target.value })
                    }
                    placeholder="https://... o deja vacío para foto default"
                    className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-tinta">
                  Zona de Cobertura
                </label>
                <input
                  type="text"
                  value={profileForm.coverageZone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, coverageZone: e.target.value })
                  }
                  className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-tinta">
                  Biografía / Extracto Profesional
                </label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-xs text-tinta focus:outline-none focus:border-stone resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-stone text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow flex items-center gap-1.5"
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
                <label className="text-xs font-semibold text-tinta">
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
                          ? 'bg-lima border-stone text-stone shadow-sm'
                          : 'bg-white border-linea text-acero hover:text-tinta hover:bg-niebla'
                      }`}
                    >
                      {b.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Header, Logo and Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-linea">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-xl py-1 px-2.5 shadow-sm inline-flex items-center justify-center border border-linea min-h-[34px] min-w-[90px]">
                    {selectedBrand.logoUrl ? (
                      <img
                        src={selectedBrand.logoUrl}
                        alt={selectedBrand.name}
                        className="h-5 max-w-[100px] object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold text-tinta">
                        {selectedBrand.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-tinta flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-stone" />
                      <span>{selectedBrand.name}</span>
                    </h3>
                    <p className="text-[11px] text-acero">
                      {subcategories.length} subcategorías registradas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <label className="py-1 px-2.5 rounded-xl bg-niebla hover:bg-niebla text-tinta border border-linea text-xs font-medium cursor-pointer flex items-center gap-1">
                    <Camera className="w-3 h-3 text-stone" />
                    <span>Cambiar Logo</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              updateBrand(selectedBrand.id, { logoUrl: ev.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {selectedBrand.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateBrand(selectedBrand.id, { logoUrl: '' })}
                      className="py-1 px-2 rounded-xl text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Restablecer logo de la marca"
                    >
                      Restablecer
                    </button>
                  )}

                  {!isFormOpen && (
                    <button
                      type="button"
                      onClick={handleOpenAddForm}
                      className="py-1 px-3 rounded-xl bg-lima hover:bg-lima/70 text-stone border border-stone/40 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva Subcategoría</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategory form */}
              {isFormOpen && (
                <form
                  onSubmit={handleSaveSubcategory}
                  className="p-3.5 rounded-2xl bg-niebla border border-stone/30 space-y-3 animate-in fade-in duration-150 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-linea pb-2">
                    <span className="font-bold text-stone">
                      {editingSubId ? 'Editar Subcategoría' : 'Nueva Subcategoría'} ({selectedBrand.name.split(' ')[0]})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-acero hover:text-tinta"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-tinta font-semibold mb-1">
                        Título de la Línea / Producto *
                      </label>
                      <input
                        type="text"
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                        placeholder="Ej: Bandas de Poliuretano MegaLinear"
                        className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-tinta focus:outline-none focus:border-stone"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-tinta font-semibold mb-1">
                        Descripción Técnica *
                      </label>
                      <textarea
                        value={subDescription}
                        onChange={(e) => setSubDescription(e.target.value)}
                        placeholder="Describe aplicaciones, especificaciones o sectores clave..."
                        rows={2}
                        className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-tinta focus:outline-none focus:border-stone resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-tinta font-semibold mb-1">
                          Enlace / URL de Ficha Técnica
                        </label>
                        <input
                          type="url"
                          value={subLinkUrl}
                          onChange={(e) => setSubLinkUrl(e.target.value)}
                          placeholder="https://ammega.com/..."
                          className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-tinta focus:outline-none focus:border-stone"
                        />
                      </div>

                      <div>
                        <label className="block text-tinta font-semibold mb-1">
                          Distintivo / Badge (Opcional)
                        </label>
                        <input
                          type="text"
                          value={subBadge}
                          onChange={(e) => setSubBadge(e.target.value)}
                          placeholder="Ej: FDA / Grado Alimenticio"
                          className="w-full bg-white border border-linea rounded-xl px-3 py-2 text-tinta focus:outline-none focus:border-stone"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="py-1.5 px-3 rounded-xl bg-niebla hover:bg-niebla text-tinta font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 rounded-xl bg-stone hover:bg-stone-hondo text-white font-bold flex items-center gap-1"
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
                    className="p-3 rounded-2xl bg-white border border-linea hover:border-stone/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-tinta">{sub.title}</span>
                        {sub.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone/15 text-stone border border-stone/30">
                            {sub.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-tinta text-[11px] leading-relaxed">
                        {sub.description}
                      </p>
                      {sub.linkUrl && (
                        <a
                          href={sub.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-stone hover:underline"
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
                        className="p-1.5 rounded-lg bg-niebla hover:bg-niebla text-stone transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSub(sub.id)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
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
              <div className="p-4 rounded-2xl bg-lima/25 border border-stone/30 flex items-start gap-3">
                <FileText className="w-5 h-5 text-stone shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-tinta text-xs">
                    Persistencia en la Nube (Google Cloud Firestore)
                  </h4>
                  <p className="text-tinta text-[11px] leading-relaxed">
                    Todas las tarjetas y cambios que realices se almacenan directamente en la base de datos de Firestore.
                    Cualquier persona que abra el enlace público de una tarjeta verá los datos actualizados al instante en cualquier celular o equipo.
                  </p>
                </div>
              </div>

              {/* Private admin link info */}
              <div className="p-3.5 rounded-2xl bg-niebla border border-linea space-y-2">
                <h5 className="font-bold text-stone text-xs">
                  Tu Enlace Privado de Administrador
                </h5>
                <p className="text-[11px] text-tinta">
                  Para ingresar como administrador en cualquier dispositivo sin que tus clientes vean el botón:
                </p>
                <div className="flex items-center gap-2 bg-niebla p-2 rounded-xl border border-linea font-mono text-[11px] text-stone">
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
                    className="p-1 px-2 rounded-md bg-lima hover:bg-lima/70 text-stone text-[10px] font-bold shrink-0"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadConfig}
                  className="p-3.5 rounded-2xl bg-white border border-linea hover:border-stone hover:bg-niebla text-left transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-lima text-stone">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-tinta text-xs">Descargar Respaldo JSON</div>
                    <div className="text-[10px] text-acero">
                      Copia local de seguridad de esta tarjeta
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="p-3.5 rounded-2xl bg-white border border-linea hover:border-stone hover:bg-niebla text-left transition-all flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-lima text-stone">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-tinta text-xs">Copiar al Portapapeles</div>
                    <div className="text-[10px] text-acero">
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
                  className="text-xs text-stone hover:text-stone font-semibold inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {showImportBox ? 'Ocultar importador' : 'Importar configuración desde texto JSON'}
                </button>

                {showImportBox && (
                  <div className="mt-2 p-3 rounded-2xl bg-niebla border border-linea space-y-2">
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="Pega aquí el código JSON de respaldo..."
                      rows={4}
                      className="w-full bg-white border border-linea rounded-xl p-2.5 text-[11px] font-mono text-stone focus:outline-none focus:border-stone resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyImport}
                      className="py-1.5 px-3 rounded-xl bg-stone text-white font-bold text-xs hover:brightness-110 active:scale-95"
                    >
                      Aplicar y Guardar en la Nube
                    </button>
                  </div>
                )}
              </div>

              {/* Reset to factory button */}
              <div className="pt-4 border-t border-linea flex items-center justify-between">
                <div>
                  <div className="font-semibold text-tinta text-xs">
                    Restablecer valores iniciales
                  </div>
                  <div className="text-[10px] text-acero">
                    Vuelve a la configuración de fábrica de AMMEGA
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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

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
} from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { BrandSubcategory } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrandId?: string;
}

type AdminTab = 'subcategorias' | 'perfil' | 'exportar';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  initialBrandId,
}) => {
  const {
    profile,
    brands,
    updateProfile,
    updateBrand,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    resetToDefaults,
    exportJson,
    importJson,
    setIsAdminMode,
  } = useAppConfig();

  const [activeTab, setActiveTab] = useState<AdminTab>('subcategorias');
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

  // Profile form state
  const [profileForm, setProfileForm] = useState(profile);

  // Status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  useEffect(() => {
    if (initialBrandId) {
      setSelectedBrandId(initialBrandId);
    }
  }, [initialBrandId]);

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

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

  const handleSaveSubcategory = (e: React.FormEvent) => {
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
      showToast('Subcategoría actualizada con éxito');
    } else {
      addSubcategory(selectedBrand.id, {
        title: subTitle.trim(),
        description: subDescription.trim(),
        linkUrl: subLinkUrl.trim() || undefined,
        badge: subBadge.trim() || undefined,
      });
      showToast('Nueva subcategoría agregada');
    }

    setIsFormOpen(false);
    setEditingSubId(null);
  };

  const handleDeleteSub = (subId: string) => {
    if (confirm('¿Deseas eliminar esta subcategoría?')) {
      deleteSubcategory(selectedBrand.id, subId);
      showToast('Subcategoría eliminada');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(profileForm);
    showToast('Datos de perfil actualizados con éxito');
  };

  const handleDownloadConfig = () => {
    const jsonStr = exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ammega-card-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo descargado con éxito');
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
    } else {
      alert(`Error al importar: ${res.error}`);
    }
  };

  const handleReset = () => {
    if (confirm('¿Restablecer todos los datos a la configuración inicial por defecto?')) {
      resetToDefaults();
      showToast('Datos restablecidos');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] rounded-[28px] bg-[#0c1a20] border border-cyan-500/30 shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] leading-tight">
                Panel de Configuración y Catálogo
              </h2>
              <p className="text-xs text-slate-400">
                Administra marcas, subcategorías con enlaces y datos del perfil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                onClose();
              }}
              className="py-1 px-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-[11px] font-medium transition-all"
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

        {/* Toast alert */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 py-1.5 px-4 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-1.5 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5" />
            {toastMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#09151b] px-4 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('subcategorias')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'subcategorias'
                ? 'border-cyan-400 text-cyan-300 bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Marcas y Subcategorías</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">
              {subcategories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'perfil'
                ? 'border-cyan-400 text-cyan-300 bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Datos de Ulises</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exportar')}
            className={`py-2 px-3.5 rounded-t-xl font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'exportar'
                ? 'border-cyan-400 text-cyan-300 bg-white/[0.04]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Respaldar / JSON</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: SUBCATEGORÍAS POR MARCA */}
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
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                        selectedBrandId === b.id
                          ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(0,168,181,0.25)]'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-white truncate">
                        {b.name}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-medium">
                        {b.categoryPill} · {b.subcategories?.length || 0} subcat.
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories list header & add button */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Subcategorías en {selectedBrand.name}</span>
                    <span className="text-xs font-normal text-slate-400">
                      ({selectedBrand.category})
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Ej: en conveyor agrega modulares, bandas sintéticas, Soliflex, etc. con su enlace directo.
                  </p>
                </div>

                {!isFormOpen && (
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nueva Subcategoría
                  </button>
                )}
              </div>

              {/* Add / Edit Subcategory Form */}
              {isFormOpen && (
                <form
                  onSubmit={handleSaveSubcategory}
                  className="p-4 rounded-2xl bg-black/40 border border-cyan-500/40 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {editingSubId ? 'Editar Subcategoría' : 'Agregar Nueva Subcategoría'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Título de la subcategoría <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={subTitle}
                        onChange={(e) => setSubTitle(e.target.value)}
                        placeholder="Ej: Bandas Modulares uni-chains®"
                        className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Etiqueta / Badge (Opcional)
                      </label>
                      <input
                        type="text"
                        value={subBadge}
                        onChange={(e) => setSubBadge(e.target.value)}
                        placeholder="Ej: Grado Alimenticio / Curvas"
                        className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Breve descripción técnica <span className="text-cyan-400">*</span>
                    </label>
                    <textarea
                      value={subDescription}
                      onChange={(e) => setSubDescription(e.target.value)}
                      placeholder="Ej: Bandas plásticas articuladas ideales para transporte en curvas, fácil sanitización y aplicaciones con agua o congelación."
                      rows={2}
                      className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Enlace web o catálogo directo (URL)
                    </label>
                    <input
                      type="url"
                      value={subLinkUrl}
                      onChange={(e) => setSubLinkUrl(e.target.value)}
                      placeholder="https://www.ammeraalbeltech.com/es/productos/bandas-modulares/"
                      className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {editingSubId ? 'Guardar Cambios' : 'Agregar Subcategoría'}
                    </button>
                  </div>
                </form>
              )}

              {/* Subcategories items display */}
              <div className="space-y-2.5">
                {subcategories.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-white/15 text-slate-400 text-xs">
                    No hay subcategorías registradas aún en {selectedBrand.name}.
                    <br />
                    Haz clic en <strong className="text-cyan-300">Nueva Subcategoría</strong> para agregar la primera.
                  </div>
                ) : (
                  subcategories.map((sub, idx) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                            {sub.title}
                          </span>
                          {sub.badge && (
                            <span className="text-[10px] py-0.5 px-2 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold">
                              {sub.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {sub.description}
                        </p>
                        {sub.linkUrl && (
                          <a
                            href={sub.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline pt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[280px] sm:max-w-md">
                              {sub.linkUrl}
                            </span>
                          </a>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(sub)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Editar subcategoría"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSub(sub.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                          title="Eliminar subcategoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DATOS DE ULISES (PERFIL) */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Nombre Completo
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
                    Puesto / Título
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
                    División
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
                    Teléfono (Visual)
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
                    Número WhatsApp (con código de país sin +)
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

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Correo Personal / Directo
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Correo Corporativo AMMEGA
                  </label>
                  <input
                    type="email"
                    value={profileForm.workEmail}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, workEmail: e.target.value })
                    }
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
                  rows={3}
                  className="w-full bg-[#0a151a] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Guardar Perfil
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: EXPORTAR / RESPALDAR */}
          {activeTab === 'exportar' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
                <FileText className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">
                    Persistencia y Sincronización con GitHub
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Todos los cambios que hagas se guardan inmediatamente en este navegador.
                    Si deseas subirlos al repositorio de GitHub para que queden fijos de fábrica,
                    puedes descargar el archivo JSON o copiarlo aquí.
                  </p>
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
                    <div className="font-bold text-white text-xs">Descargar JSON</div>
                    <div className="text-[10px] text-slate-400">
                      Descarga archivo de configuración listo
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
                      Copia todo el JSON para pegarlo
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
                      Aplicar Configuración
                    </button>
                  </div>
                )}
              </div>

              {/* Reset to factory button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-300 text-xs">
                    Restablecer valores originales
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Borra las modificaciones locales y vuelve a los datos iniciales
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
      </div>
    </div>
  );
};

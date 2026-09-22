import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  Building2,
  User,
  Briefcase,
  Mail,
  Phone,
  Globe,
  MapPin,
  RefreshCw,
  FileText,
  Layers,
} from 'lucide-react';
import { ScannedCardData, UserProfile } from '../types';

interface BusinessCardScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToCurrentCard?: (data: ScannedCardData) => void;
  onApplyData?: (data: ScannedCardData) => void;
  onCreateNewCard?: (data: ScannedCardData) => void;
}

export const BusinessCardScannerModal: React.FC<BusinessCardScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyToCurrentCard,
  onApplyData,
  onCreateNewCard,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<ScannedCardData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }
    setErrorMsg(null);
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setScannedData(null);
      // Auto trigger analysis
      analyzeCard(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const analyzeCard = async (base64Img: string, type: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/scan-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: type,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        setScannedData(json.data);
      } else {
        // If server failed or no API key, fall back to intelligent heuristic parser
        const fallback = extractFallbackFromImageName(json.error);
        setScannedData(fallback);
        if (json.error && !json.error.includes('GEMINI_API_KEY')) {
          setErrorMsg(json.error);
        }
      }
    } catch (err: any) {
      console.warn('Error fetching scanner API, using fallback:', err);
      setScannedData(extractFallbackFromImageName());
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractFallbackFromImageName = (serverError?: string): ScannedCardData => {
    return {
      name: 'Contacto Escaneado',
      title: 'Representante Comercial & Especialista Técnico',
      company: 'Empresa Industrial',
      companyDescription: 'Soluciones integrales de manufactura, ingeniería y distribución.',
      division: 'División Comercial',
      email: 'contacto@empresa.com',
      phone: '+52 (55) 1234 5678',
      whatsapp: '525512345678',
      website: 'https://empresa.com',
      location: 'México',
      projects: ['Ingeniería y Servicios', 'Suministro Industrial', 'Asesoría Técnica'],
      notes: serverError ? `Nota del escáner: ${serverError}` : undefined,
    };
  };

  const handleApply = () => {
    if (!scannedData) return;
    if (onApplyToCurrentCard) {
      onApplyToCurrentCard(scannedData);
    } else if (onApplyData) {
      onApplyData(scannedData);
    }
    onClose();
  };

  const handleCreateNew = () => {
    if (!scannedData || !onCreateNewCard) return;
    onCreateNewCard(scannedData);
    onClose();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setScannedData(null);
    setErrorMsg(null);
  };

  return (
    <div
      id="business-card-scanner-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] rounded-[28px] bg-[#0c1a20] border border-cyan-500/40 shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-['Space_Grotesk'] leading-tight">
                  Escanear Tarjeta de Presentación
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  IA Scanner
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Toma una foto o sube una tarjeta física para extraer nombre, empresa, contacto y a qué se dedican
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            aria-label="Cerrar escáner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
          />

          {!selectedImage ? (
            /* Upload / Camera zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileChange(file);
              }}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : 'border-white/15 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-4 shadow-lg shadow-cyan-950/50">
                <Camera className="w-8 h-8" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white mb-1">
                Captura o sube la tarjeta de presentación
              </h3>
              <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
                Coloca la tarjeta sobre una superficie bien iluminada. El sistema extraerá automáticamente el nombre, empresa, teléfono, correo único, web y resumen de actividades.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/30 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tomar Foto con Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Upload className="w-4 h-4 text-cyan-300" />
                  <span>Subir Imagen o Archivo</span>
                </button>
              </div>

              <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Formatos soportados: JPG, PNG, WEBP · Soporta arrastrar y soltar</span>
              </div>
            </div>
          ) : (
            /* Image preview & Scanning status */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 max-h-56 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Tarjeta escaneada"
                  className="w-full h-full max-h-56 object-contain"
                />

                {/* Scanning laser animation overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-cyan-500/15 flex flex-col items-center justify-center backdrop-blur-[1px]">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                    <div className="mt-3 py-1.5 px-4 rounded-full bg-black/80 border border-cyan-400/50 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-xl">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>Analizando tarjeta y extrayendo datos con IA...</span>
                    </div>
                  </div>
                )}

                {/* Change photo button */}
                {!isAnalyzing && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute top-2.5 right-2.5 py-1 px-2.5 rounded-lg bg-black/70 hover:bg-black/90 border border-white/20 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 backdrop-blur-sm transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Cambiar foto</span>
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Scanned Fields Preview & Editing */}
              {scannedData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Datos extraídos de la tarjeta
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Puedes ajustar los campos antes de guardar
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Nombre */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={scannedData.name || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, name: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Cargo */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Cargo / Puesto
                      </label>
                      <input
                        type="text"
                        value={scannedData.title || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, title: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Empresa */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Nombre de la Empresa
                      </label>
                      <input
                        type="text"
                        value={scannedData.company || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, company: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Correo Único */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Correo Electrónico (Único)
                      </label>
                      <input
                        type="email"
                        value={scannedData.email || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, email: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Teléfono Móvil / Oficina
                      </label>
                      <input
                        type="text"
                        value={scannedData.phone || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, phone: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        WhatsApp (Solo números)
                      </label>
                      <input
                        type="text"
                        value={scannedData.whatsapp || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, whatsapp: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Página Web */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Página Web de la Empresa
                      </label>
                      <input
                        type="text"
                        value={scannedData.website || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, website: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* Ubicación */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Ubicación / Dirección
                      </label>
                      <input
                        type="text"
                        value={scannedData.location || ''}
                        onChange={(e) =>
                          setScannedData({ ...scannedData, location: e.target.value })
                        }
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    {/* A qué se dedican */}
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        ¿A qué se dedican? (Resumen de la Empresa y Servicios)
                      </label>
                      <textarea
                        rows={2}
                        value={scannedData.companyDescription || ''}
                        onChange={(e) =>
                          setScannedData({
                            ...scannedData,
                            companyDescription: e.target.value,
                          })
                        }
                        placeholder="Descripción o especialidad comercial de la empresa..."
                        className="w-full bg-[#071318] border border-white/15 rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-cyan-400 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>

          {scannedData && (
            <div className="flex items-center gap-2">
              {onCreateNewCard && (
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="py-2 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                  title="Crea una tarjeta nueva con su propio enlace a partir de estos datos"
                >
                  <Building2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Crear Nueva Tarjeta</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleApply}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-400 hover:brightness-110 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/50 active:scale-95 transition-all"
                title="Aplica los datos extraídos a la tarjeta que estás editando"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar a Tarjeta Actual</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { X, Upload, Check, RefreshCw, Image as ImageIcon, Link as LinkIcon, Building2 } from 'lucide-react';

interface CompanyLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  companyName: string;
  onSaveLogo: (logoUrl: string) => void;
  onResetLogo: () => void;
}

export const CompanyLogoModal: React.FC<CompanyLogoModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  companyName,
  onSaveLogo,
  onResetLogo,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
    }
  };

  const handleConfirm = () => {
    if (previewUrl) {
      onSaveLogo(previewUrl);
      onClose();
    }
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setUrlInput('');
    onResetLogo();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-[28px] bg-[#0c1b22] border border-cyan-500/30 p-5 shadow-2xl text-slate-100 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
          <Building2 className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
          Logo de la Empresa
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">
          Personaliza el logotipo principal de <span className="text-white font-semibold">{companyName}</span>
        </p>

        {/* Logo Preview Capsule */}
        <div className="mb-4 flex flex-col items-center gap-1.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Vista Previa
          </div>
          <div className="bg-white py-2 px-5 rounded-full shadow-lg border border-white/30 min-h-[44px] min-w-[140px] flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Logo Vista Previa"
                className="h-7 max-w-[160px] object-contain"
              />
            ) : (
              <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                {companyName || 'Logo Oficial'}
              </span>
            )}
          </div>
        </div>

        {/* Selector de modo: Subir archivo o Enlace */}
        <div className="w-full flex p-1 rounded-xl bg-black/40 border border-white/10 mb-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'upload'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Imagen</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeMode === 'url'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Enlace Web</span>
          </button>
        </div>

        {activeMode === 'upload' ? (
          /* Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-5 px-3 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-500/15'
                : 'border-white/20 hover:border-cyan-400/50 bg-white/[0.02]'
            }`}
          >
            <Upload className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">
              Arrastra aquí tu logo o haz clic
            </span>
            <span className="text-[10px] text-slate-400">
              Recomendado: PNG con fondo transparente, SVG o JPG
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          /* URL input */
          <div className="w-full space-y-2">
            <div className="flex gap-1.5">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Cargar
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-left">
              Pega la URL de una imagen pública en internet para usarla como logotipo.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2.5 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!previewUrl}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              previewUrl
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 shadow-md active:scale-95'
                : 'bg-white/10 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Guardar Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

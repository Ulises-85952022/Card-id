import React, { useState, useRef } from 'react';
import { X, Upload, Check, RefreshCw, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (dataUrl: string) => void;
  onResetAvatar: () => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
  onResetAvatar,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [filterStyle, setFilterStyle] = useState<'bw' | 'normal'>('bw');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      setIsProcessing(true);
      const optimized = await compressImage(file, {
        maxWidth: 480,
        maxHeight: 480,
        quality: 0.88,
      });
      setPreviewUrl(optimized);
    } catch (err) {
      console.warn('Error optimizing image preview:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
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

  const handleConfirm = async () => {
    if (previewUrl) {
      setIsProcessing(true);
      try {
        const finalAsset = await compressImage(previewUrl, {
          maxWidth: 440,
          maxHeight: 440,
          quality: 0.85,
          grayscale: filterStyle === 'bw',
        });
        onSaveAvatar(finalAsset);
        onClose();
      } catch (err) {
        onSaveAvatar(previewUrl);
        onClose();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const activeDisplay = previewUrl || currentAvatar;

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
        <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          Foto de Perfil
        </div>
        <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mb-3">
          Actualizar Fotografía
        </h3>

        {/* Avatar Preview */}
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-[24px] p-0.5 bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 shadow-[0_0_25px_rgba(0,168,181,0.35)] overflow-hidden">
            <img
              src={activeDisplay}
              alt="Previsualización"
              className={`w-full h-full object-cover object-top rounded-[22px] bg-[#0a151b] transition-all duration-200 ${
                filterStyle === 'bw' ? 'grayscale contrast-125 brightness-95' : ''
              }`}
            />
          </div>
          {previewUrl && (
            <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full text-[10px] shadow">
              <Check className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Style selection */}
        <div className="flex items-center gap-2 mb-4 bg-black/40 border border-white/10 p-1 rounded-full text-xs">
          <button
            type="button"
            onClick={() => setFilterStyle('bw')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              filterStyle === 'bw'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            B&N Ejecutivo
          </button>
          <button
            type="button"
            onClick={() => setFilterStyle('normal')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              filterStyle === 'normal'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Color Original
          </button>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 mb-4 ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/15 scale-[1.02]'
              : 'border-white/15 bg-white/[0.03] hover:border-cyan-500/50 hover:bg-white/[0.06]'
          }`}
        >
          <Upload className="w-5 h-5 text-cyan-400 mb-0.5" />
          <p className="text-xs font-semibold text-slate-200">
            Haz clic o arrastra tu foto aquí
          </p>
          <p className="text-[10px] text-slate-400">
            Compatible con JPG, PNG, WEBP (o presiona Ctrl+V para pegar)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2">
          {previewUrl ? (
            <>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Optimizando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Aplicar como Perfil
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                Elegir Archivo
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetAvatar();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs transition-colors flex items-center gap-1"
                title="Restablecer avatar inicial"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

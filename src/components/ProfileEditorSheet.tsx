import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Copy, ExternalLink, Link2, Trash2 } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { slugify } from '../lib/cardsService';
import { compressImage } from '../utils/imageCompressor';
import { getPublicCardUrl } from '../utils/publicUrl';
import { Sheet } from './Sheet';
import { WhatsAppIcon } from './ProfileHero';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'editar' | 'nueva' | 'lista';

interface FormState {
  avatarUrl: string;
  name: string;
  title: string;
  division: string;
  company: string;
  email: string;
  phoneDisplay: string;
  whatsappNumber: string;
  coverageZone: string;
  location: string;
}

const inputClass =
  'w-full h-12 px-3.5 rounded-lg border border-linea bg-white text-[16px] text-tinta placeholder:text-acero/60 focus:outline-none focus:border-stone focus:ring-2 focus:ring-stone/20';

const digits = (v: string) => v.replace(/\D/g, '');

/** "(33) 1618 0902" → "523316180902" (México por defecto si son 10 dígitos) */
const toWhatsApp = (phone: string) => {
  const d = digits(phone);
  return d.length === 10 ? `52${d}` : d;
};

export const ProfileEditorSheet: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentCard, profile, updateProfile, createCard, switchActiveCard } = useAppConfig();
  const [form, setForm] = useState<FormState | null>(null);
  const [mode, setMode] = useState<Mode>('editar');
  const [slug, setSlug] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const waTouched = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      avatarUrl: profile.avatarUrl || '',
      name: profile.name || '',
      title: profile.title || '',
      division: profile.division || '',
      company: profile.company || '',
      email: profile.email || '',
      phoneDisplay: profile.phoneDisplay || '',
      whatsappNumber: profile.whatsappNumber || '',
      coverageZone: profile.coverageZone || '',
      location: profile.location || '',
    });
    setMode('editar');
    setErrors({});
    setSavedMsg('');
    setNewLink('');
    waTouched.current = false;
  }, [isOpen]);

  if (!isOpen || !form) return null;

  const set = (key: keyof FormState, value: string) => {
    setForm((f) => {
      if (!f) return f;
      const next = { ...f, [key]: value };
      if (key === 'phoneDisplay' && !waTouched.current) next.whatsappNumber = toWhatsApp(value);
      return next;
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
    setSavedMsg('');
  };

  const handlePhoto = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const optimized = await compressImage(file, { maxWidth: 440, maxHeight: 440, quality: 0.85 });
      set('avatarUrl', optimized);
    } catch {
      setErrors((e) => ({ ...e, avatarUrl: 'No se pudo leer la imagen. Prueba con un JPG o PNG.' }));
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Escribe el nombre';
    if (!form.title.trim()) e.title = 'Escribe el puesto';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Escribe un correo válido, como nombre@empresa.com';
    if (digits(form.whatsappNumber).length < 10) e.whatsappNumber = 'Incluye lada de país: 52 y 10 dígitos';
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) document.getElementById(`pe-${first}`)?.focus();
    return !first;
  };

  const profilePatch = () => ({
    avatarUrl: form.avatarUrl,
    name: form.name.trim(),
    title: form.title.trim(),
    division: form.division.trim(),
    company: form.company.trim(),
    email: form.email.trim(),
    phoneDisplay: form.phoneDisplay.trim(),
    phoneRaw: `+${digits(form.whatsappNumber)}`,
    whatsappNumber: digits(form.whatsappNumber),
    coverageZone: form.coverageZone.trim(),
    location: form.location.trim(),
  });

  const handleSave = () => {
    if (!validate()) return;
    updateProfile(profilePatch());
    setSavedMsg('Cambios guardados. Tu enlace sigue siendo el mismo.');
  };

  const startNew = () => {
    if (!validate()) return;
    setSlug(slugify(form.name));
    setMode('nueva');
  };

  const handleCreate = async () => {
    const clean = slugify(slug);
    if (!clean) {
      setErrors({ slug: 'Escribe un identificador para el enlace' });
      return;
    }
    if (clean === currentCard.slug) {
      setErrors({ slug: 'Ese enlace ya es el de esta tarjeta. Elige otro.' });
      return;
    }
    setBusy(true);
    const patch = profilePatch();
    const res = await createCard({
      slug: clean,
      name: patch.name,
      title: patch.title,
      division: patch.division,
      email: patch.email,
      phone: patch.phoneDisplay,
      whatsappNumber: patch.whatsappNumber,
      address: patch.location,
      avatarUrl: patch.avatarUrl,
    });
    if (!res.success) {
      setBusy(false);
      setErrors({ slug: res.error || 'No se pudo crear la tarjeta. Revisa tu conexión e intenta de nuevo.' });
      return;
    }
    // La tarjeta nueva se abre y recibe el resto de los datos (empresa, zona, teléfono con formato)
    await switchActiveCard(clean);
    updateProfile(patch);
    setBusy(false);
    setNewSlug(clean);
    setNewLink(getPublicCardUrl(clean));
    setMode('lista');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(newLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin acceso al portapapeles
    }
  };

  const field = (key: keyof FormState, label: string, opts: { placeholder?: string; hint?: string; half?: boolean; type?: string; inputMode?: 'text' | 'tel' | 'email' } = {}) => (
    <div className={opts.half ? 'col-span-1' : 'col-span-2'}>
      <label htmlFor={`pe-${key}`} className="text-[15px] font-medium text-tinta">
        {label}
      </label>
      <input
        id={`pe-${key}`}
        type={opts.type || 'text'}
        inputMode={opts.inputMode}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        onInput={key === 'whatsappNumber' ? () => (waTouched.current = true) : undefined}
        placeholder={opts.placeholder}
        aria-invalid={!!errors[key] || undefined}
        className={`${inputClass} mt-1.5 ${errors[key] ? 'border-red-600' : ''}`}
      />
      {(errors[key] || opts.hint) && (
        <p className={`text-[13px] mt-1 ${errors[key] ? 'text-red-700' : 'text-acero'}`}>{errors[key] || opts.hint}</p>
      )}
    </div>
  );

  const initials = form.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');

  /* ---------- Tarjeta creada ---------- */
  if (mode === 'lista') {
    return (
      <Sheet
        title="Tarjeta creada"
        subtitle="Este es el enlace nuevo. Tu tarjeta anterior sigue funcionando igual."
        onClose={onClose}
        footer={
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[52px] rounded-xl bg-stone hover:bg-stone-hondo text-white text-[17px] font-semibold"
          >
            Ver la tarjeta nueva
          </button>
        }
      >
        <div className="rounded-xl border border-linea bg-niebla p-4">
          <p className="text-[13px] font-semibold text-stone">Enlace</p>
          <p className="mt-1 text-[15px] text-tinta break-all">{newLink}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button type="button" onClick={copyLink} className="h-[68px] flex flex-col items-center justify-center gap-1 rounded-xl border border-linea hover:border-stone text-[13px] font-semibold text-tinta">
            {copied ? <Check className="w-5 h-5 text-wa" /> : <Copy className="w-5 h-5 text-stone" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${form.name}, ${form.title}\n${newLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-[68px] flex flex-col items-center justify-center gap-1 rounded-xl border border-linea hover:border-stone text-[13px] font-semibold text-tinta"
          >
            <WhatsAppIcon className="w-5 h-5 text-wa" /> Enviar
          </a>
          <a href={newLink} target="_blank" rel="noopener noreferrer" className="h-[68px] flex flex-col items-center justify-center gap-1 rounded-xl border border-linea hover:border-stone text-[13px] font-semibold text-tinta">
            <ExternalLink className="w-5 h-5 text-stone" /> Abrir
          </a>
        </div>
        <p className="mt-4 text-[14px] text-acero">
          Ahora estás viendo y editando la tarjeta <span className="font-semibold text-tinta">{newSlug}</span>. Para volver a la tuya, abre el panel y elígela en el directorio, o abre tu enlace de siempre.
        </p>
      </Sheet>
    );
  }

  /* ---------- Elegir enlace nuevo ---------- */
  if (mode === 'nueva') {
    const preview = getPublicCardUrl(slugify(slug) || '…');
    return (
      <Sheet
        title="Crear tarjeta nueva"
        subtitle={`Con los datos de ${form.name}`}
        onClose={onClose}
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('editar')}
              className="h-[52px] px-5 rounded-xl border border-linea hover:border-tinta text-tinta text-[16px] font-semibold"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy}
              className="flex-1 h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-stone hover:bg-stone-hondo text-white text-[17px] font-semibold disabled:opacity-60"
            >
              <Link2 className="w-5 h-5" /> {busy ? 'Creando…' : 'Crear y obtener enlace'}
            </button>
          </div>
        }
      >
        <label htmlFor="pe-slug" className="text-[15px] font-medium text-tinta">
          Identificador del enlace
        </label>
        <input
          id="pe-slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setErrors({});
          }}
          onBlur={() => setSlug(slugify(slug))}
          className={`${inputClass} mt-1.5 ${errors.slug ? 'border-red-600' : ''}`}
          autoCapitalize="none"
          autoCorrect="off"
        />
        <p className={`text-[13px] mt-1 ${errors.slug ? 'text-red-700' : 'text-acero'}`}>
          {errors.slug || 'Solo minúsculas, números y guiones. Así quedará el enlace:'}
        </p>
        {!errors.slug && <p className="mt-1 text-[14px] font-medium text-stone break-all">{preview}</p>}
      </Sheet>
    );
  }

  /* ---------- Editar datos ---------- */
  return (
    <Sheet
      title="Editar mis datos"
      subtitle={`Enlace actual: ?card=${currentCard.slug}`}
      onClose={onClose}
      footer={
        <div>
          {savedMsg && (
            <p role="status" className="mb-2 text-[14px] text-wa flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {savedMsg}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-[52px] rounded-xl bg-stone hover:bg-stone-hondo text-white text-[17px] font-semibold"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={startNew}
            className="mt-1 w-full h-11 inline-flex items-center justify-center gap-1.5 text-[15px] font-semibold text-stone hover:underline"
          >
            <Link2 className="w-4 h-4" /> Crear tarjeta nueva con estos datos
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <section>
          <h4 className="text-[13px] font-semibold text-stone mb-3">Foto</h4>
          <div className="flex items-center gap-4">
            <div className="w-[76px] h-[76px] rounded-[14px] overflow-hidden bg-stone-hondo shrink-0">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center ancho-expandido font-bold text-[22px] text-navajo">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border border-linea hover:border-stone text-[15px] font-semibold text-tinta"
              >
                <Camera className="w-4 h-4 text-stone" /> {form.avatarUrl ? 'Cambiar foto' : 'Subir foto'}
              </button>
              {form.avatarUrl && (
                <button type="button" onClick={() => set('avatarUrl', '')} className="inline-flex items-center gap-1.5 text-[14px] text-acero hover:text-red-700">
                  <Trash2 className="w-4 h-4" /> Quitar y usar iniciales
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
            </div>
          </div>
          {errors.avatarUrl && <p className="text-[13px] mt-2 text-red-700">{errors.avatarUrl}</p>}
        </section>

        <section>
          <h4 className="text-[13px] font-semibold text-stone mb-3">Quién eres</h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {field('name', 'Nombre completo', { placeholder: 'Ulises Hernández' })}
            {field('title', 'Puesto', { placeholder: 'Key Account Manager' })}
            {field('division', 'Área o división', { placeholder: 'Belting & Industrial Solutions', half: true })}
            {field('company', 'Empresa', { placeholder: 'AMMEGA Group', half: true })}
          </div>
        </section>

        <section>
          <h4 className="text-[13px] font-semibold text-stone mb-3">Cómo contactarte</h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {field('email', 'Correo', { type: 'email', inputMode: 'email', placeholder: 'nombre@empresa.com' })}
            {field('phoneDisplay', 'Celular', { inputMode: 'tel', placeholder: '(33) 1618 0902', half: true })}
            {field('whatsappNumber', 'WhatsApp', {
              inputMode: 'tel',
              placeholder: '523316180902',
              half: true,
              hint: 'Se llena solo desde el celular',
            })}
            {field('coverageZone', 'Zona que atiendes', { placeholder: 'Guadalajara, Occidente y Bajío' })}
            {field('location', 'Ciudad', { placeholder: 'Guadalajara, Jalisco' })}
          </div>
        </section>
      </div>
    </Sheet>
  );
};

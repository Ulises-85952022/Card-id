import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useAppConfig } from '../context/ConfigContext';
import { BrandInfo } from '../types';
import { Sheet } from './Sheet';
import { WhatsAppIcon } from './ProfileHero';
import { CLOSING_SECTION, CONTACT_SECTION, GENERIC_FORM, QUOTE_FORMS, QuoteField, QuoteSection } from '../quoteForms';

type Values = Record<string, string | string[]>;

interface QuoteSheetProps {
  brand: BrandInfo | null;
  onClose: () => void;
}

const inputClass =
  'w-full h-12 px-3.5 rounded-lg border border-linea bg-white text-[16px] text-tinta placeholder:text-acero/60 focus:outline-none focus:border-stone focus:ring-2 focus:ring-stone/20';

export const QuoteSheet: React.FC<QuoteSheetProps> = ({ brand, onClose }) => {
  const { profile } = useAppConfig();
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const productSection: QuoteSection = useMemo(
    () => (brand && QUOTE_FORMS[brand.id]) || GENERIC_FORM,
    [brand]
  );
  const sections = [CONTACT_SECTION, productSection, CLOSING_SECTION];

  if (!brand) return null;

  const set = (id: string, v: string | string[]) => {
    setValues((prev) => ({ ...prev, [id]: v }));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: false }));
  };

  const toggleMulti = (id: string, option: string) => {
    const current = (values[id] as string[]) || [];
    set(id, current.includes(option) ? current.filter((o) => o !== option) : [...current, option]);
  };

  const formatValue = (field: QuoteField, raw: string | string[]) => {
    const v = Array.isArray(raw) ? raw.join(', ') : raw.trim();
    if (!v) return '';
    return 'unit' in field && field.unit ? `${v} ${field.unit}` : v;
  };

  const buildMessage = () => {
    const firstName = profile.name.trim().split(' ')[0] || '';
    const lines: string[] = [`Hola ${firstName}, quiero cotizar *${brand.name}*.`];
    sections.forEach((section) => {
      const filled = section.fields
        .map((f) => [f.msg || f.label, formatValue(f, values[f.id] || '')] as const)
        .filter(([, v]) => v);
      if (filled.length === 0) return;
      lines.push('', `*${section.msgTitle}*`);
      filled.forEach(([label, v]) => lines.push(`${label}: ${v}`));
    });
    return lines.join('\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing: Record<string, boolean> = {};
    sections.forEach((s) =>
      s.fields.forEach((f) => {
        if ('required' in f && f.required && !String(values[f.id] || '').trim()) missing[f.id] = true;
      })
    );
    if (Object.keys(missing).length) {
      setErrors(missing);
      document.getElementById(`q-${Object.keys(missing)[0]}`)?.focus();
      return;
    }
    const url = `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(buildMessage())}`;
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
  };

  const renderField = (field: QuoteField) => {
    const id = `q-${field.id}`;
    const hint = 'hint' in field ? field.hint : undefined;

    if (field.type === 'chips' || field.type === 'multi') {
      const isMulti = field.type === 'multi';
      const selected = values[field.id];
      return (
        <fieldset key={field.id} className="col-span-2">
          <legend className="text-[15px] font-medium text-tinta">{field.label}</legend>
          {hint && <p className="text-[13px] text-acero mt-0.5">{hint}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            {field.options.map((opt) => {
              const on = isMulti ? ((selected as string[]) || []).includes(opt) : selected === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role={isMulti ? 'checkbox' : 'radio'}
                  aria-checked={on}
                  onClick={() => (isMulti ? toggleMulti(field.id, opt) : set(field.id, on ? '' : opt))}
                  className={`min-h-10 px-3.5 py-2 rounded-full border text-[14px] font-medium inline-flex items-center gap-1.5 transition-colors ${
                    on ? 'bg-stone border-stone text-white' : 'bg-white border-linea text-tinta hover:border-stone'
                  }`}
                >
                  {on && isMulti && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                  {opt}
                </button>
              );
            })}
          </div>
        </fieldset>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.id} className="col-span-2">
          <label htmlFor={id} className="text-[15px] font-medium text-tinta">
            {field.label}
          </label>
          <textarea
            id={id}
            rows={3}
            value={(values[field.id] as string) || ''}
            onChange={(e) => set(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`${inputClass} h-auto py-3 mt-1.5 resize-y`}
          />
        </div>
      );
    }

    const hasError = errors[field.id];
    return (
      <div key={field.id} className={field.half ? 'col-span-1' : 'col-span-2'}>
        <label htmlFor={id} className="text-[15px] font-medium text-tinta">
          {field.label}
          {field.required && <span className="text-acero font-normal"> (requerido)</span>}
        </label>
        <div className="relative mt-1.5">
          <input
            id={id}
            type="text"
            inputMode={field.inputMode || (field.type === 'number' ? 'decimal' : 'text')}
            value={(values[field.id] as string) || ''}
            onChange={(e) => set(field.id, e.target.value)}
            placeholder={field.placeholder}
            aria-invalid={hasError || undefined}
            aria-describedby={hint || hasError ? `${id}-h` : undefined}
            className={`${inputClass} ${field.unit ? 'pr-14' : ''} ${hasError ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20' : ''}`}
          />
          {field.unit && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] text-acero pointer-events-none">
              {field.unit}
            </span>
          )}
        </div>
        {(hint || hasError) && (
          <p id={`${id}-h`} className={`text-[13px] mt-1 ${hasError ? 'text-red-700' : 'text-acero'}`}>
            {hasError ? `Escribe tu ${field.label.toLowerCase()} para enviar la solicitud` : hint}
          </p>
        )}
      </div>
    );
  };

  return (
    <Sheet
      title={`Cotizar ${brand.name}`}
      subtitle="Llena lo que sepas. Lo demás lo vemos por WhatsApp."
      onClose={onClose}
      footer={
        <button
          type="submit"
          form="quote-form"
          className="w-full h-[52px] inline-flex items-center justify-center gap-2 rounded-xl bg-wa hover:brightness-95 text-white text-[17px] font-semibold"
        >
          <WhatsAppIcon className="w-5 h-5" /> Enviar por WhatsApp
        </button>
      }
    >
      <form id="quote-form" onSubmit={handleSubmit} noValidate className="space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h4 className="text-[13px] font-semibold text-stone mb-3">{section.title}</h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">{section.fields.map(renderField)}</div>
          </section>
        ))}
      </form>
    </Sheet>
  );
};

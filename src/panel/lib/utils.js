import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Tamaños de texto propios del panel (tokens en panel.css). Sin esto, twMerge los
// toma por colores y `text-body` borra `text-primary-foreground` en los botones.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "h3", "h4", "body", "body-sm", "caption"] }],
    },
  },
});

/** Une clases condicionales y resuelve conflictos de Tailwind (p. ej. px-2 vs px-4). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

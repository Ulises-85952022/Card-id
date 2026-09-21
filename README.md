# Tarjeta Digital Ejecutiva · Ulises Hernández (AMMEGA Group)

Tarjeta digital interactiva, vCard descargable y directorio de soluciones industriales para **Ulises Hernández**, Key Account Manager en **AMMEGA Group** (Ammeraal Beltech, Megadyne, Jason Industrial).

---

## 📸 Dónde colocar tus fotos y logotipos originales

Para que tus imágenes reales aparezcan automáticamente en la web y en GitHub sin tocar una sola línea de código, solo colócalas en las siguientes rutas con estos nombres:

```text
public/
├── avatar.png           <-- Tu fotografía oficial de perfil (Ulises Hernández)
└── logos/
    ├── ammega.png       <-- Logotipo corporativo de AMMEGA Group
    ├── ammeraal.png     <-- Logotipo de Ammeraal Beltech
    ├── megadyne.png     <-- Logotipo de Megadyne
    └── jason.png        <-- Logotipo de Jason Industrial
```

*Formatos compatibles:* `.png`, `.svg`, `.jpg`, `.webp`.  
*(Si no colocas alguna imagen, el sistema cuenta con respaldos vectoriales de alta fidelidad para que nunca se vea rota).*

---

## 🚀 Cómo publicarlo gratis en GitHub Pages (en 2 minutos)

### Paso 1: Subir a GitHub
1. Descarga el código desde Google AI Studio (Menú **Settings ⚙️ -> Export to GitHub** o descarga el archivo ZIP).
2. Sube el proyecto a tu repositorio en GitHub (por ejemplo, `https://github.com/tu-usuario/tarjeta-ammega`).
3. Agrega tus imágenes en las carpetas mencionadas arriba (`public/avatar.png` y `public/logos/`).

### Paso 2: Activar GitHub Pages
1. En tu repositorio en GitHub, ve a la pestaña **Settings** (Configuración) -> **Pages** (en el menú lateral izquierdo).
2. En **Build and deployment** > **Source**, selecciona **GitHub Actions** o despliega desde la rama con la carpeta `dist`.
3. Tu tarjeta quedará online con enlace público gratuito tipo:  
   `https://tu-usuario.github.io/tarjeta-ammega/`

---

## 💻 Comandos locales (si usas Node.js)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev

# 3. Compilar para producción (genera la carpeta dist/ con el index.html listo)
npm run build
```

La carpeta compilada **`dist/`** contiene todo el sitio web empaquetado en un solo `index.html` con rutas relativas, listo para subirse directamente a cualquier hosting estático (GitHub Pages, Vercel, Netlify, cPanel, etc.).

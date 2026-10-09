# Seguridad de la tarjeta

Cualquiera puede **ver** las tarjetas. Solo pueden **editarlas** las cuentas de Google
registradas como administradoras.

- `?admin=1` en el enlace solo abre la pantalla para entrar con Google; por sí solo no da permisos.
- Las reglas de Firestore (`firestore.rules`) rechazan cualquier escritura que no venga de un
  administrador con sesión iniciada, aunque alguien intente escribir sin pasar por la página.

## Configuración (una sola vez, en console.firebase.google.com)

Proyecto: `gen-lang-client-0087990782`

1. **Activar el acceso con Google**: Authentication → Método de acceso → Google → Habilitar → Guardar.
2. **Autorizar el dominio**: Authentication → Configuración → Dominios autorizados → Agregar dominio →
   `cardwebid.vercel.app` (y tu dominio propio cuando lo tengas).
3. **Registrarte como administrador**: Firestore Database → elige la base de datos
   `ai-studio-uliseshernndezam-…` → Iniciar colección → ID de colección `admins` →
   ID del documento = tu correo de Google **en minúsculas** → agrega un campo cualquiera
   (por ejemplo `nombre` = `Ulises`) → Guardar.
4. **Publicar las reglas**: Firestore Database → misma base de datos → pestaña Reglas → borra todo,
   pega el contenido de `firestore.rules` → Publicar.

Para agregar otro administrador, repite el paso 3 con su correo. Para quitarlo, borra su documento.

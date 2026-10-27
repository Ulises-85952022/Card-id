# Seguridad de la tarjeta

Cualquiera puede **ver** las tarjetas. Solo pueden **editarlas** las cuentas registradas como
administradoras.

- `?admin=1` en el enlace solo abre la pantalla para entrar con correo y contraseña; por sí solo no da permisos.
- Las reglas de Firestore (`firestore.rules`) rechazan cualquier escritura que no venga de un
  administrador con sesión iniciada, aunque alguien intente escribir sin pasar por la página.

## Configuración (una sola vez, en console.firebase.google.com)

Proyecto: `gen-lang-client-0087990782`

1. **Activar correo y contraseña**: Authentication → Método de acceso → Correo electrónico/contraseña →
   Habilitar (solo la primera opción) → Guardar.
2. **Crear tu usuario**: Authentication → Usuarios → Agregar usuario → tu correo y una contraseña.
3. **Desactivar el registro público**: Authentication → Configuración → Acciones del usuario →
   desmarca "Habilitar creación (registro)" → Guardar. Así nadie puede crearse una cuenta por su cuenta.
4. **Registrarte como administrador**: Firestore Database → base de datos `ai-studio-uliseshernndezam-…` →
   colección `admins` → documento con ID = el mismo correo del paso 2, **en minúsculas**
   (agrega un campo cualquiera, por ejemplo `nombre` = `Ulises`).
5. **Publicar las reglas**: Firestore Database → misma base → Reglas → pega el contenido de
   `firestore.rules` → Publicar.

Para agregar otro administrador: crea su usuario (paso 2) y su documento en `admins` (paso 4).
Para quitarlo: borra su documento en `admins` y, si quieres, su usuario.
Si olvidas tu contraseña, usa "Olvidé mi contraseña" en la pantalla de acceso.

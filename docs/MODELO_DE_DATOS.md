# Modelo de datos de net carID AI

Base de datos: **Cloud Firestore** (proyecto `gen-lang-client-0087990782`). Tipos en
`src/types/database.ts`, operaciones en `src/lib/db/`, reglas en `firestore.rules`.

## Decisiones frente a la especificación

| Especificación | Implementación | Por qué |
|---|---|---|
| Tablas SQL | Colecciones con prefijo `saas_` | `cards` ya la usa la tarjeta digital en producción (`src/lib/cardsService.ts`). Reutilizarla la rompe. |
| Claves foráneas | Campos `*_id` + cascadas en código (`src/lib/db/cascade.ts`) | Firestore no tiene claves foráneas ni `ON DELETE`. |
| `unique` en `slug` y `unique_slug` | Documentos en `saas_slugs` (id = slug) | Las reglas no pueden imponer unicidad; la creación de un documento existente falla. |
| `vip_vault_password_hash` y `vip_vault_content` en `prospect_links` | En `saas_prospect_link_secrets`, con el mismo id | `saas_prospect_links` se lee públicamente; ahí no pueden vivir secretos (criterio 4). |
| Ids UUID | `crypto.randomUUID()` | Igual que la especificación. En `saas_profiles` el id es el uid de Firebase Auth. |
| Timestamps `timestamptz` | Timestamp de Firestore, leído como ISO 8601 | Mismo significado; los tipos TypeScript usan `ISODateTime`. |

Base44 no se usa: el backend es Firebase, que ya está en el proyecto.

## Colecciones

- `saas_profiles` (id = uid): perfil del consultor o de la agencia.
- `saas_cards`: tarjetas maestras. Lectura pública solo si `is_active`.
- `saas_services`: catálogo por tarjeta. `is_vip_only` oculta el servicio al público.
- `saas_testimonials`: casos de éxito.
- `saas_prospect_links`: variantes por prospecto (sin secretos).
- `saas_prospect_link_secrets`: contraseña de la bóveda y contenido confidencial. Solo el dueño.
- `saas_quotes`: cotizaciones. Anónimos insertan; el dueño lee y cambia el `status`.
- `saas_analytics_events`: eventos. Anónimos insertan; el dueño o su agencia leen.
- `saas_slugs`: reserva de slugs únicos.

## Permisos (resumen de `firestore.rules`)

- **Perfiles:** se lee el propio y el de la misma agencia. Solo se cambian `full_name`,
  `company_name`, `avatar_url` y `whatsapp_number`. Rol, plan, agencia y correo los fija el sistema.
- **Tarjetas, servicios, casos, enlaces:** lectura pública si están activos; lectura privada para
  el dueño y su agencia; escritura solo para el dueño.
- **Cotizaciones y analíticas:** inserción anónima solo en tarjetas activas, con validación de campos.
- **Secretos de la bóveda:** solo el dueño.

## Pruebas

`tests/firestore-rules/rules.test.mjs` prueba 11 casos de acceso contra el emulador de Firestore
(requiere Java). Pasaron los 11 en la última ejecución. Para repetirlo, instala las herramientas
de prueba como dependencias de desarrollo:

```bash
npm i -D firebase-tools @firebase/rules-unit-testing
npx firebase emulators:exec --only firestore --project demo-carid "node tests/firestore-rules/rules.test.mjs"
```

## Pendiente

1. **Desbloquear la bóveda VIP:** comparar la contraseña con el hash requiere una Cloud Function. Hasta
   entonces, el cliente no puede leer `saas_prospect_link_secrets`, así que el flujo está cerrado.
2. **Límite de abuso en cotizaciones y analíticas:** las reglas no limitan la frecuencia. Falta
   Firebase App Check.
3. **`ip_hash`:** debe calcularse en el servidor (Cloud Function), nunca en el navegador.
4. **Consultas de lista con `get()`:** las lecturas por `card_id` del dueño dependen de reglas con `get()`.
   Las pruebas cubren los documentos individuales; las consultas con `where` deben verificarse en el
   emulador antes de producción.
5. **Agencias:** el mismo `agency_id` permite leer tarjetas privadas dentro de la agencia (según la
   especificación). Si no se quiere, quitar `sameAgencyAs` de `canReadPrivateCard`.
6. **Índices:** `firestore.indexes.json` define los compuestos. Desplegar con
   `firebase deploy --only firestore`.

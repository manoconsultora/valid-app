# Schema — Proveedor

## Tablas

### `public.provider_categories`

Catálogo de categorías de proveedor. Tabla de lookup con seed inicial (8 categorías).

| Columna    | Tipo        | Nullable | Default           | Constraint | Notas                                    |
| ---------- | ----------- | -------- | ----------------- | ---------- | ---------------------------------------- |
| id         | UUID        | NO       | gen_random_uuid() | PK         |                                          |
| slug       | TEXT        | NO       | —                 | UNIQUE     | Identificador legible (ej. equipamiento) |
| name       | TEXT        | NO       | —                 |            | Nombre mostrado                          |
| created_at | TIMESTAMPTZ | NO       | now()             |            |                                          |
| updated_at | TIMESTAMPTZ | NO       | now()             |            | Trigger set_updated_at                   |

### `public.providers`

Proveedores (empresas). Cada uno vinculado a un usuario de auth vía `public.users`.

| Columna      | Tipo        | Nullable | Default           | Constraint                   | Notas                     |
| ------------ | ----------- | -------- | ----------------- | ---------------------------- | ------------------------- |
| id           | UUID        | NO       | gen_random_uuid() | PK                           |                           |
| user_id      | UUID        | NO       | —                 | UNIQUE, FK → users(id)       | Un usuario = un proveedor |
| category_id  | UUID        | NO       | —                 | FK → provider_categories(id) | ON DELETE RESTRICT        |
| razon_social | TEXT        | NO       | —                 |                              | min 2, max 200            |
| cuit         | TEXT        | NO       | —                 | UNIQUE, CHECK formato        | Formato XX-XXXXXXXX-X     |
| email        | TEXT        | NO       | —                 |                              | Debe coincidir con login  |
| phone        | TEXT        | YES      | —                 |                              | max 50                    |
| contact_name | TEXT        | YES      | —                 |                              | max 200                   |
| contact_role | TEXT        | YES      | —                 |                              | max 200                   |
| created_at   | TIMESTAMPTZ | NO       | now()             |                              |                           |
| updated_at   | TIMESTAMPTZ | NO       | now()             |                              | Trigger set_updated_at    |

- **CHECK cuit:** `cuit ~ '^\d{2}-\d{8}-\d{1}$'` (dígito verificador se valida en app con util).
- **user_id:** FK a `public.users(id) ON DELETE CASCADE` — al borrar el usuario se borra el proveedor.

## ENUMs

No se agregan ENUMs nuevos; se usa la tabla `provider_categories` como catálogo.

## Relaciones

```
auth.users (Supabase)
    ↓ 1:1 (trigger handle_new_user)
public.users (id, email, name, role)
    ↑ 1:1
public.providers (user_id)  ←→  public.provider_categories (id) N:1
```

- **Proveedor** → **public.users**: `providers.user_id` REFERENCES `users(id)` ON DELETE CASCADE.
- **Proveedor** → **provider_categories**: `providers.category_id` REFERENCES `provider_categories(id)` ON DELETE RESTRICT.

## Índices

- `idx_providers_user_id` ON `providers(user_id)` — FK y búsqueda por usuario.
- `idx_providers_category_id` ON `providers(category_id)` — FK y filtros por categoría.
- `idx_providers_cuit` — ya cubierto por UNIQUE.
- `idx_providers_email` — búsquedas por email (opcional; si se filtra por email con frecuencia).

## RLS por rol

| Tabla               | Operación            | Rol                    | Condición                                       |
| ------------------- | -------------------- | ---------------------- | ----------------------------------------------- |
| provider_categories | SELECT               | authenticated          | true (todos leen catálogo)                      |
| provider_categories | INSERT/UPDATE/DELETE | —                      | Solo service_role/postgres (admin vía backend)  |
| providers           | SELECT               | admin                  | true                                            |
| providers           | SELECT               | provider               | user_id = auth.uid() (solo su propio registro)  |
| providers           | INSERT               | postgres, service_role | true (Server Action con service o sesión admin) |
| providers           | UPDATE               | admin                  | true                                            |
| providers           | UPDATE               | provider               | user_id = auth.uid() (solo propios)             |
| providers           | DELETE               | admin (o service_role) | true                                            |

## Triggers necesarios

- **set_updated_at** en `provider_categories` y en `providers` (reutilizar función `update_updated_at()` de 002).

## Flujo de creación de proveedor (invite)

1. **Server Action** (solo admin):
   - Valida datos con Zod (incl. CUIT con util de dígito verificador).
   - `supabase.auth.admin.createUser({ email, email_confirm: true, user_metadata: { name: razon_social } })` — **no** enviar contraseña; Supabase envía al usuario un mail con link para definir contraseña (invite/reset).
   - Trigger `handle_new_user` inserta en `public.users` con `role = NULL`.
   - Llamar `assign_user_role(nuevo_user_id, 'provider')` (función de 006).
   - Insertar en `public.providers` con `user_id = nuevo_user_id` y el resto de campos.
2. El usuario proveedor recibe el correo con link para establecer contraseña; nunca se envía contraseña por mail.

## Server Actions necesarias

- **createProveedor(data)** — valida con Zod; crea usuario en auth (invite); asigna rol provider; inserta en `providers`. Solo admin.
- **updateProveedor(id, data)** — actualiza campos editables; admin puede editar cualquier proveedor; provider solo el propio (por `user_id = auth.uid()`).
- **listProveedores()** — admin: todos; provider: solo el registro donde `user_id = auth.uid()`.
- **getProviderCategories()** — lista de categorías para selects (puede ser público o authenticated).

## Seed de provider_categories

Insertar las 8 categorías actuales (slug = id legacy para compatibilidad):

| slug         | name         |
| ------------ | ------------ |
| equipamiento | Equipamiento |
| tecnologia   | Tecnología   |
| iluminacion  | Iluminación  |
| audio        | Audio        |
| montaje      | Montaje      |
| seguridad    | Seguridad    |
| catering     | Catering     |
| transporte   | Transporte   |

El seed se ejecuta en el mismo script de tablas (007) con `INSERT ... ON CONFLICT DO NOTHING` sobre `slug` o por valores fijos de UUID si se desea reproducibilidad.

---

## Auditoría de seguridad (auth-security)

- **Campos sensibles:** No se guardan contraseñas ni tokens en `public.*`; el password solo se usa en el flujo de creación en auth (invite); el usuario recibe mail con link para definir contraseña.
- **Credenciales server-side:** La creación de usuario y de proveedor se hace desde Server Action con `supabase.auth.admin.createUser` y asignación de rol vía `assign_user_role`.
- **RLS:** Definido en 009 para ambas tablas; políticas por operación (SELECT/INSERT/UPDATE/DELETE); postgres/service_role tienen full access para triggers y backend; provider solo accede a su propio registro.
- **Políticas INSERT para triggers:** No hay triggers que inserten en `providers`; el insert lo hace la Server Action con sesión admin o service_role, cubiertas por las políticas de 009.
- **Inputs de texto:** Validación con Zod en `src/lib/validations/proveedor.ts` (longitudes, email, CUIT con util de dígito verificador).
- **CUIT:** CHECK de formato en DB (007); dígito verificador validado en app con `src/lib/utils/cuit.ts`.

**Sin ítems BLOQUEANTES.**

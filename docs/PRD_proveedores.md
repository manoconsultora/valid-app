# PRD — Proveedor

## Contexto

Entidad que representa una empresa proveedora que puede ser asignada a eventos por el admin. El admin crea proveedores desde el formulario "Agregar Proveedor"; al guardar se crea el registro en DB y un usuario en auth (Supabase). Las credenciales iniciales se usan solo para que auth cree el usuario; al proveedor se le envía un mail con link de reseteo (magic link), nunca la contraseña por correo.

## Roles con acceso

| Rol      | Puede crear | Puede leer       | Puede editar     | Puede eliminar |
| -------- | ----------- | ---------------- | ---------------- | -------------- |
| admin    | ✅          | ✅               | ✅               | ✅             |
| provider | ❌          | ✅ (solo propio) | ✅ (solo propio) | ❌             |

## Campos del formulario

| Campo                | Nombre técnico | Tipo    | Requerido | Validaciones                              | Notas                                     |
| -------------------- | -------------- | ------- | --------- | ----------------------------------------- | ----------------------------------------- |
| Razón Social         | `razon_social` | TEXT    | ✅        | min 2, max 200                            | Nombre legal de la empresa                |
| CUIT                 | `cuit`         | TEXT    | ✅        | formato 00-00000000-0, dígito verificador | Único en el sistema; validar con util     |
| Categoría            | `category_id`  | UUID FK | ✅        | FK a provider_categories                  | Una categoría por proveedor (MVP)         |
| Email Corporativo    | `email`        | TEXT    | ✅        | formato email                             | Único; se usa para login del usuario auth |
| Teléfono             | `phone`        | TEXT    | ❌        | opcional, max 50                          | Un solo teléfono por proveedor            |
| Contacto Responsable | `contact_name` | TEXT    | ❌        | max 200                                   | Nombre del responsable                    |
| Función del Contacto | `contact_role` | TEXT    | ❌        | max 200                                   | Ej: RRHH, Dueño, Gerente                  |

## Entidad relacionada: Categoría de proveedor

La categoría es una **tabla en la DB** (`provider_categories`) para poder testear y eventualmente que el admin gestione categorías. MVP: una sola categoría por proveedor (FK).

| Campo | Nombre técnico | Tipo | Notas                                |
| ----- | -------------- | ---- | ------------------------------------ |
| id    | `id`           | UUID | PK                                   |
| name  | `name`         | TEXT | Nombre mostrado (ej. "Equipamiento") |

**Seed inicial** (convertir de `PROVIDER_CATEGORIES` actual para que el formato coincida con la DB y se pueda testear):

| id (slug para seed) | name         |
| ------------------- | ------------ |
| equipamiento        | Equipamiento |
| tecnologia          | Tecnología   |
| iluminacion         | Iluminación  |
| audio               | Audio        |
| montaje             | Montaje      |
| seguridad           | Seguridad    |
| catering            | Catering     |
| transporte          | Transporte   |

Recomendación: en la DB usar UUID como PK y opcionalmente un `slug` o `code` único para migrar desde los ids actuales; el seed puede insertar estos 8 registros.

## Relaciones

- **Proveedor** pertenece a **provider_categories** → `providers.category_id` → `provider_categories.id`
- Usuario de auth: un registro en `auth.users` (Supabase) vinculado al proveedor; el vínculo se puede hacer por `email` o por tabla `profiles`/`users` con `provider_id` (según diseño de db-architect).

## Campos generados (no editables por usuario)

- `id`: UUID generado automáticamente (proveedor).
- `created_at`: timestamp automático.
- `updated_at`: timestamp automático (trigger o app).
- Credenciales (email/password) en el modal: el **password** es solo para que auth cree el usuario; no se persiste en nuestra DB. Al usuario se le envía email con link de reseteo (magic link), nunca la contraseña por mail.

## Reglas de negocio

1. **CUIT** es único en el sistema (UNIQUE en DB).
2. **CUIT** debe validar dígito verificador (util recomendada: `src/lib/utils/cuit.ts` o similar).
3. Al crear proveedor, se crea o vincula un usuario real en **auth** (Supabase); el password generado es solo para la creación en auth; al proveedor se le envía un mail con link para reset (magic link), nunca la contraseña por correo.
4. **Email** del proveedor es el identificador de login; debe ser único en auth.
5. Un proveedor tiene una sola categoría (FK a `provider_categories`).
6. Un solo teléfono por proveedor (MVP).

## Campos sensibles / de seguridad

- **Email**: identificador de login; no exponer en logs; único en auth.
- **Password**: no persistir en nuestra DB; solo usar en el flujo de creación en auth; nunca enviar por mail; usar magic link para reseteo.

## Schema Zod (para reutilizar en frontend y Server Actions)

```ts
import { z } from 'zod'

// Util de CUIT: validar formato 00-00000000-0 y dígito verificador.
// Ejemplo de uso: isValidCuit(cuit) → boolean
// Recomendación: implementar en src/lib/utils/cuit.ts

const cuitSchema = z
  .string()
  .min(1, 'CUIT requerido')
  .regex(/^\d{2}-\d{8}-\d{1}$/, 'Formato: 00-00000000-0')
  .refine(val => isValidCuit(val), 'CUIT con dígito verificador inválido')

export const providerCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
})

export const createProviderSchema = z.object({
  razon_social: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  cuit: cuitSchema,
  category_id: z.string().uuid('Seleccione una categoría'),
  email: z.string().email('Email corporativo inválido'),
  phone: z.string().max(50).optional().or(z.literal('')),
  contact_name: z.string().max(200).optional().or(z.literal('')),
  contact_role: z.string().max(200).optional().or(z.literal('')),
})

export type CreateProviderInput = z.infer<typeof createProviderSchema>
```

Nota: `isValidCuit` debe implementarse en una util (ej. `src/lib/utils/cuit.ts`) con el algoritmo de dígito verificador del CUIT argentino.

## Preguntas resueltas

| Pregunta                                | Decisión                    | Justificación                                                                                                                                                      |
| --------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ¿Categoría enum o tabla?                | Tabla `provider_categories` | Permitir testear con formato de DB y que el admin gestione categorías; seed con la lista actual de `PROVIDER_CATEGORIES`.                                          |
| ¿CUIT único?                            | Sí, único en el sistema     | Un CUIT identifica una sola empresa en el sistema.                                                                                                                 |
| ¿Validación CUIT?                       | Sí, dígito verificador      | Util dedicada (ej. `src/lib/utils/cuit.ts`) para validar formato y dígito verificador.                                                                             |
| ¿Credenciales crean usuario en auth?    | Sí                          | Crear usuario real en auth; el pass es solo para que auth cree la cuenta; al usuario se envía mail con link de reseteo (magic link), nunca la contraseña por mail. |
| ¿Varios teléfonos por proveedor?        | No, uno solo (MVP)          | Un campo `phone` por proveedor.                                                                                                                                    |
| ¿Una o varias categorías por proveedor? | Una (MVP)                   | FK `category_id` a `provider_categories`; si más adelante se necesitan varias, se puede añadir tabla junction.                                                     |

---

## Formato DB para testear (PROVIDER_CATEGORIES)

Para poder testear antes de tener la DB real, conviene que `PROVIDER_CATEGORIES` en código use el mismo formato que tendrá la tabla (por ejemplo objetos con `id` UUID o `id` + `name`, o seed en JSON). Así, al pasar a Supabase, el seed de `provider_categories` y el dropdown del formulario pueden compartir la misma estructura. db-architect puede definir el schema y el seed; el frontend puede seguir consumiendo una lista de categorías (desde constant seed o desde API) con la misma forma.

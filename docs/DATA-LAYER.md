# Capa de datos – VALID Fase 1

Documento breve sobre mocks, estructura de datos y endpoints esperados para la Fase 2 (backend).

---

## 1. Fuente de datos en Fase 1

- **Eventos**: `src/data/mock-events.ts` (inicial) + `src/lib/events-store.ts` (localStorage `valid_events`). Alta desde Admin → Crear evento.
- **Proveedores**: `src/data/mock-providers.ts` (inicial) + `src/lib/providers-store.ts` (localStorage `valid_providers`). Alta desde Admin → Proveedores.
- **Auth**: Supabase Auth + perfiles en `public.users`. Cliente en `src/lib/supabase/client.ts`; hooks `useAuth` y `useUser` en `src/hooks/`. Ver `docs/supabase-auth.md`. Referencia de usuarios demo en `src/data/mock-users.ts`.
- **Constantes**: venues y categorías en `src/lib/constants.ts`.

---

## 2. Estructura de datos (tipos en `src/types/index.ts`)

| Entidad    | Campos principales |
|-----------|---------------------|
| **User**  | id, email, name, role (admin \| provider) |
| **Event** | id, name, date, venueId, timeRange, description, flyerUrl?, protocolUrl?, protocolNotes?, providerIds[], statusAdmin (ARMADO \| LIVE \| VALIDACIÓN), statusProvider?, isNew?, rejectionReason? |
| **Provider** | id, razonSocial, cuit, categoryId, email, phone, contactName, contactRole |
| **Venue** | id, name, city (CABA \| Córdoba) |
| **Session** | user, expiresAt |

---

## 3. Endpoints esperados (Fase 2)

A continuación, la capa front esperaría estos recursos (reemplazando stores y mocks):

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST   | `/api/auth/login` | Body: `{ email, password }`. Devuelve token y user (con role). |
| POST   | `/api/auth/logout` | Invalida sesión. |
| GET    | `/api/events` | Lista eventos (admin: todos; proveedor: asignados). |
| GET    | `/api/events/:id` | Detalle evento. |
| POST   | `/api/events` | Crear evento (admin). Body: nombre, fecha, venueId, timeRange, descripción, protocolNotes?, providerIds[], archivos (flyer, protocolo). |
| PATCH  | `/api/events/:id` | Actualizar evento (estado, notificar, aprobar/rechazar). |
| GET    | `/api/providers` | Lista proveedores (admin). |
| POST   | `/api/providers` | Alta proveedor + opción “generar credenciales”. |
| POST   | `/api/events/:id/validacion-a` | Subida documentación corporativa (tipos ART, AP, CAT, etc.; hasta 3 PDFs por tipo). |
| POST   | `/api/events/:id/validacion-b` | Subida Excel nómina empleados. |
| POST   | `/api/events/:id/trabajadores` | Alta trabajador (rol, DNI frente/dorso, carnet ART). |

---

## 4. Credenciales demo

Crear en Supabase (Auth y fila en `public.users` con el role correspondiente). Referencia: `src/data/mock-users.ts`.

- **Admin**: admin@productora.com / admin123  
- **Proveedor**: proveedor@empresa.com / prov123  

El proveedor demo está asociado al proveedor con id `p1` en los mocks (eventos asignados por `providerIds`).

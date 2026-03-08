# Esquema Supabase – VALID

Modelo de datos para columnas y tablas en Supabase. Nombres en `snake_case`. PKs tipo `uuid` por defecto.

## Enums

```sql
CREATE TYPE app_role AS ENUM ('admin', 'proveedor');

CREATE TYPE event_status_admin AS ENUM ('ARMADO', 'LIVE', 'VALIDACIÓN');

CREATE TYPE event_status_provider AS ENUM (
  'Cargar Documentación',
  'Documentación Aprobada',
  'Documentación Rechazada'
);

CREATE TYPE documentation_status AS ENUM ('pending', 'approved', 'rejected', 'error');

CREATE TYPE validation_error_type AS ENUM ('empresa', 'nomina');
```

## Tablas

### venues

```sql
CREATE TABLE venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### provider_categories

```sql
CREATE TABLE provider_categories (
  id text PRIMARY KEY,
  name text NOT NULL
);
```

### users (profiles de app; auth en auth.users)

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### providers

```sql
CREATE TABLE providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social text NOT NULL,
  cuit text NOT NULL UNIQUE,
  category_id text NOT NULL REFERENCES provider_categories(id),
  email text NOT NULL,
  phone text,
  contact_name text,
  contact_role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### events

```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  date_display text,
  venue_id uuid NOT NULL REFERENCES venues(id),
  time_range text NOT NULL,
  description text NOT NULL,
  flyer_url text,
  protocol_url text,
  protocol_notes text,
  status_admin event_status_admin NOT NULL,
  status_provider event_status_provider,
  employee_count int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### event_providers (relación N:M evento–proveedor)

```sql
CREATE TABLE event_providers (
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  employee_count int NOT NULL DEFAULT 0,
  documentation_status documentation_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, provider_id)
);

CREATE INDEX idx_event_providers_event_id ON event_providers(event_id);
CREATE INDEX idx_event_providers_provider_id ON event_providers(provider_id);
```

### validation_errors

```sql
CREATE TABLE validation_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type validation_error_type NOT NULL,
  entity_ref text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_validation_errors_event_id ON validation_errors(event_id);
```

### employees (RRHH)

```sql
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cuil text NOT NULL,
  company_id text NOT NULL,
  position text NOT NULL,
  email text,
  phone text,
  status text NOT NULL CHECK (status IN ('Activo', 'Inactivo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### companies (opcional; para RRHH)

```sql
CREATE TABLE companies (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Si se usa: ALTER TABLE employees ADD CONSTRAINT fk_company
--   FOREIGN KEY (company_id) REFERENCES companies(id);
```

## Triggers updated_at (opcional)

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ejemplo por tabla:
-- CREATE TRIGGER venues_updated_at BEFORE UPDATE ON venues
--   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## Relaciones

- `events.venue_id` → `venues.id`
- `events` ↔ `providers`: N:M vía `event_providers`
- `event_providers.event_id` → `events.id`
- `event_providers.provider_id` → `providers.id`
- `validation_errors.event_id` → `events.id`
- `providers.category_id` → `provider_categories.id`

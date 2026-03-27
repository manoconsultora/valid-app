-- 007_provider_tables.sql
-- Orden: 7 (ejecutar tras 002_users_table).
-- Requiere: 002_users_table.sql (users, update_updated_at).
-- Descripción: Tablas provider_categories (catálogo) y providers; seed de 8 categorías. CHECK formato CUIT.

-- Catálogo de categorías de proveedor (lookup)
CREATE TABLE IF NOT EXISTS public.provider_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Proveedores: vinculados 1:1 a public.users (auth)
CREATE TABLE IF NOT EXISTS public.providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.provider_categories(id) ON DELETE RESTRICT,
  razon_social text NOT NULL,
  cuit text NOT NULL,
  email text NOT NULL,
  phone text,
  contact_name text,
  contact_role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT providers_cuit_format CHECK (cuit ~ '^\d{2}-\d{8}-\d{1}$'),
  CONSTRAINT providers_razon_social_len CHECK (char_length(razon_social) >= 2 AND char_length(razon_social) <= 200)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_providers_cuit ON public.providers(cuit);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON public.providers(user_id);
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON public.providers(category_id);

-- Seed: 8 categorías (ON CONFLICT slug para idempotencia)
INSERT INTO public.provider_categories (slug, name)
VALUES
  ('equipamiento', 'Equipamiento'),
  ('tecnologia', 'Tecnología'),
  ('iluminacion', 'Iluminación'),
  ('audio', 'Audio'),
  ('montaje', 'Montaje'),
  ('seguridad', 'Seguridad'),
  ('catering', 'Catering'),
  ('transporte', 'Transporte')
ON CONFLICT (slug) DO NOTHING;

-- ✅ VERIFICACIÓN
-- Tablas creadas: public.provider_categories, public.providers
-- Índices: idx_providers_cuit (UNIQUE), idx_providers_user_id, idx_providers_category_id
-- Seed: 8 filas en provider_categories (si no existían)

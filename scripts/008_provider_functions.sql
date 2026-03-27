-- 008_provider_functions.sql
-- Orden: 8 (ejecutar tras 007_provider_tables).
-- Requiere: 002_users_table.sql (update_updated_at), 007_provider_tables.sql.
-- Descripción: Triggers set_updated_at en provider_categories y providers.

DROP TRIGGER IF EXISTS set_updated_at ON public.provider_categories;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.provider_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.providers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ✅ VERIFICACIÓN
-- Triggers: set_updated_at en provider_categories y providers
-- Función usada: update_updated_at() (definida en 002)

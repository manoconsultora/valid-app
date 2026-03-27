-- 009_provider_rls.sql
-- Orden: 9 (ejecutar tras 008_provider_functions).
-- Requiere: 007_provider_tables.sql.
-- Descripción: RLS en provider_categories y providers. Admin: CRUD proveedores; provider: solo su registro. Catálogo lectura para authenticated.

ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;

-- Catálogo: lectura para autenticados; escritura solo postgres/service_role (admin vía backend)
DROP POLICY IF EXISTS "postgres full access provider_categories" ON public.provider_categories;
CREATE POLICY "postgres full access provider_categories"
  ON public.provider_categories
  FOR ALL
  TO postgres, service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated read provider_categories" ON public.provider_categories;
CREATE POLICY "authenticated read provider_categories"
  ON public.provider_categories
  FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- postgres y service_role pueden hacer todo (Server Actions, triggers)
DROP POLICY IF EXISTS "postgres full access providers" ON public.providers;
CREATE POLICY "postgres full access providers"
  ON public.providers
  FOR ALL
  TO postgres, service_role
  USING (true)
  WITH CHECK (true);

-- Admin: ver todos los proveedores (admin se identifica por public.users.role)
DROP POLICY IF EXISTS "admin select all providers" ON public.providers;
CREATE POLICY "admin select all providers"
  ON public.providers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'::app_role
    )
  );

-- Admin: insertar (crear proveedor desde Server Action con service_role o sesión admin)
DROP POLICY IF EXISTS "admin insert providers" ON public.providers;
CREATE POLICY "admin insert providers"
  ON public.providers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'::app_role
    )
  );

-- Admin: actualizar cualquier proveedor
DROP POLICY IF EXISTS "admin update providers" ON public.providers;
CREATE POLICY "admin update providers"
  ON public.providers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'::app_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'::app_role
    )
  );

-- Admin: eliminar (opcional; si no hay política DELETE, solo service_role/postgres)
DROP POLICY IF EXISTS "admin delete providers" ON public.providers;
CREATE POLICY "admin delete providers"
  ON public.providers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'::app_role
    )
  );

-- Provider: ver y editar solo su propio registro (user_id = auth.uid())
DROP POLICY IF EXISTS "provider select own" ON public.providers;
CREATE POLICY "provider select own"
  ON public.providers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "provider update own" ON public.providers;
CREATE POLICY "provider update own"
  ON public.providers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Permisos de tabla (Supabase no otorga por defecto)
GRANT SELECT ON public.provider_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.providers TO authenticated;

-- ✅ VERIFICACIÓN SUPABASE
-- RLS habilitado en: public.provider_categories, public.providers
-- provider_categories: postgres/service_role ALL; authenticated SELECT
-- providers: postgres/service_role ALL; admin SELECT/INSERT/UPDATE/DELETE; provider SELECT/UPDATE own
-- GRANTs: provider_categories SELECT; providers SELECT, INSERT, UPDATE, DELETE para authenticated

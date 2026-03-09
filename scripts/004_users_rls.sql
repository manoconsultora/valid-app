-- 004_users_rls.sql
-- Orden: 4 (ejecutar tras 003_handle_new_user_trigger).
-- Requiere: 002_users_table.sql.
-- Descripción: RLS en public.users + política postgres full access (trigger) + SELECT para authenticated. GRANTs según supabase-gotchas.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- postgres y service_role pueden hacer todo (trigger handle_new_user y backend)
DROP POLICY IF EXISTS "postgres full access" ON public.users;
CREATE POLICY "postgres full access"
  ON public.users
  FOR ALL
  TO postgres, service_role
  USING (true)
  WITH CHECK (true);

-- Usuarios autenticados ven solo su propio perfil
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "users can read own profile" ON public.users;
DROP POLICY IF EXISTS "postgres or self can insert users" ON public.users;
DROP POLICY IF EXISTS "users can insert own profile" ON public.users;

CREATE POLICY "users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Permisos de schema y tabla (Supabase no los otorga automáticamente)
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT SELECT ON public.users TO authenticated;

-- ✅ VERIFICACIÓN SUPABASE
-- Triggers sobre auth.users: ninguno en este script
-- RLS habilitado en: public.users
--   → Política para postgres/service_role: sí (postgres full access)
--   → Políticas para authenticated: SELECT (own profile)
-- GRANTs aplicados: USAGE public; SELECT public.users TO authenticated

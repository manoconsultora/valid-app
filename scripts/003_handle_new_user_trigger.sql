-- 003_handle_new_user_trigger.sql
-- Orden: 3 (ejecutar tras 002_users_table).
-- Requiere: 001_app_role_enum.sql, 002_users_table.sql.
-- Descripción: Función y trigger para crear perfil en public.users al insertar en auth.users.
-- role siempre NULL — nunca asumir ni leer de raw_user_meta_data (auth-rbac, auth-security). SECURITY DEFINER con search_path = public.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name text;
BEGIN
  user_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), split_part(COALESCE(NEW.email, ''), '@', 1));
  IF user_name = '' THEN
    user_name := 'Usuario';
  END IF;

  INSERT INTO public.users (id, email, name, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), user_name, NULL)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Paso 2 (gotchas): Owner OBLIGATORIO inmediatamente después del CREATE — sin esto falla en Supabase.
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Paso 3: Trigger sobre auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ✅ VERIFICACIÓN SUPABASE
-- Triggers sobre auth.users: on_auth_user_created
--   → SECURITY DEFINER: sí
--   → OWNER TO postgres: sí
-- RLS habilitado en: (ver 004)
-- GRANTs aplicados: ninguno en este script

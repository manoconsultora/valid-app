-- 013_assign_role_with_metadata.sql
-- Orden: 13 (ejecutar tras 011_assign_user_role_signature).
-- Requiere: 001_app_role_enum, 002_users_table, 006_role_nullable_and_assign_user_role.
-- Descripción: Reemplaza assign_user_role para sincronizar también app_metadata.role
--   en auth.users, de modo que el JWT refleje el rol sin consulta a public.users
--   (SOP: metadata-first para middleware, redirects y RLS).

CREATE OR REPLACE FUNCTION public.assign_user_role(
  new_role        app_role,
  target_user_id  uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role app_role;
BEGIN
  SELECT role INTO caller_role
  FROM public.users
  WHERE id = auth.uid();

  IF caller_role IS DISTINCT FROM 'admin'::app_role THEN
    RAISE EXCEPTION 'only admins can assign roles';
  END IF;

  -- 1. Actualizar rol en tabla de perfiles
  UPDATE public.users
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;

  -- 2. Sincronizar role en app_metadata del JWT (metadata-first)
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new_role::text)
  WHERE id = target_user_id;
END;
$$;

ALTER FUNCTION public.assign_user_role(app_role, uuid) OWNER TO postgres;

-- ✅ VERIFICACIÓN
-- Firma: assign_user_role(new_role app_role, target_user_id uuid) — orden alfabético
-- Actualiza: public.users.role + auth.users.raw_app_meta_data->>'role'
-- SECURITY DEFINER: sí | OWNER TO postgres: sí

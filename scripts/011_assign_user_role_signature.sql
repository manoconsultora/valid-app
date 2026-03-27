-- 011_assign_user_role_signature.sql
-- Orden: 11 (ejecutar tras 006).
-- Requiere: 006_role_nullable_and_assign_user_role.sql.
-- Descripción: Redefine assign_user_role con parámetros en orden alfabético (new_role, target_user_id) para que PostgREST/Supabase encuentre la función al llamar por RPC.

CREATE OR REPLACE FUNCTION public.assign_user_role(
  new_role app_role,
  target_user_id uuid
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

  UPDATE public.users
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
END;
$$;

ALTER FUNCTION public.assign_user_role(app_role, uuid) OWNER TO postgres;

-- ✅ VERIFICACIÓN
-- Firma ahora: assign_user_role(new_role, target_user_id) para coincidir con schema cache de Supabase.

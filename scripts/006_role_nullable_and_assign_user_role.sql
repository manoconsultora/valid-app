-- 006_role_nullable_and_assign_user_role.sql
-- Orden: 6 (ejecutar tras 004_users_rls). Requiere: 001, 002, 004.
-- Descripción: (auth-rbac) role nullable en public.users; función para que solo un admin asigne roles. Ejecutar antes de actualizar 003 si la tabla tiene role NOT NULL.

-- Permitir role NULL (nuevos usuarios sin rol hasta asignación por admin)
ALTER TABLE public.users
  ALTER COLUMN role DROP NOT NULL;

-- Función para que un admin asigne rol a un usuario (solo admin puede llamar).
-- Parámetros en orden alfabético (new_role, target_user_id) para que PostgREST/Supabase encuentre la función en el schema cache.
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

-- 012_provider_invitations.sql
-- Orden: 12 (ejecutar tras 008_provider_functions).
-- Requiere: 001_app_role_enum, 002_users_table (update_updated_at).
-- Descripción: Tabla provider_invitations para trackear estado del invite (SOP invite-system).
--   resource_id referencia providers.id sin FK para permitir el orden de inserción
--   (se pre-genera el providerId antes de invitar al usuario).

CREATE TABLE IF NOT EXISTS public.provider_invitations (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id      uuid        NOT NULL,
  supabase_user_id uuid,
  invited_email    text        NOT NULL,
  invited_role     text        NOT NULL DEFAULT 'provider',
  invite_status    text        NOT NULL DEFAULT 'pending'
                               CHECK (invite_status IN ('pending', 'accepted', 'invalid')),
  sent_at          timestamptz NOT NULL DEFAULT now(),
  accepted_at      timestamptz,
  last_error       text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_invitations_resource_id
  ON public.provider_invitations(resource_id);

CREATE INDEX IF NOT EXISTS idx_provider_invitations_supabase_user_id
  ON public.provider_invitations(supabase_user_id);

DROP TRIGGER IF EXISTS set_updated_at ON public.provider_invitations;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.provider_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.provider_invitations ENABLE ROW LEVEL SECURITY;

-- postgres y service_role: acceso total (usado por admin client desde Server Actions)
DROP POLICY IF EXISTS "postgres full access provider_invitations" ON public.provider_invitations;
CREATE POLICY "postgres full access provider_invitations"
  ON public.provider_invitations
  FOR ALL
  TO postgres, service_role
  USING (true)
  WITH CHECK (true);

-- Admin: puede leer todas las invitaciones de su plataforma
DROP POLICY IF EXISTS "admin select all provider_invitations" ON public.provider_invitations;
CREATE POLICY "admin select all provider_invitations"
  ON public.provider_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'::app_role
    )
  );

-- Provider: puede leer su propia invitación (por si se necesita en el portal)
DROP POLICY IF EXISTS "provider select own invitation" ON public.provider_invitations;
CREATE POLICY "provider select own invitation"
  ON public.provider_invitations
  FOR SELECT
  TO authenticated
  USING (supabase_user_id = auth.uid());

GRANT SELECT ON public.provider_invitations TO authenticated;

-- ✅ VERIFICACIÓN
-- Tabla: public.provider_invitations
-- Índices: idx_provider_invitations_resource_id, idx_provider_invitations_supabase_user_id
-- RLS habilitado: sí
--   → postgres/service_role: ALL
--   → admin authenticated: SELECT
--   → provider authenticated: SELECT own (supabase_user_id = auth.uid())
-- GRANT: SELECT a authenticated
-- Nota: INSERT/UPDATE solo vía service_role (admin client en Server Actions)

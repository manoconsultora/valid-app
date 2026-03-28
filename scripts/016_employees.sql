-- Employees belonging to internal companies (RRHH).
-- user_id is set only when the employee has been granted admin dashboard access via invitation.
CREATE TABLE employees (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  cuil        TEXT        NOT NULL,
  company_id  UUID        NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  position    TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  status      TEXT        NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo', 'Inactivo')),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_employees" ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

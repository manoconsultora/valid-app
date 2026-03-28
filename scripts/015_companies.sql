-- Internal group companies (RRHH). No user access — employees access is managed at employee level.
CREATE TABLE companies (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  cuit          TEXT        NOT NULL UNIQUE,
  category_id   UUID        NOT NULL REFERENCES categories(id),
  email         TEXT        NOT NULL,
  phone         TEXT,
  contact_name  TEXT,
  contact_role  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_companies" ON companies
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

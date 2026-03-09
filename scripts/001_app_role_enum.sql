-- 001_app_role_enum.sql
-- Orden: 1 (ejecutar primero).
-- Requiere: ninguno.
-- Descripción: Crea el enum app_role (admin, provider) para perfiles de app. Idempotente.

DO $$
BEGIN
  CREATE TYPE app_role AS ENUM ('admin', 'provider');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

# Scripts SQL – Supabase (VALID)

Ejecutar en **Supabase → SQL Editor** en este orden. El prefijo numérico indica el orden de ejecución.

| Orden | Archivo | Descripción |
|-------|---------|-------------|
| 1 | `001_app_role_enum.sql` | Enum `app_role` (admin, provider). Idempotente. |
| 2 | `002_users_table.sql` | Tabla `public.users` (perfiles), función `update_updated_at` y trigger de auditoría. |
| 3 | `003_handle_new_user_trigger.sql` | Trigger: crea perfil en `public.users` al registrarse; role por defecto `provider`. |
| 4 | `004_users_rls.sql` | RLS en `public.users`: solo lectura del propio perfil. |
| 5 | `005_set_admin_role_by_email.sql` | Opcional: asigna role `admin` al email de demo si quedó como `provider`. |
| 6 | `006_role_nullable_and_assign_user_role.sql` | role nullable; función `assign_user_role` (solo admin). Ejecutar si la tabla tenía role NOT NULL. |

**Convenciones:** sql-scripts (cabecera, auditoría, RLS) + supabase-gotchas (OWNER TO postgres inmediatamente después del CREATE, política "postgres full access" FOR ALL, GRANTs, TO authenticated explícito).

**Si falla "Database error creating new user":** Reejecutar **003** (con ALTER FUNCTION antes del trigger) y **004** (postgres full access + GRANTs). Ver `.cursor/rules/supabase-gotchas.mdc`. Logs: Supabase → Logs → Postgres.

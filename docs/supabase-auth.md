# Supabase Auth – VALID

Autenticación con Supabase Auth y perfiles en `public.users`. Roles automáticos y usuarios auto aprobados.

## Variables de entorno

Copiar `.env.example` a `.env.local` y rellenar:

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto (Dashboard → Settings → API).
- Clave pública: `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (Supabase puede dar una u otra; el cliente acepta ambas).

## Trigger: perfil con rol por defecto

Al insertar un usuario en `auth.users`, se crea la fila en `public.users` con rol por defecto `provider`. Para asignar admin, actualizar `role` en `public.users` manualmente o vía Dashboard.

Ejecutar en el SQL Editor de Supabase:

```sql
-- Crear perfil en public.users al registrarse (roles automáticos)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'provider')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- Rol por defecto: `provider`. Para que un usuario sea admin: `UPDATE public.users SET role = 'admin' WHERE id = '<auth.users id>';`
- Opcional: al crear usuario desde Dashboard o API, pasar en `raw_user_meta_data` la clave `role: 'admin'` para que el trigger lo use.

## RLS en public.users

Cada usuario solo debe poder leer su propio perfil:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);
```

El trigger `handle_new_user` usa `SECURITY DEFINER`, por lo que puede insertar aunque RLS esté activo. Si se añade registro desde la app, puede ser necesario una policy de INSERT para `auth.uid() = id` o usar una función definer para el insert.

## Auto aprobados

- No hay flujo de “pendiente de aprobación”: si existe sesión y fila en `public.users`, el usuario puede usar la app.
- Para que el registro sea inmediato sin confirmar email: en Supabase Dashboard → Authentication → Providers → Email, desactivar “Confirm email” si se desea.

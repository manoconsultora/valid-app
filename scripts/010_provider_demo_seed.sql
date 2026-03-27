-- 010_provider_demo_seed.sql
-- Orden: 10 (ejecutar tras 009_provider_rls).
-- Requiere: 001–009 (auth, users, provider_categories, providers, RLS).
-- Descripción: Inserta 5 proveedores demo (auth.users + auth.identities; trigger llena public.users; asignamos role provider; insertamos public.providers).
-- Contraseña común para todos los proveedores demo: DemoProvider1!
-- Ejecutar una sola vez; si se repite, puede dar error de email/CUIT duplicado.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id uuid;
  v_encrypted_pw text := crypt('DemoProvider1!', gen_salt('bf'));
  v_email text;
  v_name text;
  v_cat_slug text;
  v_razon_social text;
  v_cuit text;
  v_phone text;
  v_contact_name text;
  v_contact_role text;
  v_demo record;
BEGIN
  FOR v_demo IN
    SELECT * FROM (VALUES
      ('valid-app+sullair@ma-no.work', 'SULLAIR ARGENTINA SA', 'equipamiento', '30-57672171-0', '+54 9 11 1234-5678', 'Nombre del responsable', 'Recursos Humanos'),
      ('valid-app+eventos@ma-no.work', 'TECNO EVENTOS SRL', 'tecnologia', '30-71234567-8', '+54 9 11 1234-5678', 'Nombre del responsable', 'Gerente de Operaciones'),
      ('valid-app+iluminacionpro@ma-no.work', 'ILUMINACIÓN PRO SA', 'iluminacion', '30-61234567-9', '+54 9 11 1234-5678', 'Nombre del responsable', 'Dueño'),
      ('valid-app+master@ma-no.work', 'SONIDO MASTER SRL', 'audio', '30-81234567-0', '+54 9 11 1234-5678', 'Nombre del responsable', 'Director Técnico'),
      ('valid-app+elite@ma-no.work', 'ESTRUCTURAS ELITE SA', 'montaje', '30-91234567-1', '+54 9 11 1234-5678', 'Nombre del responsable', 'Gerente de Operaciones')
    ) AS t(email, razon_social, cat_slug, cuit, phone, contact_name, contact_role)
  LOOP
    v_email := v_demo.email;
    v_name := v_demo.razon_social;
    v_cat_slug := v_demo.cat_slug;
    v_razon_social := v_demo.razon_social;
    v_cuit := v_demo.cuit;
    v_phone := v_demo.phone;
    v_contact_name := v_demo.contact_name;
    v_contact_role := v_demo.contact_role;

    IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
      CONTINUE;
    END IF;

    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('name', v_name),
      now(),
      now()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      v_user_id,
      format('{"sub": "%s", "email": "%s"}', v_user_id, v_email)::jsonb,
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );
  END LOOP;
END $$;

-- Asignar rol provider a los usuarios demo (el trigger los crea con role NULL)
UPDATE public.users
SET role = 'provider'::app_role, updated_at = now()
WHERE email IN (
  'valid-app+sullair@ma-no.work',
  'valid-app+eventos@ma-no.work',
  'valid-app+iluminacionpro@ma-no.work',
  'valid-app+master@ma-no.work',
  'valid-app+elite@ma-no.work'
);

-- Insertar filas en public.providers (solo si no existe ya el CUIT)
INSERT INTO public.providers (user_id, category_id, razon_social, cuit, email, phone, contact_name, contact_role)
SELECT u.id, pc.id, v.razon_social, v.cuit, v.email, v.phone, v.contact_name, v.contact_role
FROM (VALUES
  ('valid-app+sullair@ma-no.work', 'SULLAIR ARGENTINA SA', 'equipamiento', '30-57672171-0', '+54 9 11 1234-5678', 'Nombre del responsable', 'Recursos Humanos'),
  ('valid-app+eventos@ma-no.work', 'TECNO EVENTOS SRL', 'tecnologia', '30-71234567-8', '+54 9 11 1234-5678', 'Nombre del responsable', 'Gerente de Operaciones'),
  ('valid-app+iluminacionpro@ma-no.work', 'ILUMINACIÓN PRO SA', 'iluminacion', '30-61234567-9', '+54 9 11 1234-5678', 'Nombre del responsable', 'Dueño'),
  ('valid-app+master@ma-no.work', 'SONIDO MASTER SRL', 'audio', '30-81234567-0', '+54 9 11 1234-5678', 'Nombre del responsable', 'Director Técnico'),
  ('valid-app+elite@ma-no.work', 'ESTRUCTURAS ELITE SA', 'montaje', '30-91234567-1', '+54 9 11 1234-5678', 'Nombre del responsable', 'Gerente de Operaciones')
) AS v(email, razon_social, cat_slug, cuit, phone, contact_name, contact_role)
JOIN public.users u ON u.email = v.email
JOIN public.provider_categories pc ON pc.slug = v.cat_slug
WHERE NOT EXISTS (SELECT 1 FROM public.providers p WHERE p.cuit = v.cuit);

-- ✅ VERIFICACIÓN
-- 5 usuarios en auth.users (y auth.identities) con email de demo
-- 5 filas en public.users con role = provider
-- 5 filas en public.providers con categoría por slug (equipamiento, tecnologia, iluminacion, audio, montaje)
-- Contraseña demo: DemoProvider1!

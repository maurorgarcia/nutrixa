-- ============================================================
-- Plan / demo (flags en users) + perfil público sin exponer emails
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'trial'
    CHECK (plan IN ('trial', 'free', 'pro', 'demo', 'enterprise'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

COMMENT ON COLUMN public.users.plan IS 'trial|free|pro|demo|enterprise — límites en app';
COMMENT ON COLUMN public.users.trial_ends_at IS 'Fin de periodo de prueba (opcional)';

-- Perfil para reservas públicas: solo columnas necesarias, sin email
CREATE OR REPLACE FUNCTION public.get_public_user_by_slug(p_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  full_name text,
  working_days integer[],
  working_hours_start time,
  working_hours_end time,
  services jsonb,
  bio text,
  specialty text,
  avatar_url text,
  role text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    u.id,
    u.slug,
    u.full_name,
    u.working_days,
    u.working_hours_start,
    u.working_hours_end,
    u.services,
    u.bio,
    u.specialty,
    u.avatar_url,
    u.role
  FROM public.users u
  WHERE u.slug = p_slug
    AND u.slug IS NOT NULL
    AND trim(u.slug) <> ''
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_user_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_user_by_slug(text) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(uuid, date) TO anon, authenticated;

-- Quitar listado público de toda la tabla users (evita scrape de emails)
DROP POLICY IF EXISTS "Public can view nutritionist profiles" ON public.users;
DROP POLICY IF EXISTS "Users select own profile" ON public.users;
CREATE POLICY "Users select own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Nuevos registros: trial 14 días (requiere columnas plan / trial_ends_at)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, plan, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'nutritionist',
    'trial',
    (NOW() + INTERVAL '14 days')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Unifica la columna "dueño del negocio" como user_id (UUID =
-- auth.users / public.users) en payments y appointments.
-- Ejecutar una vez en Supabase SQL Editor si venías de nutritionist_id.
-- ============================================================

-- ---------- PAYMENTS ----------
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nutritionist_own_payments" ON public.payments;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'nutritionist_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.payments RENAME COLUMN nutritionist_id TO user_id;
  END IF;
END $$;

DROP INDEX IF EXISTS payments_nutritionist_id_idx;
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments (user_id);

DROP POLICY IF EXISTS "payments_owner_all" ON public.payments;
CREATE POLICY "payments_owner_all"
  ON public.payments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------- APPOINTMENTS ----------
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can manage their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create an appointment" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_booking" ON public.appointments;
DROP POLICY IF EXISTS "appointments_owner_rw" ON public.appointments;
DROP POLICY IF EXISTS "appointments_select_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_own" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_owner" ON public.appointments;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'nutritionist_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.appointments RENAME COLUMN nutritionist_id TO user_id;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_appointments_nutritionist;
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments (user_id);

CREATE POLICY "appointments_select_own"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "appointments_update_own"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "appointments_delete_own"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

-- Alta por el profesional logueado (misma cuenta que user_id del turno)
CREATE POLICY "appointments_insert_owner"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Reserva pública anónima: solo si el calendario existe en public.users
CREATE POLICY "appointments_insert_public_anon"
  ON public.appointments FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_id)
  );

-- ---------- RPC: horarios ocupados (solo start/end, sin datos personales) ----------
CREATE OR REPLACE FUNCTION public.get_booked_slots(p_user_id UUID, p_date DATE)
RETURNS TABLE (start_time TIME, end_time TIME) AS $$
BEGIN
  RETURN QUERY
  SELECT a.start_time, a.end_time
  FROM public.appointments a
  WHERE a.user_id = p_user_id
    AND a.date = p_date
    AND a.status != 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(uuid, date) TO anon, authenticated;

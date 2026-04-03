-- ============================================
-- SCHEMA COMPLETO - SISTEMA DE NUTRICIÓN
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: USUARIOS (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'nutritionist' CHECK (role IN ('nutritionist', 'admin')),
    slug TEXT UNIQUE,
    working_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '18:00:00',
    services JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: PACIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    occupation TEXT,
    work_schedule TEXT,
    stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para pacientes
DROP INDEX IF EXISTS idx_patients_user_id;
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
DROP INDEX IF EXISTS idx_patients_name;
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
DROP INDEX IF EXISTS idx_patients_created_at;
CREATE INDEX idx_patients_created_at ON public.patients(created_at DESC);

-- ============================================
-- TABLA: ANAMNESIS
-- ============================================
CREATE TABLE IF NOT EXISTS public.anamnesis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Actividad física (JSONB para flexibilidad)
    physical_activity JSONB DEFAULT NULL,
    
    -- Motivo de consulta
    consultation_reason TEXT NOT NULL DEFAULT '',
    
    -- Datos antropométricos
    anthropometric_data JSONB NOT NULL DEFAULT '{}',
    
    -- Enfermedades y medicación
    diseases JSONB NOT NULL DEFAULT '[]',
    medications JSONB NOT NULL DEFAULT '[]',
    
    -- Antecedentes familiares
    family_history JSONB NOT NULL DEFAULT '[]',
    
    -- Hábitos alimentarios
    eating_habits JSONB NOT NULL DEFAULT '{}',
    
    -- Recordatorio 24h
    recall_24h JSONB NOT NULL DEFAULT '{}',
    
    -- Análisis clínicos
    lab_results JSONB NOT NULL DEFAULT '[]',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_anamnesis_updated_at ON public.anamnesis;
CREATE TRIGGER update_anamnesis_updated_at
    BEFORE UPDATE ON public.anamnesis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para anamnesis
DROP INDEX IF EXISTS idx_anamnesis_patient_id;
CREATE INDEX idx_anamnesis_patient_id ON public.anamnesis(patient_id);
DROP INDEX IF EXISTS idx_anamnesis_user_id;
CREATE INDEX idx_anamnesis_user_id ON public.anamnesis(user_id);

-- ============================================
-- TABLA: RECETAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions JSONB NOT NULL DEFAULT '[]',
    prep_time INTEGER NOT NULL DEFAULT 0,
    cook_time INTEGER NOT NULL DEFAULT 0,
    servings INTEGER NOT NULL DEFAULT 1,
    calories_per_serving INTEGER NOT NULL DEFAULT 0,
    tags JSONB NOT NULL DEFAULT '[]',
    image_url TEXT,
    is_template BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para recetas
DROP INDEX IF EXISTS idx_recipes_user_id;
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
DROP INDEX IF EXISTS idx_recipes_name;
CREATE INDEX idx_recipes_name ON public.recipes(name);
DROP INDEX IF EXISTS idx_recipes_template;
CREATE INDEX idx_recipes_template ON public.recipes(is_template) WHERE is_template = true;

-- ============================================
-- TABLA: PLANES DE ALIMENTACIÓN
-- ============================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    daily_calories INTEGER NOT NULL DEFAULT 2000,
    macros JSONB NOT NULL DEFAULT '{"protein": 30, "carbs": 40, "fats": 30}',
    days JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON public.meal_plans;
CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON public.meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para planes
DROP INDEX IF EXISTS idx_meal_plans_patient_id;
CREATE INDEX idx_meal_plans_patient_id ON public.meal_plans(patient_id);
DROP INDEX IF EXISTS idx_meal_plans_user_id;
CREATE INDEX idx_meal_plans_user_id ON public.meal_plans(user_id);
DROP INDEX IF EXISTS idx_meal_plans_active;
CREATE INDEX idx_meal_plans_active ON public.meal_plans(is_active) WHERE is_active = true;

-- ============================================
-- TABLA: SEGUIMIENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    notes TEXT,
    adherence TEXT CHECK (adherence IN ('excellent', 'good', 'fair', 'poor')),
    symptoms JSONB NOT NULL DEFAULT '[]',
    concerns JSONB NOT NULL DEFAULT '[]',
    next_appointment DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_follow_ups_updated_at ON public.follow_ups;
CREATE TRIGGER update_follow_ups_updated_at
    BEFORE UPDATE ON public.follow_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para seguimientos
DROP INDEX IF EXISTS idx_follow_ups_patient_id;
CREATE INDEX idx_follow_ups_patient_id ON public.follow_ups(patient_id);
DROP INDEX IF EXISTS idx_follow_ups_date;
CREATE INDEX idx_follow_ups_date ON public.follow_ups(date DESC);
DROP INDEX IF EXISTS idx_follow_ups_next_appointment;
CREATE INDEX idx_follow_ups_next_appointment ON public.follow_ups(next_appointment);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Políticas para users
DROP POLICY IF EXISTS "Public can view nutritionist profiles" ON public.users;
CREATE POLICY "Public can view nutritionist profiles" 
    ON public.users FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
-- (Reemplazada por la de lectura pública)

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Políticas para patients
DROP POLICY IF EXISTS "Users can view own patients" ON public.patients;
CREATE POLICY "Users can view own patients" 
    ON public.patients FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own patients" ON public.patients;
CREATE POLICY "Users can create own patients" 
    ON public.patients FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own patients" ON public.patients;
CREATE POLICY "Users can update own patients" 
    ON public.patients FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own patients" ON public.patients;
CREATE POLICY "Users can delete own patients" 
    ON public.patients FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para anamnesis
DROP POLICY IF EXISTS "Users can view own anamnesis" ON public.anamnesis;
CREATE POLICY "Users can view own anamnesis" 
    ON public.anamnesis FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own anamnesis" ON public.anamnesis;
CREATE POLICY "Users can create own anamnesis" 
    ON public.anamnesis FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own anamnesis" ON public.anamnesis;
CREATE POLICY "Users can update own anamnesis" 
    ON public.anamnesis FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own anamnesis" ON public.anamnesis;
CREATE POLICY "Users can delete own anamnesis" 
    ON public.anamnesis FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;
CREATE POLICY "Users can view own recipes" 
    ON public.recipes FOR SELECT 
    USING (auth.uid() = user_id OR is_template = true);

DROP POLICY IF EXISTS "Users can create own recipes" ON public.recipes;
CREATE POLICY "Users can create own recipes" 
    ON public.recipes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recipes" ON public.recipes;
CREATE POLICY "Users can update own recipes" 
    ON public.recipes FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recipes" ON public.recipes;
CREATE POLICY "Users can delete own recipes" 
    ON public.recipes FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para meal_plans
DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
CREATE POLICY "Users can view own meal plans" 
    ON public.meal_plans FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own meal plans" ON public.meal_plans;
CREATE POLICY "Users can create own meal plans" 
    ON public.meal_plans FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
CREATE POLICY "Users can update own meal plans" 
    ON public.meal_plans FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;
CREATE POLICY "Users can delete own meal plans" 
    ON public.meal_plans FOR DELETE 
    USING (auth.uid() = user_id);

-- Políticas para follow_ups
DROP POLICY IF EXISTS "Users can view own follow ups" ON public.follow_ups;
CREATE POLICY "Users can view own follow ups" 
    ON public.follow_ups FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own follow ups" ON public.follow_ups;
CREATE POLICY "Users can create own follow ups" 
    ON public.follow_ups FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own follow ups" ON public.follow_ups;
CREATE POLICY "Users can update own follow ups" 
    ON public.follow_ups FOR UPDATE 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own follow ups" ON public.follow_ups;
CREATE POLICY "Users can delete own follow ups" 
    ON public.follow_ups FOR DELETE 
    USING (auth.uid() = user_id);
-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para calcular IMC
CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg DECIMAL, height_cm DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    IF height_cm <= 0 OR weight_kg <= 0 THEN
        RETURN 0;
    END IF;
    RETURN ROUND(weight_kg / ((height_cm / 100) * (height_cm / 100)), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para calcular edad
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN DATE_PART('year', AGE(CURRENT_DATE, birth_date))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS TABLE (
    total_patients BIGINT,
    new_patients_this_month BIGINT,
    active_meal_plans BIGINT,
    pending_follow_ups BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.patients WHERE user_id = user_uuid) as total_patients,
        (SELECT COUNT(*) FROM public.patients WHERE user_id = user_uuid AND created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_patients_this_month,
        (SELECT COUNT(*) FROM public.meal_plans WHERE user_id = user_uuid AND is_active = true) as active_meal_plans,
        (SELECT COUNT(*) FROM public.follow_ups WHERE user_id = user_uuid AND next_appointment >= CURRENT_DATE) as pending_follow_ups;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función segura para obtener turnos ocupados (bypasses RLS pero solo devuelve horarios, no datos personales)
CREATE OR REPLACE FUNCTION get_booked_slots(p_nutritionist_id UUID, p_date DATE)
RETURNS TABLE (start_time TIME, end_time TIME) AS $$
BEGIN
    RETURN QUERY
    SELECT a.start_time, a.end_time
    FROM public.appointments a
    WHERE a.nutritionist_id = p_nutritionist_id
      AND a.date = p_date
      AND a.status != 'cancelled';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATOS INICIALES (SEED)
-- ============================================

-- Insertar recetas de ejemplo (templates)
INSERT INTO public.recipes (user_id, name, description, ingredients, instructions, prep_time, cook_time, servings, calories_per_serving, tags, is_template)
VALUES 
(
    NULL,
    'Ensalada de Quinoa',
    'Ensalada fresca y nutritiva con quinoa, verduras y aderezo de limón',
    '[
        {"id": "1", "name": "Quinoa", "quantity": 200, "unit": "g", "calories": 240, "protein": 8, "carbs": 42, "fats": 4},
        {"id": "2", "name": "Tomate cherry", "quantity": 150, "unit": "g", "calories": 27, "protein": 1, "carbs": 6, "fats": 0},
        {"id": "3", "name": "Pepino", "quantity": 100, "unit": "g", "calories": 15, "protein": 0.7, "carbs": 3.6, "fats": 0.1},
        {"id": "4", "name": "Aceite de oliva", "quantity": 15, "unit": "ml", "calories": 135, "protein": 0, "carbs": 0, "fats": 15}
    ]'::jsonb,
    '["Cocinar la quinoa según instrucciones del paquete", "Lavar y cortar las verduras", "Mezclar todo en un bowl", "Agregar el aderezo y servir"]'::jsonb,
    15,
    20,
    4,
    104,
    '["vegetarian", "gluten-free", "lunch"]'::jsonb,
    true
),
(
    NULL,
    'Pollo a la Plancha con Verduras',
    'Filete de pollo a la plancha con mix de verduras salteadas',
    '[
        {"id": "1", "name": "Pechuga de pollo", "quantity": 400, "unit": "g", "calories": 440, "protein": 92, "carbs": 0, "fats": 8},
        {"id": "2", "name": "Brócoli", "quantity": 200, "unit": "g", "calories": 68, "protein": 5.6, "carbs": 13, "fats": 0.7},
        {"id": "3", "name": "Pimiento rojo", "quantity": 100, "unit": "g", "calories": 31, "protein": 1, "carbs": 6, "fats": 0.3},
        {"id": "4", "name": "Aceite de oliva", "quantity": 10, "unit": "ml", "calories": 90, "protein": 0, "carbs": 0, "fats": 10}
    ]'::jsonb,
    '["Sazonar el pollo con sal y pimienta", "Cocinar a la plancha 6-7 min por lado", "Saltear las verduras", "Servir caliente"]'::jsonb,
    10,
    20,
    4,
    157,
    '["high-protein", "gluten-free", "low-carb", "dinner"]'::jsonb,
    true
),
(
    NULL,
    'Smoothie de Frutas',
    'Smoothie refrescante con frutas mixtas y yogur',
    '[
        {"id": "1", "name": "Plátano", "quantity": 1, "unit": "unidad", "calories": 105, "protein": 1.3, "carbs": 27, "fats": 0.4},
        {"id": "2", "name": "Fresas", "quantity": 100, "unit": "g", "calories": 32, "protein": 0.7, "carbs": 7.7, "fats": 0.3},
        {"id": "3", "name": "Yogur natural", "quantity": 150, "unit": "g", "calories": 93, "protein": 5.3, "carbs": 7, "fats": 5},
        {"id": "4", "name": "Miel", "quantity": 10, "unit": "g", "calories": 30, "protein": 0, "carbs": 8, "fats": 0}
    ]'::jsonb,
    '["Pelar y cortar el plátano", "Lavar las fresas", "Licuar todos los ingredientes", "Servir frío"]'::jsonb,
    5,
    0,
    1,
    260,
    '["vegetarian", "breakfast", "snack"]'::jsonb,
    true
);

-- ============================================
-- AUTOMATIZACIÓN DE USUARIOS (SYNC)
-- ============================================

-- Función para manejar la creación automática del perfil de usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    'nutritionist'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TABLA: TURNOS Y RESERVAS (APPOINTMENTS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutritionist_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    service_name TEXT NOT NULL,
    service_duration INTEGER NOT NULL,
    service_price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist ON public.appointments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);

-- Políticas RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can manage their own appointments" ON public.appointments;
CREATE POLICY "Nutritionists can manage their own appointments" 
    ON public.appointments 
    FOR ALL 
    USING (auth.uid() = nutritionist_id);

-- Para la turnera pública, cualquiera puede insertar pero no leer ni ver el listado
DROP POLICY IF EXISTS "Anyone can create an appointment" ON public.appointments;
CREATE POLICY "Anyone can create an appointment" 
    ON public.appointments 
    FOR INSERT 
    WITH CHECK (true);


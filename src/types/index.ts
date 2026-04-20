// ============================================
// TIPOS DEL SISTEMA DE NUTRICIÓN
// ============================================

// --- SERVICIOS ---
export interface NutritionService {
  id: string;
  name: string;
  price: number;
  duration: number; // en minutos
}

// --- USUARIO Y AUTENTICACIÓN ---
export type UserPlan = 'trial' | 'free' | 'pro' | 'demo' | 'enterprise';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'nutritionist' | 'admin';
  slug: string | null;
  working_days: number[];
  working_hours_start: string;
  working_hours_end: string;
  services: NutritionService[];
  bio?: string;
  specialty?: string;
  avatar_url?: string;
  /** Plan comercial; default trial en nuevas cuentas */
  plan?: UserPlan;
  trial_ends_at?: string | null;
  created_at: string;
  updated_at: string;
}

// --- TURNOS (APPOINTMENTS) ---
export interface Appointment {
  id: string;
  /** Profesional dueño del turno (= public.users.id / auth) */
  user_id: string;
  patient_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  service_name: string;
  service_duration: number;
  service_price: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// --- PACIENTES (PERFIL ESTÁTICO) ---
export interface Patient {
  id: string;
  user_id: string;
  nombre_completo: string;
  sexo: string;
  fecha_nacimiento: string;
  edad: number;
  telefono: string;
  correo: string;
  ocupacion: string;
  nivel_estres: string;
  patologias_preexistentes: string[];
  medicacion_habitual: string[];
  antecedentes_familiares: string[];
  tipo_dieta: string;
  alimentos_excluidos: string[];
  created_at: string;
  updated_at: string;
}

// --- HISTORIAL DE CONSULTAS Y PLAN NUTRICIONAL (DYNAMIC DATA) ---
export interface LaboratoryData {
  colesterol?: string;
  glucemia?: string;
  insulina?: string;
  b12?: string;
  vitamina_d?: string;
  otros?: string;
  fecha_laboratorio: string;
}

export interface CurrentHabits {
  actividad_fisica: string;
  horas_descanso: string;
  nivel_hidratacion: string;
}

export interface Anamnesis24hs {
  desayuno: string;
  almuerzo: string;
  merienda: string;
  cena: string;
  tipo_dia: 'semana' | 'fin_de_semana';
}

export interface Supplement {
  nombre_suplemento: string;
  dosis: string;
  estado_consumo: 'activo' | 'suspendido' | 'finalizado';
}

export interface Consultation {
  id: string;
  patient_id: string;
  user_id: string;
  fecha_consulta: string;
  motivo_consulta: string;
  peso_actual: number;
  talla: number;
  imc: number;
  sumatoria_pliegues: number;
  circunferencia_cintura: number;
  circunferencia_cadera: number;
  laboratorios: LaboratoryData;
  habitos_actuales: CurrentHabits;
  anamnesis_24hs: {
    semana: Anamnesis24hs;
    fin_de_semana: Anamnesis24hs;
  };
  // Plan Nutricional / Tratamiento
  estrategia_etapa: string;
  estructura_platos: string;
  suplementacion_recetada: Supplement[];
  notas_seguimiento: string;
  created_at: string;
  updated_at: string;
}

export interface PatientWithAge extends Patient {
  // En la nueva estructura 'edad' ya es parte de Patient, pero mantenemos por compatibilidad si es necesario
}

// --- RECETAS ---
export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  calories_per_serving: number;
  tags: RecipeTag[];
  image_url: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export type RecipeTag = 
  | 'vegan' 
  | 'vegetarian' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'keto' 
  | 'low-carb' 
  | 'high-protein' 
  | 'breakfast' 
  | 'lunch' 
  | 'dinner' 
  | 'snack' 
  | 'dessert';

// --- PLANES DE ALIMENTACIÓN ---
export interface MealPlan {
  id: string;
  patient_id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  daily_calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  days: MealPlanDay[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlanDay {
  day_of_week: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  meals: Meal[];
}

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  time: string;
  recipes: MealRecipe[];
  notes: string | null;
}

export type MealType = 'breakfast' | 'mid_morning' | 'lunch' | 'snack' | 'dinner';

export interface MealRecipe {
  recipe_id: string;
  recipe_name: string;
  quantity: number;
  unit: string;
  calories: number;
}

// --- SEGUIMIENTO ---
export interface FollowUp {
  id: string;
  patient_id: string;
  user_id: string;
  date: string;
  weight: number;
  notes: string | null;
  adherence: 'excellent' | 'good' | 'fair' | 'poor' | null;
  symptoms: string[];
  concerns: string[];
  next_appointment: string | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUpWithPatient extends FollowUp {
  patient: Patient;
}

// --- ESTADÍSTICAS DEL DASHBOARD ---
export interface DashboardStats {
  total_patients: number;
  new_patients_this_month: number;
  active_meal_plans: number;
  pending_follow_ups: number;
  recent_patients: PatientWithAge[];
  upcoming_appointments: FollowUpWithPatient[];
}

// --- FORMULARIOS ---
export interface PatientProfileFormData {
  nombre_completo: string;
  sexo: string;
  fecha_nacimiento: string;
  edad: string;
  telefono: string;
  correo: string;
  ocupacion: string;
  nivel_estres: string;
  patologias_preexistentes: string[];
  medicacion_habitual: string[];
  antecedentes_familiares: string[];
  tipo_dieta: string;
  alimentos_excluidos: string[];
}

export interface ConsultationFormData {
  fecha_consulta: string;
  motivo_consulta: string;
  peso_actual: string;
  talla: string;
  sumatoria_pliegues: string;
  circunferencia_cintura: string;
  circunferencia_cadera: string;
  laboratorios: {
    colesterol: string;
    glucemia: string;
    insulina: string;
    b12: string;
    vitamina_d: string;
    otros: string;
    fecha_laboratorio: string;
  };
  habitos_actuales: {
    actividad_fisica: string;
    horas_descanso: string;
    nivel_hidratacion: string;
  };
  anamnesis_24hs: {
    semana: {
      desayuno: string;
      almuerzo: string;
      merienda: string;
      cena: string;
    };
    weekend: {
      desayuno: string;
      almuerzo: string;
      merienda: string;
      cena: string;
    };
  };
  estrategia_etapa: string;
  estructura_platos: string;
  suplementacion_recetada: {
    nombre_suplemento: string;
    dosis: string;
    estado_consumo: 'activo' | 'suspendido' | 'finalizado';
  }[];
  notas_seguimiento: string;
}

export interface RecipeFormData {
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  prep_time: string;
  cook_time: string;
  servings: string;
  calories_per_serving: string;
  tags: RecipeTag[];
}

export interface MealPlanFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  daily_calories: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  days: MealPlanDayFormData[];
}

export interface MealPlanDayFormData {
  day_of_week: number;
  meals: MealFormData[];
}

export interface MealFormData {
  type: MealType;
  name: string;
  time: string;
  recipes: {
    recipe_id: string;
    quantity: string;
  }[];
  notes: string;
}

// --- UTILIDADES ---
export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterState {
  search: string;
  tags: RecipeTag[];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
}
// --- PAGOS Y COBROS (tabla public.payments en Supabase) ---
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'mercadopago';

export interface Payment {
  id: string;
  /** Profesional dueño del cobro (= auth.users.id) */
  user_id: string;
  patient_id: string | null;
  patient_name: string;
  patient_email: string;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  /** Solo presente si la tabla en Supabase tiene esta columna (migración opcional). */
  appointment_id?: string | null;
  notes: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Fila lista para insertar (sin columnas generadas por la BD). */
export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;

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
  created_at: string;
  updated_at: string;
}

// --- TURNOS (APPOINTMENTS) ---
export interface Appointment {
  id: string;
  nutritionist_id: string;
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

// --- PACIENTES ---
export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  occupation: string | null;
  work_schedule: string | null;
  stress_level: 'low' | 'moderate' | 'high' | null;
  created_at: string;
  updated_at: string;
}

export interface PatientWithAge extends Patient {
  age: number;
}

// --- ANAMNESIS ---
export interface Anamnesis {
  id: string;
  patient_id: string;
  user_id: string;
  
  // Actividad física
  physical_activity: {
    level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    activities: string[];
    frequency: string;
    duration: string;
  } | null;
  
  // Motivo de consulta
  consultation_reason: string;
  
  // Datos antropométricos
  anthropometric_data: {
    weight: number;
    height: number;
    bmi: number;
    waist_circumference?: number;
    hip_circumference?: number;
    arm_circumference?: number;
    body_fat_percentage?: number;
    muscle_mass?: number;
  };
  
  // Enfermedades y medicación
  diseases: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  
  // Antecedentes familiares
  family_history: {
    condition: string;
    relationship: string;
  }[];
  
  // Hábitos alimentarios
  eating_habits: {
    meal_frequency: number;
    meal_times: {
      breakfast: string;
      mid_morning: string;
      lunch: string;
      snack: string;
      dinner: string;
    };
    cooking_methods: string[];
    food_preferences: string[];
    food_dislikes: string[];
    allergies: string[];
    intolerances: string[];
  };
  
  // Recordatorio 24h
  recall_24h: {
    weekday: {
      breakfast: string;
      mid_morning: string;
      lunch: string;
      snack: string;
      dinner: string;
    };
    weekend: {
      breakfast: string;
      mid_morning: string;
      lunch: string;
      snack: string;
      dinner: string;
    };
  };
  
  // Análisis clínicos
  lab_results: {
    test_name: string;
    value: string;
    unit: string;
    reference_range: string;
    date: string;
  }[];
  
  created_at: string;
  updated_at: string;
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
export interface PatientFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  work_schedule: string;
  stress_level: 'low' | 'moderate' | 'high' | '';
}

export interface AnamnesisFormData {
  physical_activity: {
    level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | '';
    activities: string[];
    frequency: string;
    duration: string;
  };
  consultation_reason: string;
  anthropometric_data: {
    weight: string;
    height: string;
    waist_circumference: string;
    hip_circumference: string;
    arm_circumference: string;
    body_fat_percentage: string;
    muscle_mass: string;
  };
  diseases: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  family_history: {
    condition: string;
    relationship: string;
  }[];
  eating_habits: {
    meal_frequency: string;
    meal_times: {
      breakfast: string;
      mid_morning: string;
      lunch: string;
      snack: string;
      dinner: string;
    };
    cooking_methods: string[];
    food_preferences: string[];
    food_dislikes: string[];
    allergies: string[];
    intolerances: string[];
  };
  recall_24h: {
    weekday: {
      breakfast: string;
      mid_morning: string;
      lunch: string;
      snack: string;
      dinner: string;
    };
    weekend: {
      breakfast: string;
      mid_morning: string;
      lunch: string;
      snack: string;
      dinner: string;
    };
  };
  lab_results: {
    test_name: string;
    value: string;
    unit: string;
    reference_range: string;
    date: string;
  }[];
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

import { create } from 'zustand';
import { supabase, supabaseRestGet } from '@/lib/supabase/client';
import type { MealPlan, MealPlanFormData, MealType } from '@/types';

interface MealPlanState {
  mealPlans: MealPlan[];
  selectedMealPlan: MealPlan | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setMealPlans: (plans: MealPlan[]) => void;
  setSelectedMealPlan: (plan: MealPlan | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD Operations
  fetchMealPlans: (userId: string) => Promise<void>;
  fetchMealPlansByPatient: (patientId: string) => Promise<void>;
  getMealPlanById: (id: string) => Promise<MealPlan | null>;
  createMealPlan: (userId: string, patientId: string, data: MealPlanFormData) => Promise<{ data: MealPlan | null; error: string | null }>;
  updateMealPlan: (id: string, data: Partial<MealPlanFormData>) => Promise<{ error: string | null }>;
  deleteMealPlan: (id: string) => Promise<{ error: string | null }>;
  activateMealPlan: (id: string) => Promise<{ error: string | null }>;
  
  // Computed
  getActiveMealPlan: (patientId: string) => MealPlan | null;
  getMealPlansByPatient: (patientId: string) => MealPlan[];
}

const defaultDays = [
  { day_of_week: 1, meals: [] },
  { day_of_week: 2, meals: [] },
  { day_of_week: 3, meals: [] },
  { day_of_week: 4, meals: [] },
  { day_of_week: 5, meals: [] },
  { day_of_week: 6, meals: [] },
  { day_of_week: 7, meals: [] },
];

const defaultMeals: { type: MealType; name: string; time: string }[] = [
  { type: 'breakfast', name: 'Desayuno', time: '08:00' },
  { type: 'mid_morning', name: 'Media Mañana', time: '10:30' },
  { type: 'lunch', name: 'Almuerzo', time: '13:00' },
  { type: 'snack', name: 'Merienda', time: '16:30' },
  { type: 'dinner', name: 'Cena', time: '20:00' },
];

export const useMealPlanStore = create<MealPlanState>((set, get) => ({
  mealPlans: [],
  selectedMealPlan: null,
  loading: false,
  error: null,

  setMealPlans: (plans) => set({ mealPlans: plans }),
  setSelectedMealPlan: (plan) => set({ selectedMealPlan: plan }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchMealPlans: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await supabaseRestGet('meal_plans', `user_id=eq.${userId}&select=*&order=created_at.desc`);
      set({ mealPlans: data as MealPlan[] || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMealPlansByPatient: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const data = await supabaseRestGet('meal_plans', `patient_id=eq.${patientId}&select=*&order=created_at.desc`);
      set({ mealPlans: data as MealPlan[] || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  getMealPlanById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message });
        return null;
      }

      set({ selectedMealPlan: data as MealPlan });
      return data as MealPlan;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  createMealPlan: async (userId, patientId, data) => {
    set({ loading: true, error: null });
    try {
      // Ensure all days have meals
      const daysWithMeals = data.days.map((day, index) => ({
        day_of_week: day.day_of_week || index + 1,
        meals: day.meals.length > 0 ? day.meals.map(meal => ({
          id: crypto.randomUUID(),
          type: meal.type,
          name: meal.name || defaultMeals.find(m => m.type === meal.type)?.name || '',
          time: meal.time || defaultMeals.find(m => m.type === meal.type)?.time || '',
          recipes: meal.recipes.map(r => ({
            recipe_id: r.recipe_id,
            recipe_name: '', // Will be populated from recipe
            quantity: parseFloat(r.quantity) || 1,
            unit: 'porción',
            calories: 0,
          })),
          notes: meal.notes || null,
        })) : [],
      }));

      const mealPlanData = {
        patient_id: patientId,
        user_id: userId,
        name: data.name,
        description: data.description || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        daily_calories: parseInt(data.daily_calories) || 2000,
        macros: {
          protein: parseInt(data.macros.protein) || 30,
          carbs: parseInt(data.macros.carbs) || 40,
          fats: parseInt(data.macros.fats) || 30,
        },
        days: daysWithMeals,
        is_active: true,
      };

      const { data: newMealPlan, error } = await (supabase as any)
        .from('meal_plans')
        .insert(mealPlanData as any)
        .select()
        .single();

      if (error) {
        set({ error: error.message, loading: false });
        return { data: null, error: error.message };
      }

      set(state => ({ 
        mealPlans: [newMealPlan as MealPlan, ...state.mealPlans],
        loading: false 
      }));

      return { data: newMealPlan as MealPlan, error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { data: null, error: err.message };
    }
  },

  updateMealPlan: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {};

      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.start_date) updateData.start_date = data.start_date;
      if (data.end_date !== undefined) updateData.end_date = data.end_date || null;
      if (data.daily_calories) updateData.daily_calories = parseInt(data.daily_calories);
      if (data.macros) {
        updateData.macros = {
          protein: parseInt(data.macros.protein) || 30,
          carbs: parseInt(data.macros.carbs) || 40,
          fats: parseInt(data.macros.fats) || 30,
        };
      }
      if (data.days) {
        updateData.days = data.days.map((day, index) => ({
          day_of_week: day.day_of_week || index + 1,
          meals: day.meals.map(meal => ({
            id: meal.id || crypto.randomUUID(),
            type: meal.type,
            name: meal.name,
            time: meal.time,
            recipes: meal.recipes.map(r => ({
              recipe_id: r.recipe_id,
              recipe_name: r.recipe_name || '',
              quantity: parseFloat(r.quantity as string) || r.quantity || 1,
              unit: r.unit || 'porción',
              calories: r.calories || 0,
            })),
            notes: meal.notes || null,
          })),
        }));
      }

      const { error } = await (supabase as any)
        .from('meal_plans')
        .update(updateData)
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      // Update local state
      set(state => ({
        mealPlans: state.mealPlans.map(mp => 
          mp.id === id ? { ...mp, ...updateData } as MealPlan : mp
        ),
        selectedMealPlan: state.selectedMealPlan?.id === id 
          ? { ...state.selectedMealPlan, ...updateData } as MealPlan
          : state.selectedMealPlan,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  deleteMealPlan: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await (supabase as any)
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      set(state => ({
        mealPlans: state.mealPlans.filter(mp => mp.id !== id),
        selectedMealPlan: state.selectedMealPlan?.id === id ? null : state.selectedMealPlan,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  activateMealPlan: async (id) => {
    set({ loading: true, error: null });
    try {
      // First, deactivate all other plans for this patient
      const plan = get().mealPlans.find(mp => mp.id === id);
      if (!plan) {
        return { error: 'Plan no encontrado' };
      }

      // Deactivate other plans
      await supabase
        .from('meal_plans')
        .update({ is_active: false })
        .eq('patient_id', plan.patient_id)
        .neq('id', id);

      // Activate this plan
      const { error } = await supabase
        .from('meal_plans')
        .update({ is_active: true })
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      // Update local state
      set(state => ({
        mealPlans: state.mealPlans.map(mp => 
          mp.patient_id === plan.patient_id 
            ? { ...mp, is_active: mp.id === id } as MealPlan
            : mp
        ),
        selectedMealPlan: state.selectedMealPlan?.id === id 
          ? { ...state.selectedMealPlan, is_active: true } as MealPlan
          : state.selectedMealPlan,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  getActiveMealPlan: (patientId) => {
    const { mealPlans } = get();
    return mealPlans.find(mp => mp.patient_id === patientId && mp.is_active) || null;
  },

  getMealPlansByPatient: (patientId) => {
    const { mealPlans } = get();
    return mealPlans.filter(mp => mp.patient_id === patientId);
  },
}));

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { Anamnesis, AnamnesisFormData } from '@/types';
import { calculateBMI } from '@/utils/calculations';

interface AnamnesisState {
  anamnesisList: Anamnesis[];
  selectedAnamnesis: Anamnesis | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setAnamnesisList: (list: Anamnesis[]) => void;
  setSelectedAnamnesis: (anamnesis: Anamnesis | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD Operations
  fetchAnamnesisByPatient: (patientId: string) => Promise<void>;
  getAnamnesisById: (id: string) => Promise<Anamnesis | null>;
  createAnamnesis: (userId: string, patientId: string, data: AnamnesisFormData) => Promise<{ data: Anamnesis | null; error: string | null }>;
  updateAnamnesis: (id: string, data: Partial<AnamnesisFormData>) => Promise<{ error: string | null }>;
  deleteAnamnesis: (id: string) => Promise<{ error: string | null }>;
  
  // Check if patient has anamnesis
  hasAnamnesis: (patientId: string) => boolean;
}

export const useAnamnesisStore = create<AnamnesisState>((set, get) => ({
  anamnesisList: [],
  selectedAnamnesis: null,
  loading: false,
  error: null,

  setAnamnesisList: (list) => set({ anamnesisList: list }),
  setSelectedAnamnesis: (anamnesis) => set({ selectedAnamnesis: anamnesis }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchAnamnesisByPatient: async (patientId) => {
    const { anamnesisList } = get();
    if (anamnesisList.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const { data, error } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ anamnesisList: data as Anamnesis[] || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  getAnamnesisById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('anamnesis')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message });
        return null;
      }

      set({ selectedAnamnesis: data as Anamnesis });
      return data as Anamnesis;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  createAnamnesis: async (userId, patientId, data) => {
    set({ loading: true, error: null });
    try {
      // Calculate BMI
      const weight = parseFloat(data.anthropometric_data.weight) || 0;
      const height = parseFloat(data.anthropometric_data.height) || 0;
      const bmi = calculateBMI(weight, height);

      const anamnesisData = {
        patient_id: patientId,
        user_id: userId,
        physical_activity: data.physical_activity.level ? {
          level: data.physical_activity.level,
          activities: data.physical_activity.activities,
          frequency: data.physical_activity.frequency,
          duration: data.physical_activity.duration,
        } : null,
        consultation_reason: data.consultation_reason,
        anthropometric_data: {
          weight,
          height,
          bmi,
          waist_circumference: parseFloat(data.anthropometric_data.waist_circumference) || null,
          hip_circumference: parseFloat(data.anthropometric_data.hip_circumference) || null,
          arm_circumference: parseFloat(data.anthropometric_data.arm_circumference) || null,
          body_fat_percentage: parseFloat(data.anthropometric_data.body_fat_percentage) || null,
          muscle_mass: parseFloat(data.anthropometric_data.muscle_mass) || null,
        },
        diseases: data.diseases,
        medications: data.medications.filter(m => m.name.trim() !== ''),
        family_history: data.family_history.filter(fh => fh.condition.trim() !== ''),
        eating_habits: {
          meal_frequency: parseInt(data.eating_habits.meal_frequency) || 3,
          meal_times: data.eating_habits.meal_times,
          cooking_methods: data.eating_habits.cooking_methods,
          food_preferences: data.eating_habits.food_preferences,
          food_dislikes: data.eating_habits.food_dislikes,
          allergies: data.eating_habits.allergies,
          intolerances: data.eating_habits.intolerances,
        },
        recall_24h: data.recall_24h,
        lab_results: data.lab_results.filter(lr => lr.test_name.trim() !== ''),
      };

      const { data: newAnamnesis, error } = await (supabase as any)
        .from('anamnesis')
        .insert(anamnesisData)
        .select()
        .single();

      if (error) {
        set({ error: error.message, loading: false });
        return { data: null, error: error.message };
      }

      set(state => ({ 
        anamnesisList: [newAnamnesis as Anamnesis, ...state.anamnesisList],
        loading: false 
      }));

      return { data: newAnamnesis as Anamnesis, error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { data: null, error: err.message };
    }
  },

  updateAnamnesis: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {};

      if (data.physical_activity) {
        updateData.physical_activity = data.physical_activity.level ? {
          level: data.physical_activity.level,
          activities: data.physical_activity.activities,
          frequency: data.physical_activity.frequency,
          duration: data.physical_activity.duration,
        } : null;
      }

      if (data.consultation_reason) {
        updateData.consultation_reason = data.consultation_reason;
      }

      if (data.anthropometric_data) {
        const weight = parseFloat(data.anthropometric_data.weight) || 0;
        const height = parseFloat(data.anthropometric_data.height) || 0;
        updateData.anthropometric_data = {
          weight,
          height,
          bmi: calculateBMI(weight, height),
          waist_circumference: parseFloat(data.anthropometric_data.waist_circumference) || null,
          hip_circumference: parseFloat(data.anthropometric_data.hip_circumference) || null,
          arm_circumference: parseFloat(data.anthropometric_data.arm_circumference) || null,
          body_fat_percentage: parseFloat(data.anthropometric_data.body_fat_percentage) || null,
          muscle_mass: parseFloat(data.anthropometric_data.muscle_mass) || null,
        };
      }

      if (data.diseases) updateData.diseases = data.diseases;
      if (data.medications) updateData.medications = data.medications.filter(m => m.name.trim() !== '');
      if (data.family_history) updateData.family_history = data.family_history.filter(fh => fh.condition.trim() !== '');
      if (data.eating_habits) updateData.eating_habits = data.eating_habits;
      if (data.recall_24h) updateData.recall_24h = data.recall_24h;
      if (data.lab_results) updateData.lab_results = data.lab_results.filter(lr => lr.test_name.trim() !== '');

      const { error } = await (supabase as any)
        .from('anamnesis')
        .update(updateData)
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      // Update local state
      set(state => ({
        anamnesisList: state.anamnesisList.map(a => 
          a.id === id ? { ...a, ...updateData } as Anamnesis : a
        ),
        selectedAnamnesis: state.selectedAnamnesis?.id === id 
          ? { ...state.selectedAnamnesis, ...updateData } as Anamnesis
          : state.selectedAnamnesis,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  deleteAnamnesis: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('anamnesis')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      set(state => ({
        anamnesisList: state.anamnesisList.filter(a => a.id !== id),
        selectedAnamnesis: state.selectedAnamnesis?.id === id ? null : state.selectedAnamnesis,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  hasAnamnesis: (patientId) => {
    const { anamnesisList } = get();
    return anamnesisList.some(a => a.patient_id === patientId);
  },
}));

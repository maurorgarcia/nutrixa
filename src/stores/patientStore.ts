import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { Patient, PatientProfileFormData } from '@/types';

interface PatientState {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // CRUD Operations
  fetchPatients: (userId: string) => Promise<void>;
  getPatientById: (id: string) => Promise<Patient | null>;
  createPatient: (userId: string, data: PatientProfileFormData) => Promise<{ data: Patient | null; error: string | null }>;
  updatePatient: (id: string, data: Partial<PatientProfileFormData>) => Promise<{ error: string | null }>;
  deletePatient: (id: string) => Promise<{ error: string | null }>;
  
  // Computed
  filteredPatients: () => Patient[];
  getRecentPatients: (limit?: number) => Patient[];
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
  searchQuery: '',

  setPatients: (patients) => set({ patients }),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchPatients: async (userId) => {
    const { patients } = get();
    if (patients.length === 0) {
      set({ loading: true, error: null });
    }
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ patients: (data || []) as Patient[], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  getPatientById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message });
        return null;
      }

      set({ selectedPatient: data as Patient });
      return data as Patient;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  createPatient: async (userId, data) => {
    set({ loading: true, error: null });
    try {
      const patientData = {
        user_id: userId,
        nombre_completo: data.nombre_completo,
        sexo: data.sexo,
        fecha_nacimiento: data.fecha_nacimiento,
        edad: parseInt(data.edad) || 0,
        telefono: data.telefono,
        correo: data.correo,
        ocupacion: data.ocupacion,
        nivel_estres: data.nivel_estres,
        patologias_preexistentes: data.patologias_preexistentes,
        medicacion_habitual: data.medicacion_habitual,
        antecedentes_familiares: data.antecedentes_familiares,
        tipo_dieta: data.tipo_dieta,
        alimentos_excluidos: data.alimentos_excluidos,
      };

      const { data: newPatient, error } = await supabase
        .from('patients')
        .insert(patientData as any)
        .select()
        .single();

      if (error) {
        set({ error: error.message, loading: false });
        return { data: null, error: error.message };
      }

      set(state => ({ 
        patients: [newPatient as Patient, ...state.patients],
        loading: false 
      }));

      return { data: newPatient as Patient, error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { data: null, error: err.message };
    }
  },

  updatePatient: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = { ...data };
      if (data.edad) updateData.edad = parseInt(data.edad);

      const { error } = await (supabase as any)
        .from('patients')
        .update(updateData)
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      // Update local state
      set(state => ({
        patients: state.patients.map(p => 
          p.id === id ? { ...p, ...updateData } : p
        ),
        selectedPatient: state.selectedPatient?.id === id 
          ? { ...state.selectedPatient, ...updateData }
          : state.selectedPatient,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  deletePatient: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await (supabase as any)
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      set(state => ({
        patients: state.patients.filter(p => p.id !== id),
        selectedPatient: state.selectedPatient?.id === id ? null : state.selectedPatient,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  filteredPatients: () => {
    const { patients, searchQuery } = get();
    if (!searchQuery.trim()) return patients;

    const query = searchQuery.toLowerCase();
    return patients.filter(patient =>
      patient.nombre_completo.toLowerCase().includes(query) ||
      patient.correo.toLowerCase().includes(query) ||
      patient.telefono.toLowerCase().includes(query)
    );
  },

  getRecentPatients: (limit = 5) => {
    const { patients } = get();
    return patients.slice(0, limit);
  },
}));

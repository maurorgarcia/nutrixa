import { create } from 'zustand';
import { supabase, supabaseRestGet } from '@/lib/supabase/client';
import type { Patient, PatientFormData, PatientWithAge } from '@/types';
import { calculateAge } from '@/utils/calculations';

interface PatientState {
  patients: PatientWithAge[];
  selectedPatient: PatientWithAge | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  setPatients: (patients: PatientWithAge[]) => void;
  setSelectedPatient: (patient: PatientWithAge | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // CRUD Operations
  fetchPatients: (userId: string) => Promise<void>;
  getPatientById: (id: string) => Promise<PatientWithAge | null>;
  createPatient: (userId: string, data: PatientFormData) => Promise<{ data: Patient | null; error: string | null }>;
  updatePatient: (id: string, data: Partial<PatientFormData>) => Promise<{ error: string | null }>;
  deletePatient: (id: string) => Promise<{ error: string | null }>;
  
  // Computed
  filteredPatients: () => PatientWithAge[];
  getRecentPatients: (limit?: number) => PatientWithAge[];
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
    // Only show global loading spinner if we don't have data yet
    if (patients.length === 0) {
      set({ loading: true, error: null });
    }
    
    try {
      const data = await supabaseRestGet('patients', `user_id=eq.${userId}&select=*&order=created_at.desc`);

      const patientsWithAge = (data || []).map((patient: any) => ({
        ...patient,
        age: calculateAge(patient.birth_date),
      })) as PatientWithAge[];

      set({ patients: patientsWithAge, loading: false });
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

      const patientWithAge = {
        ...(data as any),
        age: calculateAge((data as any).birth_date),
      } as PatientWithAge;

      set({ selectedPatient: patientWithAge });
      return patientWithAge;
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
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        birth_date: data.birth_date,
        gender: data.gender,
        occupation: data.occupation || null,
        work_schedule: data.work_schedule || null,
        stress_level: data.stress_level || null,
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

      const patientWithAge = {
        ...(newPatient as any),
        age: calculateAge((newPatient as any).birth_date),
      } as PatientWithAge;

      set(state => ({ 
        patients: [patientWithAge, ...state.patients],
        loading: false 
      }));

      return { data: newPatient, error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { data: null, error: err.message };
    }
  },

  updatePatient: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updateData = {
        ...data,
        stress_level: data.stress_level || null,
      };

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
          p.id === id ? { ...p, ...updateData, age: p.age } : p
        ),
        selectedPatient: state.selectedPatient?.id === id 
          ? { ...state.selectedPatient, ...updateData, age: state.selectedPatient.age }
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
      patient.first_name.toLowerCase().includes(query) ||
      patient.last_name.toLowerCase().includes(query) ||
      patient.email?.toLowerCase().includes(query) ||
      patient.phone?.toLowerCase().includes(query)
    );
  },

  getRecentPatients: (limit = 5) => {
    const { patients } = get();
    return patients.slice(0, limit);
  },
}));

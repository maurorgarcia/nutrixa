import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { Consultation, ConsultationFormData } from '@/types';

interface ConsultationState {
  consultations: Consultation[];
  selectedConsultation: Consultation | null;
  loading: boolean;
  error: string | null;
  
  fetchConsultationsByPatient: (patientId: string) => Promise<void>;
  getConsultationById: (id: string) => Promise<void>;
  createConsultation: (userId: string, patientId: string, data: ConsultationFormData) => Promise<void>;
  updateConsultation: (id: string, data: Partial<ConsultationFormData>) => Promise<void>;
  deleteConsultation: (id: string) => Promise<void>;
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  consultations: [],
  selectedConsultation: null,
  loading: false,
  error: null,

  fetchConsultationsByPatient: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await (supabase as any)
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('fecha_consulta', { ascending: false });

      if (error) throw error;
      set({ consultations: data as Consultation[] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  getConsultationById: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await (supabase as any)
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ selectedConsultation: data as Consultation });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createConsultation: async (userId, patientId, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await (supabase as any)
        .from('consultations')
        .insert([{
          ...data,
          user_id: userId,
          patient_id: patientId
        }]);

      if (error) throw error;
      await get().fetchConsultationsByPatient(patientId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateConsultation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { error } = await (supabase as any)
        .from('consultations')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      const updatedConsultation = get().consultations.find(c => c.id === id);
      if (updatedConsultation) {
        await get().fetchConsultationsByPatient(updatedConsultation.patient_id);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteConsultation: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data: consultation } = await (supabase as any)
        .from('consultations')
        .select('patient_id')
        .eq('id', id)
        .single();

      const { error } = await (supabase as any)
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      if (consultation) {
        await get().fetchConsultationsByPatient(consultation.patient_id);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

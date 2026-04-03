import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { FollowUp, FollowUpWithPatient } from '@/types';

interface FollowUpState {
  followUps: FollowUp[];
  followUpsWithPatient: FollowUpWithPatient[];
  selectedFollowUp: FollowUp | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setFollowUps: (followUps: FollowUp[]) => void;
  setFollowUpsWithPatient: (followUps: FollowUpWithPatient[]) => void;
  setSelectedFollowUp: (followUp: FollowUp | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD Operations
  fetchFollowUps: (userId: string) => Promise<void>;
  fetchFollowUpsByPatient: (patientId: string) => Promise<void>;
  getFollowUpById: (id: string) => Promise<FollowUp | null>;
  createFollowUp: (userId: string, patientId: string, data: {
    date: string;
    weight: number;
    notes?: string;
    adherence?: 'excellent' | 'good' | 'fair' | 'poor';
    symptoms?: string[];
    concerns?: string[];
    next_appointment?: string;
  }) => Promise<{ data: FollowUp | null; error: string | null }>;
  updateFollowUp: (id: string, data: Partial<{
    date: string;
    weight: number;
    notes: string;
    adherence: 'excellent' | 'good' | 'fair' | 'poor';
    symptoms: string[];
    concerns: string[];
    next_appointment: string;
  }>) => Promise<{ error: string | null }>;
  deleteFollowUp: (id: string) => Promise<{ error: string | null }>;
  
  // Computed
  getUpcomingAppointments: (days?: number) => FollowUp[];
  getFollowUpsByPatient: (patientId: string) => FollowUp[];
  getWeightHistory: (patientId: string) => { date: string; weight: number }[];
}

export const useFollowUpStore = create<FollowUpState>((set, get) => ({
  followUps: [],
  followUpsWithPatient: [],
  selectedFollowUp: null,
  loading: false,
  error: null,

  setFollowUps: (followUps) => set({ followUps }),
  setFollowUpsWithPatient: (followUpsWithPatient) => set({ followUpsWithPatient }),
  setSelectedFollowUp: (followUp) => set({ selectedFollowUp: followUp }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchFollowUps: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select(`
          *,
          patient:patients(*)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ 
        followUps: data as FollowUp[] || [],
        followUpsWithPatient: data as FollowUpWithPatient[] || [],
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchFollowUpsByPatient: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) {
        set({ error: error.message, loading: false });
        return;
      }

      set({ followUps: data as FollowUp[] || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  getFollowUpById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message });
        return null;
      }

      set({ selectedFollowUp: data as FollowUp });
      return data as FollowUp;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  createFollowUp: async (userId, patientId, data) => {
    set({ loading: true, error: null });
    try {
      const followUpData = {
        patient_id: patientId,
        user_id: userId,
        date: data.date,
        weight: data.weight,
        notes: data.notes || null,
        adherence: data.adherence || null,
        symptoms: data.symptoms || [],
        concerns: data.concerns || [],
        next_appointment: data.next_appointment || null,
      };

      const { data: newFollowUp, error } = await supabase
        .from('follow_ups')
        .insert(followUpData)
        .select(`
          *,
          patient:patients(*)
        `)
        .single();

      if (error) {
        set({ error: error.message, loading: false });
        return { data: null, error: error.message };
      }

      set(state => ({ 
        followUps: [newFollowUp as FollowUp, ...state.followUps],
        followUpsWithPatient: [newFollowUp as FollowUpWithPatient, ...state.followUpsWithPatient],
        loading: false 
      }));

      return { data: newFollowUp as FollowUp, error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { data: null, error: err.message };
    }
  },

  updateFollowUp: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = {};
      
      if (data.date) updateData.date = data.date;
      if (data.weight !== undefined) updateData.weight = data.weight;
      if (data.notes !== undefined) updateData.notes = data.notes || null;
      if (data.adherence !== undefined) updateData.adherence = data.adherence || null;
      if (data.symptoms) updateData.symptoms = data.symptoms;
      if (data.concerns) updateData.concerns = data.concerns;
      if (data.next_appointment !== undefined) updateData.next_appointment = data.next_appointment || null;

      const { error } = await supabase
        .from('follow_ups')
        .update(updateData)
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      // Fetch the updated entry to get full relations if it's needed, or just merge memory
      // The easiest way is to selectively update state mapping:
      set(state => ({
        followUps: state.followUps.map(fu => 
          fu.id === id ? { ...fu, ...updateData } as FollowUp : fu
        ),
        followUpsWithPatient: state.followUpsWithPatient.map(fu => 
          fu.id === id ? { ...fu, ...updateData } as FollowUpWithPatient : fu
        ),
        selectedFollowUp: state.selectedFollowUp?.id === id 
          ? { ...state.selectedFollowUp, ...updateData } as FollowUp
          : state.selectedFollowUp,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  deleteFollowUp: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      set(state => ({
        followUps: state.followUps.filter(fu => fu.id !== id),
        followUpsWithPatient: state.followUpsWithPatient.filter(fu => fu.id !== id),
        selectedFollowUp: state.selectedFollowUp?.id === id ? null : state.selectedFollowUp,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  getUpcomingAppointments: (days = 7) => {
    const { followUps } = get();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return followUps.filter(fu => {
      if (!fu.next_appointment) return false;
      const appointmentDate = new Date(fu.next_appointment);
      return appointmentDate >= today && appointmentDate <= futureDate;
    }).sort((a, b) => {
      return new Date(a.next_appointment!).getTime() - new Date(b.next_appointment!).getTime();
    });
  },

  getFollowUpsByPatient: (patientId) => {
    const { followUps } = get();
    return followUps.filter(fu => fu.patient_id === patientId);
  },

  getWeightHistory: (patientId) => {
    const { followUps } = get();
    return followUps
      .filter(fu => fu.patient_id === patientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(fu => ({
        date: fu.date,
        weight: fu.weight,
      }));
  },
}));

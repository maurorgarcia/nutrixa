import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { Payment } from '@/types';

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  fetchPayments: (nutritionistId: string) => Promise<void>;
  fetchPaymentsByPatient: (patientId: string) => Promise<void>;
  createPayment: (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePaymentStatus: (id: string, status: Payment['status'], paidAt?: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: false,
  error: null,

  fetchPayments: async (nutritionistId) => {
    set({ loading: true, error: null });
    const { data, error } = await (supabase as any)
      .from('payments')
      .select('*')
      .eq('nutritionist_id', nutritionistId)
      .order('created_at', { ascending: false });

    if (error) set({ error: error.message, loading: false });
    else set({ payments: data || [], loading: false });
  },

  fetchPaymentsByPatient: async (patientId) => {
    set({ loading: true, error: null });
    const { data, error } = await (supabase as any)
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) set({ error: error.message, loading: false });
    else set({ payments: data || [], loading: false });
  },

  createPayment: async (payment) => {
    set({ loading: true, error: null });
    const { error } = await (supabase as any)
      .from('payments')
      .insert([payment]);

    if (error) set({ error: error.message, loading: false });
    else set({ loading: false });
  },

  updatePaymentStatus: async (id, status, paidAt) => {
    set({ loading: true, error: null });
    const { error } = await (supabase as any)
      .from('payments')
      .update({ status, paid_at: paidAt || (status === 'paid' ? new Date().toISOString() : null) } as any)
      .eq('id', id);

    if (error) set({ error: error.message, loading: false });
    else {
      set((state) => ({
        payments: state.payments.map((p) => 
          p.id === id ? { ...p, status, paid_at: paidAt || (status === 'paid' ? new Date().toISOString() : p.paid_at) } as Payment : p
        ),
        loading: false
      }));
    }
  },

  deletePayment: async (id) => {
    set({ loading: true, error: null });
    const { error } = await (supabase as any)
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) set({ error: error.message, loading: false });
    else {
      set((state) => ({
        payments: state.payments.filter((p) => p.id !== id),
        loading: false
      }));
    }
  },
}));

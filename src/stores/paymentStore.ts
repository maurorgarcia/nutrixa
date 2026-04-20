import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import type { Payment, PaymentInsert, PaymentMethod, PaymentStatus } from '@/types';

/** Adapta filas legacy (nutritionist_id) o tipos numéricos de Postgres. */
function normalizePaymentRow(raw: Record<string, unknown>): Payment {
  const amount = raw.amount;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount ?? 0);
  const owner = (raw.user_id ?? raw.nutritionist_id) as string | undefined;
  const status = (raw.status ?? 'pending') as PaymentStatus;
  const method = (raw.method ?? 'transfer') as PaymentMethod;

  return {
    id: String(raw.id),
    user_id: String(owner ?? ''),
    patient_id: (raw.patient_id as string | null) ?? null,
    patient_name: String(raw.patient_name ?? ''),
    patient_email: String(raw.patient_email ?? ''),
    description: String(raw.description ?? ''),
    amount: Number.isFinite(numAmount) ? numAmount : 0,
    currency: String(raw.currency ?? 'ARS'),
    status,
    method,
    appointment_id: (raw.appointment_id as string | null | undefined) ?? undefined,
    notes: String(raw.notes ?? ''),
    paid_at: (raw.paid_at as string | null) ?? null,
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? raw.created_at ?? ''),
  };
}

async function loadPaymentsForOwner(client: typeof supabase, ownerId: string) {
  const c = client as any;
  const strategies: Array<{ column: 'user_id' | 'nutritionist_id'; ordered: boolean }> = [
    { column: 'user_id', ordered: true },
    { column: 'nutritionist_id', ordered: true },
    { column: 'user_id', ordered: false },
    { column: 'nutritionist_id', ordered: false },
  ];

  let lastMessage = '';
  for (const { column, ordered } of strategies) {
    let q = c.from('payments').select('*').eq(column, ownerId);
    if (ordered) q = q.order('created_at', { ascending: false });
    const { data, error } = await q;
    if (!error) {
      return { data: (data || []).map((row: Record<string, unknown>) => normalizePaymentRow(row)), error: null as string | null };
    }
    lastMessage = error.message;
  }
  return { data: [] as Payment[], error: lastMessage };
}

async function loadPaymentsByPatient(client: typeof supabase, patientId: string) {
  const c = client as any;
  for (const ordered of [true, false]) {
    let q = c.from('payments').select('*').eq('patient_id', patientId);
    if (ordered) q = q.order('created_at', { ascending: false });
    const { data, error } = await q;
    if (!error) {
      return { data: (data || []).map((row: Record<string, unknown>) => normalizePaymentRow(row)), error: null as string | null };
    }
    if (!ordered) return { data: [] as Payment[], error: error.message };
  }
  return { data: [] as Payment[], error: 'Error al cargar cobros' };
}

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  fetchPayments: (ownerUserId: string) => Promise<void>;
  fetchPaymentsByPatient: (patientId: string) => Promise<void>;
  createPayment: (payment: PaymentInsert) => Promise<{ error: string | null }>;
  updatePaymentStatus: (id: string, status: Payment['status'], paidAt?: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: false,
  error: null,

  fetchPayments: async (ownerUserId) => {
    set({ loading: true, error: null });
    const { data, error } = await loadPaymentsForOwner(supabase, ownerUserId);
    if (error) set({ error, loading: false, payments: [] });
    else set({ payments: data, loading: false, error: null });
  },

  fetchPaymentsByPatient: async (patientId) => {
    set({ loading: true, error: null });
    const { data, error } = await loadPaymentsByPatient(supabase, patientId);
    if (error) set({ error, loading: false, payments: [] });
    else set({ payments: data, loading: false, error: null });
  },

  createPayment: async (payment) => {
    set({ error: null });
    const c = supabase as any;
    let { error } = await c.from('payments').insert([payment]);

    if (error && /column[^"]*user_id|Could not find the.*\buser_id\b/i.test(String(error.message))) {
      const legacy: Record<string, unknown> = { ...payment };
      legacy.nutritionist_id = payment.user_id;
      delete legacy.user_id;
      ({ error } = await c.from('payments').insert([legacy]));
    }

    if (error) {
      set({ error: error.message });
      return { error: error.message };
    }
    return { error: null };
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

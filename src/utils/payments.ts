/**
 * Módulo de Gestión de Cobros — Nutrixa
 * 
 * Implementación con Stripe (requiere una VITE_STRIPE_PUBLIC_KEY en .env)
 * En modo beta/sin clave → funciona en modo "registro interno" sin cobrar nada.
 * 
 * Para activar Stripe real:
 * 1. Crear cuenta en stripe.com (gratis)
 * 2. Agregar VITE_STRIPE_PUBLIC_KEY=pk_test_xxx en .env.local
 * 3. Instalar: npm install @stripe/stripe-js @stripe/react-stripe-js
 */

import { supabase } from '@/lib/supabase/client';

// ─── TIPOS ─────────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'mercadopago';

export interface Payment {
  id: string;
  nutritionist_id: string;
  patient_id: string | null;
  patient_name: string;
  patient_email: string;
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  appointment_id: string | null;
  notes: string;
  created_at: string;
  paid_at: string | null;
}

export interface PaymentFormData {
  patient_id?: string;
  patient_name: string;
  patient_email: string;
  description: string;
  amount: string;
  method: PaymentMethod;
  appointment_id?: string;
  notes: string;
}

// ─── FUNCIONES DE BASE DE DATOS ─────────────────────────────────────────────

export async function fetchPayments(nutritionistId: string): Promise<Payment[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('payments')
      .select('*')
      .eq('nutritionist_id', nutritionistId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Payment[];
  } catch {
    return [];
  }
}

export async function createPayment(
  nutritionistId: string,
  formData: PaymentFormData
): Promise<{ data: Payment | null; error: string | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('payments')
      .insert([{
        nutritionist_id: nutritionistId,
        patient_id: formData.patient_id || null,
        patient_name: formData.patient_name,
        patient_email: formData.patient_email,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: 'ARS',
        status: 'pending',
        method: formData.method,
        appointment_id: formData.appointment_id || null,
        notes: formData.notes,
        paid_at: null,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data: data as Payment, error: null };
  } catch (e: any) {
    return { data: null, error: e.message || 'Error al crear pago' };
  }
}

export async function markAsPaid(paymentId: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', paymentId);

    return !error;
  } catch {
    return false;
  }
}

export async function cancelPayment(paymentId: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('id', paymentId);

    return !error;
  } catch {
    return false;
  }
}

export async function deletePayment(paymentId: string): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from('payments')
      .delete()
      .eq('id', paymentId);

    return !error;
  } catch {
    return false;
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: '💵 Efectivo',
  transfer: '🏦 Transferencia',
  card: '💳 Tarjeta',
  mercadopago: '🔵 MercadoPago',
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pendiente',  cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:      { label: 'Pagado',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  partial:   { label: 'Parcial',    cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelado',  cls: 'bg-red-50 text-red-600 border-red-200' },
};

// ─── ESTADÍSTICAS DE COBROS ──────────────────────────────────────────────────

export interface PaymentStats {
  totalCollected: number;
  totalPending: number;
  totalCancelled: number;
  countPaid: number;
  countPending: number;
  byMethod: Record<PaymentMethod, number>;
}

export function computePaymentStats(payments: Payment[]): PaymentStats {
  const stats: PaymentStats = {
    totalCollected: 0, totalPending: 0, totalCancelled: 0,
    countPaid: 0, countPending: 0,
    byMethod: { cash: 0, transfer: 0, card: 0, mercadopago: 0 },
  };

  payments.forEach(p => {
    if (p.status === 'paid') {
      stats.totalCollected += p.amount;
      stats.countPaid++;
      stats.byMethod[p.method] += p.amount;
    } else if (p.status === 'pending') {
      stats.totalPending += p.amount;
      stats.countPending++;
    } else if (p.status === 'cancelled') {
      stats.totalCancelled += p.amount;
    }
  });

  return stats;
}

// ─── GENERAR LINK DE PAGO DE MERCADOPAGO (SIMULADO EN BETA) ─────────────────

export async function generateMercadoPagoLink(
  _amount: number,
  _description: string,
  _payerEmail: string
): Promise<{ url: string | null; error: string | null }> {
  // En modo beta: genera URL nativa de MP sin backend
  // Para activar real: implementar endpoint en Supabase Edge Functions o
  // backend propio que llame a la API de MP con la SECRET_KEY
  const mpUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?preference_id=beta_${Date.now()}`;
  
  // Cuando tengas backend:
  // const res = await fetch('/api/create-mp-preference', {
  //   method: 'POST', body: JSON.stringify({ amount, description, payerEmail })
  // });
  // const { init_point } = await res.json();
  // return { url: init_point, error: null };

  console.info('🔵 MercadoPago en modo simulación. Para activar, implementar el backend de preferencias.');
  return { url: mpUrl, error: null };
}

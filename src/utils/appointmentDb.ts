import { supabase } from '@/lib/supabase/client';
import type { Appointment } from '@/types';

/** Normaliza filas legacy con columna nutritionist_id. */
export function normalizeAppointmentRow(row: Record<string, unknown>): Appointment {
  const userId = String(row.user_id ?? row.nutritionist_id ?? '');
  return { ...(row as object), user_id: userId } as Appointment;
}

export async function fetchAppointmentsForOwner(ownerId: string): Promise<Appointment[]> {
  const c = supabase as any;
  let { data, error } = await c
    .from('appointments')
    .select('*')
    .eq('user_id', ownerId)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    const second = await c
      .from('appointments')
      .select('*')
      .eq('nutritionist_id', ownerId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    data = second.data;
  }

  return ((data || []) as Record<string, unknown>[]).map(normalizeAppointmentRow);
}

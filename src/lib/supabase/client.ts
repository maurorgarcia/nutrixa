import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Desactivamos el locking estricto que causa problemas en navegadores durante desarrollo local o con múltiples pestañas
    storageKey: 'senralis-auth-token'
  }
});

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  if (error.error_description) {
    return error.error_description;
  }
  return 'Ha ocurrido un error inesperado';
};

// REST directo con el JWT del usuario (misma sesión que el SDK): RLS de PostgREST sigue aplicando.
// Preferir `supabase.from(...)` cuando el SDK no presente problemas; ambos respetan políticas con anon key.
export const supabaseRestGet = async (table: string, queryStr: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No hay sesión activa para leer datos.');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${queryStr}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(errTxt);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`[REST GET ${table}] Error:`, err);
    throw err;
  }
};

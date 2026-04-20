import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types';

let isInitialized = false;

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<User>) => Promise<{ error: string | null }>;
  
  // Initialize
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      error: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { error: error.message };
          }

          // Fetch user profile - with shorter timeout for responsiveness
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError || !profile) {
            // If profile missing, create it immediately from auth metadata
            const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
            const { data: newProfile, error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || 'Usuario',
                role: 'nutritionist',
                plan: 'trial',
                trial_ends_at: trialEnd,
                slug: (data.user.user_metadata?.full_name || 'usuario')
                  .toLowerCase()
                  .trim()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/[\s_-]+/g, '-')
                  .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6),
                services: [
                  { id: 'initial-1', name: 'Consulta General', price: 0, duration: 60 }
                ]
              } as any)
              .select()
              .single();
            
            if (createError) {
               set({ error: 'Error al inicializar perfil: ' + createError.message, loading: false });
               return { error: createError.message };
            }
            
            set({ user: newProfile as unknown as User, session: data.session, loading: false });
            return { error: null };
          }

          set({ 
            user: profile as unknown as User, 
            session: data.session, 
            loading: false 
          });
          return { error: null };
        } catch (err: any) {
          set({ error: err.message, loading: false });
          return { error: err.message };
        }
      },

      signUp: async (email, password, fullName) => {
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { error: error.message };
          }

          if (data.user) {
            set({ loading: false });
            return { error: null };
          }

          set({ loading: false });
          return { error: null };
        } catch (err: any) {
          set({ error: err.message, loading: false });
          return { error: err.message };
        }
      },

      signOut: async () => {
        set({ user: null, session: null, error: null });
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Error signing out:', err);
        }
      },
      
      signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
            },
          });
          if (error) {
            set({ error: error.message, loading: false });
            return { error: error.message };
          }
          return { error: null };
        } catch (err: any) {
          set({ error: err.message, loading: false });
          return { error: err.message };
        }
      },

      resetPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) {
            set({ error: error.message, loading: false });
            return { error: error.message };
          }

          set({ loading: false });
          return { error: null };
        } catch (err: any) {
          set({ error: err.message, loading: false });
          return { error: err.message };
        }
      },

      updateProfile: async (data: Partial<User>) => {
        set({ error: null });
        console.log('[AuthStore] Iniciando updateProfile con datos:', data);
        try {
          const { user, session } = get();
          if (!user) {
            console.error('[AuthStore] Error: No hay usuario autenticado');
            return { error: 'No hay usuario autenticado' };
          }

          console.log('[AuthStore] Ejecutando update en Supabase para id:', user.id);
          
          // Limpiamos los datos para evitar circular references
          const pureData = JSON.parse(JSON.stringify(data));
          
          // FORZAMOS UN FETCH NATIVO (BYPASS AL CLIENTE SUPABASE DE JS) 
          // Esto evita ABSOLUTAMENTE cualquier cuelgue interno, lockeos de sesión o bugs del SDK con arrays JSONB
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const token = session?.access_token;
            if (!token) throw new Error('No hay token de sesión válido');

            const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'apikey': supabaseKey,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(pureData),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              const errBody = await response.text();
              console.error('[AuthStore] Error de REST Supabase:', errBody);
              set({ error: errBody });
              return { error: 'Error del servidor: ' + errBody };
            }
            
            console.log('[AuthStore] Respuesta de Update REST exitosa');
            
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              console.warn('[AuthStore] REST Fetch abortado por lentitud de red.');
              return { error: 'La red tardó más de 10 segundos en responder. Comprueba tu internet.' };
            }
            throw fetchError;
          }

          // Actualizamos el estado local de inmediato con los datos que mandamos
          const updatedUser = { ...user, ...pureData };
          set({ user: updatedUser });
          
          console.log('[AuthStore] Store local actualizado con éxito tras guardado');
          return { error: null };
        } catch (err: any) {
          console.error('[AuthStore] Excepción crítica en updateProfile:', err);
          set({ error: err.message });
          return { error: err.message };
        }
      },

      initializeAuth: async () => {
        if (isInitialized) return;
        isInitialized = true;

        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user profile
            let { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // Si falta el perfil al inicializar, lo creamos
            if (error || !profile) {
              const trialEndInit = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
              const { data: newProfile, error: createError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  full_name: session.user.user_metadata?.full_name || 'Usuario',
                  role: 'nutritionist',
                  plan: 'trial',
                  trial_ends_at: trialEndInit,
                  slug: (session.user.user_metadata?.full_name || 'usuario')
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6),
                  services: [
                    { id: 'initial-1', name: 'Consulta General', price: 0, duration: 60 }
                  ]
                } as any)
                .select()
                .single();
              
              if (!createError && newProfile) {
                profile = newProfile;
              }
            }

            if (profile) {
              set({ 
                user: profile as unknown as User, 
                session,
                loading: false 
              });
            } else {
              set({ loading: false });
            }
          } else {
            set({ loading: false });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              let { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (error || !profile) {
                const trialEndAuth = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
                const { data: newProfile, error: createError } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || 'Usuario',
                    role: 'nutritionist',
                    plan: 'trial',
                    trial_ends_at: trialEndAuth,
                    slug: (session.user.user_metadata?.full_name || 'usuario')
                      .toLowerCase()
                      .trim()
                      .replace(/[^\w\s-]/g, '')
                      .replace(/[\s_-]+/g, '-')
                      .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6),
                    services: [
                      { id: 'initial-1', name: 'Consulta General', price: 0, duration: 60 }
                    ]
                  } as any)
                  .select()
                  .single();
                
                if (!createError && newProfile) {
                  profile = newProfile;
                }
              }

              set({ 
                user: (profile as unknown as User) || null, 
                session,
                loading: false
              });
            } else {
              set({ user: null, session: null, loading: false });
            }
          });
        } catch (err) {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
);

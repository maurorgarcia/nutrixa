import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { supabase } from '@/lib/supabase/client';
import type { Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Calendar, Plus, ChevronRight,
  CalendarCheck, Check, X, AlertTriangle,
  DollarSign, ArrowUpRight, Clock, BarChart3, Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import { format, isBefore, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { followUpsWithPatient, fetchFollowUps } = useFollowUpStore();
  const { fetchMealPlans } = useMealPlanStore();
  const { payments, fetchPayments } = usePaymentStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('appointments').select('*').eq('nutritionist_id', userId)
        .order('date', { ascending: true }).order('start_time', { ascending: true });
      if (!error && data) setAppointments(data as Appointment[]);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user) {
      fetchPatients(user.id);
      fetchFollowUps(user.id);
      fetchMealPlans(user.id);
      fetchAppointments(user.id);
      fetchPayments(user.id);
    }
  }, [user]);

  const respondToAppointment = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await (supabase as any).from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(status === 'confirmed' ? 'Turno confirmado' : 'Turno rechazado');
      if (user) fetchAppointments(user.id);
    } catch { toast.error('Ocurrió un error al procesar el turno'); }
  };

  // ── COMPUTED ──
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayAppointments = useMemo(() => [
    ...followUpsWithPatient
      .filter(fu => fu.next_appointment && format(new Date(fu.next_appointment), 'yyyy-MM-dd') === todayStr)
      .map(fu => ({
        id: fu.id, type: 'follow_up' as const,
        date: new Date(fu.next_appointment!),
        name: fu.patient ? `${fu.patient.first_name} ${fu.patient.last_name}` : 'Paciente',
        subtitle: 'Control Programado',
        patientId: fu.patient_id,
      })),
    ...appointments
      .filter(a => a.status === 'confirmed' && a.date === todayStr)
      .map(a => ({
        id: a.id, type: 'booking' as const,
        date: new Date(`${a.date}T${a.start_time}`),
        name: a.guest_name || 'Paciente Nuevo',
        subtitle: `${a.service_name} • ${a.start_time.substring(0, 5)}hs`,
        patientId: null,
      })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()), [followUpsWithPatient, appointments, todayStr]);

  const inactivePatients = useMemo(() => {
    const threshold = subDays(new Date(), 90);
    return patients.filter(p => {
      const lastFollowUp = followUpsWithPatient
        .filter(fu => fu.patient_id === p.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const lastAppt = appointments
        .filter(a => a.guest_email === p.email && a.status === 'confirmed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const lastDate = lastFollowUp ? new Date(lastFollowUp.date) : lastAppt ? new Date(lastAppt.date) : new Date(p.created_at);
      return isBefore(lastDate, threshold);
    }).slice(0, 4);
  }, [patients, followUpsWithPatient, appointments]);

  const monthlyPayments = useMemo(() => {
    const now = new Date();
    return payments.filter(p => {
      const d = new Date(p.created_at);
      return p.status === 'paid' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* ── BOUTIQUE HEADER (Editorial layout) ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
        <div className="space-y-4 max-w-2xl">
           <div className="flex items-center gap-2">
              <div className="h-[1px] w-6 bg-primary/30" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{format(new Date(), "EEEE dd, MMMM", { locale: es })}</p>
           </div>
           <h1 className="text-6xl font-black text-primary leading-[0.9] tracking-[-0.06em]">
              {user?.full_name?.split(' ')[0]}.
           </h1>
           <p className="text-foreground/80 font-medium text-lg max-w-md leading-relaxed">
             {todayAppointments.length > 0 
                ? `Hay actividad prevista para hoy: ${todayAppointments.length} citas registradas en tu consultorio comercial.` 
                : 'Hoy no se registran turnos confirmados. Es un buen momento para gestionar el catálogo de recetas.'}
           </p>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          <Button onClick={() => navigate('/patients')} className="h-14 px-10 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-3">
             Registrar Paciente <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex justify-end pr-2">
             <Badge variant="outline" className="rounded-full border-primary/20 text-primary/60 bg-transparent h-7 px-4 text-[9px] font-bold tracking-widest">LICENCIA PROFESIONAL</Badge>
          </div>
        </div>
      </div>

      {/* ── METRIC STRIP (Asymmetric look) ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
         {[
           { label: 'Facturación Mensual', value: `$${monthlyPayments.toLocaleString('es-AR')}`, icon: DollarSign, color: 'emerald' },
           { label: 'Fichas Médicas', value: patients.length, icon: Users, color: 'primary' },
           { label: 'Actividad Diaria', value: todayAppointments.length, icon: CalendarCheck, color: 'blue' },
           { label: 'Alertas', value: appointments.filter(a => a.status === 'pending').length, icon: Zap, color: 'amber' },
         ].map((kpi, i) => (
           <div key={i} className={cn(
             "p-6 rounded-[2rem] border border-primary/5 bg-white shadow-sm flex flex-col justify-between h-40",
             i === 0 && "md:col-span-1",
             i === 1 && "md:col-span-1",
           )}>
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{kpi.label}</p>
                 <kpi.icon className="h-4 w-4 text-primary/20" />
              </div>
              <p className="text-4xl font-black text-primary tracking-tighter">{kpi.value}</p>
           </div>
         ))}
      </div>

      {/* ── CONTENT AREA (Editorial layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* AGENDA HOY (Left focused) */}
         <div className="lg:col-span-4 flex flex-col gap-6">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40 pl-6 border-l-2 border-primary/10">Cronograma Diario</h2>
            <Card className="border-none shadow-none bg-transparent overflow-hidden flex-1">
               <CardContent className="p-0">
                  {todayAppointments.length === 0 ? (
                    <div className="py-10">
                       <p className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">Sin compromisos para hoy</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       {todayAppointments.map(appt => (
                         <div key={appt.id} className="p-6 bg-white rounded-[1.5rem] border border-primary/5 hover:border-primary/20 transition-all flex items-center gap-6 group cursor-pointer" onClick={() => appt.patientId && navigate(`/patients/${appt.patientId}`)}>
                            <p className="text-[11px] font-black text-primary/40 group-hover:text-primary transition-colors underline underline-offset-8 decoration-primary/20">{format(appt.date, 'HH:mm')}</p>
                            <div className="min-w-0 flex-1">
                               <p className="text-sm font-black text-primary truncate uppercase tracking-tight">{appt.name}</p>
                               <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-tighter mt-0.5">{appt.subtitle}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-primary/20 group-hover:text-primary" />
                         </div>
                       ))}
                    </div>
                  )}
               </CardContent>
            </Card>

            <div className="p-8 rounded-[2.5rem] bg-accent/30 border border-accent flex flex-col gap-6">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-foreground">Notificación de Retención</p>
               </div>
               <p className="text-2xl font-black text-primary tracking-tight leading-none">Tienes {inactivePatients.length} pacientes ausentes.</p>
               <Button className="w-fit h-10 px-6 bg-primary text-white font-black uppercase tracking-widest text-[9px] rounded-full hover:scale-105 active:scale-95 transition-all">
                  Generar Estrategia
               </Button>
            </div>
         </div>

         {/* SOLICITUDES (Right focused) */}
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40 pl-6 border-l-2 border-primary/10">Bandeja de Entrada</h2>
              <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{appointments.length} SOLICITUDES</p>
            </div>
            
            <Card className="border-none shadow-none bg-transparent overflow-hidden">
               <CardContent className="p-0">
                  {appointments.length === 0 ? (
                    <div className="py-20 text-center bg-white/50 rounded-[3rem] border-2 border-dashed border-primary/5">
                       <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">No hay nuevas peticiones web</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {appointments.map(appt => (
                         <div key={appt.id} className={cn(
                           "p-8 rounded-[2rem] border bg-white flex flex-col justify-between gap-8 group transition-all",
                           appt.status === 'pending' ? "border-primary/20 shadow-xl shadow-primary/5" : "border-primary/5 opacity-60"
                         )}>
                            <div className="flex items-start justify-between">
                               <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                     <div className="h-10 w-10 bg-primary/5 rounded-full border border-primary/10 flex items-center justify-center">
                                        <p className="text-[10px] font-black text-primary">{format(new Date(appt.date), 'dd')}</p>
                                     </div>
                                     <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{format(new Date(appt.date), 'MMMM', { locale: es })}</p>
                                  </div>
                                  <div>
                                     <p className="text-xl font-black text-primary tracking-tighter uppercase leading-none mb-2">{appt.guest_name}</p>
                                     <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="rounded-full h-5 text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary border-none">{appt.service_name}</Badge>
                                        <p className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">{appt.start_time.substring(0,5)}hs</p>
                                     </div>
                                  </div>
                               </div>
                               {appt.status !== 'pending' && (
                                 <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", appt.status === 'confirmed' ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                                    {appt.status === 'confirmed' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                 </div>
                               )}
                            </div>
                            
                            {appt.status === 'pending' && (
                              <div className="flex items-center gap-2 pt-4 border-t border-primary/5">
                                 <Button onClick={() => respondToAppointment(appt.id, 'confirmed')} className="flex-1 h-12 rounded-full bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">Aprobar</Button>
                                 <Button onClick={() => respondToAppointment(appt.id, 'cancelled')} variant="ghost" className="h-12 w-12 rounded-full text-foreground/20 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"><X className="h-5 w-5" /></Button>
                              </div>
                            )}
                         </div>
                       ))}
                    </div>
                  )}
               </CardContent>
            </Card>
         </div>

      </div>

    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format, addMinutes, parse, isBefore, startOfToday } from 'date-fns';
import type { User, NutritionService } from '@/types';
import { Loader2, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, Zap, HeartPulse, Shield, Award } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [professional, setProfessional] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<'service' | 'datetime'>('service');
  const [selectedService, setSelectedService] = useState<NutritionService | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!slug) return;
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_user_by_slug', {
          p_slug: slug,
        });
        if (!rpcError && rpcData) {
          const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
          if (row) {
            const whs =
              typeof row.working_hours_start === 'string'
                ? row.working_hours_start.slice(0, 5)
                : String(row.working_hours_start || '09:00').slice(0, 5);
            const whe =
              typeof row.working_hours_end === 'string'
                ? row.working_hours_end.slice(0, 5)
                : String(row.working_hours_end || '18:00').slice(0, 5);
            setProfessional({
              id: row.id,
              slug: row.slug,
              full_name: row.full_name,
              email: '',
              role: (row.role as User['role']) || 'nutritionist',
              working_days: row.working_days || [1, 2, 3, 4, 5],
              working_hours_start: whs,
              working_hours_end: whe,
              services: (row.services as NutritionService[]) || [],
              bio: row.bio ?? undefined,
              specialty: row.specialty ?? undefined,
              avatar_url: row.avatar_url ?? undefined,
              created_at: '',
              updated_at: '',
            });
            return;
          }
        }
        const { data, error } = await supabase.from('users').select('*').eq('slug', slug).single();
        if (error) throw error;
        if (!data) throw new Error('Profesional no encontrado');
        setProfessional(data as User);
      } catch {
        setError('No pudimos encontrar el perfil de este profesional.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [slug]);

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !professional || !selectedService) return;
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      if (!professional.working_days?.includes(dayOfWeek)) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const { data: slotRows } = await (supabase as any).rpc('get_booked_slots', {
          p_user_id: professional.id,
          p_date: dateStr,
        });
        const existingAppts = (slotRows as unknown[]) || [];
        const parseTime = (timeStr: string) => parse(timeStr.substring(0, 5), 'HH:mm', new Date());
        const startTime = parseTime(professional.working_hours_start);
        const endTime = parseTime(professional.working_hours_end);
        const duration = Number(selectedService.duration);
        const slots: string[] = [];
        let current = startTime;
        let loopGuard = 0;
        
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || duration <= 0) {
          setAvailableSlots([]);
          return;
        }

        while (addMinutes(current, duration) <= endTime && loopGuard < 150) {
          loopGuard++;
          const timeString = format(current, 'HH:mm');
          const isBooked = existingAppts?.some((appt: any) => {
            const apptStart = parseTime(appt.start_time);
            const apptEnd = parseTime(appt.end_time);
            const currentEnd = addMinutes(current, duration);
            return (isBefore(current, apptEnd) || current.getTime() === apptEnd.getTime()) && isBefore(apptStart, currentEnd);
          });
          const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isPast = isToday && isBefore(current, new Date());
          if (!isBooked && !isPast) slots.push(timeString);
          current = addMinutes(current, duration);
        }
        setAvailableSlots(slots);
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
    setSelectedTime(null);
  }, [selectedDate, professional, selectedService]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !professional || !selectedService) return;
    setBooking(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startDateTime = parse(selectedTime, 'HH:mm', new Date());
      const endDateTime = addMinutes(startDateTime, selectedService.duration);
      const row: Record<string, unknown> = {
        user_id: professional.id,
        guest_name: guestInfo.name,
        guest_email: guestInfo.email,
        guest_phone: guestInfo.phone,
        service_name: selectedService.name,
        service_duration: selectedService.duration,
        service_price: selectedService.price,
        date: dateStr,
        start_time: selectedTime,
        end_time: format(endDateTime, 'HH:mm'),
        status: 'pending',
      };
      let { error } = await (supabase as any).from('appointments').insert([row]);
      if (error && /user_id|column.*user_id/i.test(String(error.message))) {
        const { user_id: _u, ...rest } = row;
        ({ error } = await (supabase as any).from('appointments').insert([{ ...rest, nutritionist_id: professional.id }]));
      }
      if (error) throw error;
      setSuccess(true);
    } catch {
      toast.error('Hubo un problema al reservar el turno. Intenta nuevamente.');
    } finally {
      setBooking(false);
    }
  };

  const selectService = (service: NutritionService) => {
    setSelectedService(service);
    setStep('datetime');
    setSelectedDate(undefined);
    setSelectedTime(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="h-10 w-10 animate-spin text-senralis-main" />
      </div>
    );
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent flex-col gap-6 text-center px-6">
        <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
           <Zap className="h-8 w-8 text-slate-300" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{error || 'Perfil no habilitado'}</h2>
          <p className="text-slate-500 font-medium mt-1">El profesional solicitado no tiene una agenda pública activa.</p>
        </div>
        <Link to="/" className="text-sm font-bold text-senralis-main hover:text-senralis-dark uppercase tracking-widest">Volver al inicio</Link>
      </div>
    );
  }

  // ── SUCCESS VIEW ──
  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6 sm:p-10 font-sans">
         <div className="max-w-xl w-full surface-card overflow-hidden flex flex-col items-center text-center p-12 sm:p-20 relative">
            <div className="absolute top-0 inset-x-0 h-4 bg-senralis-main" />
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner">
               <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h1 className="font-display text-4xl font-black tracking-[-0.05em] text-slate-900 mb-4">Cita Confirmada</h1>
            <p className="text-slate-500 font-bold text-base leading-relaxed mb-12">
               ¡Listo! Tu turno con <span className="text-slate-900">{professional.full_name}</span> ha sido registrado exitosamente. Recibirás un correo de confirmación a la brevedad.
            </p>
            
            <div className="w-full bg-slate-50 rounded-2xl p-6 space-y-4 mb-12 border border-slate-100 italic">
               <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-400">SERVICIO</span><span className="text-slate-900 uppercase">{selectedService?.name}</span></div>
               <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-400">FECHA</span><span className="text-slate-900 uppercase">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</span></div>
               <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-400">HORARIO</span><span className="text-slate-900">{selectedTime} HS</span></div>
            </div>

            <Button onClick={() => window.location.reload()} className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all">
               Finalizar Sesión
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-slate-900 relative overflow-hidden">
      
      {/* ── BACKGROUND ACCENT ── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-senralis-main/8 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      {/* ── HEADER ── */}
      <header className="h-20 lg:h-24 px-6 sm:px-12 flex items-center justify-between relative z-10">
         <div className="flex items-center gap-4">
            <img src="/logoTexto.png" alt="Senralis" className="h-6 w-auto object-contain opacity-90" />
            <div className="h-6 w-[1px] bg-slate-300 hidden sm:block" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden sm:block">Agendamiento Oficial</p>
         </div>
         <Badge variant="outline" className="rounded-full border-slate-200 bg-white/70 backdrop-blur-md px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <Shield className="w-3 h-3 text-emerald-500" /> Infraestructura Segura
         </Badge>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 py-10 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
         
         {/* ── LEFT: PROFESSIONAL INFO ── */}
         <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
               <div className="h-3 w-20 bg-senralis-main rounded-full" />
               <div className="space-y-4">
                  <h1 className="font-display text-5xl font-black tracking-[-0.06em] text-slate-900 leading-none lg:text-7xl">
                     Reserva <br />
                     <span className="text-slate-400">Tu Turno.</span>
                  </h1>
                  <p className="text-2xl font-black text-senralis-main tracking-tight uppercase">{professional.full_name}</p>
               </div>
               
               {professional.specialty && (
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                     <HeartPulse className="w-5 h-5 text-senralis-main" />
                     <span className="text-xs font-black uppercase tracking-widest text-slate-600">{professional.specialty}</span>
                  </div>
               )}

               <p className="text-lg font-bold text-slate-500 leading-relaxed max-w-lg opacity-80">
                  {professional.bio || 'Solicitá tu espacio clínico a través de nuestra plataforma de agendamiento profesional acelerado.'}
               </p>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-10 border-t border-slate-200/60 max-w-md">
               {[
                  { icon: Shield, label: 'Protección de Privacidad HL7', desc: 'Tus datos clínicos están seguros.' },
                  { icon: Award, label: 'Atención Colegiada', desc: 'Atención certificada institucionalmente.' },
                  { icon: Zap, label: 'Agendamiento Instantáneo', desc: 'Sin esperas ni llamadas telefónicas.' }
               ].map((f, i) => (
                  <div key={i} className="flex gap-4">
                     <div className="h-10 w-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                        <f.icon className="h-5 w-5 text-slate-300" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-1">{f.label}</p>
                        <p className="text-xs font-bold text-slate-400 opacity-80">{f.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* ── RIGHT: BOOKING WIZARD ── */}
         <div className="lg:col-span-7">
            <div className="surface-card rounded-[3.5rem] p-10 sm:p-14 min-h-[600px] flex flex-col">
               
               <div className="mb-14">
                  {step === 'datetime' && (
                  <button onClick={() => setStep('service')} className="group flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-senralis-main uppercase tracking-[0.2em] mb-6 transition-all">
                     <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Volver a Selección
                  </button>
                  )}
                  <h2 className="font-display text-4xl font-black tracking-[-0.05em] text-slate-900 mb-2">
                     {step === 'service' ? 'Selecciona Servicio' : 'Elige Día y Hora'}
                  </h2>
                  <div className="h-1 w-12 bg-slate-100 rounded-full" />
               </div>

               {step === 'service' && (
                  <div className="space-y-4 flex-1">
                  {(!professional.services || professional.services.length === 0) ? (
                     <div className="py-20 text-center opacity-40">
                        <Clock className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Sin servicios activos</p>
                     </div>
                  ) : professional.services.map((service) => (
                     <button
                        key={service.id}
                        onClick={() => selectService(service)}
                        className="w-full bg-slate-50 border border-transparent rounded-[2rem] p-8 text-left hover:bg-white hover:border-senralis-main/30 hover:shadow-2xl transition-all duration-500 group flex items-center justify-between gap-6"
                     >
                        <div className="flex-1 min-w-0">
                           <p className="text-2xl font-black text-slate-900 group-hover:text-senralis-main transition-colors tracking-tighter uppercase leading-none mb-4">{service.name}</p>
                           <div className="flex items-center gap-6">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <Clock className="h-4 w-4 text-slate-300" /> {service.duration} MINUTOS
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <Zap className="h-4 w-4 text-amber-500" /> ATENCIÓN DIRECTA
                              </p>
                           </div>
                        </div>
                        <div className="shrink-0 bg-white border border-slate-100 px-8 py-4 rounded-2xl group-hover:bg-slate-900 group-hover:border-black transition-all shadow-sm">
                           <span className="text-xl font-black text-slate-900 group-hover:text-white transition-colors">
                              ${service.price.toLocaleString('es-AR')}
                           </span>
                        </div>
                     </button>
                  ))}
                  </div>
               )}

               {step === 'datetime' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-14 flex-1">
                     <div className="space-y-8">
                        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100 shadow-inner">
                           <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              locale={es}
                              disabled={(date) => {
                                 const day = date.getDay() === 0 ? 7 : date.getDay();
                                 return isBefore(date, startOfToday()) || !professional.working_days?.includes(day);
                              }}
                              className="border-0 w-full font-black text-slate-900"
                           />
                        </div>
                        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-senralis-main/20 blur-3xl" />
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-senralis-soft mb-3">Servicio Profesional</p>
                           <p className="text-2xl font-black tracking-tight leading-none mb-1 uppercase bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">{selectedService?.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Inversión: ${selectedService?.price.toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="space-y-8 flex flex-col h-full">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                           <Clock className="w-4 h-4" /> Horarios Disponibles
                        </p>
                        <div className="flex-1 overflow-y-auto pr-2 no-scrollbar max-h-[400px]">
                           {!selectedDate ? (
                              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                                 <CalendarIcon className="w-12 h-12 mb-4" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">Seleccioná una fecha</p>
                              </div>
                           ) : loadingSlots ? (
                              <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-senralis-main" /></div>
                           ) : availableSlots.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-10">
                                 <Zap className="w-12 h-12 mb-4" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">Sin cupos disponibles</p>
                              </div>
                           ) : (
                              <div className="grid grid-cols-2 gap-3 pb-10">
                                 {availableSlots.map((time) => (
                                    <button
                                       key={time}
                                       onClick={() => setSelectedTime(time)}
                                       className={cn(
                                          "h-14 rounded-2xl border transition-all font-black text-sm",
                                          selectedTime === time
                                          ? "bg-slate-900 border-black text-white shadow-2xl scale-[1.03]"
                                          : "bg-white border-slate-100 text-slate-400 hover:border-senralis-main hover:text-senralis-main"
                                       )}
                                    >
                                       {time}
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>

                        {selectedTime && (
                           <div className="pt-8 border-t border-slate-100 mt-auto animate-in fade-in slide-in-from-bottom-6">
                              <form onSubmit={handleBook} className="space-y-6">
                                 <div className="space-y-4">
                                    <div className="space-y-2">
                                       <Label className="label-caps">Nombre Completo</Label>
                                       <Input required value={guestInfo.name} onChange={e => setGuestInfo({...guestInfo, name: e.target.value})} className="h-12 bg-slate-50 border-transparent rounded-xl font-bold" placeholder="Escribe tu nombre..." />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                       <div className="space-y-2">
                                          <Label className="label-caps">Email</Label>
                                          <Input type="email" required value={guestInfo.email} onChange={e => setGuestInfo({...guestInfo, email: e.target.value})} className="h-12 bg-slate-50 border-transparent rounded-xl font-bold" placeholder="tu@email.com" />
                                       </div>
                                       <div className="space-y-2">
                                          <Label className="label-caps">WhatsApp</Label>
                                          <Input type="tel" required value={guestInfo.phone} onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})} className="h-12 bg-slate-50 border-transparent rounded-xl font-bold" placeholder="+54 9..." />
                                       </div>
                                    </div>
                                 </div>
                                 <Button disabled={booking} className="w-full h-16 bg-senralis-main hover:bg-senralis-dark text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-4">
                                    {booking ? <Loader2 className="h-6 w-6 animate-spin" /> : <>AGENDAR TURNO PROFESIONAL <ArrowRight className="w-5 h-5" /></>}
                                 </Button>
                              </form>
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="h-24 sm:h-32 px-12 flex items-center justify-center text-slate-300 relative z-10 border-t border-slate-200/40 bg-white/50 backdrop-blur-md">
         <p className="text-[10px] font-black uppercase tracking-[0.4em]">Powered by Senralis Operating System · 2026</p>
      </footer>
    </div>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
   <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
   </svg>
)

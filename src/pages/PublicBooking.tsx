import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format, addMinutes, parse, isBefore, startOfToday } from 'date-fns';
import type { User, NutritionService } from '@/types';
import { Loader2, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [nutritionist, setNutritionist] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking state
  const [step, setStep] = useState<'service' | 'datetime'>('service');
  const [selectedService, setSelectedService] = useState<NutritionService | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Guest info state
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch nutritionist profile by slug
  useEffect(() => {
    async function fetchProfile() {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Nutricionista no encontrado');
        setNutritionist(data as User);
      } catch (err: any) {
        setError('No pudimos encontrar el perfil de este profesional.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [slug]);

  // Generate available slots when a date is selected
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate || !nutritionist || !selectedService) return;
      
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      
      // Check if nutritionist works on this day
      if (!nutritionist.working_days?.includes(dayOfWeek)) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        
        // Fetch existing appointments using secure RPC to avoid RLS locks and protect patient privacy
        const { data: existingAppts } = await (supabase as any)
          .rpc('get_booked_slots', { 
            p_nutritionist_id: nutritionist.id,
            p_date: dateStr
          });

        const parseTime = (timeStr: string) => {
          return parse(timeStr.substring(0, 5), 'HH:mm', new Date());
        };

        const startTime = parseTime(nutritionist.working_hours_start);
        const endTime = parseTime(nutritionist.working_hours_end);
        const duration = Number(selectedService.duration);
        
        const slots: string[] = [];
        let current = startTime;
        let loopGuard = 0; // Anti infinite loop

        // If something was parsed to an invalid date, exit immediately
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || duration <= 0) {
          setAvailableSlots([]);
          return;
        }

        while (addMinutes(current, duration) <= endTime && loopGuard < 150) {
          loopGuard++;
          const timeString = format(current, 'HH:mm');
          // Basic overlap check
          const isBooked = existingAppts?.some((appt: any) => {
            const apptStart = parseTime(appt.start_time);
            const apptEnd = parseTime(appt.end_time);
            const currentEnd = addMinutes(current, duration);
            
            return (
              (isBefore(current, apptEnd) || current.getTime() === apptEnd.getTime()) && 
              isBefore(apptStart, currentEnd)
            );
          });

          // Also check if time is in the past for today
          const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isPast = isToday && isBefore(current, new Date());

          if (!isBooked && !isPast) {
            slots.push(timeString);
          }
          current = addMinutes(current, duration); // or a 15 min step, but we step by duration to avoid weird math
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
  }, [selectedDate, nutritionist, selectedService]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !nutritionist || !selectedService) return;

    setBooking(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startDateTime = parse(selectedTime, 'HH:mm', new Date());
      const endDateTime = addMinutes(startDateTime, selectedService.duration);

      const { error } = await (supabase as any)
        .from('appointments')
        .insert([{
          nutritionist_id: nutritionist.id,
          guest_name: guestInfo.name,
          guest_email: guestInfo.email,
          guest_phone: guestInfo.phone,
          service_name: selectedService.name,
          service_duration: selectedService.duration,
          service_price: selectedService.price,
          date: dateStr,
          start_time: selectedTime,
          end_time: format(endDateTime, 'HH:mm'),
          status: 'pending' // Nutritionist can confirm it later
        }]);

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !nutritionist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 flex-col gap-4">
        <div className="text-4xl text-zinc-300">🔍</div>
        <h2 className="text-xl font-bold text-zinc-700">{error || 'No encontrado'}</h2>
        <p className="text-zinc-500 font-medium">Revisa que el enlace sea correcto.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <Card className="max-w-md w-full text-center py-8 rounded-3xl border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white overflow-hidden">
          <CardContent className="space-y-6 pt-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100 shadow-inner">
               <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
               <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">¡Turno Solicitado!</h2>
               <p className="text-sm font-medium text-zinc-500 mt-2 px-4 leading-relaxed">
                 Hemos enviado tu solicitud. {nutritionist.full_name} se pondrá en contacto pronto para confirmar.
               </p>
            </div>
            
            <div className="bg-zinc-50 mx-4 p-5 rounded-2xl border border-zinc-200 text-left space-y-3 shadow-inner">
              <p className="font-bold text-zinc-900 text-lg border-b border-zinc-200 pb-3">{selectedService?.name}</p>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 pt-1">
                <CalendarIcon className="h-5 w-5 text-emerald-600" />
                <span>{selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                <Clock className="h-5 w-5 text-emerald-600" />
                <span>A las {selectedTime} hs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasServices = nutritionist.services && nutritionist.services.length > 0;

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Left Panel - Premium visual */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-zinc-950 overflow-hidden flex-col justify-between">
        {/* Abstract Backgrounds */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30" />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20" />
        
        <div className="relative z-10 p-10 lg:p-14">
          <div className="mb-12">
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-10 opacity-100 brightness-0 invert drop-shadow-md" />
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Prioriza tu bienestar hoy.
          </h1>
          <p className="text-lg text-zinc-300 leading-relaxed font-light max-w-md">
            Agenda tu consulta con {nutritionist.full_name} y da el primer paso hacia un estilo de vida más saludable y equilibrado.
          </p>
        </div>

        <div className="relative z-10 p-10 lg:p-14 mt-auto">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl backdrop-blur-md border border-white/10 w-fit">
             <div className="bg-white/10 p-3 rounded-2xl">
               <CalendarIcon className="h-6 w-6 text-white" />
             </div>
             <div>
               <p className="text-sm font-bold text-white tracking-wide">Turnera Oficial Segura</p>
               <p className="text-xs font-medium text-zinc-400">Certificada por Nutrixa</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Booking Flow */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto px-4 py-8 sm:px-6 lg:px-12 bg-white relative">
        <div className="w-full max-w-2xl mx-auto my-auto space-y-8 lg:py-12">
          
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-10 opacity-80" />
          </div>
          
          <div className="text-center sm:text-left space-y-3 mb-12">
            {step === 'datetime' && (
              <Button variant="ghost" className="text-zinc-500 mb-6 -ml-4 hover:bg-zinc-100 hover:text-zinc-900 rounded-xl font-bold" onClick={() => setStep('service')}>
                <ChevronLeft className="h-5 w-5 mr-1" />
                Volver a servicios
              </Button>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              {step === 'service' ? 'Reserva tu turno' : 'Elige tu horario'}
            </h1>
            <h2 className="text-xl font-bold text-emerald-600 sm:hidden tracking-tight">{nutritionist.full_name}</h2>
            <p className="text-zinc-500 font-medium text-base sm:text-lg mt-2">
              {step === 'service' 
                ? 'Selecciona el tipo de servicio que precisas realizar.' 
                : 'Escoge el día y la hora para confirmar tu reserva.'}
            </p>
          </div>

          {step === 'service' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!hasServices && (
                <div className="col-span-full text-center py-16 px-4 rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                   <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">Catálogo vacío</h3>
                   <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto">
                     Este profesional todavía no ha configurado sus servicios disponibles.
                   </p>
                </div>
              )}
              {hasServices && nutritionist.services.map((service) => (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 border-zinc-200 hover:border-emerald-400 hover:-translate-y-1 active:scale-[0.98] group overflow-hidden bg-white rounded-3xl"
                  onClick={() => selectService(service)}
                >
                  <div className="p-6 flex flex-row items-center justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-lg font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors truncate tracking-tight">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                        <Clock className="h-4 w-4 opacity-60" /> 
                        <span>{service.duration} min</span>
                      </div>
                    </div>
                    <div className="shrink-0 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm group-hover:bg-emerald-600 transition-colors duration-300">
                      <span className="text-base font-black text-emerald-700 group-hover:text-white tracking-tight">
                        ${service.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              <div className="space-y-6">
                {/* Selected Service Snippet */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-inner">
                  <p className="text-xs uppercase font-black tracking-widest text-zinc-400 mb-2">Has seleccionado</p>
                  <p className="font-extrabold text-xl text-zinc-900 tracking-tight">{selectedService?.name}</p>
                  <p className="text-sm font-bold text-emerald-700 mt-1">{selectedService?.duration} minutos de duración</p>
                </div>

                <Card className="border-zinc-200 shadow-sm rounded-3xl overflow-hidden bg-white">
                  <CardContent className="p-4 sm:p-6 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={es}
                      disabled={(date) => {
                        const day = date.getDay() === 0 ? 7 : date.getDay();
                        return isBefore(date, startOfToday()) || !nutritionist.working_days?.includes(day);
                      }}
                      className="border-0"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Time & Form Selection */}
              <div className="space-y-6">
                <Card className="border-zinc-200 shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="bg-zinc-50/80 border-b border-zinc-100 pb-5 pt-6">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900 tracking-tight">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      Horarios disponibles
                    </CardTitle>
                    <CardDescription className="font-medium text-zinc-500">
                      {selectedDate 
                        ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) 
                        : 'Selecciona una fecha en el calendario'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 pb-6">
                    {!selectedDate ? (
                      <div className="py-12 bg-white rounded-2xl flex flex-col items-center justify-center text-center px-4">
                        <CalendarIcon className="h-10 w-10 text-zinc-200 mb-3" />
                         <p className="text-sm font-bold text-zinc-400">Espera de fecha</p>
                      </div>
                    ) : loadingSlots ? (
                      <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Buscando...</p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-12 text-center text-zinc-500 font-bold bg-zinc-50 rounded-2xl">
                        No hay turnos para esta fecha.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {availableSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className={`h-12 text-sm font-bold rounded-xl transition-all duration-300 ${selectedTime === time ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:-translate-y-0.5' : 'border-zinc-200 text-zinc-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50'}`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Guest Details Form */}
                {selectedTime && (
                  <Card className="animate-in fade-in slide-in-from-bottom-4 border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl overflow-hidden bg-white">
                    <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-5 pt-6">
                       <CardTitle className="text-lg font-bold text-zinc-900 tracking-tight">Confirmación de Reserva</CardTitle>
                       <CardDescription className="font-medium text-emerald-700">Completa y envía la solicitud para este turno</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 pb-8">
                      <form onSubmit={handleBook} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-bold text-zinc-700">Nombre Completo</Label>
                          <Input
                            id="name"
                            required
                            placeholder="Ej. Juan Pérez"
                            value={guestInfo.name}
                            onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                            className="bg-zinc-50 h-14 border-zinc-200 focus:ring-emerald-600 focus:border-emerald-600 rounded-xl shadow-sm text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-bold text-zinc-700">Correo Electrónico</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="tu@email.com"
                            value={guestInfo.email}
                            onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                            className="bg-zinc-50 h-14 border-zinc-200 focus:ring-emerald-600 focus:border-emerald-600 rounded-xl shadow-sm text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-bold text-zinc-700">Número de WhatsApp</Label>
                          <Input
                            id="phone"
                            type="tel"
                            required
                            placeholder="+54 11 1234-5678"
                            value={guestInfo.phone}
                            onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                            className="bg-zinc-50 h-14 border-zinc-200 focus:ring-emerald-600 focus:border-emerald-600 rounded-xl shadow-sm text-base"
                          />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 mt-6 h-14 text-base font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg" disabled={booking}>
                          {booking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                          Enviar Solicitud
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

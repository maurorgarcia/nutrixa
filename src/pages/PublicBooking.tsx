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
import { Loader2, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, CheckCircle, BarChart3, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [nutritionist, setNutritionist] = useState<User | null>(null);
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
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('slug', slug)
          .single();
        if (error) throw error;
        if (!data) throw new Error('Nutricionista no encontrado');
        setNutritionist(data as User);
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
      if (!selectedDate || !nutritionist || !selectedService) return;
      const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      if (!nutritionist.working_days?.includes(dayOfWeek)) {
        setAvailableSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const { data: existingAppts } = await (supabase as any).rpc('get_booked_slots', {
          p_nutritionist_id: nutritionist.id,
          p_date: dateStr
        });
        const parseTime = (timeStr: string) => parse(timeStr.substring(0, 5), 'HH:mm', new Date());
        const startTime = parseTime(nutritionist.working_hours_start);
        const endTime = parseTime(nutritionist.working_hours_end);
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
  }, [selectedDate, nutritionist, selectedService]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !nutritionist || !selectedService) return;
    setBooking(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startDateTime = parse(selectedTime, 'HH:mm', new Date());
      const endDateTime = addMinutes(startDateTime, selectedService.duration);
      const { error } = await (supabase as any).from('appointments').insert([{
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
        status: 'pending'
      }]);
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

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-8 w-8 animate-spin text-nutri-emerald" />
      </div>
    );
  }

  // ── ERROR ──
  if (error || !nutritionist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 flex-col gap-4 text-center px-4">
        <h2 className="text-xl font-bold text-zinc-700">{error || 'Perfil no encontrado'}</h2>
        <p className="text-zinc-500 font-medium">Revisa que el enlace sea correcto.</p>
      </div>
    );
  }

  // ── SUCCESS ──
  if (success) {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 bg-white">
        {/* Left panel — same as Login */}
        <div className="hidden md:flex flex-col justify-between lg:col-span-3 relative overflow-hidden bg-[#FAFAFA] border-r border-zinc-200">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(14,157,90,0.08),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 p-10 lg:p-14">
            <Link to="/">
              <img src="/logoNutrixa.png" alt="Nutrixa" className="h-9 w-auto opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
          </div>
          <div className="relative z-10 px-10 lg:px-14 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-zinc-900 leading-[1.1]">
              ¡Tu turno está reservado!
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-lg">
              {nutritionist.full_name} te contactará a la brevedad para confirmar la sesión. Podés cerrar esta pestaña.
            </p>
          </div>
          <div className="relative z-10 p-10 lg:p-14">
            <div className="flex items-center gap-3 border-t border-zinc-200 pt-8">
              <CheckCircle className="h-5 w-5 text-nutri-emerald" />
              <p className="text-sm font-semibold text-zinc-500">Reserva procesada con encriptación de extremo a extremo.</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 lg:col-span-2">
          <div className="mx-auto w-full max-w-sm animate-in fade-in zoom-in-95 duration-700 text-center space-y-6">
            <div className="flex md:hidden justify-center mb-2">
              <Link to="/">
                <img src="/logoNutrixa.png" alt="Nutrixa" className="h-12 w-auto object-contain hover:scale-105 transition-transform" />
              </Link>
            </div>

            <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="h-10 w-10 text-nutri-emerald" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-nutri-forest">¡Turno Solicitado!</h2>
              <p className="mt-2 text-sm text-gray-500">
                {nutritionist.full_name} se pondrá en contacto pronto para confirmar.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-5 text-left space-y-3 shadow-sm">
              <p className="font-bold text-nutri-forest border-b border-zinc-100 pb-3">{selectedService?.name}</p>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                <CalendarIcon className="h-4 w-4 text-nutri-emerald" />
                <span className="capitalize">{selectedDate && format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-zinc-600">
                <Clock className="h-4 w-4 text-nutri-emerald" />
                <span>A las {selectedTime} hs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasServices = nutritionist.services && nutritionist.services.length > 0;

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 bg-white">
      
      {/* ── LEFT PANEL — mismo que Login ── */}
      <div className="hidden md:flex flex-col justify-between lg:col-span-3 relative overflow-hidden bg-[#FAFAFA] border-r border-zinc-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(14,157,90,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(14,157,90,0.05),transparent_70%)] pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10 p-10 lg:p-14">
          <Link to="/">
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-9 w-auto opacity-90 hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Center: Value prop */}
        <div className="relative z-10 px-10 lg:px-14 space-y-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-nutri-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-nutri-emerald" />
              Turnera Clínica Oficial
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-zinc-900 leading-[1.1]">
              Reservá tu turno con {nutritionist.full_name}.
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-lg">
              Seleccioná el servicio y el horario que mejor se adapte a tu disponibilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: FileText, label: 'Consulta Clínica Inicial' },
              { icon: CalendarIcon, label: 'Disponibilidad actualizada en tiempo real' },
              { icon: BarChart3, label: 'Seguimiento profesional garantizado' },
              { icon: CheckCircle, label: 'Confirmación inmediata por correo' },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors shrink-0">
                  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-nutri-emerald transition-colors" />
                </div>
                <span className="text-sm font-semibold text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Trust */}
        <div className="relative z-10 p-10 lg:p-14">
          <div className="flex items-center gap-3 border-t border-zinc-200 pt-8">
            <CheckCircle className="h-5 w-5 text-nutri-emerald shrink-0" />
            <p className="text-xs font-medium text-zinc-500">
              Turnera <strong className="text-zinc-900">certificada por Nutrixa</strong> con encriptación de extremo a extremo.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — flujo de reserva ── */}
      <div className="flex flex-col justify-start min-h-screen px-4 py-10 sm:px-6 lg:px-8 bg-zinc-50 lg:col-span-2 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm animate-in fade-in zoom-in-95 duration-700">

          {/* Logo — igual que Login */}
          <div className="flex md:hidden justify-center mb-8 mt-8 md:mt-0">
            <Link to="/">
              <img src="/logoNutrixa.png" alt="Nutrixa" className="h-12 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-500" />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            {step === 'datetime' && (
              <button
                onClick={() => setStep('service')}
                className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-nutri-forest transition-colors mb-4 mx-auto"
              >
                <ChevronLeft className="h-4 w-4" /> Volver a servicios
              </button>
            )}
            <h2 className="text-2xl font-bold tracking-tight text-nutri-forest">
              {step === 'service' ? 'Reserva tu turno' : 'Elige tu horario'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'service'
                ? 'Selecciona el tipo de consulta que necesitás.'
                : 'Elegí el día y el horario disponible.'}
            </p>
          </div>

          {/* ── SERVICE SELECTION ── */}
          {step === 'service' && (
            <div className="space-y-3">
              {!hasServices && (
                <div className="text-center py-12 rounded-xl border-2 border-dashed border-zinc-200 bg-white">
                  <Clock className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-zinc-500">El profesional aún no configuró sus servicios.</p>
                </div>
              )}
              {hasServices && nutritionist.services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => selectService(service)}
                  className="w-full bg-white border border-zinc-200 rounded-xl p-4 text-left hover:border-nutri-emerald hover:shadow-md transition-all duration-300 group flex items-center justify-between gap-4 active:scale-[0.99]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 group-hover:text-nutri-forest transition-colors">{service.name}</p>
                    <p className="text-sm text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-3.5 w-3.5" /> {service.duration} min
                    </p>
                  </div>
                  <div className="shrink-0 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg group-hover:bg-nutri-emerald group-hover:border-transparent transition-colors">
                    <span className="text-sm font-bold text-nutri-forest group-hover:text-white transition-colors">
                      ${service.price.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── DATE/TIME SELECTION ── */}
          {step === 'datetime' && (
            <div className="space-y-5">
              {/* Selected service chip */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-medium text-zinc-400 mb-1 uppercase tracking-widest">Servicio seleccionado</p>
                <p className="font-bold text-nutri-forest">{selectedService?.name}</p>
                <p className="text-sm text-zinc-500 font-medium">{selectedService?.duration} min · ${selectedService?.price.toLocaleString()}</p>
              </div>

              {/* Calendar */}
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={es}
                  disabled={(date) => {
                    const day = date.getDay() === 0 ? 7 : date.getDay();
                    return isBefore(date, startOfToday()) || !nutritionist.working_days?.includes(day);
                  }}
                  className="border-0 w-full"
                />
              </div>

              {/* Time slots */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-nutri-emerald" />
                  <p className="text-sm font-semibold text-zinc-700">
                    {selectedDate ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es }) : 'Seleccioná una fecha'}
                  </p>
                </div>

                {!selectedDate ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-zinc-400 font-medium">Elegí un día en el calendario</p>
                  </div>
                ) : loadingSlots ? (
                  <div className="py-6 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-nutri-emerald" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-6 text-center bg-zinc-50 rounded-lg">
                    <p className="text-sm text-zinc-500 font-medium">No hay turnos disponibles para este día.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`h-11 text-sm font-semibold rounded-lg border transition-all duration-200 ${
                          selectedTime === time
                            ? 'bg-nutri-emerald border-nutri-emerald text-white shadow-md'
                            : 'border-zinc-200 text-zinc-700 bg-white hover:border-nutri-emerald hover:text-nutri-forest hover:bg-emerald-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Guest form — appears when time is chosen */}
              {selectedTime && (
                <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-3">
                    <p className="text-sm font-bold text-nutri-forest">Confirmación · {selectedTime} hs</p>
                    <p className="text-xs text-nutri-forest/70 font-medium mt-0.5">
                      {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                  </div>

                  <form onSubmit={handleBook} className="p-4 space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre completo</Label>
                      <Input
                        id="name"
                        required
                        placeholder="Ej. Juan Pérez"
                        value={guestInfo.name}
                        onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                        className="h-12 border-gray-300 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        className="h-12 border-gray-300 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">WhatsApp</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+54 11 1234-5678"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        className="h-12 border-gray-300 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-nutri-emerald hover:bg-nutri-forest hover:shadow-lg hover:-translate-y-0.5 text-white shadow-md rounded-lg transition-all duration-300"
                      disabled={booking}
                    >
                      {booking ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar Solicitud'}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, addMonths, format, isSameDay, parseISO, startOfWeek, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  Loader2,
  RefreshCcw,
  MessageCircle,
  Siren,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { fetchAppointmentsForOwner } from '@/utils/appointmentDb';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Appointment, PatientProfileFormData } from '@/types';

type AppointmentStatus = Appointment['status'];

const statusStyles: Record<AppointmentStatus, string> = {
  confirmed: 'border-teal-100 bg-teal-50 text-teal-700',
  pending: 'border-amber-100 bg-amber-50 text-amber-700',
  cancelled: 'border-slate-100 bg-slate-50 text-slate-500',
};

const statusCopy: Record<AppointmentStatus, string> = {
  confirmed: 'Confirmado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
};

export function Turnera() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { patients, createPatient, fetchPatients } = usePatientStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [actionConfig, setActionConfig] = useState<{
    type: 'confirm' | 'cancel' | 'create-patient';
    id: string;
    appointment?: Appointment;
  } | null>(null);

  const fetchAppointments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await fetchAppointmentsForOwner(user.id);
      setAppointments(rows);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar la agenda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const respondToAppointment = async (id: string, status: AppointmentStatus) => {
    try {
      const { error } = await (supabase as any).from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      toast.success(status === 'confirmed' ? 'Turno confirmado' : 'Turno cancelado');
      fetchAppointments();
      setActionConfig(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al procesar el turno');
    }
  };

  const handleCreatePatient = async (appointment: Appointment) => {
    if (!user) return;
    
    try {
      const patientData: PatientProfileFormData = {
        nombre_completo: appointment.guest_name || 'Paciente Nuevo',
        correo: appointment.guest_email || '',
        telefono: appointment.guest_phone || '',
        sexo: 'No especificado',
        fecha_nacimiento: format(new Date(), 'yyyy-MM-dd'),
        edad: '0',
        ocupacion: '',
        nivel_estres: 'Moderado',
        patologias_preexistentes: [],
        medicacion_habitual: [],
        antecedentes_familiares: [],
        tipo_dieta: 'General',
        alimentos_excluidos: []
      };

      const result = await createPatient(user.id, patientData);
      
      if (result.error) throw new Error(result.error);
      if (!result.data) throw new Error('No se pudo crear el paciente');

      const { error: updateError } = await (supabase as any)
        .from('appointments')
        .update({ patient_id: result.data.id })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      toast.success('¡Paciente creado y vinculado con éxito!');
      await fetchPatients(user.id);
      await fetchAppointments();
      setSelectedAppointment(null);
      setActionConfig(null);
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  const days = useMemo(() => {
    const start = startOfWeek(currentMonth, { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [currentMonth]);

  const selectedDayAppointments = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return appointments
      .filter((appointment) => appointment.date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [appointments, selectedDate]);

  const pendingRequests = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'pending'),
    [appointments]
  );

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
      </div>
    );
  }

  return (
    <div className="clinical-page animate-in fade-in duration-500 space-y-8">
      
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agenda de Turnos</h1>
          <p className="text-slate-500 font-medium max-w-lg">Supervise citas, solicitudes web y disponibilidad desde un panel centralizado.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchAppointments} className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Actualizar
          </Button>
          <Button onClick={() => setSelectedDate(new Date())} className="gap-2">
            <CalendarIcon className="w-4 h-4" /> Ir a Hoy
          </Button>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="clinical-panel p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-900 capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h3>
               <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2">{d}</div>
              ))}
              {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = format(day, 'MM') === format(currentMonth, 'MM');
                const dateStr = format(day, 'yyyy-MM-dd');
                const counts = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled').length;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(day)}
                    disabled={!isCurrentMonth}
                    className={cn(
                      "h-10 rounded-lg text-xs font-bold transition-all relative flex items-center justify-center",
                      !isCurrentMonth && "opacity-10",
                      isCurrentMonth && "hover:bg-slate-50",
                      isSelected ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md" : "text-slate-600",
                      !isSelected && isToday && "text-senralis-main border border-senralis-main/20"
                    )}
                  >
                    {format(day, 'd')}
                    {counts > 0 && !isSelected && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-senralis-main" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="clinical-panel p-6 border-amber-100 bg-amber-50/20">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                 <Siren className="w-4 h-4 text-amber-500" /> Solicitudes Web
               </h3>
               <div className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{pendingRequests.length}</div>
            </div>

            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="p-6 text-center bg-white border border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-400 italic">No hay solicitudes pendientes.</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="p-4 bg-white border border-amber-100 rounded-xl shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{req.guest_name || 'Paciente'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{req.service_name}</p>
                      </div>
                      <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Pendiente</div>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 bg-slate-50 p-2 rounded-lg">
                      {format(parseISO(req.date), "dd 'de' MMMM", { locale: es })} • {req.start_time.slice(0, 5)} hs
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-9 bg-senralis-main hover:bg-senralis-dark" onClick={() => setActionConfig({ type: 'confirm', id: req.id })}>
                        Confirmar
                      </Button>
                      <Button size="sm" variant="ghost" className="flex-1 h-9 text-rose-600 hover:bg-rose-50" onClick={() => setActionConfig({ type: 'cancel', id: req.id })}>
                        Rechazar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
           <div className="clinical-panel p-8 min-h-[600px]">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</h2>
                   <p className="text-sm font-medium text-slate-500">Cronograma de consultas confirmadas y pendientes</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>{selectedDayAppointments.length} Registros</span>
                </div>
             </div>

              <div className="space-y-6">
                {selectedDayAppointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <CalendarClock className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-bold">No hay turnos registrados</p>
                  </div>
                ) : (
                  selectedDayAppointments.map(app => (
                    <div key={app.id} className="group flex gap-6 p-1 hover:bg-slate-50/50 rounded-2xl transition-colors">
                       <div className="w-20 pt-1 shrink-0">
                          <div className={cn(
                            "text-lg font-bold tracking-tight text-center px-3 py-2 rounded-xl border",
                            app.status === 'confirmed' ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-400"
                          )}>
                             {app.start_time.slice(0, 5)}
                          </div>
                       </div>
                       
                       <div className="flex-1 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-2">
                             <div>
                                <h4 className="font-bold text-slate-900">{app.guest_name || 'Paciente'}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{app.service_name}</p>
                             </div>
                             <div className="flex gap-2">
                                <span className={cn(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
                                  statusStyles[app.status]
                                )}>{statusCopy[app.status]}</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                             {app.status === 'pending' && (
                               <Button size="sm" variant="outline" className="h-9 border-senralis-main text-senralis-main bg-white hover:bg-senralis-main hover:text-white" onClick={() => setActionConfig({ type: 'confirm', id: app.id })}>
                                 Confirmar
                               </Button>
                             )}
                             <Button variant="ghost" size="sm" className="h-9 text-slate-400 hover:text-slate-900" onClick={() => setSelectedAppointment(app)}>
                               Detalles <ArrowRight className="ml-2 w-4 h-4" />
                             </Button>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>

      <Sheet open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <SheetContent className="sm:max-w-md p-0 border-none shadow-2xl flex flex-col bg-white">
          {selectedAppointment && (
            <>
              <SheetHeader className="p-8 border-b border-slate-100 bg-slate-900 text-left shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
                    statusStyles[selectedAppointment.status]
                  )}>
                    {statusCopy[selectedAppointment.status]}
                  </div>
                </div>
                <SheetTitle className="text-2xl font-bold text-white tracking-tight leading-none">
                  {selectedAppointment.guest_name || 'Paciente'}
                </SheetTitle>
                <SheetDescription className="font-medium text-slate-400 text-xs">
                  {selectedAppointment.service_name} • {format(parseISO(selectedAppointment.date), "d 'de' MMMM", { locale: es })}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información de Contacto</h4>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Horario Sugerido</p>
                        <p className="text-sm font-bold text-slate-900">{selectedAppointment.start_time.slice(0, 5)} - {selectedAppointment.end_time.slice(0, 5)} HS</p>
                      </div>
                    </div>
                    {selectedAppointment.guest_email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Check className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Correo Electrónico</p>
                          <p className="text-sm font-bold text-slate-900">{selectedAppointment.guest_email}</p>
                        </div>
                      </div>
                    )}
                    {selectedAppointment.guest_phone && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <Clock3 className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Teléfono / WhatsApp</p>
                            <p className="text-sm font-bold text-slate-900">{selectedAppointment.guest_phone}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 text-[10px] font-bold gap-1.5"
                          onClick={() => {
                            const name = selectedAppointment.guest_name || 'Paciente';
                            const myName = user?.full_name || 'tu nutricionista';
                            const date = format(parseISO(selectedAppointment.date), "dd/MM");
                            const time = selectedAppointment.start_time.slice(0, 5);
                            const message = encodeURIComponent(`Hola ${name}, soy ${myName}. Te escribo para confirmar tu turno del día ${date} a las ${time} hs.`);
                            window.open(`https://wa.me/${selectedAppointment.guest_phone.replace(/\D/g, '')}?text=${message}`, '_blank');
                          }}
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notas de la Reserva</h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                    <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                      {selectedAppointment.notes || "El paciente no incluyó notas adicionales para esta consulta."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {selectedAppointment.patient_id ? (
                    <Button 
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl font-bold gap-2"
                      onClick={() => navigate(`/patients/${selectedAppointment.patient_id}`)}
                    >
                      Ver Historial Clínico <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center gap-2">
                         <Siren className="w-4 h-4" /> Este paciente aún no está en tu base de datos clínica.
                      </p>
                      <Button 
                        className="w-full bg-senralis-main hover:bg-senralis-dark text-white h-12 rounded-xl font-bold"
                        onClick={() => setActionConfig({ 
                          type: 'create-patient', 
                          id: selectedAppointment.id,
                          appointment: selectedAppointment 
                        })}
                      >
                        Dar de Alta Paciente
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!actionConfig} onOpenChange={(open) => !open && setActionConfig(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-100 p-8 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black text-slate-900 tracking-tight uppercase">
              {actionConfig?.type === 'confirm' ? '¿Confirmar este turno?' : 
               actionConfig?.type === 'cancel' ? '¿Rechazar este turno?' : 
               '¿Crear ficha de paciente?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-slate-400 leading-relaxed mb-4">
              {actionConfig?.type === 'confirm' ? 'El paciente recibirá una notificación de que su turno ha sido aceptado.' : 
               actionConfig?.type === 'cancel' ? 'Esta acción cancelará la solicitud del paciente. No se podrá deshacer fácilmente.' : 
               'Se creará una ficha clínica oficial en tu base de datos con la información proporcionada por el paciente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-100 h-11 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">
              Volver
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (actionConfig?.type === 'confirm') respondToAppointment(actionConfig.id, 'confirmed');
                else if (actionConfig?.type === 'cancel') respondToAppointment(actionConfig.id, 'cancelled');
                else if (actionConfig?.type === 'create-patient' && actionConfig.appointment) handleCreatePatient(actionConfig.appointment);
              }}
              className={cn(
                "rounded-xl h-11 px-6 font-black text-[10px] uppercase tracking-widest",
                actionConfig?.type === 'cancel' ? "bg-rose-600 text-white" : "bg-slate-900 text-white"
              )}
            >
              Confirmar Acción
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

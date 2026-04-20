import { useEffect, useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isThisWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowRight,
  Bell,
  Calendar,
  Clock3,
  Copy,
  DollarSign,
  Globe,
  Loader2,
  Plus,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchAppointmentsForOwner } from '@/utils/appointmentDb';
import { useAuthStore } from '@/stores/authStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { usePatientStore } from '@/stores/patientStore';
import { usePaymentStore } from '@/stores/paymentStore';
import type { Appointment } from '@/types';

interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  icon: ElementType;
  tone: 'teal' | 'navy' | 'amber' | 'rose';
}

const metricStyles: Record<MetricCardProps['tone'], string> = {
  teal: 'from-[#d8f3ef] to-white text-[#0f766e] border-[#b8e5dd]',
  navy: 'from-[#dfe6ff] to-white text-[#1e3a8a] border-[#c7d2fe]',
  amber: 'from-[#fdf0d8] to-white text-[#b45309] border-[#f7d9a7]',
  rose: 'from-[#ffe4e6] to-white text-[#be123c] border-[#fecdd3]',
};

function MetricCard({ label, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <div className="clinical-panel group transition-all hover:bg-slate-50">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        </div>
        <div className="rounded-lg bg-teal-50 p-2.5 text-senralis-main group-hover:bg-white transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-[11px] font-medium text-slate-500">{hint}</p>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { fetchMealPlans } = useMealPlanStore();
  const { payments, fetchPayments } = usePaymentStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        await Promise.all([
          fetchPatients(user.id),
          fetchMealPlans(user.id),
          fetchPayments(user.id),
          (async () => {
            const rows = await fetchAppointmentsForOwner(user.id);
            setAppointments(rows);
          })(),
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, fetchPatients, fetchMealPlans, fetchPayments]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const displayName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Profesional';

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === todayStr)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [appointments, todayStr]
  );

  const confirmedToday = todayAppointments.filter((appointment) => appointment.status === 'confirmed');
  const pendingCount = appointments.filter((appointment) => appointment.status === 'pending').length;
  const weekAppointments = appointments.filter(
    (appointment) =>
      appointment.status === 'confirmed' && isThisWeek(parseISO(appointment.date), { weekStartsOn: 1 })
  );
  const monthlyRevenue = payments
    .filter(
      (payment) =>
        payment.status === 'paid' && new Date(payment.created_at).getMonth() === new Date().getMonth()
    )
    .reduce((total, payment) => total + payment.amount, 0);

  const nextAppointment = appointments.find(
    (appointment) =>
      appointment.status !== 'cancelled' &&
      new Date(`${appointment.date}T${appointment.start_time}`).getTime() >= Date.now()
  );

  const quickActions = [
    { label: 'Nuevo paciente', description: 'Abrir admisión clínica', to: '/patients', icon: Plus },
    { label: 'Turnera', description: 'Ordenar la jornada', to: '/turnera', icon: Calendar },
    { label: 'Recetas', description: 'Prescribir más rápido', to: '/recipes', icon: Stethoscope },
    { label: 'Facturación', description: 'Revisar cobros activos', to: '/payments', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
      </div>
    );
  }

  return (
    <div className="clinical-page space-y-6">
      <section className="clinical-hero !p-10 border-none shadow-none bg-slate-100/50">
        <div className="relative grid gap-8 xl:grid-cols-[1fr_0.8fr] xl:items-start">
          <div className="space-y-6">

            <div className="space-y-4">
              <h1 className="clinical-title text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Panel de Control: {displayName}
              </h1>
              <p className="max-w-xl text-sm font-medium leading-relaxed text-slate-600">
                Monitorea el flujo de pacientes, la recaudación mensual y los próximos turnos desde una interfaz limpia y eficiente.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="clinical-stat bg-white">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Próximo Turno</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">
                    {nextAppointment ? nextAppointment.start_time.slice(0, 5) : '--:--'}
                  </p>
                  <span className="text-xs font-bold text-slate-400">HS</span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500 truncate">
                  {nextAppointment ? nextAppointment.guest_name || 'Paciente agendado' : 'Sin citas programadas'}
                </p>
              </div>
              <div className="clinical-stat bg-white border-l-4 border-l-senralis-main">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Estado del Día</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">{confirmedToday.length} Confirmados</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{pendingCount} Pendientes de respuesta</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={() => navigate('/turnera')}
                className="clinical-button-primary h-12 px-6"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Gestionar Agenda
              </Button>
              <Button
                onClick={() => navigate('/patients')}
                variant="outline"
                className="clinical-button-secondary h-12 px-6"
              >
                <Plus className="mr-2 h-4 w-4" />
                Alta de Paciente
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Métricas de Rendimiento</p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Resumen Mensual</h2>
              </div>
              <div className="rounded-full bg-slate-50 p-2.5 text-senralis-main">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Turnos confirmados (semana)', value: weekAppointments.length.toString(), color: 'bg-teal-500' },
                { label: 'Facturación proyectada', value: `$${monthlyRevenue.toLocaleString('es-AR')}`, color: 'bg-blue-500' },
                { label: 'Pacientes registrados', value: patients.length.toString(), color: 'bg-slate-500' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-1 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('h-2 w-2 rounded-full', item.color)} />
                    <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Enlace de reserva pública</p>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4 truncate text-[11px] font-mono text-slate-600 text-center">
                {window.location.origin}/book/{user?.slug}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    if (user?.slug) {
                      navigator.clipboard.writeText(`${window.location.origin}/book/${user.slug}`);
                      toast.success('Enlace copiado al portapapeles');
                    }
                  }}
                  variant="outline"
                  className="text-[10px] font-bold h-9 uppercase"
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copiar Link
                </Button>
                <Button
                  onClick={() => user?.slug && window.open(`/book/${user.slug}`, '_blank')}
                  className="text-[10px] font-bold h-9 uppercase bg-slate-900 hover:bg-slate-800"
                >
                  <Globe className="mr-2 h-3.5 w-3.5" />
                  Ver Página
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Facturación"
          value={`$${monthlyRevenue.toLocaleString('es-AR')}`}
          hint="Ingresos liquidados este mes"
          icon={DollarSign}
          tone="teal"
        />
        <MetricCard
          label="Pacientes Totales"
          value={patients.length.toString()}
          hint="Base clínica activa"
          icon={Users}
          tone="navy"
        />
        <MetricCard
          label="Agenda del Día"
          value={todayAppointments.length.toString()}
          hint={`${confirmedToday.length} citas confirmadas hoy`}
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="Alertas / Pendientes"
          value={pendingCount.toString()}
          hint="Turnos esperando confirmación"
          icon={Bell}
          tone="rose"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.4fr]">
        <div className="clinical-panel">
          <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Hoja de Ruta</p>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Agenda del {format(new Date(), "d 'de' MMMM", { locale: es })}</h2>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/turnera')}
              className="text-xs font-bold text-senralis-main hover:bg-teal-50"
            >
              Ver Turnera Completa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {todayAppointments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                <Calendar className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-4 text-sm font-bold text-slate-900">Sin consultas para hoy</p>
                <p className="mt-1 text-xs font-medium text-slate-400">Puedes asignar turnos manuales en la sección de Turnera.</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border text-center transition-colors',
                        appointment.status === 'confirmed'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : appointment.status === 'pending'
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-slate-100 bg-slate-50 text-slate-400'
                      )}
                    >
                      <span className="text-sm font-bold leading-none">{appointment.start_time.slice(0, 5)}</span>
                      <span className="text-[9px] font-bold uppercase opacity-60 mt-1">hs</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{appointment.guest_name || 'Paciente No Nominal'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">{appointment.service_name}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase",
                          appointment.status === 'confirmed' ? "text-teal-600" : "text-amber-600"
                        )}>
                          {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-400">{appointment.guest_email || 's/c'}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <ArrowRight className="h-4 w-4 text-slate-300 hover:text-senralis-main" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="clinical-panel bg-slate-50/30">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-6">Acciones Rápidas</p>
            <div className="grid gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.to)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-senralis-main/30 hover:shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-teal-50 p-2.5 text-senralis-main group-hover:bg-senralis-main group-hover:text-white transition-colors">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{action.label}</p>
                      <p className="text-[10px] font-medium text-slate-400">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-200 group-hover:text-senralis-main transition-colors" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-senralis-main mb-4">
              <Sparkles className="h-5 w-5" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Soporte Premium</h4>
            </div>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
              ¿Necesitas ayuda con la migración de tus pacientes o la configuración de tu agenda? Nuestro equipo médico-técnico está a tu disposición.
            </p>
            <button className="w-full bg-slate-900 text-white rounded-lg py-3 text-xs font-bold hover:bg-slate-800 transition-colors">
              Contactar Soporte
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

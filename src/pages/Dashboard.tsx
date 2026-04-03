import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { supabase } from '@/lib/supabase/client';
import type { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus, 
  ChevronRight,
  Utensils,
  Activity,
  CalendarCheck,
  Check,
  X
} from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { patients, fetchPatients } = usePatientStore();
  const { followUpsWithPatient, fetchFollowUps } = useFollowUpStore();
  const { mealPlans, fetchMealPlans } = useMealPlanStore();

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('appointments')
        .select('*')
        .eq('nutritionist_id', userId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
        
      if (!error && data) {
        setAppointments(data as Appointment[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatients(user.id);
      fetchFollowUps(user.id);
      fetchMealPlans(user.id);
      fetchAppointments(user.id);
    }
  }, [user]);

  const respondToAppointment = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      const { error } = await (supabase as any)
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success(status === 'confirmed' ? 'Turno confirmado' : 'Turno rechazado');
      if (user) fetchAppointments(user.id);
    } catch (err) {
      toast.error('Ocurrió un error al procesar el turno');
    }
  };

  const stats = [
    {
      title: 'Total Pacientes',
      value: patients.length,
      icon: Users,
      trend: `+${patients.filter(p => {
        const created = new Date(p.created_at);
        const thisMonth = new Date();
        return created.getMonth() === thisMonth.getMonth() && 
               created.getFullYear() === thisMonth.getFullYear();
      }).length} este mes`,
      onClick: () => navigate('/patients'),
    },
    {
      title: 'Planes Activos',
      value: mealPlans.filter(mp => mp.is_active).length,
      icon: Utensils,
      trend: 'Activos',
      onClick: () => navigate('/meal-plans'),
    },
    {
      title: 'Citas Próximas',
      value: [...followUpsWithPatient.filter(fu => fu.next_appointment), ...appointments.filter(a => a.status === 'confirmed')].filter(item => {
        let date;
        if ('next_appointment' in item) {
          date = new Date(item.next_appointment!);
        } else {
          date = new Date(`${item.date}T${item.start_time}`);
        }
        const today = new Date();
        const nextWeek = addDays(today, 7);
        return isBefore(date, nextWeek) && isBefore(today, date);
      }).length,
      icon: Calendar,
      trend: 'Esta semana',
      onClick: () => navigate('/follow-ups'),
    },
    {
      title: 'Seguimientos',
      value: followUpsWithPatient.length,
      icon: TrendingUp,
      trend: 'Total',
      onClick: () => navigate('/follow-ups'),
    },
  ];

  const recentPatients = patients.slice(0, 5);
  
  const allUpcomingAppointments = [
    ...followUpsWithPatient
      .filter(fu => fu.next_appointment && new Date(fu.next_appointment) >= new Date(new Date().setHours(0,0,0,0)))
      .map(fu => ({
        id: fu.id,
        type: 'follow_up',
        date: new Date(fu.next_appointment!),
        patientName: fu.patient ? `${fu.patient.first_name} ${fu.patient.last_name}` : 'Paciente',
        patientId: fu.patient_id,
        subtitle: 'Control Automático'
      })),
    ...appointments
      .filter(a => a.status === 'confirmed' && new Date(`${a.date}T${a.start_time}`) >= new Date(new Date().setHours(0,0,0,0)))
      .map(a => ({
        id: a.id,
        type: 'booking',
        date: new Date(`${a.date}T${a.start_time}`),
        patientName: a.guest_name || 'Paciente Nuevo',
        patientId: null,
        subtitle: `${a.service_name} • ${a.start_time.substring(0, 5)}`
      }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcomingAppointments = allUpcomingAppointments.slice(0, 5);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-zinc-100">
        <div className="space-y-1.5">
          <h1 className="text-4xl font-extrabold tracking-tight text-nutri-forest">Bienvenido, {user?.full_name?.split(' ')[0]}</h1>
          <p className="text-zinc-500 text-lg font-medium">Este es el resumen de tu consultorio al día de hoy.</p>
        </div>
        <Button onClick={() => navigate('/patients/new')} className="bg-nutri-emerald hover:bg-nutri-forest hover:-translate-y-0.5 hover:shadow-lg text-white shadow-md transition-all duration-300 px-6 h-12 rounded-xl text-base">
          <Plus className="h-5 w-5 mr-2" />
          Añadir Paciente
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="cursor-pointer border-zinc-100 rounded-2xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-500 tracking-wide">
                {stat.title}
              </CardTitle>
              <div className="h-12 w-12 bg-emerald-50 flex items-center justify-center rounded-2xl">
                <stat.icon className="h-6 w-6 text-nutri-emerald" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-nutri-forest tracking-tighter">{stat.value}</div>
              <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Patients */}
        <Card className="border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 pb-5">
            <CardTitle className="text-xl font-extrabold tracking-tight text-nutri-forest">Pacientes Recientes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patients')} className="text-nutri-forest font-semibold hover:text-nutri-forest hover:bg-emerald-50 rounded-xl">
              Ver todos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            {recentPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay pacientes registrados</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/patients/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar paciente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div 
                    key={patient.id}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-zinc-50 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11 shadow-sm border border-zinc-100">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-50 text-nutri-forest font-bold text-sm">
                          {getInitials(patient.first_name, patient.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="font-bold text-nutri-forest">
                          {patient.first_name} {patient.last_name}
                        </p>
                        <p className="text-sm font-medium text-zinc-500">
                          {patient.age} años • {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-300" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Follow Ups */}
        <Card className="border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all block lg:min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 pb-5">
            <CardTitle className="text-xl font-extrabold tracking-tight text-nutri-forest">Controles Agendados</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/follow-ups')} className="text-nutri-forest font-semibold hover:text-nutri-forest hover:bg-emerald-50 rounded-xl">
              Ver calendario
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay citas programadas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appt) => (
                  <div 
                    key={appt.id}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-zinc-50 hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl shadow-sm flex items-center justify-center ${appt.type === 'booking' ? 'bg-nutri-emerald' : 'bg-zinc-900'}`}>
                        {appt.type === 'booking' ? <CalendarCheck className="h-5 w-5 text-white" /> : <Activity className="h-5 w-5 text-white" />}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-nutri-forest">
                          {appt.patientName}
                        </p>
                        <p className="text-sm font-medium text-nutri-forest">
                          {format(appt.date, "d 'de' MMMM", { locale: es })} <span className="text-zinc-400 mx-1">•</span> <span className="text-zinc-500">{appt.subtitle}</span>
                        </p>
                      </div>
                    </div>
                    {appt.patientId && (
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-zinc-100" onClick={() => navigate(`/patients/${appt.patientId}`)}>
                        <ChevronRight className="h-5 w-5 text-zinc-400" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Public Turnera Appointments list */}
      <Card className="border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-nutri-green rounded-l-xl"></div>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-nutri-emerald" />
              Reservas de la Turnera Pública
            </CardTitle>
            <CardDescription>Pacientes que reservaron mediante tu enlace: <span className="text-xs bg-gray-100 px-2 py-1 rounded select-all font-mono">nutrixa.com/book/{user?.slug || 'tu-enlace'}</span></CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => user && fetchAppointments(user.id)}>
            Actualizar
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aún no tienes nuevas reservas online</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 hover:shadow-md transition-shadow rounded-xl gap-4">
                  <div className="flex gap-4">
                    {/* Date Block */}
                    <div className="bg-gray-50 px-4 py-2 rounded-lg border text-center flex-shrink-0 min-w-[5rem]">
                      <span className="block text-xs uppercase font-bold text-gray-500">
                        {format(new Date(appt.date), 'MMM', { locale: es })}
                      </span>
                      <span className="block text-2xl font-black text-nutri-forest">
                        {format(new Date(appt.date), 'd')}
                      </span>
                      <span className="block text-xs text-nutri-emerald font-medium">{appt.start_time}</span>
                    </div>

                    {/* Details Block */}
                    <div className="flex flex-col justify-center">
                      <p className="font-bold text-nutri-forest text-lg">{appt.guest_name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {appt.service_name} — {appt.service_duration} min
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{appt.guest_phone}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="font-medium text-green-700">${appt.service_price.toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-2">
                     {appt.status === 'pending' && (
                      <>
                        <Button 
                          variant="default" 
                          className="bg-green-600 hover:bg-green-700 text-white" 
                          size="sm"
                          onClick={() => respondToAppointment(appt.id, 'confirmed')}
                        >
                          <Check className="h-4 w-4 mr-1"/> Confirmar
                        </Button>
                        <Button 
                          variant="outline" 
                          className="hover:bg-red-50 hover:text-red-600"
                          size="sm"
                          onClick={() => respondToAppointment(appt.id, 'cancelled')}
                        >
                          <X className="h-4 w-4"/>
                        </Button>
                      </>
                    )}
                    
                    {appt.status === 'confirmed' && (
                      <div className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 font-semibold text-sm rounded-full flex items-center gap-1 shadow-sm">
                        <Check className="h-4 w-4" /> Confirmado
                      </div>
                    )}

                    {appt.status === 'cancelled' && (
                      <div className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 font-semibold text-sm rounded-full flex items-center gap-1 shadow-sm">
                        <X className="h-4 w-4" /> Cancelado
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-50 pb-4">
          <CardTitle className="text-lg font-bold text-nutri-forest">Acceso Rápido</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Button 
              variant="outline" 
              className="h-28 flex flex-col items-center justify-center gap-3 border-gray-200 hover:bg-emerald-50 hover:text-nutri-forest hover:border-emerald-200 transition-all rounded-xl shadow-sm"
              onClick={() => navigate('/patients/new')}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">Nuevo<br/>Paciente</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-28 flex flex-col items-center justify-center gap-3 border-gray-200 hover:bg-emerald-50 hover:text-nutri-forest hover:border-emerald-200 transition-all rounded-xl shadow-sm"
              onClick={() => navigate('/recipes')}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Utensils className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">Crear<br/>Receta</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-28 flex flex-col items-center justify-center gap-3 border-gray-200 hover:bg-emerald-50 hover:text-nutri-forest hover:border-emerald-200 transition-all rounded-xl shadow-sm"
              onClick={() => navigate('/meal-plans')}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">Armar<br/>Plan</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-28 flex flex-col items-center justify-center gap-3 border-gray-200 hover:bg-emerald-50 hover:text-nutri-forest hover:border-emerald-200 transition-all rounded-xl shadow-sm"
              onClick={() => navigate('/follow-ups')}
            >
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar className="h-5 w-5" />
              </div>
              <span className="font-semibold text-sm">Registrar<br/>Control</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

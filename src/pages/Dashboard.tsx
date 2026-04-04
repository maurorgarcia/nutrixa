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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users, Calendar, Plus, ChevronRight,
  CalendarCheck, Check, X, AlertTriangle,
  DollarSign, ArrowRight, Clock, Zap, TrendingDown,
  TrendingUp, FileText, Bell, Gift
} from 'lucide-react';
import { format, isBefore, subDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── SMALL HELPERS ────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent = false, danger = false,
}: {
  label: string; value: string | number; sub: string;
  icon: React.ElementType; accent?: boolean; danger?: boolean;
}) {
  return (
    <div className={cn(
      'p-6 rounded-[2rem] border bg-white flex flex-col justify-between h-36 transition-all',
      accent && 'border-nutri-emerald/30 shadow-lg shadow-emerald-50',
      danger && 'border-red-200 shadow-lg shadow-red-50',
      !accent && !danger && 'border-primary/5 shadow-sm',
    )}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{label}</p>
        <Icon className={cn('h-4 w-4', accent ? 'text-nutri-emerald' : danger ? 'text-red-400' : 'text-primary/20')} />
      </div>
      <div>
        <p className={cn('text-4xl font-black tracking-tighter leading-none mb-1',
          accent ? 'text-nutri-forest' : danger ? 'text-red-600' : 'text-primary'
        )}>{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{sub}</p>
      </div>
    </div>
  );
}

// ── MINI SPARKLINE (SVG) ─────────────────────────────────────────────────────

function Sparkline({ data, color = '#10b981' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80; const h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── ALERT ITEM ───────────────────────────────────────────────────────────────

function AlertItem({
  icon: Icon, title, desc, bg, iconColor, ago,
}: {
  icon: React.ElementType; title: string; desc: string;
  bg: string; iconColor: string; ago: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-primary/5 last:border-0">
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', bg)}>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-primary uppercase tracking-tight leading-none mb-1">{title}</p>
        <p className="text-[10px] font-semibold text-foreground/50 leading-snug">{desc}</p>
      </div>
      <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest whitespace-nowrap">{ago}</span>
    </div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────────────────

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
        isNew: false,
      })),
    ...appointments
      .filter(a => a.status === 'confirmed' && a.date === todayStr)
      .map(a => ({
        id: a.id, type: 'booking' as const,
        date: new Date(`${a.date}T${a.start_time}`),
        name: a.guest_name || 'Paciente Nuevo',
        subtitle: `${a.service_name} · ${a.start_time.substring(0, 5)}hs`,
        patientId: null,
        isNew: true,
      })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime()), [followUpsWithPatient, appointments, todayStr]);

  const pendingAppointments = useMemo(
    () => appointments.filter(a => a.status === 'pending'),
    [appointments]
  );

  const inactivePatients = useMemo(() => {
    const threshold = subDays(new Date(), 90);
    return patients.filter(p => {
      const lastFollowUp = followUpsWithPatient
        .filter(fu => fu.patient_id === p.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const lastDate = lastFollowUp ? new Date(lastFollowUp.date) : new Date(p.created_at);
      return isBefore(lastDate, threshold);
    }).slice(0, 3);
  }, [patients, followUpsWithPatient]);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    return payments
      .filter(p => {
        const d = new Date(p.created_at);
        return p.status === 'paid' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, p) => acc + p.amount, 0);
  }, [payments]);

  // Weight sparkline per patient (best 5 movers)
  const topProgressPatients = useMemo(() => {
    return patients
      .map(p => {
        const fus = followUpsWithPatient
          .filter(fu => fu.patient_id === p.id)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (fus.length < 2) return null;
        const first = fus[0].weight;
        const last = fus[fus.length - 1].weight;
        const diff = last - first;
        const weights = fus.map(f => f.weight);
        const initials = `${p.first_name[0]}${p.last_name[0]}`;
        return { id: p.id, name: `${p.first_name} ${p.last_name}`, diff, weights, initials, lastWeight: last };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.diff) - (b!.diff))   // most weight lost first
      .slice(0, 4) as NonNullable<ReturnType<typeof patients.map>[0]>[];
  }, [patients, followUpsWithPatient]);

  // Clinical alerts
  const clinicalAlerts = useMemo(() => {
    const alerts: { icon: React.ElementType; title: string; desc: string; bg: string; iconColor: string; ago: string }[] = [];
    // Inactive patients
    if (inactivePatients.length > 0) {
      const p = inactivePatients[0];
      alerts.push({
        icon: AlertTriangle, title: `${p.first_name} ${p.last_name} — sin actividad`,
        desc: 'Sin controles registrados en más de 90 días.',
        bg: 'bg-amber-50', iconColor: 'text-amber-600', ago: '+90d',
      });
    }
    // Expired plans
    const expiredPlans = patients.filter(p =>
      followUpsWithPatient.filter(fu => fu.patient_id === p.id).length > 0
    ).slice(0, 1);
    if (expiredPlans.length) {
      const ep = expiredPlans[0];
      alerts.push({
        icon: FileText, title: `Plan próximo a vencer`,
        desc: `Revisar plan de ${ep.first_name} ${ep.last_name}.`,
        bg: 'bg-blue-50', iconColor: 'text-blue-600', ago: 'hoy',
      });
    }
    // Birthday mock (patients born this month)
    const thisMonth = new Date().getMonth();
    const bday = patients.find(p => new Date(p.birth_date).getMonth() === thisMonth);
    if (bday) {
      alerts.push({
        icon: Gift, title: `Cumpleaños — ${bday.first_name} ${bday.last_name}`,
        desc: 'Cumple años este mes. Buen momento para personalizar el plan.',
        bg: 'bg-emerald-50', iconColor: 'text-nutri-emerald', ago: 'este mes',
      });
    }
    return alerts.slice(0, 4);
  }, [patients, inactivePatients, followUpsWithPatient]);

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">

      {/* ── EDITORIAL HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px w-6 bg-primary/20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">
              {format(new Date(), "EEEE dd, MMMM", { locale: es })}
            </p>
          </div>
          <h1 className="text-6xl font-black text-primary leading-[0.9] tracking-[-0.05em]">
            {firstName}.
          </h1>
          <p className="text-foreground/60 font-medium max-w-md leading-relaxed">
            {todayAppointments.length > 0
              ? `Tenés ${todayAppointments.length} cita${todayAppointments.length > 1 ? 's' : ''} programada${todayAppointments.length > 1 ? 's' : ''} para hoy.`
              : 'Sin turnos para hoy. Buen momento para actualizar expedientes.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <Button
            onClick={() => navigate('/patients')}
            className="h-14 px-10 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-transform active:scale-95 flex items-center gap-3"
          >
            <Plus className="h-4 w-4" /> Registrar paciente
          </Button>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm"
              className="h-8 rounded-full border-primary/10 text-primary/50 font-black text-[9px] uppercase tracking-widest"
              onClick={() => navigate('/settings')}
            >
              Turnera pública
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI STRIP ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Facturación mensual"
          value={`$${monthlyRevenue.toLocaleString('es-AR')}`}
          sub="ingresos del mes"
          icon={DollarSign}
          accent
        />
        <StatCard
          label="Fichas activas"
          value={patients.length}
          sub="pacientes registrados"
          icon={Users}
        />
        <StatCard
          label="Agenda hoy"
          value={todayAppointments.length}
          sub="turnos confirmados"
          icon={CalendarCheck}
        />
        <StatCard
          label="Solicitudes web"
          value={pendingAppointments.length}
          sub="esperan respuesta"
          icon={Bell}
          danger={pendingAppointments.length > 0}
        />
      </div>

      {/* ── MAIN 2-COL GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Agenda + Alertas */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Agenda hoy */}
          <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-primary/5">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Agenda de hoy</h2>
              <Button variant="ghost" size="sm" className="text-nutri-emerald font-black text-[10px] uppercase tracking-widest h-7 px-3 rounded-full hover:bg-emerald-50"
                onClick={() => navigate('/follow-ups')}>
                Ver semana →
              </Button>
            </div>

            <div className="px-8 py-2">
              {todayAppointments.length === 0 ? (
                <div className="py-10 text-center">
                  <Calendar className="h-8 w-8 text-primary/10 mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Sin compromisos para hoy</p>
                </div>
              ) : (
                todayAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center gap-5 py-4 border-b border-primary/5 last:border-0 group cursor-pointer hover:bg-primary/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                    onClick={() => appt.patientId && navigate(`/patients/${appt.patientId}`)}
                  >
                    <div className="text-center w-12 shrink-0">
                      <p className="text-[10px] font-black text-foreground/30 leading-none">
                        {format(appt.date, 'HH:mm')}
                      </p>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full shrink-0',
                      appt.isNew ? 'bg-blue-400' : 'bg-nutri-emerald'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-primary uppercase tracking-tight truncate">{appt.name}</p>
                      <p className="text-[10px] font-semibold text-foreground/40">{appt.subtitle}</p>
                    </div>
                    {appt.isNew && (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[8px] font-black uppercase tracking-widest rounded-lg border shrink-0">
                        Nuevo
                      </Badge>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 text-primary/10 group-hover:text-primary/40 transition-colors shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alertas clínicas */}
          <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-primary/5">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Alertas clínicas</h2>
              {clinicalAlerts.length > 0 && (
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-[9px] font-black text-amber-700">{clinicalAlerts.length}</span>
                </div>
              )}
            </div>
            <div className="px-8 py-2">
              {clinicalAlerts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/20">Sin alertas activas</p>
                </div>
              ) : clinicalAlerts.map((alert, i) => (
                <AlertItem key={i} {...alert} />
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Nuevo control', sub: 'Registrar evolución', icon: TrendingUp, to: '/follow-ups/new' },
              { label: 'Nuevo plan', sub: 'Plan dietoterápico', icon: FileText, to: '/meal-plans/new' },
              { label: 'Registrar cobro', sub: 'Sesión o plan', icon: DollarSign, to: '/payments' },
              { label: 'Nueva receta', sub: 'Catálogo nutricional', icon: Zap, to: '/recipes' },
            ].map((qa) => (
              <button
                key={qa.label}
                onClick={() => navigate(qa.to)}
                className="bg-white border border-primary/5 rounded-2xl p-5 text-left hover:border-nutri-emerald/30 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <qa.icon className="h-5 w-5 text-primary/20 group-hover:text-nutri-emerald mb-3 transition-colors" />
                <p className="text-[11px] font-black text-primary uppercase tracking-tight">{qa.label}</p>
                <p className="text-[10px] font-semibold text-foreground/35 mt-0.5">{qa.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Solicitudes + Progreso pacientes */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Solicitudes web */}
          <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-primary/5">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Solicitudes de turnos</h2>
              <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                {pendingAppointments.length} pendientes
              </p>
            </div>

            <div className="px-6 py-4">
              {appointments.length === 0 ? (
                <div className="py-12 text-center rounded-3xl border-2 border-dashed border-primary/5 mx-2">
                  <Calendar className="h-10 w-10 text-primary/10 mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/20">
                    Sin solicitudes vía turnera pública
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {appointments.slice(0, 4).map(appt => (
                    <div
                      key={appt.id}
                      className={cn(
                        'p-6 rounded-[1.5rem] border flex flex-col gap-5 transition-all',
                        appt.status === 'pending'
                          ? 'border-primary/15 shadow-md shadow-primary/5 bg-white'
                          : 'border-primary/5 opacity-60 bg-zinc-50/50',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary/5 rounded-xl flex items-center justify-center">
                              <p className="text-[10px] font-black text-primary">
                                {format(new Date(appt.date), 'dd')}
                              </p>
                            </div>
                            <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">
                              {format(new Date(appt.date), 'MMM', { locale: es })}
                            </p>
                          </div>
                          <p className="text-base font-black text-primary tracking-tight uppercase leading-tight">
                            {appt.guest_name}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-primary/5 text-primary/50 border-none text-[8px] font-black uppercase tracking-widest rounded-lg">
                              {appt.service_name}
                            </Badge>
                            <span className="text-[9px] font-black text-foreground/30">
                              {appt.start_time?.substring(0, 5)}hs
                            </span>
                          </div>
                        </div>
                        {appt.status !== 'pending' && (
                          <div className={cn('h-6 w-6 rounded-full flex items-center justify-center shrink-0',
                            appt.status === 'confirmed' ? 'bg-emerald-500' : 'bg-red-400'
                          )}>
                            {appt.status === 'confirmed'
                              ? <Check className="h-3 w-3 text-white" />
                              : <X className="h-3 w-3 text-white" />}
                          </div>
                        )}
                      </div>

                      {appt.status === 'pending' && (
                        <div className="flex items-center gap-2 pt-4 border-t border-primary/5">
                          <Button
                            onClick={() => respondToAppointment(appt.id, 'confirmed')}
                            className="flex-1 h-10 rounded-full bg-primary text-white font-black uppercase text-[9px] tracking-widest hover:scale-105 transition-all"
                          >
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => respondToAppointment(appt.id, 'cancelled')}
                            variant="ghost"
                            className="h-10 w-10 rounded-full text-foreground/20 hover:text-red-500 hover:bg-red-50 flex items-center justify-center p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Progreso de pacientes */}
          <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-primary/5">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Evolución de pacientes</h2>
              <Button variant="ghost" size="sm"
                className="text-nutri-emerald font-black text-[10px] uppercase tracking-widest h-7 px-3 rounded-full hover:bg-emerald-50"
                onClick={() => navigate('/follow-ups')}>
                Ver todos →
              </Button>
            </div>

            <div className="px-8 py-4">
              {topProgressPatients.length === 0 ? (
                <div className="py-10 text-center">
                  <TrendingDown className="h-8 w-8 text-primary/10 mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/20">
                    Registrá controles para ver el progreso
                  </p>
                </div>
              ) : topProgressPatients.map((p: any) => {
                const lost = p.diff < 0;
                const pct = Math.min(100, Math.abs(p.diff) * 5);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-5 py-4 border-b border-primary/5 last:border-0 group cursor-pointer hover:bg-primary/[0.015] -mx-2 px-2 rounded-xl transition-colors"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase">
                        {p.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-primary uppercase tracking-tight truncate">{p.name}</p>
                      <div className="mt-1.5 h-1.5 bg-primary/5 rounded-full overflow-hidden w-full">
                        <div
                          className={cn('h-full rounded-full transition-all', lost ? 'bg-nutri-emerald' : 'bg-amber-400')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={cn('text-xs font-black', lost ? 'text-nutri-forest' : 'text-amber-600')}>
                        {lost ? '' : '+'}{p.diff.toFixed(1)} kg
                      </span>
                      <Sparkline data={p.weights} color={lost ? '#059669' : '#f59e0b'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pacientes inactivos banner */}
          {inactivePatients.length > 0 && (
            <div className="p-7 rounded-[2rem] bg-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Retención</p>
                </div>
                <p className="text-xl font-black text-white tracking-tight leading-tight">
                  {inactivePatients.length} paciente{inactivePatients.length > 1 ? 's' : ''} sin actividad reciente.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {inactivePatients.map(ip => (
                    <div key={ip.id} className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-[9px] font-black text-white/70">{ip.first_name[0]}{ip.last_name[0]}</span>
                    </div>
                  ))}
                  <span className="text-[10px] font-bold text-white/40 ml-1">
                    {inactivePatients.map(ip => ip.first_name).join(', ')}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => navigate('/patients')}
                className="shrink-0 h-11 px-7 rounded-full bg-white text-primary font-black uppercase text-[9px] tracking-widest hover:scale-105 transition-all shadow-xl"
              >
                Ver pacientes <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

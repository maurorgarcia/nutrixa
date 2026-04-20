import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { useConsultationStore } from '@/stores/consultationStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  ArrowLeft, Edit, Activity, Plus, Loader2,
  Mail, Phone, Clock, DollarSign, Trash2, ArrowRight, User, Zap
} from 'lucide-react';
import { getBMICategory } from '@/utils/calculations';
import { PatientForm } from './PatientForm';
import { FollowUpForm } from './FollowUpForm';
import { PaymentForm } from './PaymentForm';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedPatient, getPatientById, loading: patientLoading } = usePatientStore();
  const { consultations, fetchConsultationsByPatient } = useConsultationStore();
  const { mealPlans, fetchMealPlansByPatient } = useMealPlanStore();
  const { payments, fetchPaymentsByPatient, deletePayment } = usePaymentStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getPatientById(id);
      fetchConsultationsByPatient(id);
      fetchMealPlansByPatient(id);
      fetchPaymentsByPatient(id);
    }
  }, [id]);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const getStressLevelBadge = useCallback((level: string | null) => {
    if (!level) return null;
    const configs: Record<string, string> = {
      'Bajo': 'bg-slate-50 text-slate-500 border-slate-100',
      'Moderado': 'bg-amber-50 text-amber-600 border-amber-100',
      'Alto': 'bg-rose-50 text-rose-600 border-rose-100',
    };
    const cls = configs[level] || configs['Moderado'];
    return <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-tight border-none", cls)}>{level}</Badge>;
  }, []);

  if (patientLoading || !selectedPatient) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
      </div>
    );
  }

  const latestConsultation = consultations[0];
  const activeMealPlan = mealPlans.find(mp => mp.is_active);

  return (
    <div className="clinical-page animate-in fade-in duration-500 space-y-8 max-w-full">
      
      {/* ── HEADER CLINICO ── */}
      <div className="clinical-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={() => navigate('/patients')} className="h-10 w-10 border-slate-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
             <Avatar className="h-14 w-14 rounded-xl border border-slate-100 ring-4 ring-slate-50">
                <AvatarFallback className="bg-slate-900 text-white font-bold text-sm uppercase">{getInitials(selectedPatient.nombre_completo)}</AvatarFallback>
             </Avatar>
             <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none mb-2">{selectedPatient.nombre_completo}</h1>
                <div className="flex items-center gap-3">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <User className="w-3.5 h-3.5" /> {selectedPatient.edad} AÑOS · {selectedPatient.sexo === 'M' || selectedPatient.sexo === 'Masculino' ? 'Masculino' : selectedPatient.sexo === 'F' || selectedPatient.sexo === 'Femenino' ? 'Femenino' : 'Otro'}
                   </p>
                   {getStressLevelBadge(selectedPatient.nivel_estres)}
                </div>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" onClick={() => setIsEditingPatient(true)} className="gap-2">
            <Edit className="h-4 w-4" /> Editar Perfil
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 gap-2" onClick={() => setIsAddingFollowUp(true)}>
            <Plus className="h-4 w-4" /> Nueva Evolución
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-auto flex mb-8 gap-1 max-w-2xl">
          {[
            { v: 'overview', l: 'Epicrisis' },
            { v: 'meal-plans', l: 'Tratamiento' },
            { v: 'follow-ups', l: 'Evolución' },
            { v: 'payments', l: 'Honorarios' }
          ].map(t => (
            <TabsTrigger key={t.v} value={t.v} className="flex-1 rounded-lg py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              {t.l}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-6 outline-none">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { icon: Mail, label: 'Email Institucional', value: selectedPatient.correo },
                 { icon: Phone, label: 'Contacto Directo', value: selectedPatient.telefono },
                 { icon: Clock, label: 'Fecha de Alta', value: format(new Date(selectedPatient.created_at), 'dd/MM/yy') },
                 { icon: Activity, label: 'IMC de Control', value: latestConsultation?.imc || '--' }
               ].map((item, i) => (
                 <div key={i} className="clinical-panel p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{item.value || '-'}</p>
                 </div>
               ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 clinical-panel overflow-hidden">
                 <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Evaluación Clínica Reciente</h3>
                 </div>
                 <div className="p-8 space-y-8">
                    {/* Antecedentes y Salud (Siempre visibles) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patologías</p>
                          <div className="flex flex-wrap gap-2">
                             {selectedPatient.patologias_preexistentes?.length > 0 ? selectedPatient.patologias_preexistentes.map((p: string) => (
                               <Badge key={p} variant="outline" className="text-[10px] font-bold uppercase tracking-tight bg-rose-50 text-rose-600 border-rose-100">{p}</Badge>
                             )) : <span className="text-xs text-slate-300 italic">Ninguna</span>}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medicación</p>
                          <div className="flex flex-wrap gap-2">
                             {selectedPatient.medicacion_habitual?.length > 0 ? selectedPatient.medicacion_habitual.map((p: string) => (
                               <Badge key={p} variant="outline" className="text-[10px] font-bold uppercase tracking-tight bg-blue-50 text-blue-600 border-blue-100">{p}</Badge>
                             )) : <span className="text-xs text-slate-300 italic">Ninguna</span>}
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alimentos Excluidos</p>
                          <div className="flex flex-wrap gap-2">
                             {selectedPatient.alimentos_excluidos?.length > 0 ? selectedPatient.alimentos_excluidos.map((p: string) => (
                               <Badge key={p} variant="outline" className="text-[10px] font-bold uppercase tracking-tight bg-slate-100 text-slate-600 border-slate-200">{p}</Badge>
                             )) : <span className="text-xs text-slate-300 italic">Sin restricciones</span>}
                          </div>
                       </div>
                    </div>

                    {latestConsultation ? (
                      <div className="flex flex-col md:flex-row items-start gap-10 pt-4">
                          <div className="text-center bg-slate-50 p-6 rounded-2xl border border-slate-100 min-w-[140px]">
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Índice IMC</p>
                             <p className="text-5xl font-bold text-slate-900 tracking-tighter leading-none">{latestConsultation.imc}</p>
                             <p className="text-[10px] font-bold text-senralis-main mt-3 uppercase tracking-widest">{getBMICategory(latestConsultation.imc).label}</p>
                          </div>
                          <div className="flex-1 space-y-6">
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnóstico / Motivo de Consulta</p>
                                <p className="text-base font-medium text-slate-700 leading-relaxed italic">"{latestConsultation.motivo_consulta}"</p>
                             </div>
                          </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                         <Activity className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                         <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sin sesiones clínicas activas</p>
                      </div>
                    )}
                 </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-8 relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-senralis-main/20 blur-3xl pointer-events-none" />
                 {activeMealPlan ? (
                    <div className="space-y-6">
                       <div>
                          <p className="text-2xl font-bold tracking-tight">{activeMealPlan.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Estatus: Activo</p>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                             <p className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Target Calorías</p>
                             <p className="text-xl font-bold">{activeMealPlan.daily_calories}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center flex flex-col justify-center">
                             <p className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Evolución</p>
                             <div className="flex items-center justify-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-senralis-main animate-pulse" />
                                <span className="text-xs font-bold uppercase">En Curso</span>
                             </div>
                          </div>
                       </div>
                       <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white hover:text-slate-900 h-10 font-bold text-xs" onClick={() => setActiveTab('meal-plans')}>
                         Ver Protocolo <ArrowRight className="w-4 h-4 ml-2" />
                       </Button>
                    </div>
                 ) : (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sin Esquema Asignado</p>
                       <Button variant="link" className="text-senralis-main mt-4 h-auto p-0 text-xs font-bold uppercase tracking-widest" onClick={() => setActiveTab('meal-plans')}>Configurar Ahora</Button>
                    </div>
                 )}
              </div>
           </div>
        </TabsContent>

        {/* ── MEAL PLANS ── */}
        <TabsContent value="meal-plans" className="space-y-6 outline-none animate-in slide-in-from-bottom-2">
           <div className="clinical-panel overflow-hidden pb-4">
              <div className="p-6 flex items-center justify-between border-b border-slate-100 mb-4">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Historial de Tratamientos</h3>
                 <Button 
                    onClick={() => navigate(`/meal-plans/new?patient_id=${id}`)}
                    className="h-9 px-4 bg-slate-900 hover:bg-slate-800 gap-2"
                 >
                    <Plus className="w-4 h-4" /> Nuevo Protocolo
                 </Button>
              </div>
              <div className="px-4 space-y-3">
                 {mealPlans.length === 0 ? (
                    <div className="p-20 text-center text-xs font-bold text-slate-300 uppercase italic">Sin registros de tratamiento</div>
                 ) : mealPlans.map(plan => (
                    <div key={plan.id} className="p-5 flex items-center justify-between rounded-xl border border-slate-100 hover:border-senralis-main/30 hover:bg-slate-50 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center font-bold transition-all", plan.is_active ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-300 border border-slate-200")}>
                             <Zap className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-base font-bold text-slate-900">{plan.name}</p>
                             <p className="text-xs font-medium text-slate-400 capitalize">{format(new Date(plan.start_date), 'dd MMMM yyyy', { locale: es })}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                             <p className="text-sm font-bold text-slate-900">{plan.daily_calories} KCAL</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Régimen Diario</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-900"><ChevronRight className="w-5 h-5" /></Button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </TabsContent>

        {/* ── FOLLOW UPS ── */}
        <TabsContent value="follow-ups" className="space-y-6 outline-none animate-in slide-in-from-bottom-2">
           <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-72 shrink-0">
                 <div className="clinical-panel p-8 text-center bg-white shadow-sm border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Δ Variación de Peso</p>
                    <p className="text-5xl font-bold text-slate-900 tracking-tighter leading-none mb-2">
                       {consultations.length > 1 ? (Number(consultations[0].peso_actual) - Number(consultations[consultations.length - 1].peso_actual)).toFixed(1) : '0'}
                       <span className="text-lg ml-1.5 text-slate-300 font-bold tracking-tight">KG</span>
                    </p>
                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                         <p>Sesiones</p><p className="text-slate-900 font-bold">{consultations.length}</p>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                         <p>Evolución</p><p className="text-teal-600 font-bold">Activa</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                 {consultations.length > 0 ? consultations.map((fu) => (
                    <div key={fu.id} className="clinical-panel p-6 flex items-center justify-between hover:border-senralis-main/30 hover:shadow-md transition-all group">
                       <div className="flex items-center gap-8">
                          <div className="text-center px-5 border-r border-slate-100 w-24">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{format(new Date(fu.fecha_consulta), 'MMM', { locale: es })}</p>
                             <p className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">{format(new Date(fu.fecha_consulta), 'dd')}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xl font-bold text-slate-900 tracking-tight">{fu.peso_actual} <span className="text-sm text-slate-300 font-bold">KG</span></p>
                             <p className="text-sm font-medium text-slate-500 italic line-clamp-1 max-w-sm">"{fu.notas_seguimiento || 'Sin observaciones registradas'}"</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedFollowUpId(fu.id); setIsAddingFollowUp(true); }} className="h-10 w-10 text-slate-200 hover:text-slate-900 group-hover:bg-slate-50"><Edit className="h-4 w-4" /></Button>
                       </div>
                    </div>
                 )) : (
                   <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 font-bold uppercase tracking-widest text-xs">Sin registros de evolución</div>
                 )}
              </div>
           </div>
        </TabsContent>

        {/* ── PAYMENTS ── */}
        <TabsContent value="payments" className="space-y-6 outline-none animate-in slide-in-from-bottom-2">
           <div className="clinical-panel overflow-hidden pb-4">
              <div className="p-6 flex items-center justify-between border-b border-slate-100 mb-4">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Registro de Honorarios</h3>
                 <Button onClick={() => setIsAddingPayment(true)} className="h-9 px-4 bg-slate-900 hover:bg-slate-800 gap-2">
                    <Plus className="w-4 h-4" /> Registrar Cobro
                 </Button>
              </div>
              <div className="px-4 space-y-3">
                 {payments.length === 0 ? (
                    <div className="p-20 text-center text-xs font-bold text-slate-300 uppercase italic">Sin movimientos financieros</div>
                 ) : payments.map(p => (
                    <div key={p.id} className="p-5 flex items-center justify-between rounded-xl border border-slate-100 hover:border-slate-300 transition-all bg-white shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center font-bold border shadow-sm transition-all", p.status === 'paid' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-300 border-slate-100")}>
                             <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-lg font-bold text-slate-900">${p.amount.toLocaleString('es-AR')}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.description}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <Badge className={cn("text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border-none", p.status === 'paid' ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-600")}>
                             {p.status === 'paid' ? 'CONSOLIDADO' : 'PENDIENTE'}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => deletePayment(p.id)} className="h-10 w-10 text-slate-200 hover:text-rose-500"><Trash2 className="h-5 w-5" /></Button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </TabsContent>
      </Tabs>

      {/* ── SHEETS ── */}
      <Sheet open={isEditingPatient} onOpenChange={setIsEditingPatient}>
        <SheetContent className="sm:max-w-xl p-0 border-none shadow-2xl flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-slate-100 bg-slate-900 text-left shrink-0">
            <SheetTitle className="text-xl font-bold text-white tracking-tight leading-none mb-2">Perfil Clínico</SheetTitle>
            <SheetDescription className="font-medium text-slate-400 text-xs">Actualización de datos institucionales del paciente.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <PatientForm initialId={id} onSuccess={() => { setIsEditingPatient(false); if(id) getPatientById(id); }} onCancel={() => setIsEditingPatient(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isAddingFollowUp} onOpenChange={(v) => { setIsAddingFollowUp(v); if(!v) setSelectedFollowUpId(null); }}>
        <SheetContent className="sm:max-w-xl p-0 border-none shadow-2xl flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-slate-100 bg-slate-900 text-left shrink-0">
            <SheetTitle className="text-xl font-bold text-white tracking-tight leading-none mb-2">{selectedFollowUpId ? 'Editar Sesión' : 'Evolución Clínica'}</SheetTitle>
            <SheetDescription className="font-medium text-slate-400 text-xs">Registro detallado de parámetros y observaciones de la sesión.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <FollowUpForm initialPatientId={id} initialId={selectedFollowUpId || undefined} onSuccess={() => { setIsAddingFollowUp(false); setSelectedFollowUpId(null); if(id) fetchConsultationsByPatient(id); }} onCancel={() => { setIsAddingFollowUp(false); setSelectedFollowUpId(null); }} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <SheetContent className="sm:max-w-xl p-0 border-none shadow-2xl flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-slate-100 bg-slate-900 text-left shrink-0">
            <SheetTitle className="text-xl font-bold text-white tracking-tight leading-none mb-2">Orden de Cobro</SheetTitle>
            <SheetDescription className="font-medium text-slate-400 text-xs">Gestión y registro de honorarios profesionales.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <PaymentForm initialPatientId={id} onSuccess={() => { setIsAddingPayment(false); if(id) fetchPaymentsByPatient(id); }} onCancel={() => setIsAddingPayment(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

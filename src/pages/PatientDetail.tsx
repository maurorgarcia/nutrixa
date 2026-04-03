import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { useAnamnesisStore } from '@/stores/anamnesisStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowLeft, 
  Edit, 
  FileText, 
  TrendingUp, 
  Utensils,
  Plus,
  Download,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MoreVertical,
  ShieldAlert,
  Zap,
  Target,
  Calendar,
  ChevronRight,
  Eye,
  Trash2
} from 'lucide-react';
import { calculateAge, getBMICategory } from '@/utils/calculations';
import { exportAnamnesisToPDF } from '@/utils/pdfExport';
import { PatientForm } from './PatientForm';
import { FollowUpForm } from './FollowUpForm';
import { PaymentForm } from './PaymentForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Anamnesis } from '@/types';

export function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedPatient, getPatientById, loading: patientLoading } = usePatientStore();
  const { anamnesisList, fetchAnamnesisByPatient } = useAnamnesisStore();
  const { mealPlans, fetchMealPlansByPatient } = useMealPlanStore();
  const { followUps, fetchFollowUpsByPatient } = useFollowUpStore();
  const { payments, fetchPaymentsByPatient, deletePayment } = usePaymentStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [selectedFollowUpId, setSelectedFollowUpId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getPatientById(id);
      fetchAnamnesisByPatient(id);
      fetchMealPlansByPatient(id);
      fetchFollowUpsByPatient(id);
      fetchPaymentsByPatient(id);
    }
  }, [id]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStressLevelBadge = (level: string | null) => {
    if (!level) return null;
    const configs = {
      low: { label: 'Bajo', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      moderate: { label: 'Moderado', className: 'bg-amber-50 text-amber-700 border-amber-100' },
      high: { label: 'Alto', className: 'bg-red-50 text-red-700 border-red-100' },
    };
    const config = configs[level as keyof typeof configs] || configs.moderate;
    return <Badge variant="secondary" className={cn("rounded-lg font-black text-[10px] uppercase tracking-wider", config.className)}>{config.label}</Badge>;
  };

  const onEditSuccess = () => {
    setIsEditingPatient(false);
    if (id) getPatientById(id);
  };

  const handleExportAnamnesis = (anamnesis: Anamnesis) => {
    if (selectedPatient) exportAnamnesisToPDF(selectedPatient, anamnesis);
  };

  if (patientLoading || !selectedPatient) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-zinc-200" /></div>;
  }

  const latestAnamnesis = anamnesisList[0];
  const activeMealPlan = mealPlans.find(mp => mp.is_active);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-zinc-200">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')} className="rounded-xl h-10 w-10 hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
            <ArrowLeft className="h-5 w-5 text-zinc-400" />
          </Button>
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white shadow-xl ring-1 ring-zinc-100 shrink-0">
              <AvatarFallback className="bg-zinc-900 text-white text-2xl font-black uppercase">
                {getInitials(selectedPatient.first_name, selectedPatient.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </h1>
                {selectedPatient.email && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[9px] font-black h-5 px-2">Activo</Badge>}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100 flex items-center gap-2">
                  {calculateAge(selectedPatient.birth_date)} años <span className="opacity-40">/</span> {selectedPatient.gender === 'male' ? 'Masc' : selectedPatient.gender === 'female' ? 'Fem' : 'Otro'}
                </span>
                {getStressLevelBadge(selectedPatient.stress_level)}
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Desde {format(new Date(selectedPatient.created_at), 'MMMM yyyy', { locale: es })}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 self-center md:self-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsEditingPatient(true)}
            className="rounded-xl font-black text-[10px] uppercase tracking-widest border-zinc-200 h-10 px-6 shadow-sm active:scale-95 transition-all bg-white hover:bg-zinc-50"
          >
            <Edit className="h-3.5 w-3.5 mr-2" /> Editar Perfil
          </Button>
          <Button 
            className="rounded-xl font-black text-[10px] uppercase tracking-widest bg-zinc-900 text-white h-10 px-6 shadow-xl active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" /> Nueva Cita
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8 overflow-x-auto pb-1 no-scrollbar sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md pt-2">
          <TabsList className="bg-zinc-200/50 p-1.5 rounded-2xl w-auto inline-flex border border-zinc-200/50 shadow-inner">
            <TabsTrigger value="overview" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-lg">Resumen</TabsTrigger>
            <TabsTrigger value="anamnesis" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-lg">Anamnesis</TabsTrigger>
            <TabsTrigger value="meal-plans" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-lg">Planes</TabsTrigger>
            <TabsTrigger value="follow-ups" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-lg">Seguimiento</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-lg flex items-center gap-2">
              <DollarSign className="h-3 w-3" /> Cobros
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview" className="space-y-6 outline-none">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { icon: Mail, label: 'Email', value: selectedPatient.email, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                 { icon: Phone, label: 'Teléfono', value: selectedPatient.phone, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                 { icon: Briefcase, label: 'Ocupación', value: selectedPatient.occupation, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                 { icon: Clock, label: 'Disponibilidad', value: selectedPatient.work_schedule, color: 'text-purple-600 bg-purple-50 border-purple-100' }
               ].map((item, i) => (
                 <Card key={i} className="border-zinc-100 shadow-none rounded-2xl overflow-hidden hover:border-zinc-200 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", item.color)}>
                         <item.icon className="h-5 w-5" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-0.5">{item.label}</p>
                          <p className="text-sm font-bold text-zinc-900 truncate">{item.value || '-'}</p>
                       </div>
                    </CardContent>
                 </Card>
               ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Estado Clínico */}
             <Card className="lg:col-span-2 border-zinc-100 shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 bg-zinc-50/30 px-8 py-5">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                       <ShieldAlert className="h-4 w-4 text-emerald-600" /> Estado Clínico
                    </CardTitle>
                    <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Resumen de última anamnesis</p>
                  </div>
                  {latestAnamnesis && (
                    <Button variant="ghost" size="sm" className="h-9 rounded-xl font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border border-emerald-100" onClick={() => handleExportAnamnesis(latestAnamnesis)}>
                      <Download className="h-4 w-4 mr-2" /> PDF Reporte
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-8">
                  {latestAnamnesis ? (
                    <div className="space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center p-6 bg-zinc-50 rounded-3xl border border-zinc-100/60 shadow-inner">
                             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">IMC Actual</p>
                             <p className="text-4xl font-black text-zinc-900 tracking-tighter">{latestAnamnesis.anthropometric_data.bmi}</p>
                             <p className={cn("text-[11px] font-black uppercase mt-2 px-3 py-1 rounded-full border inline-block", 
                               getBMICategory(latestAnamnesis.anthropometric_data.bmi) === 'Normal' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                             )}>
                               {getBMICategory(latestAnamnesis.anthropometric_data.bmi)}
                             </p>
                          </div>
                          <div className="md:col-span-2 space-y-6">
                             <div className="bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100">
                                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                                   <Target className="h-3.5 w-3.5" /> Motivo Primario
                                </p>
                                <p className="text-lg font-bold text-zinc-900 leading-tight">
                                   {latestAnamnesis.consultation_reason}
                                </p>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {latestAnamnesis.diseases.map((d, i) => (
                                  <span key={i} className="px-3 py-1.5 bg-red-50 text-red-700 text-[10px] font-black rounded-xl border border-red-100 uppercase tracking-wider flex items-center gap-2">
                                    <ShieldAlert className="h-3 w-3" /> {d}
                                  </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 px-6 border-2 border-dashed border-zinc-100 rounded-3xl">
                       <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <Activity className="h-8 w-8 text-zinc-300" />
                       </div>
                       <h3 className="text-sm font-black text-zinc-900 uppercase">Sin expediente clínico</h3>
                       <p className="text-xs font-bold text-zinc-400 mt-2 uppercase max-w-xs mx-auto">No hay datos antropométricos registrados para este paciente.</p>
                       <Button variant="outline" className="mt-6 rounded-xl font-bold border-zinc-200" onClick={() => navigate(`/patients/${id}/anamnesis/new`)}>
                         Comenzar Anamnesis
                       </Button>
                    </div>
                  )}
                </CardContent>
             </Card>

             {/* Plan Activo Preview */}
             <div className="space-y-6">
               <Card className="border-zinc-100 shadow-xl rounded-3xl overflow-hidden bg-zinc-900 text-white border-none">
                  <CardHeader className="border-b border-white/10 bg-white/5 py-4 px-6">
                    <CardTitle className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                       <Utensils className="h-4 w-4" /> Plan Nutricional Activo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     {activeMealPlan ? (
                       <div className="space-y-6">
                          <div>
                            <h3 className="text-2xl font-black tracking-tight">{activeMealPlan.name}</h3>
                            <div className="flex items-center gap-3 mt-2">
                               <span className="text-xl font-black text-emerald-400">{activeMealPlan.daily_calories} <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Kcal / día</span></span>
                               <span className="h-1 w-1 rounded-full bg-white/20" />
                               <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Iniciado {format(new Date(activeMealPlan.start_date), 'dd MMM', { locale: es })}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                             {[
                               { l: 'Prot', v: activeMealPlan.macros.protein, c: 'bg-emerald-500/20 text-emerald-400' },
                               { l: 'Carb', v: activeMealPlan.macros.carbs, c: 'bg-blue-500/20 text-blue-400' },
                               { l: 'Gras', v: activeMealPlan.macros.fats, c: 'bg-amber-500/20 text-amber-400' }
                             ].map((m, i) => (
                               <div key={i} className={cn("rounded-2xl p-4 text-center border border-white/5", m.c)}>
                                  <p className="text-[10px] font-black uppercase mb-1 opacity-60 font-mono">{m.l}</p>
                                  <p className="text-lg font-black">{m.v}%</p>
                               </div>
                             ))}
                          </div>

                          <Button 
                            variant="outline" 
                            className="w-full h-12 bg-white/5 hover:bg-white/10 border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                            onClick={() => setActiveTab('meal-plans')}
                          >
                            Ver Plan Completo <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                       </div>
                     ) : (
                       <div className="text-center py-8">
                          <Utensils className="h-10 w-10 text-white/10 mx-auto mb-4" />
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Sin plan asignado</p>
                          <Button 
                            variant="outline" 
                            className="mt-6 w-full h-12 bg-white/5 border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest"
                            onClick={() => navigate(`/patients/${id}/meal-plans/new`)}
                          >
                            Crear Primer Plan
                          </Button>
                       </div>
                     )}
                  </CardContent>
               </Card>
             </div>
          </div>
        </TabsContent>

        {/* ── ANAMNESIS TAB ── */}
        <TabsContent value="anamnesis" className="space-y-6 outline-none">
           {latestAnamnesis ? (
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Insights de IA (Sidebar left) */}
                <div className="lg:col-span-1 space-y-6">
                   <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden ring-4 ring-emerald-500/10">
                      <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="h-20 w-20" /></div>
                      <div className="relative z-10 space-y-8">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/30">
                               <Zap className="h-5 w-5 text-emerald-400" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Clinical AI Insights</span>
                         </div>
                         
                         <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Conclusión Directa</h4>
                            <p className="text-sm font-semibold leading-relaxed text-zinc-100">
                               {latestAnamnesis.physical_activity ? "Paciente con perfil metabólico adaptable pero requiere ajuste urgente en densidad calórica por sedentarismo detectado." : "Pendiente de análisis profundo."}
                            </p>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Prioridades Nutricionales</h4>
                            <div className="space-y-3">
                               {['Ajuste de Sodio', 'Distribución Protéica 1.6g', 'Fibra Soluble +25g'].map((p, i) => (
                                 <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-2xl hover:bg-white/10 transition-colors cursor-default">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    <span className="text-[11px] font-bold tracking-tight">{p}</span>
                                 </div>
                               ))}
                            </div>
                         </div>

                         <Button className="w-full h-12 bg-white text-emerald-950 hover:bg-zinc-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                            Generar Plan IA <ChevronRight className="ml-2 h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                </div>

                {/* Full Anamnesis Data (Grid right) */}
                <div className="lg:col-span-3">
                   <Card className="border-zinc-100 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                      <div className="p-10 space-y-12">
                         {/* Sección: Hábitos Alimenticios */}
                         <div className="space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="h-1 w-12 bg-zinc-900 rounded-full" />
                               <h3 className="text-base font-black text-zinc-900 uppercase tracking-widest">Patrones de Consumo</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Frecuencia</p>
                                  <p className="text-xl font-black text-zinc-900">{latestAnamnesis.eating_habits.meal_frequency} <span className="text-[10px] opacity-40">comidas</span></p>
                               </div>
                               <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
                                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Actividad</p>
                                  <p className="text-xl font-black text-zinc-900 uppercase truncate">{latestAnamnesis.physical_activity?.level || 'Sin datos'}</p>
                               </div>
                               <div className="md:col-span-2 p-6 bg-zinc-900 rounded-3xl flex items-center justify-between text-white border-zinc-800">
                                  <div>
                                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Preferencia Principal</p>
                                     <p className="text-sm font-bold truncate max-w-[150px]">{latestAnamnesis.eating_habits.food_preferences?.[0] || 'No especificado'}</p>
                                  </div>
                                  <Utensils className="h-6 w-6 text-emerald-400" />
                               </div>
                            </div>
                         </div>

                         {/* Sección: Restricciones */}
                         <div className="space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="h-1 w-12 bg-zinc-900 rounded-full" />
                               <h3 className="text-base font-black text-zinc-900 uppercase tracking-widest">Restricciones y Alergias</h3>
                            </div>
                            <div className="flex flex-wrap gap-3">
                               {latestAnamnesis.eating_habits.allergies.length > 0 ? latestAnamnesis.eating_habits.allergies.map((a, i) => (
                                 <span key={i} className="px-5 py-3 bg-red-50 text-red-700 text-xs font-black rounded-2xl border border-red-100 flex items-center gap-3">
                                    <AlertTriangle className="h-4 w-4" /> {a}
                                 </span>
                               )) : <p className="text-sm font-medium text-zinc-400">Sin alergias declaradas.</p>}
                            </div>
                         </div>

                         {/* Sección: Historial */}
                         <div className="space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="h-1 w-12 bg-zinc-900 rounded-full" />
                               <h3 className="text-base font-black text-zinc-900 uppercase tracking-widest">Seguimiento de Versiones</h3>
                            </div>
                            <div className="divide-y divide-zinc-50 border border-zinc-100 rounded-3xl overflow-hidden">
                               {anamnesisList.map((a, i) => (
                                 <div key={a.id} className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                       <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 flex flex-col items-center justify-center">
                                          <span className="text-[9px] font-black text-zinc-400 uppercase">{format(new Date(a.created_at), 'MMM', { locale: es })}</span>
                                          <span className="text-lg font-black text-zinc-900 leading-none">{format(new Date(a.created_at), 'd')}</span>
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-zinc-900">Anamnesis #{(anamnesisList.length - i).toString().padStart(2, '0')}</p>
                                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{a.anthropometric_data.weight} kg — IMC {a.anthropometric_data.bmi}</p>
                                       </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleExportAnamnesis(a)}>
                                       <Download className="h-4 w-4 text-zinc-400" />
                                    </Button>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </Card>
                </div>
             </div>
           ) : (
             <div className="text-center py-32 bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
                <Activity className="h-16 w-16 text-zinc-100 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase mb-4">Comenzar Proceso Clínico</h3>
                <p className="text-zinc-500 max-w-sm mx-auto font-medium mb-10 leading-relaxed text-lg">Iniciá la toma de datos estructurales para habilitar el análisis por Inteligencia Artificial.</p>
                <Button className="bg-zinc-900 text-white font-black uppercase tracking-widest h-14 px-12 rounded-2xl text-[10px] shadow-2xl hover:-translate-y-1 transition-all" onClick={() => navigate(`/patients/${id}/anamnesis/new`)}>
                   Abrir Wizard Clínico
                </Button>
             </div>
           )}
        </TabsContent>

        {/* ── MEAL PLANS TAB ── */}
        <TabsContent value="meal-plans" className="space-y-8 outline-none">
           <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Planes Alimentarios</h2>
                 <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Historial de dietoterapia y estados de adherencia</p>
              </div>
              <Button onClick={() => navigate(`/patients/${id}/meal-plans/new`)} className="bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl active:scale-95 transition-all">
                 <Plus className="h-4 w-4 mr-2" /> Nuevo Plan
              </Button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mealPlans.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 rounded-[3rem] bg-zinc-50/50">
                   <Utensils className="h-16 w-16 text-zinc-200 mx-auto mb-4" />
                   <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Sin planes registrados</h4>
                </div>
              ) : mealPlans.map(plan => (
                <Card key={plan.id} className={cn(
                  "border shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col group",
                  plan.is_active ? "border-emerald-200 ring-2 ring-emerald-50 relative bg-white" : "border-zinc-100 opacity-80"
                )}>
                  {plan.is_active && <span className="absolute top-4 right-4 bg-zinc-900 text-emerald-400 text-[8px] font-black uppercase px-2 py-1 rounded-lg tracking-widest shadow-xl">Activo</span>}
                  <CardHeader className="pt-8 px-8 pb-4">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 font-mono flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Inició {format(new Date(plan.start_date), 'dd MMM yyyy', { locale: es })}
                     </p>
                     <CardTitle className="text-2xl font-black tracking-tighter leading-tight text-zinc-900 group-hover:text-emerald-700 transition-colors">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 flex-1 flex flex-col gap-6">
                     <p className="text-xs font-semibold text-zinc-500 line-clamp-2 leading-relaxed h-10">{plan.description || 'Sin notas descriptivas.'}</p>
                     
                     <div className="grid grid-cols-2 gap-3 py-6 border-y border-zinc-50">
                        <div>
                           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-2 font-mono">Energía</p>
                           <p className="text-xl font-black text-zinc-900">{plan.daily_calories} <span className="text-[9px] opacity-40">kcal</span></p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-2 font-mono">Macros</p>
                           <p className="text-xl font-black text-zinc-900">{plan.macros.protein}/{plan.macros.carbs}/{plan.macros.fats}</p>
                        </div>
                     </div>

                     <div className="pt-2 pb-8 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl font-black uppercase text-[9px] h-10 border-zinc-200 hover:bg-zinc-50" onClick={() => navigate(`/meal-plans/${plan.id}`)}><Eye className="h-3.5 w-3.5 mr-2" /> Abrir</Button>
                        <Button variant="outline" size="sm" className="h-10 w-10 rounded-xl border-zinc-200 hover:bg-zinc-50 flex items-center justify-center p-0"><Download className="h-3.5 w-3.5" /></Button>
                        <Button variant="outline" size="sm" className="h-10 w-10 rounded-xl border-zinc-200 hover:bg-zinc-50 flex items-center justify-center p-0"><MoreVertical className="h-3.5 w-3.5" /></Button>
                     </div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>

        {/* ── FOLLOW UPS TAB ── */}
        <TabsContent value="follow-ups" className="space-y-8 outline-none">
           <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Registro de Seguimiento</h2>
                 <p className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Monitoreo de parámetros antropométricos y evolución</p>
              </div>
              <Button onClick={() => setIsAddingFollowUp(true)} className="bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl active:scale-95 transition-all">
                 <Plus className="h-4 w-4 mr-2" /> Nuevo Control
              </Button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Left: Stats de Evolución */}
              <div className="lg:col-span-1 space-y-4">
                 <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-zinc-800 text-white overflow-hidden p-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Diferencia de Peso</p>
                    <div className="flex items-end gap-3 mb-6">
                       <p className="text-6xl font-black tracking-tighter">{followUps.length > 1 ? (followUps[0].weight - followUps[followUps.length - 1].weight).toFixed(1) : '0'}</p>
                       <p className="text-sm font-black text-emerald-400 pb-2 flex items-center gap-1 uppercase tracking-widest">kg <TrendingUp className="h-4 w-4" /></p>
                    </div>
                    <div className="space-y-3 pb-4">
                       {[
                         { l: 'Controles', v: followUps.length },
                         { l: 'Último Peso', v: `${followUps[0]?.weight || '0'} kg` },
                         { l: 'Hace', v: followUps[0] ? differenceInDays(new Date(), new Date(followUps[0].date)) + ' días' : '-' }
                       ].map((s, i) => (
                         <div key={i} className="flex items-center justify-between text-xs py-3 border-t border-white/5">
                            <span className="font-extrabold text-white/40 uppercase tracking-widest">{s.l}</span>
                            <span className="font-black text-white">{s.v}</span>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>

              {/* Timeline Center: Liste de Controles */}
              <div className="lg:col-span-3">
                 {followUps.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] bg-zinc-50/50">
                       <Activity className="h-16 w-16 text-zinc-100 mx-auto mb-4" />
                       <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Aún no se han registrado pesajes de control</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {followUps.map(fu => (
                          <div key={fu.id} className="group relative bg-white border border-zinc-100 p-6 rounded-[2rem] hover:shadow-2xl transition-all duration-500 hover:border-zinc-200">
                             <div className="flex items-center gap-8">
                                <div className="text-center w-20 shrink-0">
                                   <p className="text-[10px] font-black text-zinc-400 uppercase leading-none mb-1 font-mono">{format(new Date(fu.date), 'MMM', { locale: es })}</p>
                                   <p className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{format(new Date(fu.date), 'dd')}</p>
                                   <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">{format(new Date(fu.date), 'yyyy')}</p>
                                </div>
                                
                                <div className="flex-1 flex items-center justify-between">
                                   <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                         <p className="text-2xl font-black text-zinc-900 tracking-tighter">{fu.weight} <span className="text-[10px] font-black uppercase text-zinc-400">kg</span></p>
                                         <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border", 
                                           fu.adherence === 'excellent' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                                           fu.adherence === 'good' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-500'
                                         )}>{fu.adherence || 'No indicado'}</span>
                                      </div>
                                      <p className="text-sm font-semibold text-zinc-500 line-clamp-1">{fu.notes || 'Sin observaciones descriptivas.'}</p>
                                   </div>
                                   
                                   <div className="flex items-center gap-2">
                                      {fu.symptoms.length > 0 && <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-100 text-[8px] font-black uppercase h-5 px-2">{fu.symptoms.length} Síntoma/s</Badge>}
                                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-20 group-hover:opacity-100 transition-opacity" onClick={() => { setSelectedFollowUpId(fu.id); setIsAddingFollowUp(true); }}>
                                         <Edit className="h-4 w-4" />
                                      </Button>
                                   </div>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </TabsContent>

        {/* ── PAYMENTS TAB ── */}
        <TabsContent value="payments" className="space-y-6 outline-none">
           <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden border border-zinc-100">
              <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 bg-zinc-50/50 px-10 py-7">
                 <div>
                   <CardTitle className="text-base font-black uppercase tracking-widest text-zinc-900 flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-zinc-900" /> Historial de Cobros
                   </CardTitle>
                   <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-tighter">Facturación y estados de cobro por servicios nutricionales</p>
                 </div>
                 <Button onClick={() => setIsAddingPayment(true)} className="bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-8 shadow-2xl active:scale-95 transition-all">
                   <Plus className="h-4 w-4 mr-2" /> Nuevo Cobro
                 </Button>
              </CardHeader>
              <CardContent className="p-0">
                 {payments.length === 0 ? (
                   <div className="py-24 text-center px-6">
                      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-100 shadow-inner">
                        <DollarSign className="h-8 w-8 text-zinc-200" />
                      </div>
                      <h3 className="text-sm font-black text-zinc-900 uppercase">Sin movimientos registrados</h3>
                      <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-tighter max-w-xs mx-auto">Emití órdenes de cobro por transferencia, efectivo o plataformas digitales.</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-zinc-50">
                      {payments.map(payment => (
                        <div key={payment.id} className="grid grid-cols-12 px-10 py-6 hover:bg-zinc-50/70 transition-all group">
                           <div className="col-span-4 flex items-center gap-5">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border", 
                                payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.1)]' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                              )}>
                                 {payment.status === 'paid' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-black text-zinc-900 leading-tight truncate">{payment.description}</p>
                                 <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> {format(new Date(payment.created_at), 'dd MMM, yyyy', { locale: es })}
                                 </p>
                              </div>
                           </div>
                           <div className="col-span-3 flex flex-col justify-center pl-4">
                              <p className="text-lg font-black text-zinc-900 tracking-tighter">${payment.amount.toLocaleString('es-AR')}</p>
                              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest font-mono">{payment.method}</p>
                           </div>
                           <div className="col-span-3 flex items-center">
                              <span className={cn("px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm", 
                                payment.status === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700')}>
                                {payment.status === 'paid' ? 'Recibido' : 'Pendiente'}
                              </span>
                           </div>
                           <div className="col-span-2 flex justify-end items-center gap-3">
                              {payment.status !== 'paid' && (
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 rounded-xl" title="Enviar enlace de pago"><ExternalLink className="h-4 w-4" /></Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" onClick={() => deletePayment(payment.id)}><Trash2 className="h-4 w-4" /></Button>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* ── SHEETS ── */}
      
      {/* Editar Paciente */}
      <Sheet open={isEditingPatient} onOpenChange={setIsEditingPatient}>
        <SheetContent className="sm:max-w-[450px] p-0 overflow-hidden border-l border-zinc-100 shadow-2xl flex flex-col">
          <SheetHeader className="p-8 border-b border-zinc-50 bg-zinc-50/50 shrink-0 text-left">
            <SheetTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">Perfil Maestro</SheetTitle>
            <SheetDescription className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest mt-1">
              Información estructural del paciente
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8">
            <PatientForm 
              initialId={id} 
              onSuccess={onEditSuccess} 
              onCancel={() => setIsEditingPatient(false)} 
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Agregar/Editar Seguimiento */}
      <Sheet open={isAddingFollowUp} onOpenChange={(v) => { setIsAddingFollowUp(v); if(!v) setSelectedFollowUpId(null); }}>
        <SheetContent className="sm:max-w-[450px] p-0 overflow-hidden border-l border-zinc-100 shadow-2xl flex flex-col">
          <SheetHeader className="p-8 border-b border-zinc-50 bg-zinc-50/50 shrink-0 text-left">
            <SheetTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">{selectedFollowUpId ? 'Editar Control' : 'Ficha de Control'}</SheetTitle>
            <SheetDescription className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest mt-1">
              Registro del progreso clínico y antropométrico
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8">
            <FollowUpForm 
              initialPatientId={id}
              initialId={selectedFollowUpId || undefined}
              onSuccess={() => { setIsAddingFollowUp(false); setSelectedFollowUpId(null); if(id) fetchFollowUpsByPatient(id); }}
              onCancel={() => { setIsAddingFollowUp(false); setSelectedFollowUpId(null); }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Agregar Pago */}
      <Sheet open={isAddingPayment} onOpenChange={setIsAddingPayment}>
        <SheetContent className="sm:max-w-[450px] p-0 overflow-hidden border-l border-zinc-100 shadow-2xl flex flex-col">
          <SheetHeader className="p-8 border-b border-zinc-50 bg-zinc-50/50 shrink-0 text-left">
            <SheetTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">Orden de Cobro</SheetTitle>
            <SheetDescription className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest mt-1">
              Emitir nueva boleta de cargo o registrar pago
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8">
            <PaymentForm 
              initialPatientId={id}
              onSuccess={() => { setIsAddingPayment(false); if(id) fetchPaymentsByPatient(id); }}
              onCancel={() => setIsAddingPayment(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}

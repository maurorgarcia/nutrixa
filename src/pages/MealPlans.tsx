import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { usePatientStore } from '@/stores/patientStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Check, 
  Loader2, 
  ChevronRight, 
  Download, 
  FileText, 
  Zap,
  AlertTriangle,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MealPlan } from '@/types';
import { exportMealPlanToPDF } from '@/utils/pdfExport';
import { cn } from '@/lib/utils';

export function MealPlans() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mealPlans, loading, fetchMealPlans, deleteMealPlan, activateMealPlan } = useMealPlanStore();
  const { patients } = usePatientStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<MealPlan | null>(null);

  useEffect(() => {
    if (user) {
      fetchMealPlans(user.id);
    }
  }, [user]);

  const handleDelete = async () => {
    if (planToDelete) {
      await deleteMealPlan(planToDelete.id);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.nombre_completo : 'Paciente';
  };

  const handleExport = (plan: MealPlan) => {
    const patient = patients.find(p => p.id === plan.patient_id);
    if (patient) {
      exportMealPlanToPDF(patient, plan);
    }
  };

  if (loading && mealPlans.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
      </div>
    );
  }

  return (
    <div className="clinical-page space-y-6 max-w-full">
      
      {/* ── HEADER (Standard Pattern) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-senralis-main" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Directorio de Tratamientos</p>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Protocolos Clínicos</h1>
          <p className="text-sm font-bold text-slate-500 opacity-80">{mealPlans.length} planes operativos activos</p>
        </div>
        <Button
          onClick={() => navigate('/meal-plans/new')}
          className="h-10 px-4 rounded-xl bg-senralis-main text-white font-bold text-xs uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Protocolo
        </Button>
      </div>

      {/* ── PLANS LIST (Compact Table Style) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {mealPlans.length === 0 ? (
          <div className="p-20 text-center">
             <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin protocolos registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {mealPlans.map((plan) => (
              <div 
                key={plan.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
                onClick={() => navigate(`/meal-plans/${plan.id}`)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                    plan.is_active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 border border-slate-100"
                  )}>
                    <Zap className={cn("w-4 h-4", plan.is_active ? "text-senralis-soft" : "text-slate-300")} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 truncate mb-1">{plan.name}</h3>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                          <Users className="w-3 h-3" /> {getPatientName(plan.patient_id)}
                       </p>
                       <span className="h-1 w-1 rounded-full bg-slate-200" />
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] font-black tracking-widest border-slate-100">{plan.daily_calories} KCAL</Badge>
                          <Badge variant="outline" className="text-[8px] font-black tracking-widest border-slate-100">P: {plan.macros.protein}G</Badge>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   {plan.is_active && (
                     <Badge className="hidden sm:flex bg-senralis-main text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Certificado</Badge>
                   )}
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-slate-900 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl">
                         <DropdownMenuItem onClick={() => navigate(`/meal-plans/${plan.id}`)} className="text-xs font-bold py-2.5">Editar Plan</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleExport(plan)} className="text-xs font-bold py-2.5">Exportar PDF</DropdownMenuItem>
                         {!plan.is_active && (
                           <DropdownMenuItem onClick={() => activateMealPlan(plan.id)} className="text-xs font-bold py-2.5 text-senralis-main">Activar</DropdownMenuItem>
                         )}
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                           className="text-xs font-bold py-2.5 text-rose-500"
                           onClick={(e) => {
                             e.stopPropagation();
                             setPlanToDelete(plan);
                             setDeleteDialogOpen(true);
                           }}
                         >
                           Eliminar
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                   <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-senralis-main transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-100 p-8 shadow-2xl">
          <AlertDialogHeader>
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
               <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-lg font-black text-slate-900 tracking-tight uppercase">¿Dar de baja protocolo?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-slate-400 leading-relaxed mb-4">
              Esta acción eliminará definitivamente el plan de intervención. El paciente dejará de tener acceso de forma inmediata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-100 h-10 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-600 text-white h-10 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-rose-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

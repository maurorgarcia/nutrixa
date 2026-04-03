import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
  Calendar,
  Check,
  Loader2,
  ChevronRight,
  Download,
  Utensils
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
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente no encontrado';
  };

  const handleExport = (plan: MealPlan) => {
    const patient = patients.find(p => p.id === plan.patient_id);
    if (patient) {
      exportMealPlanToPDF(patient, plan);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-zinc-100">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Planes Nutricionales</h1>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Estrategias de dietoterapia y prescripción calórica</p>
        </div>
        <Button onClick={() => navigate('/meal-plans/new')} className="h-12 px-8 rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
          <Plus className="h-4 w-4" /> Nuevo Plan Maestro
        </Button>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-200" />
        </div>
      ) : mealPlans.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-zinc-100 shadow-sm">
           <Utensils className="h-16 w-16 text-zinc-100 mx-auto mb-6" />
           <h3 className="text-xl font-black text-zinc-900 tracking-tighter uppercase mb-2">Sin prescripciones activas</h3>
           <p className="text-zinc-400 max-w-xs mx-auto text-xs font-bold uppercase tracking-widest mb-10">Comenzá diseñando un plan basado en los requerimientos de la anamnesis.</p>
           <Button onClick={() => navigate('/meal-plans/new')} className="bg-zinc-900 text-white font-black uppercase tracking-widest h-12 px-10 rounded-2xl text-[10px] shadow-xl">
             Crear Primer Plan
           </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <Card key={plan.id} className={cn(
              "group border-zinc-100 shadow-sm rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col bg-white relative",
              plan.is_active && "ring-2 ring-emerald-500/20 border-emerald-100"
            )}>
              {plan.is_active && (
                <div className="absolute top-6 right-6 z-10">
                   <Badge className="bg-emerald-900 text-emerald-400 border-none text-[8px] font-black uppercase tracking-widest px-2.5 h-6 rounded-lg shadow-xl">Activo</Badge>
                </div>
              )}
              <CardHeader className="p-8 pb-3">
                 <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
                       <Calendar className="h-3 w-3" /> {format(new Date(plan.start_date), "dd MMM yyyy", { locale: es })}
                    </p>
                    <CardTitle className="text-2xl font-black tracking-tighter leading-tight text-zinc-900 group-hover:text-emerald-700 transition-colors cursor-pointer" onClick={() => navigate(`/meal-plans/${plan.id}`)}>
                       {plan.name}
                    </CardTitle>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter mt-1">
                       {getPatientName(plan.patient_id)}
                    </p>
                 </div>
              </CardHeader>

              <CardContent className="p-8 pt-0 flex-1 flex flex-col">
                 <div className="grid grid-cols-3 gap-3 py-6 my-4 border-y border-zinc-50">
                    <div className="text-center">
                       <p className="text-[9px] font-black text-zinc-300 uppercase mb-1">Calorías</p>
                       <p className="text-lg font-black text-zinc-900">{plan.daily_calories}</p>
                    </div>
                    <div className="text-center col-span-2">
                       <p className="text-[9px] font-black text-zinc-300 uppercase mb-1">Macros (P/C/G)</p>
                       <p className="text-lg font-black text-zinc-900">{plan.macros.protein}/{plan.macros.carbs}/{plan.macros.fats}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 rounded-2xl font-black uppercase text-[9px] tracking-widest border-zinc-200 hover:bg-zinc-50 shadow-sm"
                      onClick={() => navigate(`/meal-plans/${plan.id}`)}
                    >
                      Abrir Ficha <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-12 w-12 rounded-2xl border border-zinc-100 hover:bg-zinc-50 flex items-center justify-center p-0">
                             <MoreVertical className="h-4 w-4 text-zinc-400" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-zinc-100 shadow-2xl">
                          {!plan.is_active && (
                            <DropdownMenuItem onClick={() => activateMealPlan(plan.id)} className="h-11 rounded-xl text-emerald-600 font-bold focus:bg-emerald-50">
                               <Check className="h-4 w-4 mr-3" /> Establecer Activo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleExport(plan)} className="h-11 rounded-xl font-bold">
                             <Download className="h-4 w-4 mr-3" /> Exportar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/meal-plans/${plan.id}`)} className="h-11 rounded-xl font-bold">
                             <Edit className="h-4 w-4 mr-3" /> Editar Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="h-11 rounded-xl text-red-600 font-bold focus:bg-red-50 focus:text-red-700"
                            onClick={() => {
                              setPlanToDelete(plan);
                              setDeleteDialogOpen(true);
                            }}
                          >
                             <Trash2 className="h-4 w-4 mr-3" /> Eliminar Permanentemente
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none p-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">¿Eliminar plan?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500 font-medium text-base">
              Estas a punto de eliminar el plan <strong>{planToDelete?.name}</strong>. Esta acción no se puede deshacer y el paciente perderá el acceso a esta prescripción.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest border-zinc-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl">
              Eliminar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

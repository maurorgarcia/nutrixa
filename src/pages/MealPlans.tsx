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
  Flame,
  Users,
  Check,
  Loader2,
  ChevronRight,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MealPlan } from '@/types';
import { exportMealPlanToPDF } from '@/utils/pdfExport';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planes de Alimentación</h1>
          <p className="text-gray-500 mt-1">Gestiona los planes nutricionales de tus pacientes</p>
        </div>
        <Button onClick={() => navigate('/meal-plans/new')} className="bg-black hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Plan
        </Button>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : mealPlans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay planes registrados</h3>
            <p className="text-gray-500 mb-4">Crea tu primer plan de alimentación</p>
            <Button onClick={() => navigate('/meal-plans/new')} className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Crear Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mealPlans.map((plan) => (
            <Card key={plan.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-semibold">
                        {plan.name}
                      </CardTitle>
                      {plan.is_active && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {getPatientName(plan.patient_id)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!plan.is_active && (
                        <DropdownMenuItem onClick={() => activateMealPlan(plan.id)}>
                          <Check className="h-4 w-4 mr-2" />
                          Activar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate(`/meal-plans/${plan.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(plan)}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setPlanToDelete(plan);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    <span>{plan.daily_calories} kcal/día</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(plan.start_date), "d MMM", { locale: es })}
                      {plan.end_date && ` - ${format(new Date(plan.end_date), "d MMM", { locale: es })}`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary">P: {plan.macros.protein}%</Badge>
                  <Badge variant="secondary">C: {plan.macros.carbs}%</Badge>
                  <Badge variant="secondary">G: {plan.macros.fats}%</Badge>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/meal-plans/${plan.id}`)}
                >
                  Ver plan
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el plan <strong>{planToDelete?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

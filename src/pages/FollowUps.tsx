import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  TrendingUp,
  Weight,
  ChevronRight,
  Loader2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { FollowUp } from '@/types';
import { exportFollowUpToPDF } from '@/utils/pdfExport';

const adherenceLabels = {
  excellent: { label: 'Excelente', color: 'bg-green-100 text-green-800' },
  good: { label: 'Buena', color: 'bg-blue-100 text-blue-800' },
  fair: { label: 'Regular', color: 'bg-yellow-100 text-yellow-800' },
  poor: { label: 'Deficiente', color: 'bg-red-100 text-red-800' },
};

export function FollowUps() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { followUpsWithPatient, loading, fetchFollowUps, deleteFollowUp } = useFollowUpStore();
  const { patients } = usePatientStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [followUpToDelete, setFollowUpToDelete] = useState<FollowUp | null>(null);

  useEffect(() => {
    if (user) {
      fetchFollowUps(user.id);
    }
  }, [user]);

  const handleDelete = async () => {
    if (followUpToDelete) {
      await deleteFollowUp(followUpToDelete.id);
      setDeleteDialogOpen(false);
      setFollowUpToDelete(null);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Paciente no encontrado';
  };

  const getInitials = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return '?';
    return `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();
  };

  const handleExport = (followUp: FollowUp) => {
    const patient = patients.find(p => p.id === followUp.patient_id);
    if (patient) {
      const patientFollowUps = followUpsWithPatient
        .filter(fu => fu.patient_id === patient.id)
        .map(fu => fu as FollowUp);
      exportFollowUpToPDF(patient, patientFollowUps);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento</h1>
          <p className="text-gray-500 mt-1">Registra y visualiza el progreso de tus pacientes</p>
        </div>
        <Button onClick={() => navigate('/follow-ups/new')} className="bg-black hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Control
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total controles</p>
                <p className="text-2xl font-bold">{followUpsWithPatient.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Citas esta semana</p>
                <p className="text-2xl font-bold">
                  {followUpsWithPatient.filter(fu => {
                    if (!fu.next_appointment) return false;
                    const nextDate = new Date(fu.next_appointment);
                    const today = new Date();
                    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return nextDate >= today && nextDate <= nextWeek;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Weight className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pacientes con seguimiento</p>
                <p className="text-2xl font-bold">
                  {new Set(followUpsWithPatient.map(fu => fu.patient_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow Ups List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : followUpsWithPatient.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay controles registrados</h3>
            <p className="text-gray-500 mb-4">Comienza registrando el primer seguimiento</p>
            <Button onClick={() => navigate('/follow-ups/new')} className="bg-black hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Control
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {followUpsWithPatient.map((followUp) => (
            <Card key={followUp.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {getInitials(followUp.patient_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getPatientName(followUp.patient_id)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(followUp.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg font-bold">{followUp.weight} kg</span>
                        {followUp.adherence && (
                          <Badge 
                            variant="secondary" 
                            className={adherenceLabels[followUp.adherence].color}
                          >
                            {adherenceLabels[followUp.adherence].label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {followUp.next_appointment && (
                      <div className="text-right mr-4 hidden sm:block">
                        <p className="text-sm text-gray-500">Próxima cita</p>
                        <p className="font-medium">
                          {format(new Date(followUp.next_appointment), "d MMM", { locale: es })}
                        </p>
                      </div>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/follow-ups/${followUp.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport(followUp)}>
                          <Download className="h-4 w-4 mr-2" />
                          Exportar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setFollowUpToDelete(followUp);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {(followUp.symptoms?.length > 0 || followUp.concerns?.length > 0 || followUp.notes) && (
                  <div className="mt-4 pt-4 border-t">
                    {followUp.symptoms?.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Síntomas: </span>
                        <span className="text-sm">{followUp.symptoms.join(', ')}</span>
                      </div>
                    )}
                    {followUp.concerns?.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Inquietudes: </span>
                        <span className="text-sm">{followUp.concerns.join(', ')}</span>
                      </div>
                    )}
                    {followUp.notes && (
                      <div>
                        <span className="text-sm text-gray-500">Notas: </span>
                        <span className="text-sm">{followUp.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar control?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro de seguimiento. Esta acción no se puede deshacer.
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

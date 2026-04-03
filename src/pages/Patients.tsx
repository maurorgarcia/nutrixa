import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar,
  TrendingUp,
  Utensils,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { calculateAge } from '@/utils/calculations';
import type { PatientWithAge } from '@/types';

export function Patients() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { patients, loading, fetchPatients, deletePatient, setSearchQuery, filteredPatients } = usePatientStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<PatientWithAge | null>(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (user) {
      fetchPatients(user.id);
    }
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const handleDelete = async () => {
    if (patientToDelete) {
      await deletePatient(patientToDelete.id);
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStressLevelBadge = (level: string | null) => {
    if (!level) return null;
    
    const configs = {
      low: { label: 'Bajo', className: 'bg-green-100 text-green-800' },
      moderate: { label: 'Moderado', className: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Alto', className: 'bg-red-100 text-red-800' },
    };
    
    const config = configs[level as keyof typeof configs];
    if (!config) return null;
    
    return <Badge variant="secondary" className={config.className}>{config.label}</Badge>;
  };

  const displayedPatients = filteredPatients();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 mt-1">Gestiona tus pacientes y su información</p>
        </div>
        <Button onClick={() => navigate('/patients/new')} className="bg-black hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {displayedPatients.length} {displayedPatients.length === 1 ? 'paciente' : 'pacientes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : displayedPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchValue ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchValue 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza agregando tu primer paciente'}
              </p>
              {!searchValue && (
                <Button onClick={() => navigate('/patients/new')} className="bg-black hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Paciente
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayedPatients.map((patient) => (
                <div 
                  key={patient.id}
                  className="flex items-center justify-between py-4 group"
                >
                  <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {getInitials(patient.first_name, patient.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        {getStressLevelBadge(patient.stress_level)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{patient.age} años</span>
                        <span>•</span>
                        <span>{patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}</span>
                        {patient.email && (
                          <>
                            <span>•</span>
                            <span>{patient.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/patients/${patient.id}/anamnesis`)}
                      className="hidden sm:flex"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Anamnesis
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/patients/${patient.id}/meal-plans`)}
                      className="hidden sm:flex"
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      Plan
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}`)}>
                          <ChevronRight className="h-4 w-4 mr-2" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}/anamnesis`)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Anamnesis
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}/meal-plans`)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Plan de alimentación
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}/follow-ups`)}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Seguimiento
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setPatientToDelete(patient);
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a <strong>{patientToDelete?.first_name} {patientToDelete?.last_name}</strong> y todos sus datos asociados (anamnesis, planes, seguimientos). Esta acción no se puede deshacer.
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

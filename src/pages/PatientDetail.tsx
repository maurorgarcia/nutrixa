import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePatientStore } from '@/stores/patientStore';
import { useAnamnesisStore } from '@/stores/anamnesisStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Utensils,
  Plus,
  Download,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Activity
} from 'lucide-react';
import { calculateAge, getBMICategory } from '@/utils/calculations';
import { exportAnamnesisToPDF } from '@/utils/pdfExport';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedPatient, getPatientById, loading: patientLoading } = usePatientStore();
  const { anamnesisList, fetchAnamnesisByPatient, selectedAnamnesis } = useAnamnesisStore();
  const { mealPlans, fetchMealPlansByPatient } = useMealPlanStore();
  const { followUps, fetchFollowUpsByPatient } = useFollowUpStore();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      getPatientById(id);
      fetchAnamnesisByPatient(id);
      fetchMealPlansByPatient(id);
      fetchFollowUpsByPatient(id);
    }
  }, [id]);

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

  const handleExportAnamnesis = () => {
    if (selectedPatient && selectedAnamnesis) {
      exportAnamnesisToPDF(selectedPatient, selectedAnamnesis);
    }
  };

  if (patientLoading || !selectedPatient) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const latestAnamnesis = anamnesisList[0];
  const activeMealPlan = mealPlans.find(mp => mp.is_active);
  const latestFollowUp = followUps[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-black text-white text-xl">
                {getInitials(selectedPatient.first_name, selectedPatient.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-500">
                  {calculateAge(selectedPatient.birth_date)} años • {' '}
                  {selectedPatient.gender === 'male' ? 'Masculino' : selectedPatient.gender === 'female' ? 'Femenino' : 'Otro'}
                </span>
                {getStressLevelBadge(selectedPatient.stress_level)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/patients/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="anamnesis">Anamnesis</TabsTrigger>
          <TabsTrigger value="meal-plans">Planes</TabsTrigger>
          <TabsTrigger value="follow-ups">Seguimiento</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedPatient.email && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedPatient.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {selectedPatient.phone && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium text-gray-900">{selectedPatient.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {selectedPatient.occupation && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ocupación</p>
                      <p className="font-medium text-gray-900">{selectedPatient.occupation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {selectedPatient.work_schedule && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium text-gray-900">{selectedPatient.work_schedule}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Anamnesis Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Anamnesis
                </CardTitle>
                {latestAnamnesis && (
                  <Button variant="ghost" size="sm" onClick={handleExportAnamnesis}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {latestAnamnesis ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{latestAnamnesis.anthropometric_data.weight}</p>
                        <p className="text-xs text-gray-500">kg</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{latestAnamnesis.anthropometric_data.height}</p>
                        <p className="text-xs text-gray-500">cm</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{latestAnamnesis.anthropometric_data.bmi}</p>
                        <p className="text-xs text-gray-500">IMC</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('anamnesis')}
                    >
                      Ver completo
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No hay anamnesis registrada</p>
                    <Button onClick={() => navigate(`/patients/${id}/anamnesis/new`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear anamnesis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meal Plan Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Plan Activo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeMealPlan ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">{activeMealPlan.name}</p>
                      <p className="text-sm text-gray-500">{activeMealPlan.daily_calories} kcal/día</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">P: {activeMealPlan.macros.protein}%</Badge>
                      <Badge variant="secondary">C: {activeMealPlan.macros.carbs}%</Badge>
                      <Badge variant="secondary">G: {activeMealPlan.macros.fats}%</Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('meal-plans')}
                    >
                      Ver plan
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No hay plan activo</p>
                    <Button onClick={() => navigate(`/patients/${id}/meal-plans/new`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow Up Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Último Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestFollowUp ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold">{latestFollowUp.weight} kg</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(latestFollowUp.date), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    {latestFollowUp.adherence && (
                      <Badge variant="secondary">
                        Adherencia: {latestFollowUp.adherence === 'excellent' ? 'Excelente' : 
                                    latestFollowUp.adherence === 'good' ? 'Buena' : 
                                    latestFollowUp.adherence === 'fair' ? 'Regular' : 'Deficiente'}
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('follow-ups')}
                    >
                      Ver historial
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No hay controles registrados</p>
                    <Button onClick={() => navigate(`/patients/${id}/follow-ups/new`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar control
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Anamnesis Tab */}
        <TabsContent value="anamnesis">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Anamnesis Nutricional</CardTitle>
              <div className="flex gap-2">
                {latestAnamnesis && (
                  <Button variant="outline" onClick={handleExportAnamnesis}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                )}
                <Button onClick={() => navigate(`/patients/${id}/anamnesis/new`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {latestAnamnesis ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {latestAnamnesis ? (
                <div className="space-y-8">
                  {/* Anthropometric Data */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Datos Antropométricos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Peso</p>
                        <p className="text-2xl font-bold">{latestAnamnesis.anthropometric_data.weight} <span className="text-sm font-normal">kg</span></p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Altura</p>
                        <p className="text-2xl font-bold">{latestAnamnesis.anthropometric_data.height} <span className="text-sm font-normal">cm</span></p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">IMC</p>
                        <p className="text-2xl font-bold">{latestAnamnesis.anthropometric_data.bmi}</p>
                        <p className="text-xs text-gray-500">{getBMICategory(latestAnamnesis.anthropometric_data.bmi).label}</p>
                      </div>
                      {latestAnamnesis.anthropometric_data.body_fat_percentage && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">% Grasa</p>
                          <p className="text-2xl font-bold">{latestAnamnesis.anthropometric_data.body_fat_percentage}%</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Consultation Reason */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Motivo de Consulta</h3>
                    <p className="text-gray-700">{latestAnamnesis.consultation_reason || 'No especificado'}</p>
                  </div>

                  {/* Diseases */}
                  {latestAnamnesis.diseases?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Enfermedades</h3>
                      <div className="flex flex-wrap gap-2">
                        {latestAnamnesis.diseases.map((disease, index) => (
                          <Badge key={index} variant="secondary">{disease}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {latestAnamnesis.medications?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Medicación</h3>
                      <ul className="space-y-2">
                        {latestAnamnesis.medications.map((med, index) => (
                          <li key={index} className="text-gray-700">
                            • {med.name} {med.dosage && `- ${med.dosage}`} {med.frequency && `(${med.frequency})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Eating Habits */}
                  {latestAnamnesis.eating_habits && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Hábitos Alimentarios</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {latestAnamnesis.eating_habits.meal_frequency && (
                          <div>
                            <p className="text-sm text-gray-500">Comidas por día</p>
                            <p className="font-medium">{latestAnamnesis.eating_habits.meal_frequency}</p>
                          </div>
                        )}
                        {latestAnamnesis.eating_habits.allergies?.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Alergias</p>
                            <p className="font-medium">{latestAnamnesis.eating_habits.allergies.join(', ')}</p>
                          </div>
                        )}
                        {latestAnamnesis.eating_habits.intolerances?.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Intolerancias</p>
                            <p className="font-medium">{latestAnamnesis.eating_habits.intolerances.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay anamnesis registrada</h3>
                  <p className="text-gray-500 mb-4">Crea una anamnesis para comenzar el seguimiento nutricional</p>
                  <Button onClick={() => navigate(`/patients/${id}/anamnesis/new`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Anamnesis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meal Plans Tab */}
        <TabsContent value="meal-plans">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Planes de Alimentación</CardTitle>
              <Button onClick={() => navigate(`/patients/${id}/meal-plans/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plan
              </Button>
            </CardHeader>
            <CardContent>
              {mealPlans.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay planes registrados</h3>
                  <p className="text-gray-500 mb-4">Crea un plan de alimentación personalizado</p>
                  <Button onClick={() => navigate(`/patients/${id}/meal-plans/new`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mealPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/patients/${id}/meal-plans/${plan.id}`)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{plan.name}</p>
                          {plan.is_active && <Badge>Activo</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">
                          {plan.daily_calories} kcal/día • P:{plan.macros.protein}% C:{plan.macros.carbs}% G:{plan.macros.fats}%
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver detalle
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Follow Ups Tab */}
        <TabsContent value="follow-ups">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Seguimiento</CardTitle>
              <Button onClick={() => navigate(`/patients/${id}/follow-ups/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Control
              </Button>
            </CardHeader>
            <CardContent>
              {followUps.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay controles registrados</h3>
                  <p className="text-gray-500 mb-4">Registra el progreso de tu paciente</p>
                  <Button onClick={() => navigate(`/patients/${id}/follow-ups/new`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Control
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {followUps.map((followUp) => (
                    <div 
                      key={followUp.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/patients/${id}/follow-ups/${followUp.id}`)}
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(followUp.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        <p className="text-sm text-gray-500">
                          Peso: {followUp.weight} kg {followUp.adherence && `• Adherencia: ${followUp.adherence}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver detalle
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

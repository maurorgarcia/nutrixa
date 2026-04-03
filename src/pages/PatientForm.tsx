import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatientFormData } from '@/types';

const initialFormData: PatientFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  birth_date: '',
  gender: 'male',
  occupation: '',
  work_schedule: '',
  stress_level: '',
};

interface PatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialId?: string;
}

export function PatientForm({ onSuccess, onCancel, initialId }: PatientFormProps) {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = initialId || routeId;
  const { user } = useAuthStore();
  const { selectedPatient, createPatient, updatePatient, getPatientById, loading } = usePatientStore();
  
  const isEditing = Boolean(id);
  const isInsideSheet = Boolean(onSuccess);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);

  useEffect(() => {
    if (isEditing && id) {
      getPatientById(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing && selectedPatient) {
      setFormData({
        first_name: selectedPatient.first_name,
        last_name: selectedPatient.last_name,
        email: selectedPatient.email || '',
        phone: selectedPatient.phone || '',
        birth_date: selectedPatient.birth_date,
        gender: selectedPatient.gender,
        occupation: selectedPatient.occupation || '',
        work_schedule: selectedPatient.work_schedule || '',
        stress_level: selectedPatient.stress_level || '',
      });
    }
  }, [selectedPatient, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    
    try {
      const dataToSave = {
        ...formData,
        stress_level: (formData.stress_level as string) === 'unspecified' ? '' : formData.stress_level
      };

      if (isEditing && id) {
        await updatePatient(id, dataToSave as PatientFormData);
      } else {
        await createPatient(user.id, dataToSave as PatientFormData);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/patients');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/patients');
    }
  };

  if (isEditing && loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", isInsideSheet && "pb-20")}>
      {/* Header - Only show if not inside sheet */}
      {!isInsideSheet && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-nutri-forest">
              {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditing 
                ? 'Actualiza la información del paciente' 
                : 'Completa los datos para registrar un nuevo paciente'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn("grid grid-cols-1 gap-6", !isInsideSheet && "lg:grid-cols-2")}>
          {/* Personal Information */}
          <Card className={isInsideSheet ? "border-0 shadow-none bg-transparent" : ""}>
            {!isInsideSheet && (
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Información Personal</CardTitle>
              </CardHeader>
            )}
            <CardContent className={cn("space-y-4", isInsideSheet && "p-0")}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                    placeholder="Juan"
                    className="h-10 border-zinc-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                    placeholder="Pérez"
                    className="h-10 border-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="paciente@email.com"
                  className="h-10 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+54 11 1234-5678"
                  className="h-10 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Fecha de nacimiento *</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleChange('birth_date', e.target.value)}
                  required
                  className="h-10 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Sexo *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleChange('gender', value as 'male' | 'female' | 'other')}
                  className="flex gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer text-sm">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer text-sm">Femenino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer text-sm">Otro</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className={isInsideSheet ? "border-0 shadow-none bg-transparent" : ""}>
            {!isInsideSheet && (
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Información Adicional</CardTitle>
              </CardHeader>
            )}
            <CardContent className={cn("space-y-4", isInsideSheet && "p-0")}>
              <div className="space-y-2">
                <Label htmlFor="occupation">Ocupación</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="Ej: Ingeniero, Estudiante..."
                  className="h-10 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_schedule">Horario de trabajo</Label>
                <Input
                  id="work_schedule"
                  value={formData.work_schedule}
                  onChange={(e) => handleChange('work_schedule', e.target.value)}
                  placeholder="Ej: 9:00 - 18:00, turno rotativo..."
                  className="h-10 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stress_level">Nivel de estrés</Label>
                <Select
                  value={formData.stress_level}
                  onValueChange={(value) => handleChange('stress_level', value)}
                >
                  <SelectTrigger className="h-10 border-zinc-200">
                    <SelectValue placeholder="Seleccionar nivel de estrés" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unspecified">No especificado</SelectItem>
                    <SelectItem value="low">Bajo</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions - Stick to bottom in Sheet, or normal in Page */}
        <div className={cn(
          "flex justify-end gap-3",
          isInsideSheet 
            ? "fixed bottom-0 right-0 left-0 p-6 bg-white border-t border-zinc-100 z-10 sm:left-auto sm:w-[450px]" 
            : "mt-6"
        )}>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancelClick}
            className="font-semibold text-zinc-500"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-10 px-6 rounded-xl"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Guardar cambios' : 'Crear paciente'}
          </Button>
        </div>
      </form>
    </div>
  );
}

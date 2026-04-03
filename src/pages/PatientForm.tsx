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

export function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { selectedPatient, createPatient, updatePatient, getPatientById, loading } = usePatientStore();
  
  const isEditing = Boolean(id);
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
      navigate('/patients');
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing && loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing 
              ? 'Actualiza la información del paciente' 
              : 'Completa los datos para registrar un nuevo paciente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                    placeholder="Juan"
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
                />
              </div>

              <div className="space-y-2">
                <Label>Sexo *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleChange('gender', value as 'male' | 'female' | 'other')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Femenino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">Otro</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Ocupación</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="Ej: Ingeniero, Estudiante..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_schedule">Horario de trabajo</Label>
                <Input
                  id="work_schedule"
                  value={formData.work_schedule}
                  onChange={(e) => handleChange('work_schedule', e.target.value)}
                  placeholder="Ej: 9:00 - 18:00, turno rotativo..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stress_level">Nivel de estrés</Label>
                <Select
                  value={formData.stress_level}
                  onValueChange={(value) => handleChange('stress_level', value)}
                >
                  <SelectTrigger>
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

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/patients')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-black hover:bg-gray-800"
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

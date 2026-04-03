import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Save, X } from 'lucide-react';

interface FollowUpFormData {
  patient_id: string;
  date: string;
  weight: string;
  notes: string;
  adherence: string;
  symptoms: string[];
  concerns: string[];
  next_appointment: string;
}

const initialFormData: FollowUpFormData = {
  patient_id: '',
  date: new Date().toISOString().split('T')[0],
  weight: '',
  notes: '',
  adherence: '',
  symptoms: [],
  concerns: [],
  next_appointment: '',
};

export function FollowUpForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { selectedFollowUp, createFollowUp, updateFollowUp, getFollowUpById, loading } = useFollowUpStore();
  const { patients, fetchPatients } = usePatientStore();
  
  const isEditing = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FollowUpFormData>(initialFormData);
  const [newSymptom, setNewSymptom] = useState('');
  const [newConcern, setNewConcern] = useState('');

  useEffect(() => {
    if (user) {
      fetchPatients(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && id) {
      getFollowUpById(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing && selectedFollowUp) {
      setFormData({
        patient_id: selectedFollowUp.patient_id,
        date: selectedFollowUp.date,
        weight: selectedFollowUp.weight.toString(),
        notes: selectedFollowUp.notes || '',
        adherence: selectedFollowUp.adherence || '',
        symptoms: selectedFollowUp.symptoms || [],
        concerns: selectedFollowUp.concerns || [],
        next_appointment: selectedFollowUp.next_appointment || '',
      });
    }
  }, [selectedFollowUp, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.patient_id) return;

    setSaving(true);
    
    try {
      const dataToSave = {
        date: formData.date,
        weight: parseFloat(formData.weight),
        notes: formData.notes || undefined,
        adherence: ((formData.adherence as string) === 'unspecified' || !formData.adherence) ? undefined : formData.adherence as 'excellent' | 'good' | 'fair' | 'poor',
        symptoms: formData.symptoms,
        concerns: formData.concerns,
        next_appointment: formData.next_appointment || undefined,
      };

      if (isEditing && id) {
        await updateFollowUp(id, dataToSave);
      } else {
        await createFollowUp(user.id, formData.patient_id, dataToSave);
      }
      navigate('/follow-ups');
    } catch (error) {
      console.error('Error saving follow up:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()],
      }));
      setNewSymptom('');
    }
  };

  const removeSymptom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index),
    }));
  };

  const addConcern = () => {
    if (newConcern.trim()) {
      setFormData(prev => ({
        ...prev,
        concerns: [...prev.concerns, newConcern.trim()],
      }));
      setNewConcern('');
    }
  };

  const removeConcern = (index: number) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.filter((_, i) => i !== index),
    }));
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/follow-ups')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-nutri-forest">
            {isEditing ? 'Editar Control' : 'Nuevo Control'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing 
              ? 'Actualiza el registro de seguimiento' 
              : 'Registra el progreso de tu paciente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Información del Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    required
                    placeholder="70.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adherence">Adherencia al plan</Label>
                <Select
                  value={formData.adherence}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, adherence: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unspecified">No especificado</SelectItem>
                    <SelectItem value="excellent">Excelente</SelectItem>
                    <SelectItem value="good">Buena</SelectItem>
                    <SelectItem value="fair">Regular</SelectItem>
                    <SelectItem value="poor">Deficiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_appointment">Próxima cita</Label>
                <Input
                  id="next_appointment"
                  type="date"
                  value={formData.next_appointment}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_appointment: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Symptoms and Concerns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Síntomas e Inquietudes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Symptoms */}
              <div className="space-y-2">
                <Label>Síntomas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar síntoma..."
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSymptom();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSymptom}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-center gap-1 bg-red-50 text-red-700 rounded-full px-3 py-1">
                      <span className="text-sm">{symptom}</span>
                      <button
                        type="button"
                        onClick={() => removeSymptom(index)}
                        className="hover:text-red-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div className="space-y-2">
                <Label>Inquietudes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar inquietud..."
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addConcern();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addConcern}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.concerns.map((concern, index) => (
                    <div key={index} className="flex items-center gap-1 bg-yellow-50 text-nutri-orangeAlt rounded-full px-3 py-1">
                      <span className="text-sm">{concern}</span>
                      <button
                        type="button"
                        onClick={() => removeConcern(index)}
                        className="hover:text-yellow-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observaciones adicionales sobre el paciente..."
                rows={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/follow-ups')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-nutri-forest hover:bg-nutri-emerald"
            disabled={saving || (!isEditing && !formData.patient_id) || !formData.weight}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Guardar cambios' : 'Registrar control'}
          </Button>
        </div>
      </form>
    </div>
  );
}

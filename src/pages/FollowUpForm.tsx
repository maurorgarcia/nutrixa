import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useFollowUpStore } from '@/stores/followUpStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';

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

interface FollowUpFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialId?: string;
  initialPatientId?: string;
}

export function FollowUpForm({ onSuccess, onCancel, initialId, initialPatientId }: FollowUpFormProps) {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = initialId || routeId;
  const { user } = useAuthStore();
  const { selectedFollowUp, createFollowUp, updateFollowUp, getFollowUpById, loading } = useFollowUpStore();
  const { patients, fetchPatients } = usePatientStore();
  
  const isEditing = Boolean(id);
  const isInsideSheet = Boolean(onSuccess);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FollowUpFormData>({ ...initialFormData, patient_id: initialPatientId || '' });
  const [newSymptom, setNewSymptom] = useState('');
  const [newConcern, setNewConcern] = useState('');

  useEffect(() => {
    if (user && !initialPatientId) {
      fetchPatients(user.id);
    }
  }, [user, initialPatientId]);

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
        toast.success('Evolución actualizada correctamente');
      } else {
        await createFollowUp(user.id, formData.patient_id, dataToSave);
        toast.success('Nueva evolución registrada con éxito');
      }

      if (onSuccess) onSuccess();
      else navigate('/follow-ups');
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

  const handleCancelClick = () => {
    if (onCancel) onCancel();
    else navigate('/follow-ups');
  };

  if (isEditing && loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", isInsideSheet && "pb-24")}>
      {!isInsideSheet && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/follow-ups')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isEditing ? 'Editar Control' : 'Nuevo Control'}
            </h1>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn("grid grid-cols-1 gap-6", !isInsideSheet && "lg:grid-cols-2")}>
          <Card className={isInsideSheet ? "border-0 shadow-none bg-transparent" : "border-slate-200"}>
            <CardContent className={cn("space-y-4", isInsideSheet && "p-0")}>
              {!initialPatientId && !isEditing && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Paciente *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, patient_id: value }))}
                    required
                  >
                    <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                      <SelectValue placeholder="Seleccionar paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.nombre_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Fecha *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    className="h-12 border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Peso (kg) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    required
                    placeholder="70.5"
                    className="h-12 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Adherencia</Label>
                <Select
                  value={formData.adherence}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, adherence: value }))}
                >
                  <SelectTrigger className="h-12 border-slate-200 rounded-xl text-sm font-semibold">
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
            </CardContent>
          </Card>

          <Card className={isInsideSheet ? "border-0 shadow-none bg-transparent" : "border-slate-200"}>
            <CardContent className={cn("space-y-4", isInsideSheet && "p-0")}>
               <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Síntomas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar síntoma..."
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSymptom();
                      }
                    }}
                    className="h-10 border-slate-200 rounded-xl"
                  />
                  <Button type="button" variant="outline" onClick={addSymptom} className="rounded-xl h-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-center gap-1 bg-red-50 text-red-700 rounded-lg px-2.5 py-1 border border-red-100">
                      <span className="text-[10px] font-black uppercase tracking-wider">{symptom}</span>
                      <button type="button" onClick={() => removeSymptom(index)} className="hover:text-red-900"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Inquietudes</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar inquietud..."
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addConcern();
                      }
                    }}
                    className="h-10 border-slate-200 rounded-xl"
                  />
                  <Button type="button" variant="outline" onClick={addConcern} className="rounded-xl h-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.concerns.map((concern, index) => (
                    <div key={index} className="flex items-center gap-1 bg-amber-50 text-amber-700 rounded-lg px-2.5 py-1 border border-amber-100">
                      <span className="text-[10px] font-black uppercase tracking-wider">{concern}</span>
                      <button type="button" onClick={() => removeConcern(index)} className="hover:text-amber-900"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className={cn("space-y-2", !isInsideSheet && "lg:col-span-2")}>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notas de evolución</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Describí los cambios observados en este control..."
              className={cn("min-h-[100px] border-slate-200 rounded-2xl", isInsideSheet && "bg-slate-50/50")}
            />
          </div>

          <div className={cn("space-y-2", !isInsideSheet && "lg:col-span-2")}>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Próxima cita sugerida</Label>
            <Input
              type="date"
              value={formData.next_appointment}
              onChange={(e) => setFormData(prev => ({ ...prev, next_appointment: e.target.value }))}
              className="h-12 border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className={cn(
          "flex justify-end gap-3",
          isInsideSheet 
            ? "fixed bottom-0 right-0 left-0 p-6 bg-white border-t border-slate-100 z-10 sm:left-auto sm:w-[450px]" 
            : "mt-6"
        )}>
          <Button type="button" variant="ghost" onClick={handleCancelClick} className="font-bold text-slate-500 h-11 px-6">
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg active:scale-95 transition-all"
            disabled={saving || (!isEditing && !formData.patient_id) || !formData.weight}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isEditing ? 'Guardar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

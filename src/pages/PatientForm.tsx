import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { usePatientStore } from '@/stores/patientStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PatientProfileFormData } from '@/types';

const initialFormData: PatientProfileFormData = {
  nombre_completo: '',
  sexo: 'Femenino',
  fecha_nacimiento: '',
  edad: '',
  telefono: '',
  correo: '',
  ocupacion: '',
  nivel_estres: 'Moderado',
  patologias_preexistentes: [],
  medicacion_habitual: [],
  antecedentes_familiares: [],
  tipo_dieta: '',
  alimentos_excluidos: [],
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
  const [formData, setFormData] = useState<PatientProfileFormData>(initialFormData);
  
  // Local state for array inputs
  const [newPathology, setNewPathology] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newHistory, setNewHistory] = useState('');
  const [newExcludedFood, setNewExcludedFood] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      getPatientById(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing && selectedPatient) {
      setFormData({
        nombre_completo: selectedPatient.nombre_completo,
        sexo: selectedPatient.sexo,
        fecha_nacimiento: selectedPatient.fecha_nacimiento,
        edad: selectedPatient.edad.toString(),
        telefono: selectedPatient.telefono,
        correo: selectedPatient.correo,
        ocupacion: selectedPatient.ocupacion,
        nivel_estres: selectedPatient.nivel_estres,
        patologias_preexistentes: selectedPatient.patologias_preexistentes || [],
        medicacion_habitual: selectedPatient.medicacion_habitual || [],
        antecedentes_familiares: selectedPatient.antecedentes_familiares || [],
        tipo_dieta: selectedPatient.tipo_dieta || '',
        alimentos_excluidos: selectedPatient.alimentos_excluidos || [],
      });
    }
  }, [selectedPatient, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    
    try {
      if (isEditing && id) {
        await updatePatient(id, formData);
        toast.success('Perfil actualizado correctamente');
      } else {
        await createPatient(user.id, formData);
        toast.success('Paciente creado con éxito');
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

  const handleChange = (field: keyof PatientProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (field: 'patologias_preexistentes' | 'medicacion_habitual' | 'antecedentes_familiares' | 'alimentos_excluidos', value: string, setter: (v: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: 'patologias_preexistentes' | 'medicacion_habitual' | 'antecedentes_familiares' | 'alimentos_excluidos', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
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
    <div className={cn("space-y-6", isInsideSheet && "pb-24")}>
      {!isInsideSheet && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEditing ? 'Editar Perfil' : 'Nuevo Registro de Paciente'}
            </h1>
            <p className="text-slate-500 mt-1">Información estática del perfil del paciente.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── SECCIÓN 1: DATOS PERSONALES ── */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <div className="h-px w-8 bg-slate-200" /> Datos Personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre_completo">Nombre Completo *</Label>
              <Input
                id="nombre_completo"
                value={formData.nombre_completo}
                onChange={(e) => handleChange('nombre_completo', e.target.value)}
                required
                placeholder="María Agustina Nicoloriche"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Sexo *</Label>
              <RadioGroup
                value={formData.sexo}
                onValueChange={(value) => handleChange('sexo', value)}
                className="flex gap-4 p-2 bg-slate-50 rounded-xl border border-slate-100 h-11 items-center px-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Masculino" id="masc" />
                  <Label htmlFor="masc" className="cursor-pointer text-sm">M</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Femenino" id="fem" />
                  <Label htmlFor="fem" className="cursor-pointer text-sm">F</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Otro" id="otro" />
                  <Label htmlFor="otro" className="cursor-pointer text-sm">Otro</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => handleChange('fecha_nacimiento', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  value={formData.edad}
                  onChange={(e) => handleChange('edad', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ocupacion">Ocupación</Label>
              <Input
                id="ocupacion"
                value={formData.ocupacion}
                onChange={(e) => handleChange('ocupacion', e.target.value)}
                placeholder="Ej: Empleada de atención al público"
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 2: CONTACTO Y ESTILO DE VIDA ── */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <div className="h-px w-8 bg-slate-200" /> Contacto y Estilo de Vida
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                value={formData.correo}
                onChange={(e) => handleChange('correo', e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nivel_estres">Nivel de Estrés</Label>
              <Select value={formData.nivel_estres} onValueChange={(v) => handleChange('nivel_estres', v)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Moderado">Moderado</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tipo_dieta">Tipo de Dieta</Label>
              <Input
                id="tipo_dieta"
                value={formData.tipo_dieta}
                onChange={(e) => handleChange('tipo_dieta', e.target.value)}
                placeholder="Ej: Vegetariana"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Alimentos Excluidos</Label>
              <div className="flex gap-2">
                <Input 
                  value={newExcludedFood} 
                  onChange={e => setNewExcludedFood(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('alimentos_excluidos', newExcludedFood, setNewExcludedFood))}
                  placeholder="Agregar alimento..."
                  className="h-10 rounded-lg"
                />
                <Button type="button" size="icon" variant="outline" onClick={() => addItem('alimentos_excluidos', newExcludedFood, setNewExcludedFood)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.alimentos_excluidos.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 gap-1 flex items-center bg-slate-100 text-slate-700 rounded-lg border-none">
                    {item}
                    <button type="button" onClick={() => removeItem('alimentos_excluidos', idx)} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: ANTECEDENTES Y SALUD ── */}
        <section className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <div className="h-px w-8 bg-slate-200" /> Antecedentes y Salud
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patologías */}
            <div className="space-y-2">
              <Label>Patologías Preexistentes</Label>
              <div className="flex gap-2">
                <Input 
                  value={newPathology} 
                  onChange={e => setNewPathology(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('patologias_preexistentes', newPathology, setNewPathology))}
                  className="h-10 rounded-lg"
                />
                <Button type="button" size="icon" variant="outline" onClick={() => addItem('patologias_preexistentes', newPathology, setNewPathology)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.patologias_preexistentes.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 gap-1 flex items-center bg-red-50 text-red-700 rounded-lg border-none">
                    {item}
                    <button type="button" onClick={() => removeItem('patologias_preexistentes', idx)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Medicación */}
            <div className="space-y-2">
              <Label>Medicación Habitual</Label>
              <div className="flex gap-2">
                <Input 
                  value={newMedication} 
                  onChange={e => setNewMedication(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('medicacion_habitual', newMedication, setNewMedication))}
                  className="h-10 rounded-lg"
                />
                <Button type="button" size="icon" variant="outline" onClick={() => addItem('medicacion_habitual', newMedication, setNewMedication)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.medicacion_habitual.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 gap-1 flex items-center bg-blue-50 text-blue-700 rounded-lg border-none">
                    {item}
                    <button type="button" onClick={() => removeItem('medicacion_habitual', idx)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Antecedentes Familiares */}
            <div className="space-y-2">
              <Label>Antecedentes Familiares</Label>
              <div className="flex gap-2">
                <Input 
                  value={newHistory} 
                  onChange={e => setNewHistory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('antecedentes_familiares', newHistory, setNewHistory))}
                  className="h-10 rounded-lg"
                />
                <Button type="button" size="icon" variant="outline" onClick={() => addItem('antecedentes_familiares', newHistory, setNewHistory)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.antecedentes_familiares.map((item, idx) => (
                  <Badge key={idx} variant="secondary" className="pl-2 pr-1 py-1 gap-1 flex items-center bg-amber-50 text-amber-700 rounded-lg border-none">
                    {item}
                    <button type="button" onClick={() => removeItem('antecedentes_familiares', idx)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTONES DE ACCIÓN ── */}
        <div className={cn(
          "flex justify-end gap-3",
          isInsideSheet 
            ? "fixed bottom-0 right-0 p-6 bg-white border-t border-slate-100 z-50 w-full md:max-w-xl shadow-2xl" 
            : "mt-12 bg-slate-50 p-6 rounded-2xl"
        )}>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel || (() => navigate('/patients'))}
            className="font-bold text-slate-500 hover:bg-slate-100 h-12 px-8 rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-black h-12 px-10 rounded-xl shadow-xl shadow-slate-200 transition-all flex items-center gap-2"
            disabled={saving}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isEditing ? 'Actualizar Perfil' : 'Crear Registro'}
          </Button>
        </div>
      </form>
    </div>
  );
}


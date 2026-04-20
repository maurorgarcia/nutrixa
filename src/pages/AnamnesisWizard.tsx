import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAnamnesisStore } from '@/stores/anamnesisStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { calculateBMI, getBMICategory } from '@/utils/calculations';
import { analyzeAnamnesisWithAI, type AIAnalysisResult } from '@/utils/aiAnalysis';
import type { AnamnesisFormData } from '@/types';

const steps = [
  { id: 'physical', title: 'Actividad Física', description: 'Nivel y tipo de actividad' },
  { id: 'consultation', title: 'Motivo de Consulta', description: 'Razón de la visita' },
  { id: 'anthropometric', title: 'Datos Antropométricos', description: 'Medidas corporales' },
  { id: 'medical', title: 'Antecedentes Médicos', description: 'Enfermedades y medicación' },
  { id: 'family', title: 'Antecedentes Familiares', description: 'Historial familiar' },
  { id: 'eating', title: 'Hábitos Alimentarios', description: 'Preferencias y hábitos' },
  { id: 'recall', title: 'Recordatorio 24h', description: 'Consumo alimentario' },
  { id: 'lab', title: 'Análisis Clínicos', description: 'Resultados de laboratorio' },
];

const initialFormData: AnamnesisFormData = {
  physical_activity: {
    level: '',
    activities: [],
    frequency: '',
    duration: '',
  },
  consultation_reason: '',
  anthropometric_data: {
    weight: '',
    height: '',
    waist_circumference: '',
    hip_circumference: '',
    arm_circumference: '',
    body_fat_percentage: '',
    muscle_mass: '',
  },
  diseases: [],
  medications: [],
  family_history: [],
  eating_habits: {
    meal_frequency: '',
    meal_times: {
      breakfast: '',
      mid_morning: '',
      lunch: '',
      snack: '',
      dinner: '',
    },
    cooking_methods: [],
    food_preferences: [],
    food_dislikes: [],
    allergies: [],
    intolerances: [],
  },
  recall_24h: {
    weekday: {
      breakfast: '',
      mid_morning: '',
      lunch: '',
      snack: '',
      dinner: '',
    },
    weekend: {
      breakfast: '',
      mid_morning: '',
      lunch: '',
      snack: '',
      dinner: '',
    },
  },
  lab_results: [],
};

export function AnamnesisWizard() {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuthStore();
  const { createAnamnesis } = useAnamnesisStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AnamnesisFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [newDisease, setNewDisease] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newIntolerance, setNewIntolerance] = useState('');
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !patientId) return;
    setSaving(true);
    try {
      await createAnamnesis(user.id, patientId, formData);
      navigate(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error creating anamnesis:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const result = await analyzeAnamnesisWithAI(formData);
      setAiResult(result);
    } finally {
      setAiLoading(false);
    }
  };

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addItem = (path: string, item: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      current[arrayKey] = [...current[arrayKey], item];
      return newData;
    });
  };

  const removeItem = (path: string, index: number) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      const arrayKey = keys[keys.length - 1];
      current[arrayKey] = current[arrayKey].filter((_: any, i: number) => i !== index);
      return newData;
    });
  };

  const weight = parseFloat(formData.anthropometric_data.weight) || 0;
  const height = parseFloat(formData.anthropometric_data.height) || 0;
  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Physical Activity
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Nivel de actividad física</Label>
              <RadioGroup
                value={formData.physical_activity.level}
                onValueChange={(value) => updateFormData('physical_activity.level', value)}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {[
                  { value: 'sedentary', label: 'Sedentario', desc: 'Poco o ningún ejercicio' },
                  { value: 'light', label: 'Ligero', desc: 'Ejercicio 1-3 días/semana' },
                  { value: 'moderate', label: 'Moderado', desc: 'Ejercicio 3-5 días/semana' },
                  { value: 'active', label: 'Activo', desc: 'Ejercicio 6-7 días/semana' },
                  { value: 'very_active', label: 'Muy Activo', desc: 'Ejercicio intenso diario' },
                ].map((option) => (
                  <div key={option.value} className="flex items-start space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Actividades que realiza</Label>
              <Textarea
                id="activities"
                placeholder="Ej: Caminar, natación, gimnasio..."
                value={formData.physical_activity.activities.join(', ')}
                onChange={(e) => updateFormData('physical_activity.activities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia</Label>
                <Input
                  id="frequency"
                  placeholder="Ej: 3 veces por semana"
                  value={formData.physical_activity.frequency}
                  onChange={(e) => updateFormData('physical_activity.frequency', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duración</Label>
                <Input
                  id="duration"
                  placeholder="Ej: 30 minutos"
                  value={formData.physical_activity.duration}
                  onChange={(e) => updateFormData('physical_activity.duration', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 1: // Consultation Reason
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="consultation_reason">Motivo de consulta *</Label>
              <Textarea
                id="consultation_reason"
                placeholder="Describe el motivo principal de la consulta, objetivos del paciente, etc."
                value={formData.consultation_reason}
                onChange={(e) => updateFormData('consultation_reason', e.target.value)}
                required
                className="min-h-[200px]"
              />
            </div>
          </div>
        );

      case 2: // Anthropometric Data
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={formData.anthropometric_data.weight}
                  onChange={(e) => updateFormData('anthropometric_data.weight', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="170"
                  value={formData.anthropometric_data.height}
                  onChange={(e) => updateFormData('anthropometric_data.height', e.target.value)}
                  required
                />
              </div>
            </div>

            {bmi > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">IMC Calculado</p>
                    <p className="text-3xl font-bold">{bmi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Clasificación</p>
                    <p className={`text-lg font-medium ${bmiCategory.color}`}>{bmiCategory.label}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waist">Circunferencia de cintura (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  placeholder="80"
                  value={formData.anthropometric_data.waist_circumference}
                  onChange={(e) => updateFormData('anthropometric_data.waist_circumference', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hip">Circunferencia de cadera (cm)</Label>
                <Input
                  id="hip"
                  type="number"
                  step="0.1"
                  placeholder="95"
                  value={formData.anthropometric_data.hip_circumference}
                  onChange={(e) => updateFormData('anthropometric_data.hip_circumference', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="body_fat">% Grasa corporal</Label>
                <Input
                  id="body_fat"
                  type="number"
                  step="0.1"
                  placeholder="25"
                  value={formData.anthropometric_data.body_fat_percentage}
                  onChange={(e) => updateFormData('anthropometric_data.body_fat_percentage', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="muscle_mass">Masa muscular (kg)</Label>
                <Input
                  id="muscle_mass"
                  type="number"
                  step="0.1"
                  placeholder="35"
                  value={formData.anthropometric_data.muscle_mass}
                  onChange={(e) => updateFormData('anthropometric_data.muscle_mass', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3: // Medical History
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Enfermedades</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar enfermedad..."
                  value={newDisease}
                  onChange={(e) => setNewDisease(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newDisease.trim()) {
                      addItem('diseases', newDisease.trim());
                      setNewDisease('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newDisease.trim()) {
                      addItem('diseases', newDisease.trim());
                      setNewDisease('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.diseases.map((disease, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm">{disease}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('diseases', index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Medicación</Label>
              {formData.medications.map((med, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Nombre del medicamento"
                    value={med.name}
                    onChange={(e) => {
                      const newMeds = [...formData.medications];
                      newMeds[index].name = e.target.value;
                      updateFormData('medications', newMeds);
                    }}
                  />
                  <Input
                    placeholder="Dosis"
                    value={med.dosage}
                    onChange={(e) => {
                      const newMeds = [...formData.medications];
                      newMeds[index].dosage = e.target.value;
                      updateFormData('medications', newMeds);
                    }}
                    className="w-32"
                  />
                  <Input
                    placeholder="Frecuencia"
                    value={med.frequency}
                    onChange={(e) => {
                      const newMeds = [...formData.medications];
                      newMeds[index].frequency = e.target.value;
                      updateFormData('medications', newMeds);
                    }}
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem('medications', index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem('medications', { name: '', dosage: '', frequency: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar medicamento
              </Button>
            </div>
          </div>
        );

      case 4: // Family History
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Antecedentes familiares</Label>
              {formData.family_history.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Condición/Enfermedad"
                    value={item.condition}
                    onChange={(e) => {
                      const newHistory = [...formData.family_history];
                      newHistory[index].condition = e.target.value;
                      updateFormData('family_history', newHistory);
                    }}
                  />
                  <Input
                    placeholder="Parentesco"
                    value={item.relationship}
                    onChange={(e) => {
                      const newHistory = [...formData.family_history];
                      newHistory[index].relationship = e.target.value;
                      updateFormData('family_history', newHistory);
                    }}
                    className="w-40"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem('family_history', index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem('family_history', { condition: '', relationship: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar antecedente
              </Button>
            </div>
          </div>
        );

      case 5: // Eating Habits
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="meal_frequency">Frecuencia de comidas al día</Label>
              <Select
                value={formData.eating_habits.meal_frequency}
                onValueChange={(value) => updateFormData('eating_habits.meal_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 comidas</SelectItem>
                  <SelectItem value="3">3 comidas</SelectItem>
                  <SelectItem value="4">4 comidas</SelectItem>
                  <SelectItem value="5">5 comidas</SelectItem>
                  <SelectItem value="6+">6 o más comidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Horarios de comidas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'breakfast', label: 'Desayuno' },
                  { key: 'mid_morning', label: 'Media mañana' },
                  { key: 'lunch', label: 'Almuerzo' },
                  { key: 'snack', label: 'Merienda' },
                  { key: 'dinner', label: 'Cena' },
                ].map((meal) => (
                  <div key={meal.key} className="space-y-1">
                    <Label className="text-sm text-gray-500">{meal.label}</Label>
                    <Input
                      type="time"
                      value={formData.eating_habits.meal_times[meal.key as keyof typeof formData.eating_habits.meal_times]}
                      onChange={(e) => updateFormData(`eating_habits.meal_times.${meal.key}`, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Alergias alimentarias</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar alergia..."
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newAllergy.trim()) {
                      addItem('eating_habits.allergies', newAllergy.trim());
                      setNewAllergy('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newAllergy.trim()) {
                      addItem('eating_habits.allergies', newAllergy.trim());
                      setNewAllergy('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.eating_habits.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center gap-1 bg-red-50 text-red-700 rounded-full px-3 py-1">
                    <span className="text-sm">{allergy}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('eating_habits.allergies', index)}
                      className="hover:text-red-900"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Intolerancias</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar intolerancia..."
                  value={newIntolerance}
                  onChange={(e) => setNewIntolerance(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newIntolerance.trim()) {
                      addItem('eating_habits.intolerances', newIntolerance.trim());
                      setNewIntolerance('');
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newIntolerance.trim()) {
                      addItem('eating_habits.intolerances', newIntolerance.trim());
                      setNewIntolerance('');
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.eating_habits.intolerances.map((intolerance, index) => (
                  <div key={index} className="flex items-center gap-1 bg-yellow-50 text-nutri-orangeAlt rounded-full px-3 py-1">
                    <span className="text-sm">{intolerance}</span>
                    <button
                      type="button"
                      onClick={() => removeItem('eating_habits.intolerances', index)}
                      className="hover:text-yellow-900"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6: // 24h Recall
        return (
          <div className="space-y-8">
            {/* Weekday */}
            <div>
              <h3 className="font-semibold mb-4">Día de semana</h3>
              <div className="space-y-4">
                {[
                  { key: 'breakfast', label: 'Desayuno' },
                  { key: 'mid_morning', label: 'Media mañana' },
                  { key: 'lunch', label: 'Almuerzo' },
                  { key: 'snack', label: 'Merienda' },
                  { key: 'dinner', label: 'Cena' },
                ].map((meal) => (
                  <div key={meal.key} className="space-y-2">
                    <Label>{meal.label}</Label>
                    <Textarea
                      placeholder={`Describe lo que consume en ${meal.label.toLowerCase()}...`}
                      value={formData.recall_24h.weekday[meal.key as keyof typeof formData.recall_24h.weekday]}
                      onChange={(e) => updateFormData(`recall_24h.weekday.${meal.key}`, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Weekend */}
            <div>
              <h3 className="font-semibold mb-4">Fin de semana</h3>
              <div className="space-y-4">
                {[
                  { key: 'breakfast', label: 'Desayuno' },
                  { key: 'mid_morning', label: 'Media mañana' },
                  { key: 'lunch', label: 'Almuerzo' },
                  { key: 'snack', label: 'Merienda' },
                  { key: 'dinner', label: 'Cena' },
                ].map((meal) => (
                  <div key={meal.key} className="space-y-2">
                    <Label>{meal.label}</Label>
                    <Textarea
                      placeholder={`Describe lo que consume en ${meal.label.toLowerCase()}...`}
                      value={formData.recall_24h.weekend[meal.key as keyof typeof formData.recall_24h.weekend]}
                      onChange={(e) => updateFormData(`recall_24h.weekend.${meal.key}`, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 7: // Lab Results
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Análisis clínicos</Label>
              {formData.lab_results.map((result, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Nombre del análisis"
                    value={result.test_name}
                    onChange={(e) => {
                      const newResults = [...formData.lab_results];
                      newResults[index].test_name = e.target.value;
                      updateFormData('lab_results', newResults);
                    }}
                  />
                  <Input
                    placeholder="Valor"
                    value={result.value}
                    onChange={(e) => {
                      const newResults = [...formData.lab_results];
                      newResults[index].value = e.target.value;
                      updateFormData('lab_results', newResults);
                    }}
                    className="w-24"
                  />
                  <Input
                    placeholder="Unidad"
                    value={result.unit}
                    onChange={(e) => {
                      const newResults = [...formData.lab_results];
                      newResults[index].unit = e.target.value;
                      updateFormData('lab_results', newResults);
                    }}
                    className="w-24"
                  />
                  <Input
                    type="date"
                    value={result.date}
                    onChange={(e) => {
                      const newResults = [...formData.lab_results];
                      newResults[index].date = e.target.value;
                      updateFormData('lab_results', newResults);
                    }}
                    className="w-36"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem('lab_results', index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem('lab_results', { test_name: '', value: '', unit: '', reference_range: '', date: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar análisis
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${patientId}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-senralis-dark">Anamnesis Nutricional</h1>
          <p className="text-gray-500 mt-1">Completa la información paso a paso</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
              index === currentStep
                ? 'bg-black text-white'
                : index < currentStep
                ? 'bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {index < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
            <span className="text-sm hidden sm:inline">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          <p className="text-gray-500">{steps[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {currentStep === steps.length - 1 ? (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleAIAnalysis}
              disabled={aiLoading}
              className="border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              {aiLoading
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : <Sparkles className="h-4 w-4 mr-2" />
              }
              Analizar con IA
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-senralis-dark hover:bg-senralis-main"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Guardar Anamnesis
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleNext}
            className="bg-senralis-dark hover:bg-senralis-main"
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* ── AI ANALYSIS PANEL ── */}
      {aiResult && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h2 className="text-base font-black text-violet-900">Análisis Clínico-Nutricional IA</h2>
            {aiResult.estimatedCalories && (
              <span className="ml-auto text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                TMB estimada: {aiResult.estimatedCalories} kcal/día
              </span>
            )}
          </div>

          <p className="text-sm text-violet-800 font-medium">{aiResult.summary}</p>

          {aiResult.risks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <p className="text-xs font-black text-amber-700 uppercase tracking-wider">Factores de Riesgo</p>
              </div>
              <ul className="space-y-1.5">
                {aiResult.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                    <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiResult.nutritionalPriorities.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-violet-600" />
                <p className="text-xs font-black text-violet-700 uppercase tracking-wider">Prioridades Nutricionales</p>
              </div>
              <ul className="space-y-1.5">
                {aiResult.nutritionalPriorities.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-violet-900">
                    <span className="w-1 h-1 rounded-full bg-violet-500 mt-2 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {aiResult.recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-senralis-main" />
                <p className="text-xs font-black text-senralis-dark uppercase tracking-wider">Recomendaciones</p>
              </div>
              <ul className="space-y-1.5">
                {aiResult.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-senralis-dark">
                    <span className="w-1 h-1 rounded-full bg-senralis-main mt-2 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-violet-500 font-medium border-t border-violet-200 pt-3">
            ⚡ Análisis generado por motor de reglas clínicas nutricionales. Solo como orientación profesional — siempre aplicá tu criterio clínico.
          </p>
        </div>
      )}
    </div>
  );
}

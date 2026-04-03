import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { usePatientStore } from '@/stores/patientStore';
import { useRecipeStore } from '@/stores/recipeStore';
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
import { ArrowLeft, Loader2, Plus, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { MealPlanFormData, MealFormData, MealType } from '@/types';

const daysOfWeek = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

const mealTypes: { value: MealType; label: string; defaultTime: string }[] = [
  { value: 'breakfast', label: 'Desayuno', defaultTime: '08:00' },
  { value: 'mid_morning', label: 'Media Mañana', defaultTime: '10:30' },
  { value: 'lunch', label: 'Almuerzo', defaultTime: '13:00' },
  { value: 'snack', label: 'Merienda', defaultTime: '16:30' },
  { value: 'dinner', label: 'Cena', defaultTime: '20:00' },
];

const emptyMeal: MealFormData = {
  type: 'breakfast',
  name: '',
  time: '08:00',
  recipes: [],
  notes: '',
};

const initialFormData: MealPlanFormData = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  daily_calories: '',
  macros: {
    protein: '30',
    carbs: '40',
    fats: '30',
  },
  days: daysOfWeek.map(day => ({
    day_of_week: day.value,
    meals: [],
  })),
};

export function MealPlanForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { selectedMealPlan, createMealPlan, updateMealPlan, getMealPlanById, loading } = useMealPlanStore();
  const { patients, fetchPatients } = usePatientStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  
  const isEditing = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<MealPlanFormData>(initialFormData);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  useEffect(() => {
    if (user) {
      fetchPatients(user.id);
      fetchRecipes(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && id) {
      getMealPlanById(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing && selectedMealPlan) {
      setSelectedPatient(selectedMealPlan.patient_id);
      setFormData({
        name: selectedMealPlan.name,
        description: selectedMealPlan.description || '',
        start_date: selectedMealPlan.start_date,
        end_date: selectedMealPlan.end_date || '',
        daily_calories: selectedMealPlan.daily_calories.toString(),
        macros: {
          protein: selectedMealPlan.macros.protein.toString(),
          carbs: selectedMealPlan.macros.carbs.toString(),
          fats: selectedMealPlan.macros.fats.toString(),
        },
        days: selectedMealPlan.days.map(day => ({
          day_of_week: day.day_of_week,
          meals: day.meals.map(meal => ({
            type: meal.type,
            name: meal.name,
            time: meal.time,
            recipes: meal.recipes.map(r => ({
              recipe_id: r.recipe_id,
              quantity: r.quantity.toString(),
            })),
            notes: meal.notes || '',
          })),
        })),
      });
    }
  }, [selectedMealPlan, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPatient) return;

    setSaving(true);
    
    try {
      if (isEditing && id) {
        await updateRecipe(id, formData);
      } else {
        await createMealPlan(user.id, selectedPatient, formData);
      }
      navigate('/meal-plans');
    } catch (error) {
      console.error('Error saving meal plan:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayValue: number) => {
    setExpandedDays(prev => 
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const addMeal = (dayIndex: number) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        meals: [...newDays[dayIndex].meals, { ...emptyMeal, type: 'breakfast' }],
      };
      return { ...prev, days: newDays };
    });
  };

  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof MealFormData, value: any) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIndex].meals];
      newMeals[mealIndex] = { ...newMeals[mealIndex], [field]: value };
      newDays[dayIndex] = { ...newDays[dayIndex], meals: newMeals };
      return { ...prev, days: newDays };
    });
  };

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        meals: newDays[dayIndex].meals.filter((_, i) => i !== mealIndex),
      };
      return { ...prev, days: newDays };
    });
  };

  const addRecipeToMeal = (dayIndex: number, mealIndex: number) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIndex].meals];
      newMeals[mealIndex] = {
        ...newMeals[mealIndex],
        recipes: [...newMeals[mealIndex].recipes, { recipe_id: '', quantity: '1' }],
      };
      newDays[dayIndex] = { ...newDays[dayIndex], meals: newMeals };
      return { ...prev, days: newDays };
    });
  };

  const updateRecipeInMeal = (dayIndex: number, mealIndex: number, recipeIndex: number, field: string, value: string) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIndex].meals];
      const newRecipes = [...newMeals[mealIndex].recipes];
      newRecipes[recipeIndex] = { ...newRecipes[recipeIndex], [field]: value };
      newMeals[mealIndex] = { ...newMeals[mealIndex], recipes: newRecipes };
      newDays[dayIndex] = { ...newDays[dayIndex], meals: newMeals };
      return { ...prev, days: newDays };
    });
  };

  const removeRecipeFromMeal = (dayIndex: number, mealIndex: number, recipeIndex: number) => {
    setFormData(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIndex].meals];
      newMeals[mealIndex] = {
        ...newMeals[mealIndex],
        recipes: newMeals[mealIndex].recipes.filter((_, i) => i !== recipeIndex),
      };
      newDays[dayIndex] = { ...newDays[dayIndex], meals: newMeals };
      return { ...prev, days: newDays };
    });
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/meal-plans')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Plan' : 'Nuevo Plan de Alimentación'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing 
              ? 'Actualiza el plan nutricional' 
              : 'Diseña un plan personalizado para tu paciente'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Información del Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="patient">Paciente *</Label>
                    <Select
                      value={selectedPatient}
                      onValueChange={setSelectedPatient}
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

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del plan *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Ej: Plan de adelgazamiento - Fase 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Objetivos y características del plan..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Fecha de inicio *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Fecha de fin (opcional)</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Plan Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.days.map((day, dayIndex) => (
                    <div key={day.day_of_week} className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleDay(day.day_of_week)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium">{daysOfWeek[dayIndex].label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {day.meals.length} comidas
                          </span>
                          {expandedDays.includes(day.day_of_week) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>

                      {expandedDays.includes(day.day_of_week) && (
                        <div className="p-4 space-y-4">
                          {day.meals.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">
                              No hay comidas asignadas para este día
                            </p>
                          ) : (
                            day.meals.map((meal, mealIndex) => (
                              <div key={mealIndex} className="p-4 bg-gray-50 rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-2 flex-1">
                                    <Select
                                      value={meal.type}
                                      onValueChange={(value) => updateMeal(dayIndex, mealIndex, 'type', value as MealType)}
                                    >
                                      <SelectTrigger className="w-40">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {mealTypes.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      placeholder="Nombre (opcional)"
                                      value={meal.name}
                                      onChange={(e) => updateMeal(dayIndex, mealIndex, 'name', e.target.value)}
                                      className="flex-1"
                                    />
                                    <Input
                                      type="time"
                                      value={meal.time}
                                      onChange={(e) => updateMeal(dayIndex, mealIndex, 'time', e.target.value)}
                                      className="w-28"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMeal(dayIndex, mealIndex)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                {/* Recipes */}
                                <div className="space-y-2">
                                  {meal.recipes.map((recipe, recipeIndex) => (
                                    <div key={recipeIndex} className="flex gap-2">
                                      <Select
                                        value={recipe.recipe_id}
                                        onValueChange={(value) => updateRecipeInMeal(dayIndex, mealIndex, recipeIndex, 'recipe_id', value)}
                                      >
                                        <SelectTrigger className="flex-1">
                                          <SelectValue placeholder="Seleccionar receta..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {recipes.map((r) => (
                                            <SelectItem key={r.id} value={r.id}>
                                              {r.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="Cant."
                                        value={recipe.quantity}
                                        onChange={(e) => updateRecipeInMeal(dayIndex, mealIndex, recipeIndex, 'quantity', e.target.value)}
                                        className="w-24"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRecipeFromMeal(dayIndex, mealIndex, recipeIndex)}
                                        className="text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addRecipeToMeal(dayIndex, mealIndex)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Agregar receta
                                  </Button>
                                </div>

                                <Textarea
                                  placeholder="Notas adicionales..."
                                  value={meal.notes}
                                  onChange={(e) => updateMeal(dayIndex, mealIndex, 'notes', e.target.value)}
                                  className="min-h-[60px]"
                                />
                              </div>
                            ))
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addMeal(dayIndex)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar comida
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Macros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Macronutrientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="daily_calories">Calorías diarias</Label>
                  <Input
                    id="daily_calories"
                    type="number"
                    value={formData.daily_calories}
                    onChange={(e) => setFormData(prev => ({ ...prev, daily_calories: e.target.value }))}
                    placeholder="2000"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Distribución (%)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">Proteínas</Label>
                      <Input
                        type="number"
                        value={formData.macros.protein}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          macros: { ...prev.macros, protein: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Carbs</Label>
                      <Input
                        type="number"
                        value={formData.macros.carbs}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          macros: { ...prev.macros, carbs: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Grasas</Label>
                      <Input
                        type="number"
                        value={formData.macros.fats}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          macros: { ...prev.macros, fats: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800"
                disabled={saving || (!isEditing && !selectedPatient)}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? 'Guardar cambios' : 'Crear plan'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/meal-plans')}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

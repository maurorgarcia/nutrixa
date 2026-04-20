import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useMealPlanStore } from '@/stores/mealPlanStore';
import { usePatientStore } from '@/stores/patientStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Save, Trash2, Search } from 'lucide-react';
import type { MealPlanFormData, MealFormData, MealType } from '@/types';

const DAYS = [
  { value: 1, short: 'Lun', label: 'Lunes' },
  { value: 2, short: 'Mar', label: 'Martes' },
  { value: 3, short: 'Mié', label: 'Miércoles' },
  { value: 4, short: 'Jue', label: 'Jueves' },
  { value: 5, short: 'Vie', label: 'Viernes' },
  { value: 6, short: 'Sáb', label: 'Sábado' },
  { value: 7, short: 'Dom', label: 'Domingo' },
];

const MEAL_TYPES: { value: MealType; label: string; time: string; emoji: string }[] = [
  { value: 'breakfast',   label: 'Desayuno',      time: '08:00', emoji: '🌅' },
  { value: 'mid_morning', label: 'Media Mañana',  time: '10:30', emoji: '🍎' },
  { value: 'lunch',       label: 'Almuerzo',      time: '13:00', emoji: '🍽️' },
  { value: 'snack',       label: 'Merienda',       time: '16:30', emoji: '☕' },
  { value: 'dinner',      label: 'Cena',           time: '20:00', emoji: '🌙' },
];

const EMPTY_MEAL: MealFormData = { type: 'breakfast', name: '', time: '08:00', recipes: [], notes: '' };

const INITIAL: MealPlanFormData = {
  name: '', description: '', start_date: '', end_date: '', daily_calories: '',
  macros: { protein: '30', carbs: '40', fats: '30' },
  days: DAYS.map(d => ({ day_of_week: d.value, meals: [] })),
};

export function MealPlanForm() {
  const navigate = useNavigate();
  const { id, patientId } = useParams<{ id: string; patientId?: string }>();
  const { user } = useAuthStore();
  const { selectedMealPlan, createMealPlan, updateMealPlan, getMealPlanById, loading } = useMealPlanStore();
  const { patients, fetchPatients } = usePatientStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  
  const isEditing = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<MealPlanFormData>(INITIAL);
  const [selectedPatient, setSelectedPatient] = useState(patientId || '');
  const [activeDay, setActiveDay] = useState(1);
  const [recipeSearch, setRecipeSearch] = useState('');

  useEffect(() => {
    if (user) { fetchPatients(user.id); fetchRecipes(user.id); }
  }, [user]);

  useEffect(() => {
    if (isEditing && id) getMealPlanById(id);
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
            type: meal.type, name: meal.name, time: meal.time,
            recipes: meal.recipes.map(r => ({ recipe_id: r.recipe_id, quantity: r.quantity.toString() })),
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
        await updateMealPlan(id, formData);
        toast.success('Protocolo actualizado con éxito');
      } else {
        await createMealPlan(user.id, selectedPatient, formData);
        toast.success('Nuevo protocolo creado y asignado');
      }
      navigate(patientId ? `/patients/${patientId}` : '/meal-plans');
    } catch (err) { console.error(err); toast.error('Error al guardar el protocolo'); }
    finally { setSaving(false); }
  };

  // ── Mutators ──
  const dayIndex = (dayValue: number) => formData.days.findIndex(d => d.day_of_week === dayValue);
  
  const addMeal = (dayVal: number) => {
    setFormData(prev => {
      const days = [...prev.days];
      const di = days.findIndex(d => d.day_of_week === dayVal);
      days[di] = { ...days[di], meals: [...days[di].meals, { ...EMPTY_MEAL }] };
      return { ...prev, days };
    });
  };

  const removeMeal = (dayVal: number, mealIdx: number) => {
    setFormData(prev => {
      const days = [...prev.days];
      const di = days.findIndex(d => d.day_of_week === dayVal);
      days[di] = { ...days[di], meals: days[di].meals.filter((_, i) => i !== mealIdx) };
      return { ...prev, days };
    });
  };

  const updateMealField = (dayVal: number, mealIdx: number, field: keyof MealFormData, value: any) => {
    setFormData(prev => {
      const days = [...prev.days];
      const di = days.findIndex(d => d.day_of_week === dayVal);
      const meals = [...days[di].meals];
      meals[mealIdx] = { ...meals[mealIdx], [field]: value };
      days[di] = { ...days[di], meals };
      return { ...prev, days };
    });
  };

  const addRecipeToMeal = (dayVal: number, mealIdx: number, recipeId: string) => {
    setFormData(prev => {
      const days = [...prev.days];
      const di = days.findIndex(d => d.day_of_week === dayVal);
      const meals = [...days[di].meals];
      // Don't add duplicates
      if (meals[mealIdx].recipes.some(r => r.recipe_id === recipeId)) return prev;
      meals[mealIdx] = { ...meals[mealIdx], recipes: [...meals[mealIdx].recipes, { recipe_id: recipeId, quantity: '1' }] };
      days[di] = { ...days[di], meals };
      return { ...prev, days };
    });
  };

  const removeRecipeFromMeal = (dayVal: number, mealIdx: number, recipeIdx: number) => {
    setFormData(prev => {
      const days = [...prev.days];
      const di = days.findIndex(d => d.day_of_week === dayVal);
      const meals = [...days[di].meals];
      meals[mealIdx] = { ...meals[mealIdx], recipes: meals[mealIdx].recipes.filter((_, i) => i !== recipeIdx) };
      days[di] = { ...days[di], meals };
      return { ...prev, days };
    });
  };

  const updateRecipeQty = (dayVal: number, mealIdx: number, recipeIdx: number, qty: string) => {
    setFormData(prev => {
      const days = [...prev.days];
      const di = days.findIndex(d => d.day_of_week === dayVal);
      const meals = [...days[di].meals];
      const recs = [...meals[mealIdx].recipes];
      recs[recipeIdx] = { ...recs[recipeIdx], quantity: qty };
      meals[mealIdx] = { ...meals[mealIdx], recipes: recs };
      days[di] = { ...days[di], meals };
      return { ...prev, days };
    });
  };

  if (isEditing && loading) return (
    <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-slate-300" /></div>
  );

  const activeDayData = formData.days.find(d => d.day_of_week === activeDay);
  const filteredRecipes = recipes.filter(r => r.name.toLowerCase().includes(recipeSearch.toLowerCase()));
  const macroTotal = Number(formData.macros.protein) + Number(formData.macros.carbs) + Number(formData.macros.fats);

  return (
    <form onSubmit={handleSubmit} className="space-y-0 animate-in fade-in duration-500">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 -mx-6 px-6 py-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(patientId ? `/patients/${patientId}/meal-plans` : '/meal-plans')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {isEditing ? 'Editar Plan' : 'Nuevo Plan de Alimentación'}
            </h1>
            <p className="text-xs font-medium text-slate-500">
              {isEditing ? 'Actualizá el plan nutricional' : 'Diseñá un plan personalizado'}
            </p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={saving || (!isEditing && !selectedPatient)}
          className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-5 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditing ? 'Guardar cambios' : 'Crear plan'}
        </Button>
      </div>

      <div className="flex gap-6">

        {/* ══ LEFT: PLAN CONFIG + DAY EDITOR ══ */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Plan Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Configuración del Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isEditing && (
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-wider">Paciente *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Seleccionar paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nombre_completo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-wider">Nombre del plan *</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  required placeholder="Ej: Plan de déficit calórico — Fase 1"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-wider">Inicio *</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))} required className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-black text-slate-500 uppercase tracking-wider">Fin (opcional)</Label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))} className="h-9 text-sm" />
              </div>
            </div>

            {/* Macros inline */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black text-slate-500 uppercase tracking-wider">Kcal/día</Label>
                  <Input type="number" value={formData.daily_calories} onChange={e => setFormData(p => ({ ...p, daily_calories: e.target.value }))} placeholder="2000" className="h-9 text-sm w-28" />
                </div>
                {(['protein', 'carbs', 'fats'] as const).map((macro, i) => (
                  <div key={macro} className="space-y-1.5">
                    <Label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                      {['Proteínas', 'Carbos', 'Grasas'][i]} %
                    </Label>
                    <Input type="number" min="0" max="100" value={formData.macros[macro]}
                      onChange={e => setFormData(p => ({ ...p, macros: { ...p.macros, [macro]: e.target.value } }))}
                      className="h-9 text-sm w-20"
                    />
                  </div>
                ))}
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${macroTotal === 100 ? 'bg-slate-50 text-senralis-dark' : 'bg-red-50 text-red-600'}`}>
                  Total: {macroTotal}%
                </div>
              </div>
            </div>
          </div>

          {/* Day Tabs */}
          <div>
            <div className="flex gap-1 border-b border-slate-200 overflow-x-auto pb-0 -mb-px">
              {DAYS.map(day => {
                const di = dayIndex(day.value);
                const mealCount = formData.days[di]?.meals.length ?? 0;
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => setActiveDay(day.value)}
                    className={`relative flex flex-col items-center gap-0.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                      activeDay === day.value
                        ? 'border-senralis-main text-senralis-dark'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {day.short}
                    {mealCount > 0 && (
                      <span className={`text-[10px] font-black leading-none ${activeDay === day.value ? 'text-senralis-main' : 'text-slate-400'}`}>
                        {mealCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active day meals */}
            <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">
                  {DAYS.find(d => d.value === activeDay)?.label}
                </h3>
                <button
                  type="button"
                  onClick={() => addMeal(activeDay)}
                  className="flex items-center gap-1.5 text-xs font-bold text-senralis-dark bg-slate-50 hover:bg-slate-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar comida
                </button>
              </div>

              {(!activeDayData || activeDayData.meals.length === 0) ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-medium text-slate-400">Sin comidas para este día</p>
                  <button type="button" onClick={() => addMeal(activeDay)} className="mt-2 text-xs font-bold text-senralis-main hover:text-senralis-dark">
                    + Agregar primera comida
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDayData?.meals.map((meal, mealIdx) => {
                    const mealMeta = MEAL_TYPES.find(m => m.value === meal.type);
                    return (
                      <div key={mealIdx} className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Meal header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                          <span className="text-base">{mealMeta?.emoji}</span>
                          <Select
                            value={meal.type}
                            onValueChange={val => updateMealField(activeDay, mealIdx, 'type', val as MealType)}
                          >
                            <SelectTrigger className="border-0 bg-transparent h-7 text-sm font-bold text-slate-900 p-0 w-auto focus:ring-0 shadow-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEAL_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <input
                            type="time"
                            value={meal.time}
                            onChange={e => updateMealField(activeDay, mealIdx, 'time', e.target.value)}
                            className="text-xs font-bold text-slate-500 bg-transparent border-0 focus:outline-none p-0 ml-auto"
                          />
                          <button type="button" onClick={() => removeMeal(activeDay, mealIdx)} className="text-slate-400 hover:text-red-500 transition-colors ml-2">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Meal body */}
                        <div className="p-4 space-y-3">
                          {/* Recipes added to this meal */}
                          {meal.recipes.length > 0 && (
                            <div className="space-y-2">
                              {meal.recipes.map((r, ri) => {
                                const recipeMeta = recipes.find(rec => rec.id === r.recipe_id);
                                return (
                                  <div key={ri} className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-xs font-bold text-slate-700 flex-1 truncate">{recipeMeta?.name || 'Receta'}</span>
                                    <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                      {recipeMeta ? `${recipeMeta.calories_per_serving * Number(r.quantity)} kcal` : ''}
                                    </span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      min="0.5"
                                      value={r.quantity}
                                      onChange={e => updateRecipeQty(activeDay, mealIdx, ri, e.target.value)}
                                      className="w-14 text-xs font-bold text-center border border-slate-200 rounded-md h-6 focus:outline-none focus:ring-1 focus:ring-senralis-main"
                                    />
                                    <span className="text-[10px] text-slate-400">porc.</span>
                                    <button type="button" onClick={() => removeRecipeFromMeal(activeDay, mealIdx, ri)} className="text-slate-300 hover:text-red-400 transition-colors">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Notes */}
                          <Textarea
                            placeholder="Notas adicionales..."
                            value={meal.notes}
                            onChange={e => updateMealField(activeDay, mealIdx, 'notes', e.target.value)}
                            className="min-h-[52px] text-xs resize-none border-slate-200"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ RIGHT: RECIPE SIDEBAR ══ */}
        <div className="w-72 shrink-0 hidden lg:flex flex-col gap-4 sticky top-[88px] self-start">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Recetario</p>
              <span className="text-[10px] font-bold text-slate-400">{filteredRecipes.length} recetas</span>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar receta..."
                  value={recipeSearch}
                  onChange={e => setRecipeSearch(e.target.value)}
                  className="w-full h-7 pl-7 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-senralis-main placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Recipe list — click to add to current day's first available meal, or let user pick */}
            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              {filteredRecipes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Sin recetas</p>
              ) : filteredRecipes.map(recipe => (
                <div key={recipe.id} className="group border-b border-slate-50 last:border-0">
                  <div className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-900 truncate mb-0.5">{recipe.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">{recipe.calories_per_serving} kcal/por.</p>
                    {/* Add buttons for each meal in active day */}
                    {activeDayData && activeDayData.meals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {activeDayData.meals.map((m, idx) => {
                          const meta = MEAL_TYPES.find(mt => mt.value === m.type);
                          const alreadyAdded = m.recipes.some(r => r.recipe_id === recipe.id);
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => addRecipeToMeal(activeDay, idx, recipe.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                alreadyAdded
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : 'bg-slate-50 text-senralis-dark border-emerald-200 hover:bg-slate-100'
                              }`}
                            >
                              {alreadyAdded ? '✓' : '+'} {meta?.label ?? `Comida ${idx + 1}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {(!activeDayData || activeDayData.meals.length === 0) && (
                      <p className="text-[10px] text-slate-400 mt-1">Agregá una comida primero</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}

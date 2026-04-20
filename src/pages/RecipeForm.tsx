import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RecipeFormData, RecipeIngredient, RecipeTag } from '@/types';

const recipeTags: { value: RecipeTag; label: string }[] = [
  { value: 'vegan', label: 'Vegano' },
  { value: 'vegetarian', label: 'Vegetariano' },
  { value: 'gluten-free', label: 'Sin Gluten' },
  { value: 'dairy-free', label: 'Sin Lácteos' },
  { value: 'keto', label: 'Keto' },
  { value: 'low-carb', label: 'Bajo en Carbohidratos' },
  { value: 'high-protein', label: 'Alto en Proteínas' },
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'dinner', label: 'Cena' },
  { value: 'snack', label: 'Snack' },
  { value: 'dessert', label: 'Postre' },
];

const emptyIngredient: RecipeIngredient = {
  id: '',
  name: '',
  quantity: 0,
  unit: 'g',
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
};

const initialFormData: RecipeFormData = {
  name: '',
  description: '',
  ingredients: [],
  instructions: [''],
  prep_time: '',
  cook_time: '',
  servings: '1',
  calories_per_serving: '',
  tags: [],
};

interface RecipeFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialId?: string;
}

export function RecipeForm({ onSuccess, onCancel, initialId }: RecipeFormProps) {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = initialId || routeId;
  const { user } = useAuthStore();
  const { selectedRecipe, createRecipe, updateRecipe, getRecipeById, loading } = useRecipeStore();
  
  const isEditing = Boolean(id);
  const isInsideSheet = Boolean(onSuccess);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);

  useEffect(() => {
    if (isEditing && id) {
      getRecipeById(id);
    }
  }, [id, isEditing]);

  useEffect(() => {
    if (isEditing && selectedRecipe) {
      setFormData({
        name: selectedRecipe.name,
        description: selectedRecipe.description || '',
        ingredients: selectedRecipe.ingredients,
        instructions: selectedRecipe.instructions.length > 0 ? selectedRecipe.instructions : [''],
        prep_time: selectedRecipe.prep_time.toString(),
        cook_time: selectedRecipe.cook_time.toString(),
        servings: selectedRecipe.servings.toString(),
        calories_per_serving: selectedRecipe.calories_per_serving.toString(),
        tags: selectedRecipe.tags,
      });
    }
  }, [selectedRecipe, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    
    try {
      const cleanedData = {
        ...formData,
        instructions: formData.instructions.filter(i => i.trim() !== ''),
        ingredients: formData.ingredients.map(ing => ({
          ...ing,
          id: ing.id || crypto.randomUUID(),
        })),
      };

      if (isEditing && id) {
        await updateRecipe(id, cleanedData);
        toast.success('Receta actualizada correctamente');
      } else {
        await createRecipe(user.id, cleanedData);
        toast.success('Nueva receta creada con éxito');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/recipes');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof RecipeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...emptyIngredient, id: crypto.randomUUID() }],
    }));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      return { ...prev, ingredients: newIngredients };
    });
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const toggleTag = (tag: RecipeTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/recipes');
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
    <div className={cn("space-y-6", isInsideSheet && "pb-24")}>
      {!isInsideSheet && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/recipes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-senralis-dark">
              {isEditing ? 'Editar Receta' : 'Nueva Receta'}
            </h1>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={cn("grid grid-cols-1 gap-6", !isInsideSheet && "lg:grid-cols-3")}>
          <div className={cn("space-y-6", !isInsideSheet && "lg:col-span-2")}>
            <Card className={isInsideSheet ? "border-0 shadow-none bg-transparent" : "border-slate-200"}>
              {!isInsideSheet && <CardHeader><CardTitle className="text-lg font-semibold">Información Básica</CardTitle></CardHeader>}
              <CardContent className={cn("space-y-4", isInsideSheet && "p-0")}>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la receta *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required className="h-10 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="border-slate-200" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep_time">Prep. (min)</Label>
                    <Input id="prep_time" type="number" value={formData.prep_time} onChange={(e) => handleChange('prep_time', e.target.value)} className="h-10 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cook_time">Cocción (min)</Label>
                    <Input id="cook_time" type="number" value={formData.cook_time} onChange={(e) => handleChange('cook_time', e.target.value)} className="h-10 border-slate-200" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isInsideSheet ? "border-0 shadow-none bg-transparent" : "border-slate-200"}>
              <CardHeader className="flex flex-row items-center justify-between px-0 py-4">
                <CardTitle className="text-lg font-semibold">Ingredientes</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="rounded-xl font-bold">
                  <Plus className="h-4 w-4 mr-2" /> Agregar
                </Button>
              </CardHeader>
              <CardContent className="px-0">
                <div className="space-y-3">
                  {formData.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <Input placeholder="Harina" value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)} className="flex-1 h-9 border-slate-200" />
                      <Input type="number" placeholder="100" value={ing.quantity || ''} onChange={(e) => updateIngredient(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-20 h-9 border-slate-200" />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
             <Card className={isInsideSheet ? "border-0 shadow-none bg-transparent" : "border-slate-200"}>
               <CardHeader className="px-0 py-4"><CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Etiquetas</CardTitle></CardHeader>
               <CardContent className="px-0">
                  <div className="flex flex-wrap gap-2">
                    {recipeTags.map(tag => (
                      <button key={tag.value} type="button" onClick={() => toggleTag(tag.value)} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all border", formData.tags.includes(tag.value) ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                        {tag.label}
                      </button>
                    ))}
                  </div>
               </CardContent>
             </Card>

             <div className={cn(
              "flex flex-col gap-3",
              isInsideSheet && "fixed bottom-0 right-0 left-0 p-6 bg-white border-t border-slate-100 sm:left-auto sm:w-[450px]"
             )}>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 px-6 rounded-xl" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Guardar cambios' : 'Crear receta'}
                </Button>
                <Button type="button" variant="ghost" className="w-full font-semibold text-slate-500" onClick={handleCancelClick}>
                  Cancelar
                </Button>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
}

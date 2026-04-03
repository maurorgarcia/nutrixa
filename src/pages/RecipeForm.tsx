import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
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

export function RecipeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { selectedRecipe, createRecipe, updateRecipe, getRecipeById, loading } = useRecipeStore();
  
  const isEditing = Boolean(id);
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
      // Clean up data
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
      } else {
        await createRecipe(user.id, cleanedData);
      }
      navigate('/recipes');
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

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ''],
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => {
      const newInstructions = [...prev.instructions];
      newInstructions[index] = value;
      return { ...prev, instructions: newInstructions };
    });
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
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

  // Calculate total calories from ingredients
  const totalCalories = formData.ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0);
  const servings = parseInt(formData.servings) || 1;
  const calculatedCaloriesPerServing = Math.round(totalCalories / servings);

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
        <Button variant="ghost" size="icon" onClick={() => navigate('/recipes')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Receta' : 'Nueva Receta'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing 
              ? 'Actualiza los datos de la receta' 
              : 'Completa los datos para crear una nueva receta'}
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
                <CardTitle className="text-lg font-semibold">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la receta *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    placeholder="Ej: Ensalada de quinoa con verduras"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Breve descripción de la receta..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep_time">Tiempo prep. (min)</Label>
                    <Input
                      id="prep_time"
                      type="number"
                      value={formData.prep_time}
                      onChange={(e) => handleChange('prep_time', e.target.value)}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cook_time">Tiempo cocción (min)</Label>
                    <Input
                      id="cook_time"
                      type="number"
                      value={formData.cook_time}
                      onChange={(e) => handleChange('cook_time', e.target.value)}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servings">Porciones</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={formData.servings}
                      onChange={(e) => handleChange('servings', e.target.value)}
                      placeholder="4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorías/porción</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.calories_per_serving}
                      onChange={(e) => handleChange('calories_per_serving', e.target.value)}
                      placeholder={calculatedCaloriesPerServing > 0 ? calculatedCaloriesPerServing.toString() : '300'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Ingredientes</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </CardHeader>
              <CardContent>
                {formData.ingredients.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay ingredientes agregados</p>
                    <Button type="button" variant="outline" className="mt-4" onClick={addIngredient}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar ingrediente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 items-start p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 grid grid-cols-6 gap-2">
                          <div className="col-span-2">
                            <Input
                              placeholder="Nombre"
                              value={ingredient.name}
                              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Cant."
                              value={ingredient.quantity || ''}
                              onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="Unidad"
                              value={ingredient.unit}
                              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Kcal"
                              value={ingredient.calories || ''}
                              onChange={(e) => updateIngredient(index, 'calories', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="P"
                              value={ingredient.protein || ''}
                              onChange={(e) => updateIngredient(index, 'protein', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Preparación</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar paso
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full text-sm font-medium shrink-0">
                        {index + 1}
                      </span>
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Paso ${index + 1}...`}
                        className="flex-1 min-h-[60px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInstruction(index)}
                        className="text-red-500"
                        disabled={formData.instructions.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Etiquetas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {recipeTags.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleTag(tag.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.tags.includes(tag.value)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Nutrition Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Resumen Nutricional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Calorías totales</span>
                    <span className="font-medium">{totalCalories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Por porción</span>
                    <span className="font-medium">{calculatedCaloriesPerServing} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Proteínas totales</span>
                    <span className="font-medium">
                      {formData.ingredients.reduce((sum, ing) => sum + (ing.protein || 0), 0).toFixed(1)}g
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? 'Guardar cambios' : 'Crear receta'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/recipes')}
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

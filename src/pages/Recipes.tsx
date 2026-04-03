import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  Flame,
  ChevronRight,
  Loader2,
  Filter,
  X
} from 'lucide-react';
import type { Recipe, RecipeTag } from '@/types';

const recipeTags: { value: RecipeTag; label: string; color: string }[] = [
  { value: 'vegan', label: 'Vegano', color: 'bg-green-100 text-green-800' },
  { value: 'vegetarian', label: 'Vegetariano', color: 'bg-lime-100 text-lime-800' },
  { value: 'gluten-free', label: 'Sin Gluten', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'dairy-free', label: 'Sin Lácteos', color: 'bg-blue-100 text-blue-800' },
  { value: 'keto', label: 'Keto', color: 'bg-purple-100 text-purple-800' },
  { value: 'low-carb', label: 'Bajo en Carbohidratos', color: 'bg-orange-100 text-orange-800' },
  { value: 'high-protein', label: 'Alto en Proteínas', color: 'bg-red-100 text-red-800' },
  { value: 'breakfast', label: 'Desayuno', color: 'bg-pink-100 text-pink-800' },
  { value: 'lunch', label: 'Almuerzo', color: 'bg-emerald-100 text-nutri-forest' },
  { value: 'dinner', label: 'Cena', color: 'bg-teal-100 text-teal-800' },
  { value: 'snack', label: 'Snack', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'dessert', label: 'Postre', color: 'bg-rose-100 text-rose-800' },
];

export function Recipes() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { recipes, loading, fetchRecipes, deleteRecipe, setSearchQuery, setSelectedTags, filteredRecipes } = useRecipeStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localSelectedTags, setLocalSelectedTags] = useState<RecipeTag[]>([]);

  useEffect(() => {
    if (user) {
      fetchRecipes(user.id);
    }
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchValue);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    setSelectedTags(localSelectedTags);
  }, [localSelectedTags]);

  const handleDelete = async () => {
    if (recipeToDelete) {
      await deleteRecipe(recipeToDelete.id);
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const toggleTag = (tag: RecipeTag) => {
    setLocalSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getTagStyle = (tag: RecipeTag) => {
    return recipeTags.find(t => t.value === tag)?.color || 'bg-gray-100 text-gray-800';
  };

  const getTagLabel = (tag: RecipeTag) => {
    return recipeTags.find(t => t.value === tag)?.label || tag;
  };

  const displayedRecipes = filteredRecipes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nutri-forest">Recetario</h1>
          <p className="text-gray-500 mt-1">Gestiona tus recetas y crea nuevas</p>
        </div>
        <Button onClick={() => navigate('/recipes/new')} className="bg-nutri-forest hover:bg-nutri-emerald">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Receta
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar recetas..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-gray-100' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {localSelectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {localSelectedTags.length}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Filtrar por etiquetas</Label>
                {localSelectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocalSelectedTags([])}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {recipeTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      localSelectedTags.includes(tag.value)
                        ? tag.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : displayedRecipes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-nutri-forest mb-1">
              {searchValue || localSelectedTags.length > 0 ? 'No se encontraron recetas' : 'No hay recetas registradas'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchValue || localSelectedTags.length > 0 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Comienza agregando tu primera receta'}
            </p>
            {!searchValue && localSelectedTags.length === 0 && (
              <Button onClick={() => navigate('/recipes/new')} className="bg-nutri-forest hover:bg-nutri-emerald">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Receta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRecipes.map((recipe) => (
            <Card key={recipe.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {recipe.name}
                    </CardTitle>
                    {recipe.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/recipes/${recipe.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setRecipeToDelete(recipe);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prep_time + recipe.cook_time} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} porc.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    <span>{recipe.calories_per_serving} kcal</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className={getTagStyle(tag)}>
                      {getTagLabel(tag)}
                    </Badge>
                  ))}
                  {recipe.tags.length > 3 && (
                    <Badge variant="secondary">+{recipe.tags.length - 3}</Badge>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  Ver receta
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la receta <strong>{recipeToDelete?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { Label } from '@/components/ui/label';

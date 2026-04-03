import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  Search, Plus, Edit, Trash2, Clock,
  Flame, Loader2, MoreVertical, Filter, X, Utensils, FileText
} from 'lucide-react';
import { RecipeForm } from './RecipeForm';
import type { Recipe, RecipeTag } from '@/types';
import { cn } from '@/lib/utils';

const recipeTags: { value: RecipeTag; label: string; cls: string }[] = [
  { value: 'vegan',        label: 'Vegano',           cls: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'vegetarian',  label: 'Vegetariano',       cls: 'bg-lime-50 text-lime-700 border-lime-200' },
  { value: 'gluten-free', label: 'Sin Gluten',        cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { value: 'dairy-free',  label: 'Sin Lácteos',       cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'keto',        label: 'Keto',              cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'low-carb',    label: 'Bajo en Carbs',     cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'high-protein',label: 'Alto en Proteínas', cls: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'breakfast',   label: 'Desayuno',          cls: 'bg-pink-50 text-pink-700 border-pink-200' },
  { value: 'lunch',       label: 'Almuerzo',          cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'dinner',      label: 'Cena',              cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  { value: 'snack',       label: 'Snack',             cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'dessert',     label: 'Postre',            cls: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export function Recipes() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loading, fetchRecipes, deleteRecipe, setSearchQuery, setSelectedTags, filteredRecipes } = useRecipeStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localSelectedTags, setLocalSelectedTags] = useState<RecipeTag[]>([]);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  useEffect(() => { if (user) fetchRecipes(user.id); }, [user]);
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchValue), 300);
    return () => clearTimeout(t);
  }, [searchValue]);
  useEffect(() => { setSelectedTags(localSelectedTags); }, [localSelectedTags]);

  const handleDelete = async () => {
    if (recipeToDelete) {
      await deleteRecipe(recipeToDelete.id);
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  const onSuccess = () => {
    setIsAddingRecipe(false);
    setEditingRecipeId(null);
    if (user) fetchRecipes(user.id);
  };

  const toggleTag = (tag: RecipeTag) =>
    setLocalSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const getTagMeta = (tag: RecipeTag) => recipeTags.find(t => t.value === tag);
  const displayedRecipes = filteredRecipes();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recetario</h1>
          <p className="text-slate-500 font-medium mt-1">
            {displayedRecipes.length} {displayedRecipes.length === 1 ? 'receta' : 'recetas'}
            {localSelectedTags.length > 0 && ` · ${localSelectedTags.length} filtros activos`}
          </p>
        </div>
        <Button
          onClick={() => setIsAddingRecipe(true)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white h-11 px-6 rounded-xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="h-5 w-5" /> Nueva Receta
        </Button>
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar recetas por nombre o ingredientes..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className="w-full h-12 pl-11 pr-4 text-sm font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn("h-12 px-5 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest gap-2 transition-all", showFilters ? "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800" : "bg-white text-zinc-600 hover:bg-zinc-50")}
        >
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      {/* Tag Filters */}
      {showFilters && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap gap-2">
            {recipeTags.map(tag => (
              <button
                key={tag.value}
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border",
                  localSelectedTags.includes(tag.value)
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-md shadow-zinc-200 scale-105"
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                )}
              >
                {tag.label}
              </button>
            ))}
            {localSelectedTags.length > 0 && (
              <button
                onClick={() => setLocalSelectedTags([])}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Column headers */}
        <div className="grid grid-cols-12 px-6 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <span className="col-span-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Receta</span>
          <span className="col-span-1 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden md:block text-center">Cal</span>
          <span className="col-span-2 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden lg:block text-center">Tiempo</span>
          <span className="col-span-3 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Etiquetas</span>
          <span className="col-span-1 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right"></span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500/20" />
          </div>
        ) : displayedRecipes.length === 0 ? (
          <div className="py-24 text-center px-6">
             <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Utensils className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900">No se encontraron recetas</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">
              Ajustá los filtros o cargá una nueva receta para verla en esta lista.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {displayedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="grid grid-cols-12 items-center px-6 py-4 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                {/* Name */}
                <div className="col-span-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 font-black text-sm shrink-0 uppercase">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">
                      {recipe.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{recipe.ingredients.length} ingredientes</p>
                  </div>
                </div>

                {/* Calories */}
                <div className="col-span-1 hidden md:flex flex-col items-center">
                  <span className="text-sm font-black text-slate-700">{recipe.calories_per_serving}</span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">kcal</span>
                </div>

                {/* Time */}
                <div className="col-span-2 hidden lg:flex flex-col items-center">
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    {recipe.cook_time + recipe.prep_time} min
                  </span>
                </div>

                {/* Tags */}
                <div className="col-span-3 hidden sm:flex items-center gap-1.5 flex-wrap">
                  {recipe.tags.slice(0, 2).map((tag) => {
                    const meta = getTagMeta(tag);
                    return meta && (
                      <span key={tag} className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${meta.cls}`}>
                        {meta.label}
                      </span>
                    );
                  })}
                  {recipe.tags.length > 2 && (
                    <span className="text-[10px] font-black text-slate-300">+{recipe.tags.length - 2}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end" onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200/50 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-200 shadow-xl p-1.5">
                      <DropdownMenuItem onClick={() => navigate(`/recipes/${recipe.id}`)} className="rounded-lg font-bold text-xs flex items-center gap-2.5 py-2 cursor-pointer">
                        <FileText className="h-4 w-4 text-blue-500" /> Ver receta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingRecipeId(recipe.id)} className="rounded-lg font-bold text-xs flex items-center gap-2.5 py-2 cursor-pointer">
                        <Edit className="h-4 w-4 text-emerald-500" /> Editar receta
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setRecipeToDelete(recipe);
                          setDeleteDialogOpen(true);
                        }}
                        className="rounded-lg font-bold text-xs flex items-center gap-2.5 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar receta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SHEET ADD/EDIT ── */}
      <Sheet open={isAddingRecipe || !!editingRecipeId} onOpenChange={(open) => {
        if (!open) {
          setIsAddingRecipe(false);
          setEditingRecipeId(null);
        }
      }}>
        <SheetContent className="sm:max-w-[450px] p-0 overflow-hidden border-l border-zinc-100 shadow-2xl flex flex-col">
          <SheetHeader className="p-6 border-b border-zinc-100 shrink-0">
            <SheetTitle className="text-xl font-black text-zinc-900">
              {editingRecipeId ? 'Editar Receta' : 'Nueva Receta'}
            </SheetTitle>
            <SheetDescription className="font-bold text-zinc-400 text-xs uppercase tracking-tighter">
              {editingRecipeId ? 'Actualiza los ingredientes y preparación' : 'Crea una nueva joya culinaria para tus pacientes'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <RecipeForm 
              initialId={editingRecipeId || undefined} 
              onSuccess={onSuccess} 
              onCancel={() => { setIsAddingRecipe(false); setEditingRecipeId(null); }} 
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-200 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-900">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Esta acción eliminará la receta <span className="font-black text-slate-900">"{recipeToDelete?.name}"</span>. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

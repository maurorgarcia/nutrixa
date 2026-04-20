import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useRecipeStore } from '@/stores/recipeStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator
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
  Loader2, MoreVertical, Filter, X, FileText, ChevronRight,
  Zap, Activity, AlertTriangle, BookOpen
} from 'lucide-react';
import { RecipeForm } from './RecipeForm';
import type { Recipe, RecipeTag } from '@/types';
import { cn } from '@/lib/utils';

const recipeTags: { value: RecipeTag; label: string; cls: string }[] = [
  { value: 'vegan',        label: 'Vegano',           cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { value: 'vegetarian',  label: 'Vegetariano',       cls: 'bg-teal-50 text-teal-600 border-teal-100' },
  { value: 'gluten-free', label: 'Sin Gluten',        cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'dairy-free',  label: 'Sin Lácteos',       cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  { value: 'keto',        label: 'Keto',              cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { value: 'low-carb',    label: 'Bajo en Carbs',     cls: 'bg-orange-50 text-orange-700 border-orange-100' },
  { value: 'high-protein',label: 'Alto Proteico',     cls: 'bg-rose-50 text-rose-700 border-rose-100' },
  { value: 'breakfast',   label: 'Desayuno',          cls: 'bg-slate-50 text-slate-500 border-slate-100' },
  { value: 'lunch',       label: 'Almuerzo',          cls: 'bg-slate-50 text-slate-500 border-slate-100' },
  { value: 'dinner',      label: 'Cena',              cls: 'bg-slate-50 text-slate-500 border-slate-100' },
  { value: 'snack',       label: 'Snack',             cls: 'bg-slate-50 text-slate-500 border-slate-100' },
  { value: 'dessert',     label: 'Postre',            cls: 'bg-slate-50 text-slate-500 border-slate-100' },
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
      const { error } = await deleteRecipe(recipeToDelete.id);
      if (error) {
        toast.error('No se pudo eliminar la receta. Si es una plantilla del sistema, no puede borrarse.');
      } else {
        toast.success('Receta eliminada correctamente');
      }
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

  if (loading && displayedRecipes.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
      </div>
    );
  }

  return (
    <div className="clinical-page space-y-6 max-w-full">
      
      {/* ── HEADER (Standard Pattern) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-senralis-main" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biblioteca Clínica</p>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Vademécum / Prescripciones</h1>
          <p className="text-sm font-bold text-slate-500 opacity-80">{displayedRecipes.length} registros validados</p>
        </div>
        <Button
          onClick={() => setIsAddingRecipe(true)}
          className="h-10 px-4 rounded-xl bg-senralis-main text-white font-bold text-xs uppercase tracking-widest"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Registro
        </Button>
      </div>

      {/* ── SEARCH & FILTERS (Compact) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative flex-1 group w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <Input 
                type="text" 
                placeholder="Buscar por componente o ingrediente..." 
                className="pl-11 h-11 bg-slate-50 border-transparent rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-senralis-main/20 transition-all w-full shadow-none"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
               />
            </div>
            <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-11 px-6 rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest transition-all gap-3 w-full md:w-auto",
                  showFilters ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                )}
            >
                <Filter className="h-4 w-4" /> {showFilters ? 'Cerrar' : 'Filtros'}
            </Button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
            {recipeTags.map(tag => (
              <button
                key={tag.value}
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                  localSelectedTags.includes(tag.value)
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                )}
              >
                {tag.label}
              </button>
            ))}
            {localSelectedTags.length > 0 && (
              <button onClick={() => setLocalSelectedTags([])} className="text-[9px] font-black uppercase tracking-widest text-rose-500 px-3 py-1.5 hover:underline">Limpiar</button>
            )}
          </div>
        )}
      </div>

      {/* ── RECIPE LIST (Compact Data Pattern) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {displayedRecipes.length === 0 ? (
          <div className="p-20 text-center">
             <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-4" />
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin resultados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {displayedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-senralis-main transition-colors">
                    <Zap className="h-4 w-4 text-senralis-soft" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-slate-900 truncate">{recipe.name}</h3>
                      {recipe.is_template && (
                        <Badge variant="outline" className="bg-slate-100 text-[8px] border-none text-slate-500 font-black tracking-widest px-1.5 h-4 uppercase">Sistema</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                       <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                          <Activity className="w-3 h-3" /> {recipe.ingredients.length} Ingred.
                       </p>
                       <span className="h-1 w-1 rounded-full bg-slate-200" />
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px] font-black tracking-widest border-slate-100">{recipe.calories_per_serving} KCAL</Badge>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> {recipe.prep_time + recipe.cook_time}'</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <div className="hidden lg:flex gap-2">
                      {recipe.tags.slice(0, 2).map((tag) => {
                        const meta = getTagMeta(tag);
                        return meta && (
                          <span key={tag} className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-transparent shadow-sm", meta.cls)}>
                            {meta.label}
                          </span>
                        );
                      })}
                   </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                         <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-slate-900 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl">
                         <DropdownMenuItem onClick={() => navigate(`/recipes/${recipe.id}`)} className="text-xs font-bold py-2.5">Detalles</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => setEditingRecipeId(recipe.id)} className="text-xs font-bold py-2.5">Editar</DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem 
                           className="text-xs font-bold py-2.5 text-rose-500"
                           onClick={(e) => {
                             e.stopPropagation();
                             setRecipeToDelete(recipe);
                             setDeleteDialogOpen(true);
                           }}
                         >
                           Eliminar
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                   <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-senralis-main transition-all" />
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
        <SheetContent className="sm:max-w-xl p-0 border-none shadow-2xl flex flex-col bg-white">
          <SheetHeader className="p-8 border-b border-slate-100 bg-[#0F172A] text-left shrink-0">
            <SheetTitle className="text-xl font-black text-white tracking-widest uppercase mb-1">Ficha Técnica</SheetTitle>
            <SheetDescription className="font-bold text-senralis-soft/70 text-[10px] uppercase tracking-widest">
              Control de Base Vademécum
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <RecipeForm 
              initialId={editingRecipeId || undefined} 
              onSuccess={onSuccess} 
              onCancel={() => { setIsAddingRecipe(false); setEditingRecipeId(null); }} 
            />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-slate-100 p-8 shadow-2xl">
          <AlertDialogHeader>
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
               <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <AlertDialogTitle className="text-lg font-black text-slate-900 tracking-tight uppercase">¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-slate-400 leading-relaxed mb-4">
              Esta acción eliminará definitivamente el registro de la base institucional.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-100 h-10 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-rose-600 text-white h-10 px-6 font-black text-[10px] uppercase tracking-widest hover:bg-rose-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

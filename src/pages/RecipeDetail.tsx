import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecipeStore } from '@/stores/recipeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  Users, 
  Flame, 
  Download, 
  Loader2, 
  CheckCircle2,
  ChefHat,
  Scale
} from 'lucide-react';
import { exportRecipeToPDF } from '@/utils/pdfExport';

export function RecipeDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedRecipe, getRecipeById, loading } = useRecipeStore();

  useEffect(() => {
    if (id) {
      getRecipeById(id);
    }
  }, [id]);

  const handleExport = () => {
    if (selectedRecipe) {
      exportRecipeToPDF(selectedRecipe);
    }
  };

  if (loading || !selectedRecipe) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-senralis-main" />
          <p className="text-sm text-slate-500 font-medium">Cargando receta...</p>
        </div>
      </div>
    );
  }

  const totalTime = selectedRecipe.prep_time + selectedRecipe.cook_time;
  
  // Tag styling helper
  const getTagStyle = (tag: string) => {
    const styles: Record<string, string> = {
      'vegan': 'bg-green-50 text-green-700 border-green-100',
      'vegetarian': 'bg-lime-50 text-lime-700 border-lime-100',
      'gluten-free': 'bg-yellow-50 text-yellow-700 border-yellow-100',
      'dairy-free': 'bg-blue-50 text-blue-700 border-blue-100',
      'keto': 'bg-purple-50 text-purple-700 border-purple-100',
      'low-carb': 'bg-orange-50 text-orange-700 border-orange-100',
      'high-protein': 'bg-red-50 text-red-700 border-red-100',
    };
    return styles[tag] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/recipes')}
            className="hover:bg-slate-100 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
              <span>Recetario</span>
              <span>/</span>
              <span className="text-senralis-main">Detalle</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedRecipe.name}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="rounded-xl font-bold border-slate-200">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button 
            onClick={() => navigate(`/recipes/${id}/edit`)}
            className="bg-senralis-dark hover:bg-senralis-main rounded-xl font-bold shadow-sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <div className="h-1 bg-amber-400" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tiempo</p>
                <p className="text-lg font-extrabold text-slate-900">{totalTime} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-blue-400" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Porciones</p>
                <p className="text-lg font-extrabold text-slate-900">{selectedRecipe.servings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-rose-400" />
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Flame className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Energía</p>
                <p className="text-lg font-extrabold text-slate-900">{selectedRecipe.calories_per_serving} kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <div className="h-1 bg-senralis-soft" />
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-1.5">
              {selectedRecipe.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className={`rounded-lg font-bold border-transparent ${getTagStyle(tag)}`}>
                  {tag.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Ingredients & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        
        {/* Ingredients Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-senralis-main" />
            <h2 className="text-xl font-bold text-slate-900">Ingredientes</h2>
          </div>
          
          <Card className="border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-senralis-main group-hover:scale-125 transition-transform" />
                      <span className="font-semibold text-slate-700">{ing.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                      {ing.quantity} {ing.unit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Macro Summary if available */}
          <Card className="bg-slate-900 text-white rounded-2xl border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Macronutrientes (Total)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">PROT</p>
                  <p className="text-lg font-extrabold">{selectedRecipe.ingredients.reduce((s, i) => s + (i.protein || 0), 0).toFixed(1)}g</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">CARB</p>
                  <p className="text-lg font-extrabold">{selectedRecipe.ingredients.reduce((s, i) => s + (i.carbs || 0), 0).toFixed(1)}g</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">GRAS</p>
                  <p className="text-lg font-extrabold">{selectedRecipe.ingredients.reduce((s, i) => s + (i.fats || 0), 0).toFixed(1)}g</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-senralis-main" />
            <h2 className="text-xl font-bold text-slate-900">Preparación</h2>
          </div>

          {selectedRecipe.description && (
            <p className="text-slate-500 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
              {selectedRecipe.description}
            </p>
          )}

          <div className="space-y-6">
            {selectedRecipe.instructions.map((step, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm shadow-md z-10">
                    {i + 1}
                  </div>
                  {i < selectedRecipe.instructions.length - 1 && (
                    <div className="flex-1 w-0.5 bg-slate-100 my-1 group-hover:bg-senralis-main/20 transition-colors" />
                  )}
                </div>
                <div className="flex-1 pt-0.5 pb-2">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

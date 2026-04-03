import { create } from 'zustand';
import { supabase, supabaseRestGet } from '@/lib/supabase/client';
import type { Recipe, RecipeFormData, RecipeTag } from '@/types';

interface RecipeState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: RecipeTag[];
  
  // Actions
  setRecipes: (recipes: Recipe[]) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: RecipeTag[]) => void;
  
  // CRUD Operations
  fetchRecipes: (userId: string) => Promise<void>;
  getRecipeById: (id: string) => Promise<Recipe | null>;
  createRecipe: (userId: string, data: RecipeFormData) => Promise<{ data: Recipe | null; error: string | null }>;
  updateRecipe: (id: string, data: Partial<RecipeFormData>) => Promise<{ error: string | null }>;
  deleteRecipe: (id: string) => Promise<{ error: string | null }>;
  
  // Computed
  filteredRecipes: () => Recipe[];
  getRecipesByTag: (tag: RecipeTag) => Recipe[];
  getTemplateRecipes: () => Recipe[];
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  selectedRecipe: null,
  loading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],

  setRecipes: (recipes) => set({ recipes }),
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),

  fetchRecipes: async (userId) => {
    const { recipes } = get();
    if (recipes.length === 0) {
      set({ loading: true, error: null });
    }
    try {
      const data = await supabaseRestGet('recipes', `select=*&or=(user_id.eq.${userId},is_template.eq.true)&order=created_at.desc`);
      set({ recipes: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  getRecipeById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        set({ error: error.message });
        return null;
      }

      set({ selectedRecipe: data as Recipe });
      return data as Recipe;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  createRecipe: async (userId, data) => {
    set({ loading: true, error: null });
    try {
      const recipeData = {
        user_id: userId,
        name: data.name,
        description: data.description || null,
        ingredients: data.ingredients,
        instructions: data.instructions,
        prep_time: parseInt(data.prep_time) || 0,
        cook_time: parseInt(data.cook_time) || 0,
        servings: parseInt(data.servings) || 1,
        calories_per_serving: parseInt(data.calories_per_serving) || 0,
        tags: data.tags,
        image_url: null,
        is_template: false,
      };

      const { data: newRecipe, error } = await (supabase as any)
        .from('recipes')
        .insert(recipeData)
        .select()
        .single();

      if (error) {
        set({ error: error.message, loading: false });
        return { data: null, error: error.message };
      }

      set(state => ({ 
        recipes: [newRecipe as Recipe, ...state.recipes],
        loading: false 
      }));

      return { data: newRecipe as Recipe, error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { data: null, error: err.message };
    }
  },

  updateRecipe: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updateData: any = { ...data };
      
      // Convert string numbers to integers
      if (data.prep_time) updateData.prep_time = parseInt(data.prep_time);
      if (data.cook_time) updateData.cook_time = parseInt(data.cook_time);
      if (data.servings) updateData.servings = parseInt(data.servings);
      if (data.calories_per_serving) updateData.calories_per_serving = parseInt(data.calories_per_serving);

      const { error } = await (supabase as any)
        .from('recipes')
        .update(updateData)
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      // Update local state
      set(state => ({
        recipes: state.recipes.map(r => 
          r.id === id ? { ...r, ...updateData } as Recipe : r
        ),
        selectedRecipe: state.selectedRecipe?.id === id 
          ? { ...state.selectedRecipe, ...updateData } as Recipe
          : state.selectedRecipe,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  deleteRecipe: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await (supabase as any)
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) {
        set({ error: error.message, loading: false });
        return { error: error.message };
      }

      set(state => ({
        recipes: state.recipes.filter(r => r.id !== id),
        selectedRecipe: state.selectedRecipe?.id === id ? null : state.selectedRecipe,
        loading: false,
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { error: err.message };
    }
  },

  filteredRecipes: () => {
    const { recipes, searchQuery, selectedTags } = get();
    
    return recipes.filter(recipe => {
      // Filter by search query
      const matchesSearch = !searchQuery.trim() || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => recipe.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  },

  getRecipesByTag: (tag) => {
    const { recipes } = get();
    return recipes.filter(r => r.tags.includes(tag));
  },

  getTemplateRecipes: () => {
    const { recipes } = get();
    return recipes.filter(r => r.is_template);
  },
}));

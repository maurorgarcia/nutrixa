import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { PatientForm } from '@/pages/PatientForm';
import { PatientDetail } from '@/pages/PatientDetail';
import { AnamnesisWizard } from '@/pages/AnamnesisWizard';
import { Recipes } from '@/pages/Recipes';
import { RecipeForm } from '@/pages/RecipeForm';
import { MealPlans } from '@/pages/MealPlans';
import { MealPlanForm } from '@/pages/MealPlanForm';
import { FollowUps } from '@/pages/FollowUps';
import { FollowUpForm } from '@/pages/FollowUpForm';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { Landing } from '@/pages/Landing';
import { PublicBooking } from '@/pages/PublicBooking';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { initializeAuth, loading, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/book/:slug" element={<PublicBooking />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        
        {/* Patients */}
        <Route path="/patients" element={<MainLayout><Patients /></MainLayout>} />
        <Route path="/patients/new" element={<MainLayout><PatientForm /></MainLayout>} />
        <Route path="/patients/:id" element={<MainLayout><PatientDetail /></MainLayout>} />
        <Route path="/patients/:id/edit" element={<MainLayout><PatientForm /></MainLayout>} />
        
        {/* Anamnesis */}
        <Route path="/patients/:patientId/anamnesis" element={<MainLayout><PatientDetail /></MainLayout>} />
        <Route path="/patients/:patientId/anamnesis/new" element={<MainLayout><AnamnesisWizard /></MainLayout>} />
        
        {/* Recipes */}
        <Route path="/recipes" element={<MainLayout><Recipes /></MainLayout>} />
        <Route path="/recipes/new" element={<MainLayout><RecipeForm /></MainLayout>} />
        <Route path="/recipes/:id" element={<MainLayout><Recipes /></MainLayout>} />
        <Route path="/recipes/:id/edit" element={<MainLayout><RecipeForm /></MainLayout>} />
        
        {/* Meal Plans */}
        <Route path="/meal-plans" element={<MainLayout><MealPlans /></MainLayout>} />
        <Route path="/meal-plans/new" element={<MainLayout><MealPlanForm /></MainLayout>} />
        <Route path="/meal-plans/:id" element={<MainLayout><MealPlanForm /></MainLayout>} />
        <Route path="/meal-plans/:id/edit" element={<MainLayout><MealPlanForm /></MainLayout>} />
        
        {/* Patient-specific Meal Plans */}
        <Route path="/patients/:patientId/meal-plans" element={<MainLayout><MealPlans /></MainLayout>} />
        <Route path="/patients/:patientId/meal-plans/new" element={<MainLayout><MealPlanForm /></MainLayout>} />
        <Route path="/patients/:patientId/meal-plans/:id" element={<MainLayout><MealPlanForm /></MainLayout>} />
        <Route path="/patients/:patientId/meal-plans/:id/edit" element={<MainLayout><MealPlanForm /></MainLayout>} />
        
        {/* Follow Ups */}
        <Route path="/follow-ups" element={<MainLayout><FollowUps /></MainLayout>} />
        <Route path="/follow-ups/new" element={<MainLayout><FollowUpForm /></MainLayout>} />
        <Route path="/follow-ups/:id" element={<MainLayout><FollowUpForm /></MainLayout>} />
        <Route path="/follow-ups/:id/edit" element={<MainLayout><FollowUpForm /></MainLayout>} />
        
        {/* Patient-specific Follow Ups */}
        <Route path="/patients/:patientId/follow-ups" element={<MainLayout><FollowUps /></MainLayout>} />
        <Route path="/patients/:patientId/follow-ups/new" element={<MainLayout><FollowUpForm /></MainLayout>} />
        <Route path="/patients/:patientId/follow-ups/:id" element={<MainLayout><FollowUpForm /></MainLayout>} />
        <Route path="/patients/:patientId/follow-ups/:id/edit" element={<MainLayout><FollowUpForm /></MainLayout>} />

        {/* Profile & Settings */}
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

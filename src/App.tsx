import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Patients } from '@/pages/Patients';
import { PatientDetail } from '@/pages/PatientDetail';
import { AnamnesisWizard } from '@/pages/AnamnesisWizard';
import { Recipes } from '@/pages/Recipes';
import { RecipeDetail } from '@/pages/RecipeDetail';
import { MealPlans } from '@/pages/MealPlans';
import { MealPlanForm } from '@/pages/MealPlanForm';
import { FollowUps } from '@/pages/FollowUps';
import { FollowUpForm } from '@/pages/FollowUpForm';
import { Turnera } from '@/pages/Turnera';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { Landing } from '@/pages/Landing';
import { PublicBooking } from '@/pages/PublicBooking';
import { Privacy } from '@/pages/Privacy';
import { Terms } from '@/pages/Terms';
import { Payments } from '@/pages/Payments';
import { Toaster } from '@/components/ui/sonner';

// ── ROUTE GUARDS ────────────────────────────────────────────────────────────

/**
 * ProtectedRoute: redirects to /login if no active session.
 * Renders null (no flash) while auth is still initializing.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return null; // wait silently — App.tsx shows the splash
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * PublicOnlyRoute: redirects authenticated users away from login/landing.
 * Prevents the flash of login form for already-logged-in users.
 */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  // While initializing auth, we allow rendering public pages (Landing) 
  // to avoid the splash screen on initial home visit.
  if (loading && !user) return <>{children}</>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ── ANIMATED ROUTES ─────────────────────────────────────────────────────────

/**
 * Applies a fade-in on top-level section changes only.
 * Uses the first two path segments as key so internal subroutes
 * (e.g. /patients/123/edit) animate only at the section level, not every click.
 */
function AnimatedRoutes({ user }: { user: any }) {
  const location = useLocation();

  // Key on first segment group: /patients/123/edit → "patients"
  // This prevents an animation flash on every sub-page navigation
  const sectionKey = '/' + (location.pathname.split('/')[1] || '');

  return (
    <div key={sectionKey} className="animate-in fade-in duration-200 fill-mode-both">
      <Routes location={location}>

        {/* ── PUBLIC ── */}
        <Route path="/" element={
          <PublicOnlyRoute><Landing /></PublicOnlyRoute>
        } />
        <Route path="/login" element={
          <PublicOnlyRoute><Login /></PublicOnlyRoute>
        } />
        <Route path="/book/:slug" element={<PublicBooking />} />
        <Route path="/privacy"    element={<Privacy />} />
        <Route path="/terms"      element={<Terms />} />

        {/* ── PROTECTED ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
        } />

        {/* Turnera */}
        <Route path="/turnera" element={
          <ProtectedRoute><MainLayout><Turnera /></MainLayout></ProtectedRoute>
        } />

        {/* Patients */}
        <Route path="/patients" element={
          <ProtectedRoute><MainLayout><Patients /></MainLayout></ProtectedRoute>
        } />
        <Route path="/patients/:id" element={
          <ProtectedRoute><MainLayout><PatientDetail /></MainLayout></ProtectedRoute>
        } />

        {/* Anamnesis */}
        <Route path="/patients/:patientId/anamnesis/new" element={
          <ProtectedRoute><MainLayout><AnamnesisWizard /></MainLayout></ProtectedRoute>
        } />

        {/* Recipes */}
        <Route path="/recipes" element={
          <ProtectedRoute><MainLayout><Recipes /></MainLayout></ProtectedRoute>
        } />
        <Route path="/recipes/:id" element={
          <ProtectedRoute><MainLayout><RecipeDetail /></MainLayout></ProtectedRoute>
        } />

        {/* Meal Plans */}
        <Route path="/meal-plans" element={
          <ProtectedRoute><MainLayout><MealPlans /></MainLayout></ProtectedRoute>
        } />
        <Route path="/meal-plans/new" element={
          <ProtectedRoute><MainLayout><MealPlanForm /></MainLayout></ProtectedRoute>
        } />
        <Route path="/meal-plans/:id" element={
          <ProtectedRoute><MainLayout><MealPlanForm /></MainLayout></ProtectedRoute>
        } />

        {/* Patient-specific Meal Plans */}
        <Route path="/patients/:patientId/meal-plans" element={
          <ProtectedRoute><MainLayout><MealPlans /></MainLayout></ProtectedRoute>
        } />
        <Route path="/patients/:patientId/meal-plans/new" element={
          <ProtectedRoute><MainLayout><MealPlanForm /></MainLayout></ProtectedRoute>
        } />
        <Route path="/patients/:patientId/meal-plans/:id" element={
          <ProtectedRoute><MainLayout><MealPlanForm /></MainLayout></ProtectedRoute>
        } />

        {/* Follow Ups */}
        <Route path="/follow-ups" element={
          <ProtectedRoute><MainLayout><FollowUps /></MainLayout></ProtectedRoute>
        } />
        <Route path="/follow-ups/new" element={
          <ProtectedRoute><MainLayout><FollowUpForm /></MainLayout></ProtectedRoute>
        } />
        <Route path="/follow-ups/:id" element={
          <ProtectedRoute><MainLayout><FollowUpForm /></MainLayout></ProtectedRoute>
        } />
        <Route path="/follow-ups/:id/edit" element={
          <ProtectedRoute><MainLayout><FollowUpForm /></MainLayout></ProtectedRoute>
        } />

        {/* Patient-specific Follow Ups */}
        <Route path="/patients/:patientId/follow-ups" element={
          <ProtectedRoute><MainLayout><FollowUps /></MainLayout></ProtectedRoute>
        } />
        <Route path="/patients/:patientId/follow-ups/new" element={
          <ProtectedRoute><MainLayout><FollowUpForm /></MainLayout></ProtectedRoute>
        } />
        <Route path="/patients/:patientId/follow-ups/:id" element={
          <ProtectedRoute><MainLayout><FollowUpForm /></MainLayout></ProtectedRoute>
        } />
        <Route path="/patients/:patientId/follow-ups/:id/edit" element={
          <ProtectedRoute><MainLayout><FollowUpForm /></MainLayout></ProtectedRoute>
        } />

        {/* Payments */}
        <Route path="/payments" element={
          <ProtectedRoute><MainLayout><Payments /></MainLayout></ProtectedRoute>
        } />

        {/* Profile & Settings */}
        <Route path="/profile" element={
          <ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><MainLayout><Settings /></MainLayout></ProtectedRoute>
        } />

        {/* Catch-all → intelligent: send logged users to dashboard, others to landing */}
        <Route path="*" element={
          user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
        } />

      </Routes>
    </div>
  );
}

// ── APP ─────────────────────────────────────────────────────────────────────

function App() {
  const { initializeAuth, user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes user={user} />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

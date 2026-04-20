import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    // Only redirect once auth is fully resolved (not while still loading)
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // While loading: show minimal inline indicator, not a fullscreen takeover
  // (App.tsx already handles the initial full-page load)
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(29,141,142,0.14),transparent_26%),linear-gradient(180deg,#f8fbfa_0%,#eef3f0_100%)]" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#1d8d8e]/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-slate-900/5 blur-3xl" />
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="surface-card flex flex-col items-center gap-5 px-10 py-8 text-center">
            <img src="/logoTexto.png" alt="Senralis" className="h-6 w-auto opacity-80" />
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-senralis-main animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-senralis-main animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-senralis-main animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Preparando entorno clínico</p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in yet — don't flash the layout, let the redirect take effect
  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(29,141,142,0.1),transparent_26%),linear-gradient(180deg,rgba(248,250,249,0.92),rgba(239,243,241,0.96))]" />
      <div className="pointer-events-none absolute left-[-8rem] top-20 h-64 w-64 rounded-full bg-[#1d8d8e]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-slate-900/5 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 h-screen transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
      </div>
      
      <div className="flex min-w-0 w-full flex-1 flex-col lg:w-auto">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px] overflow-x-hidden pb-12">
            {children}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
}

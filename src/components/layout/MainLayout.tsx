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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-5">
          <img src="/logoNutrixa.png" alt="Nutrixa" className="h-12 w-auto opacity-70" />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-nutri-emerald animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-nutri-emerald animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-nutri-emerald animate-bounce" style={{ animationDelay: '300ms' }} />
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
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      
      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 h-screen`}>
        <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto h-screen overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-12 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

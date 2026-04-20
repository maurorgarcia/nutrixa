import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings, Menu, Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  const trialEnd = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const showTrial =
    user?.plan === 'trial' && trialEnd && !Number.isNaN(trialEnd.getTime()) && trialEnd.getTime() > Date.now();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {showTrial && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-amber-900">
          Cuenta en prueba hasta {format(trialEnd, "d MMM yyyy", { locale: es })} — los datos de tu consultorio están aislados de otras cuentas.
        </div>
      )}
      <div className="mx-auto flex h-16 w-full items-center gap-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9 text-slate-500 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Info Area */}
        <div className="hidden md:flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                {format(new Date(), "EEEE dd 'de' MMMM", { locale: es })}
              </span>
              <span className="text-sm font-bold text-slate-900 leading-none">
                {getGreeting()}{firstName ? `, Dr/a. ${firstName}` : ''}
              </span>
           </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto hidden sm:block">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-senralis-main transition-colors" />
              <Input 
                placeholder="Buscar pacientes o protocolos..."
                className="h-9 w-full bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 pl-10 text-xs font-medium rounded-lg"
                onChange={(e) => {
                  if (e.target.value.length > 2) {
                    navigate(`/patients?q=${encodeURIComponent(e.target.value)}`);
                  }
                }}
              />
           </div>
        </div>

        <div className="ml-auto flex items-center gap-3">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1 pl-1 pr-3 rounded-xl hover:bg-slate-50 transition-colors group">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="bg-slate-900 text-white text-[10px] font-bold uppercase">
                    {user?.full_name ? getInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                   <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user?.full_name}</p>
                   <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl border-slate-100 mt-2">
              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-3">Gestión de Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg p-2.5 text-xs font-bold gap-3 cursor-pointer">
                <User className="w-4 h-4 text-slate-400" /> Perfil Profesional
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg p-2.5 text-xs font-bold gap-3 cursor-pointer">
                <Settings className="w-4 h-4 text-slate-400" /> Configuración System
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-lg p-2.5 text-xs font-bold gap-3 cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                <LogOut className="w-4 h-4" /> Finalizar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

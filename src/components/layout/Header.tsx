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
import { LogOut, User, Settings, Menu } from 'lucide-react';

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

  // Greeting based on time of day
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <header className="h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 sm:px-6 shrink-0">
      
      {/* Left: Mobile menu + greeting */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:block">
          <p className="text-xs font-medium text-zinc-400 leading-none mb-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p className="text-sm font-bold text-zinc-900 leading-none">
            {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
          </p>
        </div>

        {/* Mobile: just greeting */}
        <p className="text-sm font-bold text-zinc-900 sm:hidden">
          {getGreeting()}{firstName ? `, ${firstName}` : ''}
        </p>
      </div>

      {/* Right: User menu */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 px-2 h-10 rounded-xl hover:bg-zinc-50 border border-transparent hover:border-zinc-200/80 transition-all"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-nutri-forest text-white text-xs font-bold">
                  {user?.full_name ? getInitials(user.full_name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-zinc-900 leading-none">{user?.full_name}</p>
                <p className="text-[10px] text-zinc-400 font-medium leading-none mt-0.5">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 rounded-xl border-zinc-200/80 shadow-lg">
            <DropdownMenuLabel className="text-xs font-bold text-zinc-400 uppercase tracking-widest pb-1">
              Mi cuenta
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg cursor-pointer">
              <User className="mr-2 h-4 w-4 text-zinc-500" />
              <span className="font-medium">Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-zinc-500" />
              <span className="font-medium">Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-medium">Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

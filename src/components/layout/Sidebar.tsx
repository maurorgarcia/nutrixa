import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Settings,
  User,
  DollarSign,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const navigation = [
  { name: 'Dashboard',    href: '/dashboard',  icon: LayoutDashboard },
  { name: 'Agenda',       href: '/turnera',    icon: Calendar },
  { name: 'Pacientes',    href: '/patients',   icon: Users },
  { name: 'Prescripciones', href: '/recipes',   icon: BookOpen },
  { name: 'Protocolos',   href: '/meal-plans', icon: TrendingUp },
  { name: 'Honorarios',   href: '/payments',   icon: DollarSign },
];

const secondaryNavigation = [
  { name: 'Mi Perfil',      href: '/profile',  icon: User },
  { name: 'Configuración',  href: '/settings', icon: Settings },
];

interface SidebarProps {
  onNavClick?: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
  const { signOut } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="px-6 py-8">
        <img src="/logoTexto.png" alt="Senralis" className="h-6 w-auto" />
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 py-4 no-scrollbar">
        <div>
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Administración</p>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onNavClick}
                end={item.href === '/dashboard'}
                className={({ isActive }) => cn(
                  'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
                  isActive ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-4 w-4", isActive ? "text-senralis-main" : "text-slate-400 group-hover:text-slate-900")} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="h-4 w-4 text-slate-600" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Sistema</p>
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onNavClick}
                className={({ isActive }) => cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
                  isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("h-4 w-4", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => signOut()}
          className="group flex w-full items-center justify-between rounded-xl p-3 text-left transition-all hover:bg-rose-50 border border-transparent hover:border-rose-100"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 group-hover:bg-rose-100 transition-colors">
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Cerrar Sesión</p>
              <p className="text-[10px] font-medium text-slate-400">Finalizar Jornada</p>
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Settings,
  User,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard',    href: '/dashboard',  icon: LayoutDashboard },
  { name: 'Pacientes',    href: '/patients',   icon: Users },
  { name: 'Recetario',    href: '/recipes',    icon: BookOpen },
  { name: 'Planes',       href: '/meal-plans', icon: Calendar },
  { name: 'Seguimiento',  href: '/follow-ups', icon: TrendingUp },
  { name: 'Cobros',       href: '/payments',   icon: DollarSign },
];

const secondaryNavigation = [
  { name: 'Mi Perfil',      href: '/profile',  icon: User },
  { name: 'Configuración',  href: '/settings', icon: Settings },
];

interface SidebarProps {
  onNavClick?: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
  return (
    <div className="h-full w-64 bg-white border-r border-zinc-200/80 flex flex-col shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">

      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-100 shrink-0">
        <img
          src="/logoNutrixa.png"
          alt="Nutrixa"
          className="h-9 w-auto object-contain hover:opacity-80 transition-opacity"
        />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 px-3 pb-2">
          Clínica
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onNavClick}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                isActive
                  ? 'bg-emerald-50 text-nutri-forest border border-emerald-100/80'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200',
                  isActive ? 'bg-nutri-emerald/10' : 'group-hover:bg-zinc-100'
                )}>
                  <item.icon className={cn(
                    'h-4 w-4 transition-colors duration-200',
                    isActive ? 'text-nutri-emerald' : 'text-zinc-400 group-hover:text-zinc-600'
                  )} />
                </div>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Secondary nav */}
      <div className="px-3 py-4 border-t border-zinc-100 space-y-1 shrink-0">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 px-3 pb-2">
          Cuenta
        </p>
        {secondaryNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group',
                isActive
                  ? 'bg-zinc-100 text-zinc-900 border border-zinc-200/80'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200',
                  isActive ? 'bg-zinc-200' : 'group-hover:bg-zinc-100'
                )}>
                  <item.icon className={cn(
                    'h-4 w-4 transition-colors duration-200',
                    isActive ? 'text-zinc-700' : 'text-zinc-400 group-hover:text-zinc-600'
                  )} />
                </div>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

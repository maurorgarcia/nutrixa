import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Settings,
  Utensils,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Recetario', href: '/recipes', icon: BookOpen },
  { name: 'Planes', href: '/meal-plans', icon: Calendar },
  { name: 'Seguimiento', href: '/follow-ups', icon: TrendingUp },
];

const secondaryNavigation = [
  { name: 'Mi Perfil', href: '/profile', icon: User },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

interface SidebarProps {
  onNavClick?: () => void;
}

export function Sidebar({ onNavClick }: SidebarProps) {
  return (
    <div className="h-full w-64 bg-white border-r border-emerald-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo Area */}
      <div className="h-28 flex items-center justify-center px-6 border-b border-gray-100">
        <img 
          src="/logoNutrixa.png" 
          alt="Nutrixa" 
          className="h-12 w-auto max-w-full object-contain drop-shadow-sm transition-transform hover:scale-105" 
        />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "h-5 w-5 transition-colors duration-200", 
                  isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600"
                )} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Secondary Navigation */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {secondaryNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group',
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm border border-zinc-200'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn(
                  "h-5 w-5 transition-colors duration-200", 
                  isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600"
                )} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

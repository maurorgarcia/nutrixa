import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Activity, Users, CalendarDays } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, loading, user } = useAuthStore();
  
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setIsSignUp(true);
    }
  }, [searchParams]);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (error) {
        setError(error);
      } else {
        setError('Cuenta creada. Redirigiendo al dashboard...');
      }
    } else {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setError(error);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 bg-white">
      
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between bg-zinc-900 border-r border-zinc-800 lg:col-span-3 relative overflow-hidden">
        {/* Abstract beautiful Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=2653" 
          alt="Nutrition Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
        
        {/* Top left mini text */}
        <div className="relative z-10 p-10 lg:p-14">
          <div className="flex items-center gap-2 text-white/80 font-medium tracking-widest text-sm uppercase">
            <Activity className="h-4 w-4" />
            <span>Sistema Profesional de Salud</span>
          </div>
        </div>
        
        {/* Value Proposition */}
        <div className="relative z-10 p-10 lg:p-14 text-white space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both delay-300">
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Lleva tu consulta nutricional al siguiente nivel.
          </h1>
          <p className="text-lg text-zinc-300 leading-relaxed font-light">
            Una solución integral para profesionales: gestiona pacientes, diseña planes personalizados, controla tus ingresos y automatiza tu agenda, todo desde un único lugar.
          </p>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Pacientes</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <CalendarDays className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Turnera Pública</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex flex-col justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50 lg:col-span-2 relative">
        <div className="mx-auto w-full max-w-sm animate-in fade-in zoom-in-95 duration-700 fill-mode-both">
          
          {/* Logo */}
          <div className="flex justify-center mb-10 animate-in slide-in-from-top-4 duration-500 delay-150 fill-mode-both">
            <img 
              src="/logoNutrixa.png" 
              alt="Nutrixa" 
              className="h-20 w-auto object-contain drop-shadow-sm transition-transform duration-500 hover:scale-105" 
            />
          </div>

          <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 transition-all">
              {isSignUp ? 'Empieza hoy' : 'Bienvenido de nuevo'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp 
                ? 'Ingresa tus datos para crear tu cuenta profesional' 
                : 'Usa tus credenciales para acceder a tu escritorio'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
            {error && (
              <Alert variant={error.includes('creada') ? 'default' : 'destructive'} className="bg-red-50 text-red-700 border-red-200 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSignUp && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Nombre completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Lic. María Pérez"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="h-12 border-gray-300 focus:ring-emerald-600 focus:border-emerald-600 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
                />
              </div>
            )}

            <div className="space-y-1 transition-all duration-300">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 border-gray-300 focus:ring-emerald-600 focus:border-emerald-600 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
              />
            </div>

            <div className="space-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
                {!isSignUp && (
                  <a href="#" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-12 pr-10 border-gray-300 focus:ring-emerald-600 focus:border-emerald-600 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 text-white shadow-md rounded-lg transition-all duration-300 active:translate-y-0 active:shadow-md"
              disabled={loading}
            >
              <div className="relative flex items-center justify-center w-full">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span className="transition-all duration-300">{isSignUp ? 'Crear cuenta gratuita' : 'Ingresar a mi cuenta'}</span>
                )}
              </div>
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-50 text-gray-500">O también puedes</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors focus:outline-none"
              >
                {isSignUp 
                  ? '¿Ya tienes una cuenta? Inicia sesión' 
                  : '¿No tienes cuenta? Registrate como Profesional'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

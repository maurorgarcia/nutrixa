import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, CheckCircle, Calendar, BarChart3, FileText, ArrowLeft } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, loading, user } = useAuthStore();
  
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => {
    if (searchParams.get('signup') === 'true') setIsSignUp(true);
  }, [searchParams]);
  
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSignUp) {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      if (error) setError(error);
      else setError('Cuenta creada. Redirigiendo al dashboard...');
    } else {
      const { error } = await signIn(formData.email, formData.password);
      if (error) setError(error);
      else navigate('/dashboard');
    }
  };

  const features = [
    { icon: FileText, label: 'Expedientes clínicos completos' },
    { icon: Calendar, label: 'Turnera pública automatizada' },
    { icon: BarChart3, label: 'Métricas financieras en tiempo real' },
    { icon: CheckCircle, label: 'Planes dietoterapéuticos en minutos' },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 bg-white font-sans">
      
      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex flex-col justify-between lg:col-span-3 relative overflow-hidden bg-[#FAFAFA] border-r border-zinc-200">
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(14,157,90,0.08),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(14,157,90,0.05),transparent_70%)] pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10 p-10 lg:p-14">
          <Link to="/">
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-9 w-auto opacity-90 hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Center: Value prop */}
        <div className="relative z-10 px-10 lg:px-14 space-y-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-nutri-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-nutri-emerald" />
              Plataforma Clínica B2B
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-zinc-900 leading-[1.1]">
              Gestión profesional <br />sin complicaciones.
            </h1>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed max-w-lg">
              Todo lo que necesita tu consultorio en un único sistema: pacientes, dietas, turnos y finanzas.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 gap-4">
            {features.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors shrink-0">
                  <Icon className="h-4 w-4 text-zinc-500 group-hover:text-nutri-emerald transition-colors" />
                </div>
                <span className="text-sm font-semibold text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Trust */}
        <div className="relative z-10 p-10 lg:p-14">
          <div className="flex items-center gap-3 border-t border-zinc-200 pt-8">
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-200 object-cover" src="https://images.unsplash.com/photo-1594824432247-497d337f7cce?w=64&auto=format&fit=crop&q=80" alt="Professional" />
              <img className="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-200 object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&auto=format&fit=crop&q=80" alt="Professional" />
              <img className="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-200 object-cover" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=64&auto=format&fit=crop&q=80" alt="Professional" />
            </div>
            <p className="text-xs font-medium text-zinc-500">
              Confiado por <strong className="text-zinc-900">+2,400 nutricionistas</strong> en toda Latinoamérica.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex flex-col justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8 bg-white lg:col-span-2 relative">
        
        {/* Right Panel Header (Mobile only) */}
        <div className="md:hidden p-8 flex items-center justify-between border-b border-zinc-50 bg-white sticky top-0 z-30">
          <Link to="/">
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-8 w-auto" />
          </Link>
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 hover:text-zinc-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver
          </Link>
        </div>

        {/* Right Panel Header (Desktop) */}
        <div className="hidden md:flex p-10 justify-end absolute top-0 right-0 z-20">
           <Link to="/" className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 hover:text-zinc-600 transition-colors group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" /> Inicio
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm animate-in fade-in zoom-in-95 duration-700 relative flex-1 flex flex-col justify-center px-8 md:px-0">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">
              {isSignUp ? 'Empezar' : 'Entrar'}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {isSignUp
                  ? 'Plataforma Profesional Nutrixa'
                  : 'Escritorio de Control Central'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="h-12 border-gray-300 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12 border-gray-300 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
                {!isSignUp && (
                  <a href="#" className="text-xs font-medium text-nutri-forest hover:underline transition-colors">
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
                  className="h-12 pr-10 border-gray-300 focus:ring-nutri-emerald focus:border-nutri-emerald rounded-lg shadow-sm transition-all duration-200 hover:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-nutri-forest focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-nutri-emerald hover:bg-nutri-forest hover:shadow-lg hover:-translate-y-0.5 text-white shadow-md rounded-lg transition-all duration-300 active:translate-y-0"
              disabled={loading}
            >
              {loading
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <span>{isSignUp ? 'Crear cuenta gratuita' : 'Ingresar a mi cuenta'}</span>
              }
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">O también</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-sm font-medium text-nutri-forest hover:underline transition-all focus:outline-none"
              >
                {isSignUp
                  ? '¿Ya tenés cuenta? Iniciá sesión'
                  : '¿No tenés cuenta? Registrate como Profesional'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

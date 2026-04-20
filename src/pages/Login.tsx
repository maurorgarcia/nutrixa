import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, ShieldCheck, Activity, ArrowLeft, Mail, ArrowRight, Lock } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { signIn, loading, user } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await signIn(formData.email, formData.password);
    if (error) setError(error);
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* ── LEFT PANEL: INSTITUTIONAL CONTEXT ── */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-slate-900 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute inset-0 bg-gradient-to-br from-senralis-main/20 to-transparent" />
           <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20 group">
            <img src="/logoTexto.png" alt="Senralis" className="h-6 w-auto brightness-0 invert group-hover:scale-105 transition-transform" />
          </Link>

          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Acceso a la <br /> <span className="text-senralis-main">Infraestructura</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                Inicie sesión para gestionar su consultorio digital con los más altos estándares de seguridad y eficiencia clínica.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: ShieldCheck, title: "Seguridad de Datos", desc: "Encriptación AES-256 de nivel hospitalario." },
                { icon: Activity, title: "Trazabilidad Total", desc: "Monitoreo constante de la evolución del paciente." },
                { icon: Lock, title: "Soberanía Digital", desc: "Su información permanece bajo su control absoluto." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-senralis-main" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Medical Systems Standard</span>
          <div className="flex gap-4 grayscale opacity-40">
            <div className="h-4 w-12 bg-slate-600 rounded" />
            <div className="h-4 w-12 bg-slate-600 rounded" />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: AUTH FORM ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 relative overflow-hidden">
        {/* Subtle background detail */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-senralis-main/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-[400px] relative z-10 mt-12 md:mt-0">
           {/* Mobile Branding */}
           <div className="md:hidden flex flex-col items-center mb-12">
              <img src="/logoTexto.png" alt="Senralis" className="h-6 w-auto mb-3" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Platform</p>
           </div>

           <div className="mb-10 text-center md:text-left">
             <Link to="/" className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-senralis-main transition-colors mb-8 group">
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Inicio
             </Link>
             <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Portal Profesional</h2>
             <p className="text-slate-500 font-medium">Ingrese sus credenciales corporativas</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-rose-50 border-rose-100 text-rose-700 rounded-xl">
                  <AlertDescription className="text-xs font-bold uppercase tracking-wide">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Identificación / Email</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-300" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="doctor@senralis.app"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 focus:border-senralis-main outline-none transition-all font-medium text-[15px] shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between pl-1 pr-1">
                  <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contraseña</Label>
                  <button type="button" className="text-[10px] font-bold text-senralis-main hover:text-senralis-dark uppercase tracking-widest">¿Olvidó su clave?</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-300" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-12 py-3.5 focus:border-senralis-main outline-none transition-all font-medium text-[15px] shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl mt-4 flex items-center justify-center gap-2 "
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Acceder al Panel <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
           </form>

           <div className="mt-16 pt-10 border-t border-slate-100 text-center">
              <p className="text-sm font-medium text-slate-500 mb-4">¿No tiene acceso corporativo?</p>
              <Link to="/?demo=true" className="text-sm font-bold text-senralis-main hover:text-senralis-dark transition-colors">
                Solicite una demostración institucional
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}

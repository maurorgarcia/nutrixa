import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  CheckCircle,
  FileText,
  Smartphone,
  ArrowRight,
  Star,
  Activity,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-950 selection:bg-emerald-200 font-sans overflow-x-hidden">
      
      {/* ── BACKGROUND PATTERN ── */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

      {/* ── NAV ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-7 w-auto" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Características</a>
            <a href="#about" className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Misión</a>
            <a href="#pricing"  className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">Planes</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors">
              Iniciar Sesión
            </Link>
            <button
              onClick={() => navigate('/login?signup=true')}
              className="group relative inline-flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all overflow-hidden"
            >
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
              Probar Gratis
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-40 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Version Badge */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-1000 inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-zinc-200/80 rounded-full px-3 py-1 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-zinc-600 tracking-wide uppercase">Nutrixa v2.0 disponible</span>
              <span className="h-4 w-px bg-zinc-200" />
              <Link to="/login?signup=true" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Conoce más <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            
            {/* Headline */}
            <h1 className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both text-5xl md:text-7xl lg:text-[5.5rem] font-black text-zinc-950 leading-[1.05] tracking-tighter">
              El software definitivo para <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">nutricionistas de élite.</span>
            </h1>
            
            {/* Subhead */}
            <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto">
              Abandona las hojas de cálculo y las agendas en papel. Centraliza pacientes, dietas, seguimientos y turnos en una plataforma diseñada a la perfección.
            </p>

            {/* CTAs */}
            <div className="animate-in fade-in zoom-in-95 duration-1000 delay-700 fill-mode-both flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg px-8 py-4 rounded-full transition-all shadow-[0_8px_30px_rgb(5_150_105_/_0.3)] hover:shadow-[0_8px_40px_rgb(5_150_105_/_0.4)] hover:-translate-y-1"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#demo"
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-lg font-bold text-zinc-700 hover:text-zinc-950 bg-white px-8 py-4 rounded-full border border-zinc-200 transition-all hover:bg-zinc-50 hover:border-zinc-300 shadow-sm"
              >
                Ver plataforma
              </a>
            </div>

            {/* Trust logos */}
            <div className="animate-in fade-in duration-1000 delay-1000 fill-mode-both pt-16">
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Confiado por más de 500 profesionales y clínicas</p>
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {['NutriTech', 'VitalSys', 'HealthHub', 'ClinicaSanar', 'DietPro'].map(name => (
                  <span key={name} className="text-xl font-black tracking-tighter text-zinc-800">{name}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Epic Dashboard Preview */}
          <div id="demo" className="mt-24 relative max-w-6xl mx-auto perspective-[2000px]">
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-1000 fill-mode-both relative rounded-t-[2.5rem] md:rounded-[2.5rem] bg-white border border-zinc-200/50 shadow-2xl p-2 md:p-4 rotate-x-12 hover:rotate-x-0 transition-transform duration-1000 ease-out origin-bottom">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/5 to-transparent rounded-[2.5rem] backdrop-blur-3xl z-10 pointer-events-none" />
              <div className="rounded-[1.8rem] md:rounded-[2rem] overflow-hidden border border-zinc-100 bg-[#f8f9fa] shadow-inner relative z-0">
                {/* Mock Browser Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-zinc-100 rounded-md px-6 py-1.5 text-xs font-medium text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      app.nutrixa.com
                    </div>
                  </div>
                  <div className="w-12" /> {/* Spacer */}
                </div>
                {/* Image */}
                <img
                  src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=2670"
                  alt="Nutrixa Dashboard"
                  className="w-full h-auto object-cover object-top opacity-95 transition-opacity hover:opacity-100"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES ── */}
      <section id="features" className="py-32 relative z-10 bg-white border-y border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tight leading-[1.1] max-w-3xl">
              Diseñado al detalle para una <br className="hidden md:block" />
              <span className="text-emerald-600">experiencia inigualable.</span>
            </h2>
            <p className="mt-6 text-xl text-zinc-500 max-w-2xl font-medium">
              Cada funcionalidad es un módulo pensado para reducir la fricción diaria en la administración de tus consultas y pacientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
             
            {/* Feature 1 - Prominent (2 columns) */}
            <div className="group md:col-span-2 relative bg-zinc-50 rounded-[2rem] p-8 border border-zinc-200/60 overflow-hidden hover:bg-zinc-100/50 transition-colors">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-200/30 blur-3xl rounded-full -mr-20 -mt-20 transition-all group-hover:bg-emerald-300/40" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100 mb-auto">
                  <Users className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-950 mb-3">Expediente Clínico Universal</h3>
                  <p className="text-lg text-zinc-600 font-medium">
                    Fichas completas con anamnesis configurable, registro antropométrico inteligente, hábitos y evolución cronológica. Un historial médico que da gusto visualizar.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-zinc-950 rounded-[2rem] p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-2xl rounded-full transition-all group-hover:bg-emerald-500/30" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="bg-zinc-800 w-14 h-14 rounded-2xl flex items-center justify-center mb-auto">
                  <Calendar className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Agenda Inteligente</h3>
                  <p className="text-zinc-400 font-medium">
                    URL personalizada. Tus clientes agendan según tu disponibilidad en tiempo real. Adiós a las demoras por WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-[2rem] p-8 border border-zinc-200/60 overflow-hidden hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
              <div className="relative z-10 h-full flex flex-col">
                <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-auto">
                  <FileText className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-3">Dietas en 1 clic</h3>
                  <p className="text-zinc-600 font-medium">
                    Arma planes alimentarios con arrastrar y soltar. Exportalos a PDF corporativo con tu logo inmediatamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white rounded-[2rem] p-8 border border-zinc-200/60 overflow-hidden hover:shadow-xl hover:shadow-indigo-900/5 transition-all">
              <div className="relative z-10 h-full flex flex-col">
                <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-auto">
                  <Activity className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-3">Métricas Reales</h3>
                  <p className="text-zinc-600 font-medium">
                    Gráficos automáticos de asistencia, ingresos y retención de pacientes. Toda la data de tu negocio a simple vista.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white rounded-[2rem] p-8 border border-zinc-200/60 overflow-hidden hover:shadow-xl hover:shadow-rose-900/5 transition-all">
              <div className="relative z-10 h-full flex flex-col">
                <div className="bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-auto">
                  <Smartphone className="w-7 h-7 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-3">App Everywhere</h3>
                  <p className="text-zinc-600 font-medium">
                    Optimizado para escritorio, tablet y celular. Tu consultorio viaja con vos a donde quiera que vayas.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS / IMPACT ── */}
      <section className="py-24 bg-zinc-950 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-900/40 via-zinc-950 to-zinc-950" />
         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-zinc-800">
               <div className="pt-8 md:pt-0 md:pr-12">
                  <p className="text-5xl md:text-7xl font-black text-emerald-400 mb-2">10h+</p>
                  <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Ahorradas por mes</p>
               </div>
               <div className="pt-8 md:pt-0 md:px-12">
                  <p className="text-5xl md:text-7xl font-black text-emerald-400 mb-2">100%</p>
                  <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Privacidad Médica</p>
               </div>
               <div className="pt-8 md:pt-0 md:px-12">
                  <p className="text-5xl md:text-7xl font-black text-emerald-400 mb-2">2x</p>
                  <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Retención de Consultas</p>
               </div>
               <div className="pt-8 md:pt-0 md:pl-12 flex flex-col justify-center items-center md:items-start text-left">
                  <Zap className="w-10 h-10 text-amber-400 mb-4" />
                  <p className="text-lg font-bold text-zinc-100">Rápido como un rayo</p>
                  <p className="text-zinc-500 text-sm mt-1">Navegación instantánea entre secciones.</p>
               </div>
            </div>
         </div>
      </section>

      {/* ── ABOUT / MISSION ── */}
      <section id="about" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-zinc-200/50 border border-zinc-200/50 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-emerald-50/80 to-transparent pointer-events-none" />
            
            <div className="flex-1 relative z-10">
              <p className="inline-block bg-emerald-100 text-emerald-800 text-sm font-bold px-4 py-1.5 rounded-full mb-8">Nuestra Filosofía</p>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-950 leading-[1.1] mb-8">
                Construimos software <br />
                <span className="italic font-light text-zinc-500">que no se siente</span> como trabajo.
              </h2>
              <div className="space-y-6 text-xl text-zinc-600 font-medium">
                <p>
                  Nutrixa nació al observar que profesionales brillantes perdían su energía vital lidiando con excels arcaicos, emails traspapelados y PDFs horribles.
                </p>
                <p>
                  Creemos que tu herramienta de trabajo debe devolverte inspiración, asombrar a tus pacientes con su profesionalismo, y facilitarte la vida al extremo. <strong>Para que vos te dediques a sanar, mientras Nutrixa gestiona.</strong>
                </p>
              </div>
            </div>

            <div className="flex-1 w-full relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000" 
                alt="Filosofía Nutrixa" 
                className="w-full aspect-[4/5] md:aspect-square object-cover rounded-[2rem] shadow-xl rotate-2 hover:rotate-0 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-4">
                    <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Avatar"/>
                    <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Avatar"/>
                    <img className="w-12 h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar"/>
                  </div>
                  <div className="ml-2">
                    <p className="text-zinc-950 font-bold">Comunidad Activa</p>
                    <p className="text-zinc-500 text-sm">Mejorando cada día</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-32 bg-zinc-50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-zinc-950 tracking-tighter mb-6">
              Sin precios escondidos. <br />
              Total transparencia.
            </h2>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
              Nutrixa está en fase exclusiva de lanzamiento. Unite hoy y asegurá acceso total y vitalicio a todas nuestras funciones actuales.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white rounded-[3rem] p-2 shadow-2xl shadow-zinc-200/50 border border-zinc-200/80 relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] pointer-events-none" />
            <div className="bg-zinc-950 text-white rounded-[2.5rem] p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <Star className="text-emerald-400 w-10 h-10 fill-emerald-400 opacity-20" />
               </div>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-4">Founder's Plan</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-7xl font-black tracking-tighter">$0</span>
                <span className="text-zinc-400 text-lg font-medium">/ para siempre*</span>
              </div>
              
              <ul className="space-y-4 mb-10">
                {[
                  'Pacientes ilimitados para siempre',
                  'Fichas clínicas e historial completo',
                  'Turnera automática con link público',
                  'Constructor de dietas (Drag & Drop)',
                  'Soporte directo por chat',
                  'Actualizaciones sin costo'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
                    <span className="text-zinc-300 font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-black text-lg py-5 rounded-full transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.02]"
              >
                Reclamar Acceso
              </button>
              <p className="text-zinc-500 text-sm mt-6 text-center font-medium">* Válido solo durante el cupo de lanzamiento (primeros 1,000 usuarios).</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white pt-24 pb-12 border-t border-zinc-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <img src="/logoNutrixa.png" alt="Nutrixa" className="h-8 w-auto mix-blend-multiply" />
              <p className="text-lg text-zinc-500 font-medium max-w-sm">
                Redefiniendo la forma en que los profesionales de la nutrición impactan en el mundo.
              </p>
            </div>
            
            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-950">Plataforma</p>
              <ul className="space-y-4 text-zinc-600 font-medium">
                <li><a href="#features" className="hover:text-emerald-600 transition-colors">Características</a></li>
                <li><a href="#about" className="hover:text-emerald-600 transition-colors">Nosotros</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600 transition-colors">Precios</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <p className="text-sm font-bold uppercase tracking-widest text-zinc-950">Legal y Contacto</p>
              <ul className="space-y-4 text-zinc-600 font-medium">
                <li><Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-600 transition-colors">Términos</Link></li>
                <li><a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors inline-block mt-4 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-full">Hablar por WhatsApp</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500 font-medium">© {new Date().getFullYear()} Nutrixa Inc. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-sm text-zinc-500 font-medium">
              <span>Hecho con ❤️ en Argentina</span>
              <span>•</span>
              <span>Protección Ley 25.326</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

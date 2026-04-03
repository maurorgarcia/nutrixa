import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, CheckCircle, FileText, ArrowRight,
  Menu, X, Shield, Activity, BarChart3, ChevronRight, Check,
  ChevronDown
} from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-nutri-emerald/20 selection:text-nutri-forest overflow-x-hidden">
      
      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-zinc-200/50 shadow-sm py-1.5' : 'bg-transparent py-3'}`}>
        <div className="max-w-[85rem] mx-auto px-6 flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 outline-none rounded-lg group"
          >
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-7 md:h-8 w-auto group-hover:opacity-80 transition-opacity" />
          </button>

          <div className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-md rounded-full px-2 py-1 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] border border-white">
            <a href="#features" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm px-4 py-1.5 rounded-full transition-all duration-300">Infraestructura</a>
            <a href="#workflow" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm px-4 py-1.5 rounded-full transition-all duration-300">Sistema</a>
            <a href="#pricing" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm px-4 py-1.5 rounded-full transition-all duration-300">Licencias</a>
            <a href="#faq" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-white hover:shadow-sm px-4 py-1.5 rounded-full transition-all duration-300">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors px-2">
              Acceso Institucional
            </Link>
            <button
              onClick={() => navigate('/login?signup=true')}
              className="bg-nutri-forest hover:bg-zinc-900 text-white text-sm font-bold px-5 py-2 rounded-full transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 group"
            >
              Comenzar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden text-zinc-600 relative z-10">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl transition-all duration-300 origin-top overflow-hidden border-b border-zinc-100 ${isMenuOpen ? 'max-h-[400px] shadow-2xl opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-4 border-b border-zinc-100 pb-5">
              <a href="#features" onClick={()=>setIsMenuOpen(false)} className="text-base font-semibold text-zinc-600">Infraestructura</a>
              <a href="#workflow" onClick={()=>setIsMenuOpen(false)} className="text-base font-semibold text-zinc-600">Sistema</a>
              <a href="#pricing" onClick={()=>setIsMenuOpen(false)} className="text-base font-semibold text-zinc-600">Licencias</a>
              <a href="#faq" onClick={()=>setIsMenuOpen(false)} className="text-base font-semibold text-zinc-600">FAQ</a>
            </div>
            <div className="flex flex-col gap-4">
              <Link to="/login" onClick={()=>setIsMenuOpen(false)} className="text-base font-bold text-zinc-900 text-center py-2">
                Acceso Institucional
              </Link>
              <button
                onClick={() => { setIsMenuOpen(false); navigate('/login?signup=true'); }}
                className="bg-nutri-forest text-white text-base font-semibold px-5 py-4 rounded-xl shadow-sm w-full"
              >
                Comenzar gratis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-6 overflow-hidden">
        
        {/* Absolute premium background mesh */}
        <div className="absolute inset-0 z-0 opacity-40">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,157,90,0.1),rgba(255,255,255,0))]" />
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="max-w-[85rem] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
          
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-sm text-zinc-600 font-semibold text-xs animate-in fade-in slide-in-from-bottom-8 duration-700 hover:shadow-md transition-shadow cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nutri-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-nutri-emerald"></span>
              </span>
              Nutrixa Profesional — Plataforma B2B
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold tracking-tighter text-zinc-900 leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Gestión clínica <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-nutri-forest to-nutri-emerald">
                sin fricción.
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-zinc-500 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Unifica reportes antropométricos, diseño dietoterapéutico automatizado y agenda online en un entorno nativo hiper-veloz. Sin distracciones.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full sm:w-auto bg-nutri-forest text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 px-6 py-3.5 rounded-xl text-base font-bold flex items-center justify-center gap-2 group"
              >
                Configurar mi espacio
                <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
              <button
                 onClick={() => navigate('/login')}
                 className="w-full sm:w-auto text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 px-6 py-3.5 rounded-xl font-bold transition-colors duration-300"
              >
                 Acceso personal
              </button>
            </div>

            {/* Social Proof Avatars Restyled */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-4 border-t border-zinc-200/60 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 max-w-sm mx-auto lg:mx-0">
               <div className="flex -space-x-2.5">
                 <img className="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-200" src="https://images.unsplash.com/photo-1594824432247-497d337f7cce?w=100&auto=format&fit=crop&q=80" alt="Nutricionista" />
                 <img className="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-200" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80" alt="Médico" />
                 <img className="w-8 h-8 rounded-full border-2 border-[#FAFAFA] bg-zinc-200" src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80" alt="Especialista" />
               </div>
               <div className="text-xs font-medium text-zinc-500">
                 Estándar clínico elegido por <strong className="text-zinc-900 font-bold">+2,400 nutricionistas</strong>.
               </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl lg:max-w-none animate-in fade-in zoom-in-95 duration-1000 delay-200 relative">
            
            <div className="relative group/mockup isolate">
              {/* Floating Element UI */}
              <div className="absolute -left-6 md:-left-10 top-16 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-white p-3 hidden lg:flex items-center gap-3 z-20 transition-all duration-700 opacity-0 translate-y-4 group-hover/mockup:opacity-100 group-hover/mockup:translate-y-0 delay-100">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-nutri-emerald" />
                </div>
                <div className="pr-1">
                  <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">Protección Segura</p>
                  <p className="text-xs font-bold text-zinc-900">100% Encriptado</p>
                </div>
              </div>

              {/* Main mockup */}
              <div className="relative bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-[0_0_50px_rgba(0,0,0,0.04)] p-2 md:p-3 transform hover:-translate-y-1 transition-transform duration-700">
                <div className="bg-white rounded-2xl border border-zinc-200/50 shadow-sm overflow-hidden flex flex-col h-[280px] md:h-[400px]">
                  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FCFCFC] border-b border-zinc-100 h-10">
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=2670"
                    alt="Dashboard Nutrixa UI"
                    className="w-full h-full object-cover object-left-top opacity-95 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* ── MODULES / INFRASTRUCTURE ── */}
      <section id="features" className="py-16 md:py-24 bg-[#FAFAFA] relative border-t border-zinc-200/60">
        <div className="max-w-[85rem] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-emerald-600 font-bold tracking-widest uppercase text-xs mb-2">Arquitectura Modular</h2>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-[1.1] mb-4">
              Infraestructura diseñada para <span className="text-nutri-forest">alto rendimiento.</span>
            </h3>
            <p className="text-zinc-500 text-base font-medium leading-relaxed">
              Herramientas de clase empresarial, empaquetadas en la interfaz más intuitiva del mercado médico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            
            {[
              { icon: FileText, title: "Expediente Centralizado", desc: "Anamnesis completa, control de medicación y gráficos de evolución corporal progresiva." },
              { icon: CheckCircle, title: "Dietoterapia Dinámica", desc: "Construcción paramétrica de planes en base a un repositorio central y cálculos en vivo." },
              { icon: Calendar, title: "Turnera Inteligente", desc: "Portal web para pacientes sincronizado. Reduce ausentismo mediante notificaciones." }
            ].map((mod, i) => (
               <div key={i} className="group bg-white border border-zinc-200/80 rounded-2xl p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-300 relative overflow-hidden flex flex-col justify-center">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                   <div className="bg-[#FAFAFA] border border-zinc-100 h-12 w-12 rounded-[1rem] flex items-center justify-center mb-5 group-hover:bg-nutri-emerald group-hover:border-transparent transition-all duration-300 shadow-sm shrink-0">
                     <mod.icon className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                   </div>
                   <h4 className="text-lg font-bold text-zinc-900 mb-2">{mod.title}</h4>
                   <p className="text-zinc-500 font-medium leading-relaxed text-sm">
                     {mod.desc}
                   </p>
                 </div>
               </div>
            ))}

             <div className="group bg-zinc-950 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 p-8 lg:p-10 flex flex-col md:col-span-3 relative overflow-hidden mt-1">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(14,157,90,0.15),transparent)] pointer-events-none" />
               
               <div className="flex flex-col lg:flex-row gap-8 items-center justify-between relative z-10 w-full text-center lg:text-left">
                 <div className="flex-1 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full mb-4">
                      <BarChart3 className="w-3 h-3 text-nutri-lime" />
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Dashboard Gerencial</span>
                    </div>
                    <h4 className="text-2xl lg:text-3xl font-extrabold text-white mb-3 tracking-tight">
                      Auditoría financiera y proyecciones.
                    </h4>
                    <p className="text-zinc-400 font-medium leading-relaxed text-base">
                      Panel gerencial que monitorea métricas en tiempo real: nivel de retención, facturación y crecimiento. Respaldado en datos inmutables y de fácil interpretación visual.
                    </p>
                 </div>
                 <div className="shrink-0 mt-2 lg:mt-0">
                    <button onClick={() => navigate('/login?signup=true')} className="bg-white text-zinc-900 font-bold px-6 py-3.5 rounded-xl flex items-center gap-2 hover:bg-zinc-100 transition-colors shadow-lg">
                      Ver Estadísticas <ArrowRight className="w-4 h-4"/>
                    </button>
                 </div>
               </div>
             </div>

          </div>
        </div>
      </section>

      {/* ── WORKFLOW / SYSTEM ── */}
      <section id="workflow" className="py-16 md:py-24 bg-white border-t border-zinc-200/80 overflow-hidden">
        <div className="max-w-[85rem] mx-auto px-6">
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            
            <div className="flex-1 space-y-8">
              <div className="space-y-3">
                <h2 className="text-nutri-forest font-bold tracking-widest uppercase text-xs mb-2">Experiencia del paciente</h2>
                <h3 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-[1.1]">
                  Interacciones trazables.
                </h3>
                <p className="text-base text-zinc-500 font-medium leading-relaxed">
                  Automatiza el circuito completo: desde la cita agendada hasta la emisión del plan.
                </p>
              </div>

              <div className="relative">
                {/* Dashed Connecting Line */}
                <div className="absolute left-[1.35rem] top-6 bottom-6 w-px border-l-2 border-dashed border-zinc-200 hidden md:block" />

                <div className="space-y-6">
                  {[
                     { num: "01", title: "Carga Pre-Clínica", desc: "Formularios para que ingresen ya perfilados." },
                     { num: "02", title: "Sesión Terapéutica", desc: "Registro métrico e historial de guardado automático." },
                     { num: "03", title: "Emisión de Reporte", desc: "Exportación del plan y auto-agenda de siguiente control." }
                  ].map((step, i) => (
                    <div key={i} className="relative flex gap-5 md:gap-6 group">
                      <div className="w-11 h-11 bg-white border-2 border-zinc-200 rounded-xl flex items-center justify-center shrink-0 z-10 shadow-sm group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white text-zinc-400 font-extrabold text-sm transition-all duration-300">
                        {step.num}
                      </div>
                      <div className="pt-2">
                        <h4 className="text-lg font-bold text-zinc-900 mb-1">{step.title}</h4>
                        <p className="text-zinc-500 font-medium leading-relaxed text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative">
               <div className="relative rounded-[1.5rem] bg-zinc-900 p-1.5 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-700">
                 <img 
                   src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000" 
                   alt="Labor Nutrixa" 
                   className="w-full h-full lg:min-h-[400px] object-cover rounded-[1.25rem] opacity-90"
                 />
                 
                 <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end gap-3 z-20">
                   <div className="bg-white/95 backdrop-blur shadow-lg border border-white px-4 py-2.5 rounded-lg flex items-center gap-2">
                      <Shield className="w-4 h-4 text-zinc-900" />
                      <div>
                        <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest leading-none">Seguridad</p>
                        <p className="text-xs font-bold text-zinc-900 leading-tight block mt-0.5">Control Total</p>
                      </div>
                   </div>
                 </div>
               </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── NATIVE FAQ ACCORDION ── */}
      <section id="faq" className="py-16 md:py-20 bg-[#FAFAFA] border-t border-zinc-200/80">
        <div className="max-w-[42rem] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-3">Preguntas Frecuentes</h2>
            <p className="text-base text-zinc-500 font-medium">Transparencia absoluta técnica y operativa.</p>
          </div>
          
          <div className="space-y-3">
            {[
              {
                q: "¿Requiere instalación de alguna App?",
                a: "No. Nutrixa funciona en cualquier navegador (PC, Tablet, Celular) y no requiere que los pacientes instalen aplicaciones extras para visualizar sus turnos o dietas."
              },
              {
                q: "¿Dónde y cómo se protegen los datos?",
                a: "Empleamos encriptación AES-256 en servidores de alto resguardo clínico para asegurar que la confidencialidad médico-paciente esté protegida contra todo riesgo."
              },
              {
                q: "¿Puedo importar recetarios previos?",
                a: "Contamos con una suite fácil de 'copiar y pegar' donde agilizas el alta de tus dietas y menús propios rápidamente para disponer de ellos al recetar."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-zinc-200/80 rounded-xl [&_summary::-webkit-details-marker]:hidden open:border-zinc-300 transition-colors shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-bold text-zinc-900 text-sm md:text-base focus:outline-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-400 group-open:-rotate-180 transition-transform duration-300 shrink-0" />
                </summary>
                <div className="border-t border-zinc-100 px-5 pb-5 pt-3">
                  <p className="text-zinc-600 font-medium leading-relaxed text-sm">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING B2B ── */}
      <section id="pricing" className="py-16 md:py-24 bg-white border-t border-zinc-200/80 relative overflow-hidden">
        <div className="max-w-[85rem] mx-auto px-6 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-nutri-forest font-bold tracking-widest uppercase text-xs mb-2">Adquisición y Licencias</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight leading-[1.1] mb-4">Flexibilidad de Crecimiento</h3>
            <p className="text-base text-zinc-500 font-medium leading-relaxed">
              Integra el software de inmediato. Escalá según cómo evolucione tu clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[55rem] mx-auto items-center">
            
            {/* Plan Standard */}
            <div className="bg-[#FAFAFA] border border-zinc-200 rounded-[1.5rem] p-8 flex flex-col shadow-sm">
              <div className="mb-5">
                <h4 className="text-xl font-bold text-zinc-900 mb-1">Fundamental</h4>
                <p className="text-zinc-500 text-xs font-medium">Herramientas esenciales sin riesgo.</p>
              </div>
              <div className="mb-6 border-b border-zinc-200/80 pb-6">
                <span className="text-4xl font-extrabold text-zinc-900 tracking-tighter">Gratis</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Base limitada a 5 pacientes',
                  'Módulo clínico estándar',
                  'Cálculo dietoterapéutico básico',
                  'Soporte por email'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-zinc-200/80 flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5 text-zinc-500" />
                    </div>
                    <span className="text-zinc-600 font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full bg-white hover:bg-zinc-50 border-2 border-zinc-200 text-zinc-900 font-bold text-sm py-3.5 rounded-xl transition-colors mt-auto"
              >
                Implementar Gratis
              </button>
            </div>

            {/* Plan Profesional */}
            <div className="bg-zinc-950 rounded-[1.5rem] p-8 lg:p-10 flex flex-col relative overflow-hidden shadow-xl border border-zinc-800">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(14,157,90,0.2)_0%,transparent_70%)] rounded-full blur-3xl pointer-events-none" />
              
              <div className="mb-5 relative z-10 flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">Institucional Vitalicio</h4>
                  <p className="text-zinc-400 text-xs font-medium">Tratamiento para licencias Beta.</p>
                </div>
                <span className="bg-nutri-forest text-white text-[9px] uppercase font-extrabold tracking-widest px-2 py-1 rounded-full border border-nutri-emerald shadow-sm">
                  Exclusivo
                </span>
              </div>
              
              <div className="mb-6 border-b border-zinc-800 pb-6 relative z-10 flex items-end gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tighter">Bonificado</span>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1 relative z-10">
                {[
                  'Pacientes y expedientes ilimitados',
                  'Turnera pública web integrada',
                  'Suite dietoterapéutica full activa',
                  'Métricas gerenciales y finanzas',
                  'Soporte técnico preferencial'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-nutri-forest/30 flex items-center justify-center shrink-0 border border-nutri-forest/50">
                      <Check className="h-2.5 w-2.5 text-nutri-lime" />
                    </div>
                    <span className="text-zinc-300 font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full relative z-10 bg-white hover:bg-zinc-100 text-zinc-950 transition-all duration-300 font-extrabold text-sm py-3.5 rounded-xl flex justify-center items-center gap-2 group shadow-md"
              >
                Suscribirme Libre <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER DEEP B2B ── */}
      <footer className="bg-zinc-950 pt-16 pb-8 text-zinc-400 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        
        <div className="max-w-[85rem] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-8 mb-12">
            <div className="col-span-1 md:col-span-4 lg:col-span-5">
              <img src="/logoNutrixa.png" alt="Nutrixa" className="h-7 w-auto mb-5 brightness-0 invert opacity-90" />
              <p className="text-xs md:text-sm font-medium leading-relaxed mb-5 max-w-sm">
                Plataforma Clínica Especializada. Infraestructura digital orientada a la eficiencia operativa del nutricionista moderno institucional e independiente.
              </p>
              <div className="flex gap-3">
                 <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer">
                    <Activity className="w-3.5 h-3.5 text-zinc-500" />
                 </div>
                 <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer">
                    <Shield className="w-3.5 h-3.5 text-zinc-500" />
                 </div>
              </div>
            </div>

            {/* Link columns: 2-col on mobile, spread on desktop */}
            <div className="grid grid-cols-2 md:contents gap-8">
              <div className="md:col-span-1 lg:col-start-7 lg:col-span-2">
                <p className="text-[10px] font-extrabold text-white mb-4 uppercase tracking-widest">Plataforma</p>
                <ul className="space-y-3 text-xs md:text-sm font-medium">
                  <li><a href="#features" className="hover:text-white transition-colors">Sistema</a></li>
                  <li><a href="#workflow" className="hover:text-white transition-colors">Integración</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Licencia B2B</a></li>
                </ul>
              </div>

              <div className="md:col-span-1 lg:col-span-2">
                <p className="text-[10px] font-extrabold text-white mb-4 uppercase tracking-widest">Legales</p>
                <ul className="space-y-3 text-xs md:text-sm font-medium">
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                  <li><Link to="/terms" className="hover:text-white transition-colors">Términos</Link></li>
                  <li>
                    <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors group">
                      Contacto <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform"/>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] font-semibold text-zinc-500">
            <p>Copyright © {new Date().getFullYear()} Nutrixa. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-nutri-emerald animate-pulse" />
               Sistemas Operativos
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

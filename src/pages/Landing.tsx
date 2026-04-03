import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu, X, Shield, ChevronDown, Check, ArrowUp, ArrowRight,
  Monitor, Activity, FileText
} from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── CORPORATE NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white ${scrolled ? 'border-b border-gray-200 shadow-sm' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="outline-none flex items-center"
          >
            <img src="/logoNutrixa.png" alt="Nutrixa" className="h-7 w-auto" />
          </button>

          <div className="hidden md:flex items-center gap-8">
            <a href="#infraestructura" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Infraestructura</a>
            <a href="#flujos" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Sistema Operativo</a>
            <a href="#licencias" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Licencias Corporativas</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Acceso Institucional
            </button>
            <button
              onClick={() => navigate('/login?signup=true')}
              className="bg-[#0F172A] hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              Comenzar prueba
            </button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden text-slate-600">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden absolute top-20 inset-x-0 bg-white border-b border-gray-200 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
          <div className="px-6 py-4 flex flex-col gap-4">
            <a href="#infraestructura" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-700 py-2">Infraestructura</a>
            <a href="#flujos" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-700 py-2">Sistema Operativo</a>
            <a href="#licencias" onClick={() => setIsMenuOpen(false)} className="text-base font-semibold text-slate-700 py-2">Licencias Corporativas</a>
            <div className="h-px bg-gray-100 my-2"></div>
            <button onClick={() => navigate('/login')} className="w-full text-left text-base font-semibold text-slate-700 py-2">Acceso Institucional</button>
            <button onClick={() => navigate('/login?signup=true')} className="w-full bg-[#0F172A] text-white rounded-lg py-3 text-base font-semibold mt-2">Comenzar prueba</button>
          </div>
        </div>
      </nav>

      {/* ── B2B HERO SECTION ── */}
      <section className="pt-40 pb-24 md:pt-52 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-black tracking-tighter text-[#0F172A] leading-[1.1]">
              Sistema centralizado <br className="hidden lg:block"/> de gestión clínica.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Infraestructura de alto rendimiento para profesionales de la nutrición. 
              Centralice expedientes, dietoterapia automatizada y agendas web en un entorno seguro y nativo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full sm:w-auto bg-[#10B981] hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2"
              >
                Configurar mi espacio <ArrowRight className="w-4 h-4" />
              </button>
              <button
                 onClick={() => navigate('/login')}
                 className="w-full sm:w-auto text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-8 py-4 rounded-xl font-semibold text-base transition-colors"
              >
                 Contactar ventas
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full lg:w-auto">
             <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
               <div className="bg-slate-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
               </div>
               <img
                 src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=2670"
                 alt="Nutrixa Dashboard"
                 className="w-full h-auto object-cover border-b border-white"
               />
             </div>
          </div>
        </div>
      </section>

      {/* ── CLIENTS / TRUST SIGNALS ── */}
      <section className="border-y border-gray-100 bg-slate-50 py-12">
         <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-semibold text-slate-500 mb-8">Infraestructura confiable, integrada con los estándares del sector</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-60 grayscale">
              <span className="text-xl font-black text-slate-700">MediCare</span>
              <span className="text-xl font-black text-slate-700">NutriTech</span>
              <span className="text-xl font-black text-slate-700">HealthData API</span>
              <span className="text-xl font-black text-slate-700 hidden sm:block">BioSys</span>
              <span className="text-xl font-black text-slate-700 hidden md:block">Clinical Hub</span>
            </div>
         </div>
      </section>

      {/* ── INFRASTRUCTURE GRID ── */}
      <section id="infraestructura" className="py-24 md:py-32 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tighter leading-tight mb-6">
              Arquitectura diseñada <br className="hidden md:block"/> para escalabilidad clínica.
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Herramientas de clase empresarial, empaquetadas en una interfaz austera y altamente funcional. Elimine procesos redundantes en su consultorio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 mb-6">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Expediente Centralizado</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Anamnesis completa, control de medicación y cuadros gráficos de evolución en una sola vista estructurada.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 mb-6">
                <Activity className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Dietoterapia Dinámica</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Construcción paramétrica de planes en base a un repositorio central con macro-cálculos en vivo.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-500 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-100 mb-6">
                <Monitor className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-3">Turnera Inteligente</h3>
              <p className="text-slate-600 font-medium leading-relaxed">
                Portal web para pacientes. Recordatorios automáticos por WhatsApp y correo para reducir ausentismo.
              </p>
            </div>
            
            <div className="lg:col-span-3 bg-slate-900 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between border border-slate-800 relative overflow-hidden">
               <div className="relative z-10 max-w-2xl">
                 <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Auditoría financiera y proyecciones</h3>
                 <p className="text-slate-400 font-medium text-lg leading-relaxed">
                   Panel gerencial que monitorea retención, facturación y crecimiento global. Respaldado en bases de datos inmutables e interpretados visualmente para la toma de decisiones.
                 </p>
               </div>
               <button onClick={() => navigate('/login?signup=true')} className="relative z-10 w-full md:w-auto bg-white hover:bg-gray-100 text-[#0F172A] font-bold px-8 py-4 rounded-xl flex justify-center items-center gap-2 transition-colors shrink-0">
                 Activar entorno de prueba <ArrowRight className="w-5 h-5"/>
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW STRUCTURE ── */}
      <section id="flujos" className="py-24 md:py-32 bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="text-sm font-bold text-emerald-600 tracking-widest uppercase mb-4">Flujos estructurados</h2>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tighter leading-tight mb-6">
                  Interacciones trazables de punta a punta.
                </h3>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Automatice el ciclo completo de atención del paciente desde la agendación hasta la emisión del reporte nutricional.
                </p>
              </div>

              <div className="space-y-8">
                {[
                   { num: "01", title: "Carga Pre-Clínica", desc: "El paciente completa formatos web estandarizados para ingresar a la base de datos." },
                   { num: "02", title: "Sesión Terapéutica", desc: "Registro de variables clínicas en un entorno estructurado con autoguardado en tiempo real." },
                   { num: "03", title: "Emisión y Alta", desc: "Exportación del plan y automatización retrospectiva de futuras citas." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-emerald-600 font-black text-xl pt-1">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#0F172A] mb-2">{step.title}</h4>
                      <p className="text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full relative">
               <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1000" 
                   alt="Labor Nutrixa" 
                   className="w-full h-auto object-cover rounded-xl"
                 />
                 <div className="p-6 bg-white flex items-start gap-4">
                    <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-[#0F172A] mb-1">Privacidad y Cumplimiento</p>
                      <p className="text-sm font-medium text-slate-600">Base de datos encriptada en reposo, garantizando el absoluto secreto en la relación médico-paciente.</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── B2B PRICING ── */}
      <section id="licencias" className="py-24 md:py-32 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tighter leading-tight mb-6">
              Licenciamiento Corporativo
            </h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Adquisición de software bajo modelos predecibles, orientados a la expansión de centros médicos y nutricionistas independientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             
            {/* Standard Tier */}
            <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col hover:border-gray-300 transition-colors">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Fundamental</h3>
              <p className="text-slate-600 font-medium mb-8">Infraestructura limitada para entornos de prueba.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-[#0F172A] tracking-tighter">Gratis</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Base limitada a 5 pacientes activos',
                  'Módulo clínico predeterminado',
                  'Cálculo dietoterapéutico básico',
                  'Soporte estándar por correo'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold py-4 rounded-xl transition-colors text-base"
              >
                Crear entorno
              </button>
            </div>

            {/* Premium Tier */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-10 flex flex-col relative shadow-xl">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
                Sugerido
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Avanzado</h3>
              <p className="text-slate-400 font-medium mb-8">Despliegue operativo íntegro para profesionales.</p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white tracking-tighter">Consultar</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Pacientes y expedientes ilimitados',
                  'Turnera pública web integrada',
                  'Suite dietoterapéutica proactiva',
                  'Métricas gerenciales e historial',
                  'Soporte técnico preferencial con SLA'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-300 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors text-base"
              >
                Solicitar Acceso
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── MINIMAL FAQ ── */}
      <section id="faq" className="py-24 md:py-32 bg-slate-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tighter text-center mb-16">Transparencia Operativa</h2>
          <div className="space-y-4">
            {[
              {
                q: "¿Requiere instalación nativa en dispositivos?",
                a: "No. Nutrixa System opera integralmente sobre la nube como una PWA. Puede acceder desde cualquier dispositivo con un navegador moderno, sin descargar ejecutables pesados."
              },
              {
                q: "¿Cómo se auditan y controlan los datos clínicos?",
                a: "La información es almacenada en servidores dedicados bajo protocolos de encriptación estándar internacional (AES-256), restringiendo el acceso exclusivamente al administrador del entorno."
              },
              {
                q: "¿Cuáles son los límites de uso en la licencia gratuita?",
                a: "El plan Fundamental provee acceso técnico al 100% de la arquitectura básica, limitando únicamente el volumen de registros a 5 pacientes para pruebas de estrés técnico."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-6 p-6 font-bold text-[#0F172A] text-lg focus:outline-none select-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 text-slate-400 group-open:text-emerald-600 group-open:-rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-slate-600 font-medium leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── B2B FOOTER ── */}
      <footer className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <img src="/logoNutrixa.png" alt="Nutrixa" className="h-8 w-auto mb-6 grayscale opacity-80" />
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                Infraestructura digital especializada de alto rendimiento. Construida para resolver asimetrías de información y acelerar rutinas operatorias en consultorios.
              </p>
            </div>
            
            <div>
              <p className="text-xs font-black text-[#0F172A] mb-6 uppercase tracking-widest">Plataforma</p>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#infraestructura" className="hover:text-emerald-600 transition-colors">Infraestructura</a></li>
                <li><a href="#flujos" className="hover:text-emerald-600 transition-colors">Integraciones</a></li>
                <li><a href="#licencias" className="hover:text-emerald-600 transition-colors">Auditoría y Licencias</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-black text-[#0F172A] mb-6 uppercase tracking-widest">Legal</p>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link to="/privacy" className="hover:text-emerald-600 transition-colors">Aviso de Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-emerald-600 transition-colors">Términos de Servicio</Link></li>
                <li>
                  <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">
                    Soporte Técnico
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-400 font-medium">
              © {new Date().getFullYear()} Nutrixa System. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
               Sistemas Operativos en Línea
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Scroll Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 p-3 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        aria-label="Volver arriba"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

    </div>
  );
}

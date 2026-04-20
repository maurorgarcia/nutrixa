import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Menu, X, Shield, ChevronDown, Check, ArrowUp, ArrowRight,
  Monitor, Activity, FileText, User, Users, Mail, Globe, Phone, Calendar, Zap, Sparkles,
  ClipboardList, CreditCard, Layout, Layers, ShieldCheck, Database, Headphones, Stethoscope
} from 'lucide-react';

// ── CUSTOM HOOK FOR SCROLL REVEAL ──
function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export function Landing() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [demoData, setDemoData] = useState({ name: '', email: '', phone: '' });
  
  // Custom Calendar State
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0); 
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const months = ["Abril 2026", "Mayo 2026", "Junio 2026"];
  const handleNextMonth = () => setSelectedMonthIndex(p => Math.min(p + 1, months.length - 1));
  const handlePrevMonth = () => setSelectedMonthIndex(p => Math.max(p - 1, 0));

  const handleOpenDemoModal = () => {
    setIsDemoModalOpen(true);
    setDemoStep(1);
    setDemoData({ name: '', email: '', phone: '' });
    setSelectedMonthIndex(0);
    setSelectedDateIndex(null);
    setSelectedTimeSlot(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);

    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      handleOpenDemoModal();
      window.history.replaceState({}, '', window.location.pathname);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-50 selection:text-senralis-main overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group"
          >
            <img src="/logoTexto.png" alt="Senralis" className="h-6 w-auto group-hover:scale-105 transition-transform" />
          </button>

          <div className="hidden md:flex items-center gap-8">
            <a href="#soluciones" className="text-sm font-bold text-slate-600 hover:text-senralis-main transition-colors">Ecosistema</a>
            <a href="#especialidades" className="text-sm font-bold text-slate-600 hover:text-senralis-main transition-colors">Especialidades</a>
            <a href="#tecnologia" className="text-sm font-bold text-slate-600 hover:text-senralis-main transition-colors">Tecnología</a>
            
            <div className="h-4 w-px bg-slate-200 mx-2" />
            
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
               Acceso Profesional
            </button>
            <button 
              onClick={handleOpenDemoModal}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
              Agendar Demo
            </button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 md:hidden text-slate-600 focus:outline-none">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden absolute top-20 inset-x-0 bg-white border-b border-slate-200 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-8 flex flex-col gap-6">
            <a href="#soluciones" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-700">Ecosistema</a>
            <a href="#especialidades" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-700">Especialidades</a>
            <button 
              onClick={() => { setIsMenuOpen(false); navigate('/login'); }} 
              className="w-full text-center text-lg font-bold text-slate-900 py-3"
            >
              Acceso Profesional
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); handleOpenDemoModal(); }} 
              className="w-full bg-senralis-main text-white rounded-xl py-4 text-lg font-bold"
            >
              Solicitar Demostración
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="pt-40 pb-24 md:pt-52 md:pb-32 px-6 relative overflow-hidden bg-white">
        <div className="absolute top-20 left-[-10%] w-[40%] h-[400px] bg-teal-50/40 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="flex-1 space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Infraestructura Médica Certificada
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-[1] sm:text-6xl md:text-7xl lg:text-8xl">
              El Cerebro Digital de tu <span className="text-senralis-main">Consultorio</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Senralis unifica la agenda asistencial, el historial clínico y la gestión financiera en una sola infraestructura de alto rendimiento.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-4">
              <button
                onClick={handleOpenDemoModal}
                className="group w-full sm:w-auto bg-senralis-main hover:bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-teal-900/20 active:scale-95"
              >
                Comenzar ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
              >
                Acceso Profesional <ArrowUp className="w-4 h-4 rotate-45 text-slate-300" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full lg:w-auto relative animate-in fade-in slide-in-from-right duration-1000">
             <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-[0_40px_80px_rgba(0,0,0,0.15)] p-2 relative group hover:-translate-y-2 transition-transform duration-700">
               <div className="bg-white rounded-[1.8rem] overflow-hidden border border-slate-200">
                  <div className="p-8 bg-white aspect-[4/3] flex flex-col gap-8 relative">
                    <div className="flex gap-6">
                      <div className="flex-1 h-36 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                        <div className="w-1/3 h-2 bg-slate-200 rounded mb-6" />
                        <div className="w-full h-4 bg-senralis-main/20 rounded animate-pulse" />
                        <div className="w-2/3 h-2 bg-slate-100 rounded mt-4" />
                      </div>
                      <div className="flex-1 h-36 bg-slate-50 rounded-2xl border border-slate-100 p-6">
                        <div className="w-1/3 h-2 bg-slate-200 rounded mb-6" />
                        <div className="flex gap-2">
                           <div className="w-2 h-8 bg-slate-200 rounded" />
                           <div className="w-2 h-12 bg-senralis-main rounded" />
                           <div className="w-2 h-6 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 p-8 flex flex-col justify-center">
                       <div className="flex items-center justify-between mb-8">
                          <div className="w-1/4 h-3 bg-slate-200 rounded" />
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-senralis-main"><Users className="w-6 h-6" /></div>
                       </div>
                       <div className="space-y-4">
                          {[1,2].map(i => (
                            <div key={i} className="h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-between px-4">
                               <div className="w-1/3 h-2 bg-slate-50 rounded" />
                               <div className="w-8 h-4 bg-teal-50 rounded" />
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── CORE PILLARS section ── */}
      <section id="soluciones" className="py-24 md:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row gap-20">
              <div className="lg:w-1/3 sticky top-32 h-fit">
                 <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                   Una Infraestructura <br /> <span className="text-senralis-main">Sin Costuras</span>.
                 </h2>
                 <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
                   Elimina la fragmentación de herramientas. Todo lo que tu práctica profesional necesita, integrado de forma nativa.
                 </p>
                 <div className="space-y-6">
                    {[
                      { icon: Calendar, label: "Agenda Centralizada" },
                      { icon: FileText, label: "Epicrisis Digital" },
                      { icon: CreditCard, label: "Gestión de Honorarios" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 text-slate-900 font-bold">
                        <div className="w-10 h-10 bg-teal-50 text-senralis-main rounded-xl flex items-center justify-center"><item.icon className="w-5 h-5" /></div>
                        {item.label}
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8">
                 <PillarCard 
                    icon={CalendarClock} 
                    title="Agendamiento Público" 
                    desc="Tu propio micrositio de reservas vinculado en tu perfil de Instagram o Web. Reduce el intercambio de mensajes en un 90%."
                 />
                 <PillarCard 
                    icon={ClipboardList} 
                    title="Historial Evolutivo" 
                    desc="Registra cada sesión con plantillas personalizables. Accede a la evolución cronológica del paciente en milisegundos."
                 />
                 <PillarCard 
                    icon={Layers} 
                    title="Ecosistema de Pagos" 
                    desc="Monitorea tus ingresos mensuales, deudas de pacientes y cobros realizados sin usar planillas externas."
                 />
                 <PillarCard 
                    icon={Headphones} 
                    title="Recordatorios Automáticos" 
                    desc="Sistema inteligente de alertas vía WhatsApp para confirmar asistencia y reducir el ausentismo clínico."
                    tone="teal"
                 />
              </div>
           </div>
        </div>
      </section>

      {/* ── ESPECIALIDADES section ── */}
      <section id="especialidades" className="py-24 md:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-20 max-w-4xl mx-auto">
             Diseñado para la <span className="text-senralis-main underline decoration-teal-500/20 underline-offset-8">Excelencia</span> en cualquier rama de la salud.
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { icon: Activity, name: "Nutrición" },
               { icon: Stethoscope, name: "Medicina General" },
               { icon: Zap, name: "Kinesiología" },
               { icon: User, name: "Psicología" },
               { icon: ClipboardList, name: "Odontología" },
               { icon: Target, name: "Entrenamiento" },
               { icon: Sparkles, name: "Estética" },
               { icon: Globe, name: "Telemedicina" }
             ].map((item, i) => (
               <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-senralis-main transition-all group hover:shadow-xl hover:-translate-y-1">
                 <item.icon className="w-8 h-8 text-slate-200 mb-4 mx-auto group-hover:text-senralis-main transition-colors" />
                 <p className="font-bold text-slate-900">{item.name}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                text: "Antes usaba Excel y WhatsApp. Senralis automatizó todo mi flujo de turnos y me devolvió 5 horas de mi semana.",
                author: "Dr. Marcos Ruiz", role: "Cardiología"
              },
              { 
                text: "La interfaz es impecable. Mis pacientes aman poder agendar solos y yo amo no tener que cobrar manualmente.",
                author: "Lic. Clara Mendez", role: "Nutricionista"
              },
              { 
                text: "Es el estándar que buscábamos. La seguridad de los datos y el historial evolutivo son los mejores del mercado.",
                author: "Clínica Versal", role: "Institución"
              }
            ].map((t, i) => (
              <div key={i} className="flex flex-col justify-between h-full space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
                 <p className="text-xl font-medium text-slate-600 leading-relaxed italic">"{t.text}"</p>
                 <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                    <div>
                       <p className="font-bold text-slate-900">{t.author}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-senralis-main/20 blur-[100px] pointer-events-none" />
           <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                La Profesionalización <br /> de tu Práctica comienza <span className="text-senralis-main">Hoy</span>.
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <button onClick={handleOpenDemoModal} className="w-full sm:w-auto bg-senralis-main hover:bg-white hover:text-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl">
                   Solicitar Demo Gratis
                 </button>
                 <button onClick={() => navigate('/login')} className="w-full sm:w-auto text-white/60 hover:text-white font-bold transition-colors">
                   Acceso para Profesionales
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <img src="/logoTexto.png" alt="Senralis" className="h-5 w-auto" />
          <div className="flex gap-8 text-sm font-bold text-slate-400">
             <a href="#" className="hover:text-slate-900 transition-colors">Privacidad</a>
             <a href="#" className="hover:text-slate-900 transition-colors">Términos</a>
             <a href="#" className="hover:text-slate-900 transition-colors">Consultas</a>
          </div>
          <p className="text-sm font-bold text-slate-300">© 2026 Senralis Infrastructure.</p>
        </div>
      </footer>

      {/* ── REFINED DEMO MODAL ── */}
      {isDemoModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsDemoModalOpen(false)}></div>
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row min-h-[600px] max-h-[90dvh]">
            <button onClick={() => setIsDemoModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors z-[50]">
              <X className="w-6 h-6" />
            </button>
            <div className="hidden md:flex md:w-[40%] bg-slate-900 p-12 flex-col justify-between text-white">
               <div>
                  <img src="/logoTexto.png" alt="Senralis" className="h-5 w-auto brightness-0 invert mb-20" />
                  <h3 className="text-4xl font-extrabold mb-6 leading-tight">Agenda una Demo Privada</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Mostramos como Senralis puede automatizar tu consultorio en 15 minutos.</p>
               </div>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                 <Database className="w-3 h-3" /> Data Architecture: Cluster-01
               </div>
            </div>
            <div className="flex-1 p-8 md:p-12 bg-white overflow-y-auto no-scrollbar">
               {/* Modal content same as before but styled cleaner... */}
               {demoStep === 1 && (
                <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Selecciona un horario disponible</h3>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center text-slate-900 font-bold font-mono text-sm">
                       <span>{months[selectedMonthIndex]}</span>
                       <div className="flex gap-2">
                         <button onClick={handlePrevMonth} disabled={selectedMonthIndex === 0} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-20"><ChevronDown className="w-4 h-4 rotate-90" /></button>
                         <button onClick={handleNextMonth} disabled={selectedMonthIndex === 2} className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 disabled:opacity-20"><ChevronDown className="w-4 h-4 -rotate-90" /></button>
                       </div>
                    </div>
                    <div className="p-6 grid grid-cols-7 gap-2">
                      {['L','M','X','J','V','S','D'].map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase mb-4">{d}</div>)}
                      {[...Array(30)].map((_, i) => (
                        <button key={i} onClick={() => setSelectedDateIndex(i + 1)} className={cn("h-10 rounded-xl text-xs font-bold transition-all", selectedDateIndex === i + 1 ? 'bg-senralis-main text-white shadow-xl' : 'hover:bg-slate-100 text-slate-600')}>{i + 1}</button>
                      ))}
                    </div>
                  </div>
                  {selectedDateIndex && (
                     <div className="animate-in fade-in duration-300 space-y-6">
                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                           {['09:00', '11:00', '15:30', '17:00'].map(t => (
                             <button key={t} onClick={() => setSelectedTimeSlot(t)} className={cn("px-6 py-3 rounded-xl border font-bold text-sm transition-all shrink-0", selectedTimeSlot === t ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900')}>{t}</button>
                           ))}
                        </div>
                        <button onClick={() => setDemoStep(2)} disabled={!selectedTimeSlot} className="w-full bg-senralis-main text-white py-5 rounded-2xl font-bold shadow-2xl active:scale-[0.98] disabled:opacity-50">Continuar</button>
                     </div>
                  )}
                </div>
               )}
               {demoStep === 2 && (
                 <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                    <h3 className="text-2xl font-bold text-slate-900 mb-10">Tus datos institucionales</h3>
                    <div className="space-y-6 mb-12">
                       <input type="text" placeholder="Tu nombre" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-senralis-main font-medium transition-all" value={demoData.name} onChange={(e) => setDemoData({...demoData, name: e.target.value})} />
                       <input type="email" placeholder="Email corporativo" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 outline-none focus:border-senralis-main font-medium transition-all" value={demoData.email} onChange={(e) => setDemoData({...demoData, email: e.target.value})} />
                    </div>
                    <div className="flex gap-4">
                       <button onClick={() => setDemoStep(1)} className="px-6 font-bold text-slate-400">Atrás</button>
                       <button onClick={() => setDemoStep(3)} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-bold shadow-xl">Confirmar Reserva</button>
                    </div>
                 </div>
               )}
               {demoStep === 3 && (
                 <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-teal-50 text-senralis-main rounded-full flex items-center justify-center mb-8"><Check className="w-10 h-10" /></div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">¡Listo!</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mb-10">Te enviamos los detalles de la demo a tu correo electrónico.</p>
                    <button onClick={() => setIsDemoModalOpen(false)} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold">Cerrar</button>
                 </div>
               )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── HELPERS ──

function PillarCard({ icon: Icon, title, desc, tone = 'slate' }: { icon: any, title: string, desc: string, tone?: 'slate' | 'teal' }) {
  return (
    <div className={cn(
      "p-10 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden h-full flex flex-col justify-between",
      tone === 'teal' ? "bg-teal-50/20 border-teal-100 hover:bg-teal-50" : "bg-white border-slate-100 hover:border-senralis-main/20 hover:shadow-xl hover:-translate-y-2"
    )}>
       <div className="relative z-10">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-10 group-hover:text-senralis-main transition-colors duration-500"><Icon className="w-7 h-7" /></div>
          <h3 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">{title}</h3>
          <p className="text-[15px] font-medium text-slate-500 leading-relaxed">{desc}</p>
       </div>
       <div className="mt-8 relative z-10">
          <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-senralis-main transition-colors">
            Explorar Módulo <ArrowRight className="w-3.5 h-3.5" />
          </button>
       </div>
    </div>
  );
}

const CalendarClock = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M18 22a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M18 16.5V18l1 1"/></svg>
);

const Target = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);

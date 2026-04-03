import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  CheckCircle,
  FileText,
  Smartphone,
  ArrowRight,
  Star
} from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── NAV ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src="/logoNutrixa.png" alt="Nutrixa" className="h-8 w-auto" />

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-medium">Funciones</a>
            <a href="#pricing"  className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-medium">Precios</a>
            <a href="#about"    className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors font-medium">Nosotros</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-2">
              Ingresar
            </Link>
            <button
              onClick={() => navigate('/login?signup=true')}
              className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Empezar gratis
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-28 pb-20 bg-gradient-to-b from-zinc-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-4 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Software para nutricionistas · Gratis
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-950 leading-tight tracking-tight">
              Tu consulta nutricional,{' '}
              <span className="text-emerald-600">organizada y profesional.</span>
            </h1>
            
            {/* Sub */}
            <p className="text-lg text-zinc-500 font-normal leading-relaxed max-w-2xl mx-auto">
              Nutrixa centraliza la gestión de pacientes, los planes de alimentación, la agenda online y el seguimiento clínico en una sola herramienta. Simple, elegante y diseñada para especialistas.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Empezar gratis
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center text-base font-semibold text-zinc-700 hover:text-zinc-900 px-8 py-3.5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all"
              >
                Ver demo
              </Link>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 pt-2 text-sm text-zinc-500">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="font-medium">Valorado por más de 150 profesionales</span>
            </div>
          </div>

          {/* Product screenshot */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200">
              {/* Fake browser bar */}
              <div className="flex items-center gap-1.5 bg-zinc-100 px-4 py-2.5 border-b border-zinc-200">
                <span className="h-3 w-3 rounded-full bg-red-300" />
                <span className="h-3 w-3 rounded-full bg-yellow-300" />
                <span className="h-3 w-3 rounded-full bg-green-300" />
                <div className="ml-3 flex-1 bg-white rounded-md px-3 py-1 text-xs text-zinc-400 text-center">
                  app.nutrixa.com
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=2670"
                alt="Nutrixa Dashboard"
                className="w-full h-auto block"
              />
            </div>
            {/* Subtle glow below the image */}
            <div className="absolute -bottom-10 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / LOGOS ── */}
      <section className="py-14 border-y border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-8">
            Elegido por profesionales de la nutrición en todo el país
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 opacity-40">
            {['NutriCheck', 'ClinicMax', 'ProHealth', 'MedSaaS', 'VitalCare'].map(name => (
              <span key={name} className="text-lg font-bold text-zinc-800 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3">Plataforma completa</p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 leading-tight">
              Todo lo que necesitás para gestionar tu consulta.
            </h2>
            <p className="mt-4 text-base text-zinc-500 leading-relaxed">
              Diseñamos cada función pensando en el flujo real de trabajo de un nutricionista.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                color: 'bg-emerald-50 text-emerald-600',
                title: 'Gestión de Pacientes',
                desc: 'Fichas clínicas completas con historial, anamnesis, antropometría y seguimiento de evolución.'
              },
              {
                icon: Calendar,
                color: 'bg-blue-50 text-blue-600',
                title: 'Turnera Online',
                desc: 'Un link propio para que tus pacientes agenden turnos según tu disponibilidad, sin llamadas.'
              },
              {
                icon: FileText,
                color: 'bg-violet-50 text-violet-600',
                title: 'Planes Alimentarios',
                desc: 'Generá dietas personalizadas con tu biblioteca de recetas y exportalas en PDF profesional.'
              },
              {
                icon: BarChart3,
                color: 'bg-amber-50 text-amber-600',
                title: 'Estadísticas',
                desc: 'Visualizá ingresos, cobros pendientes y evolución de pacientes con reportes automáticos.'
              },
              {
                icon: Smartphone,
                color: 'bg-rose-50 text-rose-600',
                title: 'Mobile Ready',
                desc: 'Accedé desde tu celular o tablet con la misma experiencia que en la versión de escritorio.'
              },
              {
                icon: CheckCircle,
                color: 'bg-teal-50 text-teal-600',
                title: 'Seguimiento Clínico',
                desc: 'Registrá evolución de peso, hábitos y métricas de salud en el tiempo para cada paciente.'
              }
            ].map((feat, i) => (
              <div key={i} className="group bg-white border border-zinc-100 rounded-2xl p-7 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className={`inline-flex p-3 rounded-xl mb-5 ${feat.color}`}>
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Llevá tu consulta al siguiente nivel.
            </h2>
            <p className="text-base text-zinc-400">
              Nutrixa es gratis para todos los nutricionistas que se registren durante nuestra etapa de lanzamiento. Sin tarjetas de crédito, sin compromisos.
            </p>
            <button
              onClick={() => navigate('/login?signup=true')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors shadow-lg"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-3">Precios</p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 leading-tight">
              Gratis durante el lanzamiento.
            </h2>
            <p className="mt-4 text-base text-zinc-500">
              Acceso completo a todas las funciones mientras construimos la plataforma junto a la comunidad.
            </p>
          </div>

          <div className="max-w-sm mx-auto bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="bg-emerald-600 px-8 py-6 text-center">
              <p className="text-sm font-semibold text-emerald-100 mb-1">Plan Profesional</p>
              <p className="text-5xl font-extrabold text-white">Gratis</p>
              <p className="text-sm text-emerald-200 mt-1">mientras dure el período de lanzamiento</p>
            </div>
            <div className="px-8 py-8 space-y-4">
              {[
                'Pacientes ilimitados',
                'Turnera online con link propio',
                'Generador de planes alimentarios',
                'Exportación a PDF',
                'Historial clínico completo',
                'Soporte por WhatsApp',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-zinc-700">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/login?signup=true')}
                className="w-full mt-6 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                Registrarme gratis
              </button>
              <p className="text-xs text-zinc-400 text-center">Sin tarjeta de crédito requerida</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-100 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="space-y-4">
              <img src="/logoNutrixa.png" alt="Nutrixa" className="h-7 w-auto opacity-80" />
              <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
                Software de gestión clínica para profesionales de la nutrición.
              </p>
            </div>

            <div className="flex gap-16">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Plataforma</p>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="#features" className="hover:text-emerald-600 transition-colors">Funciones</a></li>
                  <li><a href="#pricing"  className="hover:text-emerald-600 transition-colors">Precios</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Legal</p>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacidad</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Términos</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-900">Contacto</p>
                <ul className="space-y-2 text-sm text-zinc-500">
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-emerald-600 transition-colors">WhatsApp</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-zinc-400">© 2026 Nutrixa. Todos los derechos reservados.</p>
            <p className="text-xs text-zinc-400">Argentina · Cumple Ley 25.326</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

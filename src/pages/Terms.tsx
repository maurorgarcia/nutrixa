import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Users, CreditCard, Server, AlertTriangle, Scale, Mail } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: '1. Aceptación de los términos',
    content: [
      {
        subtitle: 'Alcance del acuerdo:',
        text: 'Al crear una cuenta o utilizar la plataforma Nutrixa, usted acepta quedar sujeto a estos Términos y Condiciones en su versión vigente. Si no está de acuerdo con alguna parte de ellos, debe abstenerse de usar la plataforma.'
      },
      {
        subtitle: 'Capacidad legal:',
        text: 'Para utilizar Nutrixa como profesional, debe ser mayor de 18 años y contar con habilitación para ejercer como nutricionista, dietista o profesional de salud afín en el territorio donde presta servicios. Nutrixa es una plataforma exclusivamente B2B.'
      }
    ]
  },
  {
    icon: Server,
    title: '2. Descripción del servicio',
    content: [
      {
        subtitle: '¿Qué es Nutrixa?',
        text: 'Nutrixa es una plataforma de software como servicio (SaaS) diseñada para nutricionistas y profesionales de la salud. Provee herramientas de gestión de expedientes clínicos, diseño de planes dietoterapéuticos, seguimiento de pacientes y una turnera pública de agendamiento.'
      },
      {
        subtitle: 'Alcance de la licencia:',
        text: 'Al registrarse, se le otorga una licencia de uso personal, no exclusiva, no transferible y revocable para acceder a las funcionalidades habilitadas según el plan contratado. Esta licencia no implica transferencia de propiedad intelectual del software.'
      },
      {
        subtitle: 'Evolución del servicio:',
        text: 'Nutrixa puede agregar, modificar o discontinuar funcionalidades con el fin de mejorar la plataforma. En caso de cambios significativos, se notificará a los usuarios con al menos 15 días de anticipación.'
      }
    ]
  },
  {
    icon: Users,
    title: '3. Responsabilidades del profesional',
    content: [
      {
        subtitle: 'Uso correcto de la plataforma:',
        text: 'El profesional es responsable de toda la actividad que ocurra bajo su cuenta. Debe mantener sus credenciales de acceso en confidencialidad y notificar a Nutrixa de inmediato ante cualquier acceso no autorizado sospechado.'
      },
      {
        subtitle: 'Datos de pacientes:',
        text: 'El profesional es responsable de obtener el consentimiento informado de sus pacientes para el tratamiento de datos clínicos en plataformas digitales, en cumplimiento de la Ley 25.326. Nutrixa provee la infraestructura técnica pero no asume responsabilidad por el contenido ingresado.'
      },
      {
        subtitle: 'Secreto profesional:',
        text: 'El profesional tiene la obligación legal de mantener el secreto profesional respecto a los datos clínicos de sus pacientes. Nutrixa proporciona controles técnicos para proteger dicha confidencialidad, pero la responsabilidad ética-legal recae en el profesional tratante.'
      },
      {
        subtitle: 'Usos prohibidos:',
        text: 'Queda expresamente prohibido: compartir credenciales de acceso, usar la plataforma para actividades ilícitas, intentar acceder a datos de otros profesionales, realizar ingeniería inversa del software, o usar los datos de pacientes para fines distintos al tratamiento clínico.'
      }
    ]
  },
  {
    icon: CreditCard,
    title: '4. Planes, precios y facturación',
    content: [
      {
        subtitle: 'Período de lanzamiento — Beta Fundadora:',
        text: 'Durante la fase Beta, la plataforma se ofrece sin costo a los primeros profesionales que se registren. Los usuarios que completen su registro durante este período accederán a los beneficios del plan Institucional Vitalicio según las condiciones comunicadas al momento del alta.'
      },
      {
        subtitle: 'Futuros planes de pago:',
        text: 'Nutrixa se reserva el derecho de introducir planes de suscripción de pago con acceso a funcionalidades avanzadas. Los usuarios existentes serán notificados con un mínimo de 30 días de anticipación antes de que cualquier cambio tarifario les afecte.'
      },
      {
        subtitle: 'Política de reembolsos:',
        text: 'En caso de transacciones futuras, los reembolsos serán evaluados caso por caso dentro de los 10 días hábiles posteriores al cobro, siempre que el motivo esté fundado en un error técnico imputable a Nutrixa.'
      }
    ]
  },
  {
    icon: Server,
    title: '5. Disponibilidad y nivel de servicio',
    content: [
      {
        subtitle: 'Disponibilidad objetivo:',
        text: 'Nutrixa aspira a mantener una disponibilidad del 99.9% mensual. Las interrupciones programadas de mantenimiento se comunicarán con anticipación y preferentemente en horarios de baja demanda (madrugada).'
      },
      {
        subtitle: 'Exclusiones de responsabilidad:',
        text: 'Nutrixa no se hace responsable por interrupciones causadas por: fuerza mayor, fallos en la conectividad del proveedor de infraestructura (Supabase), ataques de denegación de servicio externos, o comportamiento indebido del usuario final.'
      },
      {
        subtitle: 'Respaldo de datos:',
        text: 'Se realizan copias de seguridad automáticas de la base de datos con frecuencia mínima diaria. En caso de pérdida de datos por causas imputables a Nutrixa, se realizará la restauración al último punto de respaldo disponible.'
      }
    ]
  },
  {
    icon: Scale,
    title: '6. Propiedad intelectual y datos',
    content: [
      {
        subtitle: 'El software es de Nutrixa:',
        text: 'Todo el código fuente, diseño, marca, logotipos, textos y funcionalidades de la plataforma son propiedad exclusiva de Nutrixa y están protegidos por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción sin autorización expresa.'
      },
      {
        subtitle: 'Sus datos son suyos:',
        text: 'El profesional retiene la propiedad de todos los datos que ingresa en la plataforma, incluyendo los expedientes de pacientes y planes creados. Nutrixa no reclama ningún derecho sobre dicho contenido y actúa únicamente como custodio técnico.'
      },
      {
        subtitle: 'Portabilidad de datos:',
        text: 'Puede solicitar la exportación de todos sus datos en formato estándar (CSV/JSON) en cualquier momento desde la configuración de su cuenta o contactándonos.'
      }
    ]
  },
  {
    icon: AlertTriangle,
    title: '7. Limitación de responsabilidad',
    content: [
      {
        subtitle: 'Herramienta de apoyo, no sustituto clínico:',
        text: 'Nutrixa es una herramienta de gestión y apoyo administrativo-clínico. No reemplaza el juicio profesional del nutricionista ni constituye asesoramiento médico. Las decisiones terapéuticas son responsabilidad exclusiva del profesional habilitado.'
      },
      {
        subtitle: 'Límite de responsabilidad:',
        text: 'En ningún caso la responsabilidad total de Nutrixa ante el usuario excederá el importe pagado por el servicio en los últimos 12 meses. Nutrixa no será responsable por daños indirectos, pérdida de datos por negligencia del usuario, ni lucro cesante.'
      }
    ]
  },
  {
    icon: Mail,
    title: '8. Jurisdicción y contacto',
    content: [
      {
        subtitle: 'Ley aplicable:',
        text: 'Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa que no pueda resolverse de forma amistosa será sometida a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.'
      },
      {
        subtitle: 'Modificaciones a los términos:',
        text: 'Nutrixa puede actualizar estos términos periódicamente. La versión vigente siempre estará disponible en esta página con la fecha de última actualización. El uso continuado de la plataforma tras la publicación de cambios implica su aceptación.'
      },
      {
        subtitle: 'Contacto legal:',
        text: 'Para consultas sobre estos términos: legales@nutrixa.com'
      }
    ]
  }
];

export function Terms() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">

      {/* Header */}
      <div className="bg-white border-b border-zinc-200/80">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-nutri-forest transition-colors mb-6 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center">
              <Scale className="h-5 w-5 text-zinc-600" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nutrixa · Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-3">
            Términos y Condiciones
          </h1>
          <p className="text-zinc-500 font-medium leading-relaxed max-w-2xl">
            Estos términos regulan el uso de la plataforma Nutrixa por parte de profesionales de la salud y nutrición. Leálos antes de registrarse. Al crear una cuenta, usted acepta el presente acuerdo en su totalidad.
          </p>
          <p className="text-xs text-zinc-400 font-medium mt-4 border-t border-zinc-100 pt-4">
            Última actualización: Abril 2026 · Versión 1.0 · República Argentina
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {sections.map(({ icon: Icon, title, content }, i) => (
          <div key={i} className="bg-white border border-zinc-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-zinc-500" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
            </div>
            <div className="space-y-5">
              {content.map((item, j) => (
                <div key={j}>
                  <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-700 mb-1.5">{item.subtitle}</p>
                  <p className="text-sm font-medium text-zinc-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Sus datos', value: 'Son siempre suyos. Nutrixa no los vende ni comparte.' },
            { label: 'Cookies', value: 'Solo técnicas. Sin rastreo ni publicidad.' },
            { label: 'Legislación', value: 'Ley 25.326 Argentina · Foro CABA.' }
          ].map((card, i) => (
            <div key={i} className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm text-center">
              <p className="text-xs font-extrabold uppercase tracking-widest text-nutri-forest mb-1">{card.label}</p>
              <p className="text-xs font-medium text-zinc-500 leading-relaxed">{card.value}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-400 font-medium pb-8">
          © {new Date().getFullYear()} Nutrixa · Para dudas legales: <a href="mailto:legales@nutrixa.com" className="text-nutri-forest hover:underline">legales@nutrixa.com</a>
        </p>
      </div>
    </div>
  );
}

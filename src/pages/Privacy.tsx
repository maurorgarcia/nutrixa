import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, UserCheck, Lock, Cookie, Mail } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: '1. Datos que recopilamos',
    content: [
      {
        subtitle: 'Del profesional al registrarse:',
        text: 'Nombre completo, dirección de correo electrónico y credenciales de acceso (contraseña hasheada por Supabase Auth). Datos opcionales del perfil profesional como matrícula, especialidad y foto.'
      },
      {
        subtitle: 'De los pacientes (ingresados por el profesional):',
        text: 'Datos antropométricos, historial clínico-nutricional, anamnesis, planes dietoterapéuticos y registro de seguimientos. Estos datos son clasificados como datos sensibles de salud bajo la Ley 25.326 y su tratamiento requiere el consentimiento del paciente, responsabilidad que recae en el profesional tratante.'
      },
      {
        subtitle: 'De la turnera pública:',
        text: 'Nombre, correo electrónico y número de WhatsApp del solicitante, utilizados exclusivamente para gestionar la reserva del turno con el profesional correspondiente.'
      },
      {
        subtitle: 'Datos técnicos:',
        text: 'Token de sesión JWT almacenado en localStorage del navegador (necesario para mantener la sesión activa). No se utilizan cookies de seguimiento, publicidad ni analítica de terceros.'
      }
    ]
  },
  {
    icon: UserCheck,
    title: '2. Finalidad del tratamiento',
    content: [
      {
        subtitle: 'Prestación del servicio:',
        text: 'Los datos recopilados se utilizan exclusivamente para provisionar las funcionalidades de la plataforma: gestión de pacientes, generación de planes, agenda de turnos y reportes clínicos.'
      },
      {
        subtitle: 'Comunicaciones transaccionales:',
        text: 'Podemos enviar correos relacionados con el estado de su cuenta (confirmaciones, alertas de seguridad). No enviamos comunicaciones de marketing sin consentimiento explícito.'
      },
      {
        subtitle: 'Mejora del servicio:',
        text: 'Podemos utilizar datos anonimizados y agregados (sin identificación personal) para mejorar funcionalidades de la plataforma.'
      }
    ]
  },
  {
    icon: Lock,
    title: '3. Seguridad y encriptación',
    content: [
      {
        subtitle: 'Infraestructura segura:',
        text: 'Los datos se almacenan en servidores de Supabase con encriptación AES-256 en reposo y TLS 1.3 en tránsito. Las contraseñas nunca se almacenan en texto plano; se aplica hashing bcrypt.'
      },
      {
        subtitle: 'Aislamiento por profesional:',
        text: 'Las políticas de seguridad a nivel de fila (Row Level Security) de la base de datos garantizan que cada profesional solo puede acceder a sus propios pacientes y datos, sin posibilidad de acceso cruzado.'
      },
      {
        subtitle: 'Datos de salud — categoría especial:',
        text: 'Los registros clínicos de pacientes son datos sensibles bajo la Ley 25.326 (Argentina) y normativas equivalentes en otros países latinoamericanos. Su acceso está restringido exclusivamente al profesional titular de la cuenta.'
      }
    ]
  },
  {
    icon: Cookie,
    title: '4. Cookies y almacenamiento local',
    content: [
      {
        subtitle: '¿Usamos cookies?',
        text: 'Nutrixa NO utiliza cookies de seguimiento, publicidad ni analítica de terceros. El único almacenamiento que realizamos en su navegador es el token de sesión en localStorage, estrictamente necesario para mantener su sesión iniciada.'
      },
      {
        subtitle: '¿Necesito aceptar cookies?',
        text: 'No. Al tratarse exclusivamente de cookies técnicas/necesarias, están exentas del requisito de consentimiento bajo las normativas aplicables. No se realizan perfiles de comportamiento ni se comparte ningún dato con plataformas publicitarias.'
      }
    ]
  },
  {
    icon: Shield,
    title: '5. Compartición de datos con terceros',
    content: [
      {
        subtitle: 'Nunca vendemos sus datos:',
        text: 'Nutrixa no vende, alquila ni cede información personal o clínica a terceros bajo ninguna circunstancia.'
      },
      {
        subtitle: 'Proveedores de infraestructura:',
        text: 'Utilizamos Supabase como proveedor de base de datos y autenticación, bajo acuerdos de procesamiento de datos que garantizan el cumplimiento normativo. Supabase actúa como encargado del tratamiento, no como responsable.'
      },
      {
        subtitle: 'Obligaciones legales:',
        text: 'Solo podríamos compartir información si fuese requerido por orden judicial firme emitida por autoridad competente conforme a la legislación argentina vigente.'
      }
    ]
  },
  {
    icon: UserCheck,
    title: '6. Derechos del titular de los datos',
    content: [
      {
        subtitle: 'Sus derechos (Ley 25.326):',
        text: 'Usted tiene derecho a acceder, rectificar, actualizar y suprimir sus datos personales. También puede oponerse al tratamiento o solicitar su portabilidad. Estos derechos pueden ejercerse desde la configuración de su cuenta o contactándonos.'
      },
      {
        subtitle: 'Datos de pacientes:',
        text: 'El profesional es responsable del tratamiento de los datos de sus pacientes ingresados en la plataforma. Nutrixa actúa como plataforma técnica (encargado del tratamiento) y facilita las herramientas de rectificación y eliminación.'
      },
      {
        subtitle: 'Eliminación de cuenta:',
        text: 'Al solicitar la baja de su cuenta, todos los datos asociados (perfil, pacientes y registros) serán eliminados de forma permanente de nuestros servidores en un plazo máximo de 30 días hábiles.'
      }
    ]
  },
  {
    icon: Mail,
    title: '7. Contacto y reclamos',
    content: [
      {
        subtitle: 'Canal de privacidad:',
        text: 'Para ejercer sus derechos, reportar una incidencia de seguridad o realizar cualquier consulta sobre el tratamiento de datos, puede contactarnos en: legales@nutrixa.com'
      },
      {
        subtitle: 'Autoridad de control:',
        text: 'En Argentina, puede presentar una denuncia ante la Agencia de Acceso a la Información Pública (AAIP), organismo de control de la Ley 25.326, si considera que sus derechos no han sido debidamente atendidos.'
      }
    ]
  }
];

export function Privacy() {
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
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-nutri-emerald" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-nutri-emerald">Nutrixa · Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-3">
            Política de Privacidad
          </h1>
          <p className="text-zinc-500 font-medium leading-relaxed max-w-2xl">
            En Nutrixa la privacidad de los profesionales y la de sus pacientes es de máxima prioridad. Este documento describe de forma transparente cómo tratamos la información personal y clínica en nuestra plataforma.
          </p>
          <p className="text-xs text-zinc-400 font-medium mt-4 border-t border-zinc-100 pt-4">
            Última actualización: Abril 2026 · Aplica a todos los usuarios de Nutrixa en Latinoamérica
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
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
                  <p className="text-xs font-extrabold uppercase tracking-widest text-nutri-forest mb-1.5">{item.subtitle}</p>
                  <p className="text-sm font-medium text-zinc-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Cookie summary callout */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex gap-4">
          <Cookie className="h-5 w-5 text-nutri-emerald shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-nutri-forest mb-1">Resumen de cookies</p>
            <p className="text-sm font-medium text-zinc-600 leading-relaxed">
              Nutrixa <strong>no usa cookies de rastreo ni publicidad</strong>. Solo almacenamos un token de sesión técnico en su navegador para mantenerlo autenticado. No se requiere ningún banner de aceptación de cookies.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 font-medium pb-8">
          © {new Date().getFullYear()} Nutrixa · Todos los datos se tratan conforme a la <strong className="text-zinc-500">Ley 25.326</strong> de Protección de Datos Personales (Argentina) y normativas equivalentes de aplicación regional.
        </p>
      </div>
    </div>
  );
}

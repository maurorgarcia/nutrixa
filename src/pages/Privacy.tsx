import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <h1 className="text-4xl font-extrabold text-zinc-900 leading-tight">Política de Privacidad</h1>
        <div className="prose prose-zinc prose-a:text-emerald-600 max-w-none text-zinc-500 leading-relaxed space-y-6">
          <p>
            En Nutrixa, la privacidad de nuestros usuarios y la de sus pacientes es de máxima prioridad. Esta política describe cómo recopilamos, utilizamos y protegemos su información.
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">1. Información que recopilamos</h2>
          <p>
            Recopilamos información personal que usted nos proporciona directamente al registrarse, como su nombre, correo electrónico y datos profesionales. Además, almacenamos los datos clínicos de pacientes que usted ingresa en la plataforma, rigurosamente protegidos.
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">2. Uso de la información</h2>
          <p>
            Utilizamos su información para proveer y mejorar nuestros servicios, comunicarnos con usted acerca de su cuenta y procesar transacciones. Los datos clínicos de sus pacientes son estrictamente confidenciales y solo accesibles por usted.
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">3. Seguridad de los datos</h2>
          <p>
            Implementamos medidas de seguridad de grado industrial y encriptación de bases de datos para proteger su información contra acceso no autorizado, alteración, divulgación o destrucción. Cumplimos con la Ley 25.326 de Protección de Datos Personales (Argentina).
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">4. Sus Derechos</h2>
          <p>
            Usted tiene el derecho de acceder, rectificar o eliminar su información personal y la de sus pacientes en cualquier momento desde la configuración de su cuenta.
          </p>
          <p className="mt-12 text-sm">
            Última actualización: Abril 2026. Si tiene dudas, contáctenos en legales@nutrixa.com.
          </p>
        </div>
      </div>
    </div>
  );
}

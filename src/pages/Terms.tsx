import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <h1 className="text-4xl font-extrabold text-zinc-900 leading-tight">Términos y Condiciones</h1>
        <div className="prose prose-zinc prose-a:text-emerald-600 max-w-none text-zinc-500 leading-relaxed space-y-6">
          <p>
            Al utilizar Nutrixa, usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo con alguna parte de ellos, no debe utilizar nuestra plataforma.
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">1. Uso de la plataforma</h2>
          <p>
            Nutrixa es una herramienta B2B (Software as a Service) diseñada para profesionales de la nutrición. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta.
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">2. Propiedad de los datos</h2>
          <p>
            Usted retiene todos los derechos sobre la información que ingresa en la plataforma, incluidos los registros de pacientes y planes creados. Nutrixa no utilizará esta información para fines distintos a proveer el servicio.
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">3. Planes y Pagos</h2>
          <p>
            Durante nuestro período de lanzamiento, la plataforma se ofrece de manera gratuita. En el futuro, Nutrixa se reserva el derecho de introducir planes de pago o funciones premium, notificando a todos los usuarios con antelación suficiente.
          </p>
          <h2 className="text-xl font-bold text-zinc-900 mt-8 mb-4">4. Disponibilidad del Servicio</h2>
          <p>
            Nos esforzamos por mantener la plataforma operativa las 24 horas. Sin embargo, no somos responsables por interrupciones temporales debidas a mantenimiento o causas fuera de nuestro control.
          </p>
          <p className="mt-12 text-sm">
            Última actualización: Abril 2026. Si tiene dudas, contáctenos en legales@nutrixa.com.
          </p>
        </div>
      </div>
    </div>
  );
}

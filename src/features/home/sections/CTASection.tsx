import { Shield, Award, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  onVerResultados: () => void;
  onComenzarAhora?: () => void;
  hideVerResultadosButton?: boolean;
}

export default function CTASection({
  onVerResultados,
  onComenzarAhora,
  hideVerResultadosButton = false,
}: Props) {
  return (
    <section className="bg-white py-12 sm:py-20 section-padding text-slate-900">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="heading-lg sm:heading-xl font-bold mb-4 sm:mb-6">
          Aprende lo que Realmente Funciona
        </h2>
        <p className="body-text text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto">
          Accede a las herramientas y métodos que he descubierto tras años de investigación.
          No es magia, es matemática.
        </p>

        <div className="inline-grid grid-cols-1 sm:flex sm:flex-row justify-center gap-4 pt-1 mb-10 sm:mb-16">
          <button
            onClick={() => {
              if (onComenzarAhora) {
                onComenzarAhora();
                return;
              }

              document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 border border-blue-700/20 transform hover:scale-105 transition-all shadow-xl"
          >
            Comenzar Ahora
          </button>
          {!hideVerResultadosButton && (
            <button
              onClick={onVerResultados}
              className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-white hover:bg-slate-100 text-blue-700 border-2 border-blue-200 transform hover:scale-105 transition-all shadow-lg"
            >
              Ver Todos los Casos Reales
            </button>
          )}
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 sm:mb-16">
          <Link
            to="/terminos-del-servicio"
            className="transition hover:text-blue-700"
          >
            Términos del servicio
          </Link>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" aria-hidden="true" />
          <Link
            to="/politica-de-privacidad"
            className="transition hover:text-blue-700"
          >
            Política de privacidad
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg">Pago Seguro</h3>
            <p className="text-sm text-slate-500">Stripe</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg">Garantía 5 Días</h3>
            <p className="text-sm text-slate-500">Reembolso sin preguntas</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg">Comunidad Activa</h3>
            <p className="text-sm text-slate-500">50+ miembros</p>
          </div>
        </div>
      </div>
    </section>
  );
}

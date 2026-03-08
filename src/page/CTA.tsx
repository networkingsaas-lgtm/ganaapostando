import { ArrowRight, Shield, Award, Users } from 'lucide-react';

interface Props {
  onVerResultados: () => void;
}

export default function CTA({ onVerResultados }: Props) {
  return (
    <section className="py-12 sm:py-20 section-padding bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="heading-lg sm:heading-xl font-bold mb-4 sm:mb-6">
          Aprende lo que Realmente Funciona
        </h2>
        <p className="body-text text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto">
          Accede a las herramientas y métodos que he descubierto tras años de investigación.
          No es magia, es matemática.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-16">
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105 shadow-xl flex items-center justify-center gap-2">
            Comenzar Ahora
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onVerResultados}
            className="btn-primary bg-white/10 hover:bg-white/20 text-white border border-white/30 transform hover:scale-105"
          >
            Ver Todos los Casos Reales
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-white/10">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg">Pago Seguro</h3>
            <p className="text-sm text-gray-400">Stripe</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg">Garantía 5 Días</h3>
            <p className="text-sm text-gray-400">Reembolso sin preguntas</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg">Comunidad Activa</h3>
            <p className="text-sm text-gray-400">50+ miembros</p>
          </div>
        </div>
      </div>
    </section>
  );
}

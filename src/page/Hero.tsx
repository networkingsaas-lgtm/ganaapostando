import { TrendingUp, Calculator } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import ScrollReveal from '../components/ScrollReveal';
import { usuarios } from './Resultados';

const roiMedio = usuarios.reduce((acc, u) => acc + (u.beneficioTotal / u.inversion) * 100, 0) / usuarios.length;
const gananciaTotal = usuarios.reduce((acc, u) => acc + u.beneficioTotal, 0);
const gananciaMedia = gananciaTotal / usuarios.length;

interface Props {
  onVerResultados: () => void;
}

export default function Hero({ onVerResultados }: Props) {
  const animatedRoi = useCountUp(roiMedio);
  const animatedTotal = useCountUp(gananciaTotal);
  const animatedMedia = useCountUp(gananciaMedia);

  return (
    <section className="hero-bg relative overflow-hidden text-white pt-10 sm:pt-16 pb-12 sm:pb-16 section-padding">
      {/* Orbes animados de fondo */}
      <div className="orb-1 absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="orb-2 absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="orb-3 absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
          <div className="w-full lg:flex-1 space-y-6 sm:space-y-8 min-w-0">
            <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 text-sm">
              <Calculator className="w-4 h-4" />
              <span>Método 100% Basado en Matemáticas</span>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
            <h1 className="heading-xl font-bold leading-tight">
              Convierte tus <span className="text-red-400">Apuestas</span> deportivas en <span className="text-green-400">Ingresos reales</span>, Aprende con Nosotros
            </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
            <p className="body-text text-gray-300">
              Domina el matched betting para sacar dinero sin riesgo de los bonos, y aprende a identificar value bets donde las casas cometen errores.
              Métodos probados basados en investigación real, no promesas falsas.
            </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105 shadow-xl">
                Ver Cursos Disponibles
              </button>
              <button onClick={onVerResultados} className="btn-primary bg-white/10 hover:bg-white/20 text-white border border-white/30 transform hover:scale-105">
                Ver Todos Los Casos Reales
              </button>
            </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
            <div className="flex flex-wrap gap-6 sm:gap-8 pt-4">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">100%</div>
                <div className="text-sm text-gray-400">Satisfacción</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">10+</div>
                <div className="text-sm text-gray-400">Estudiantes</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">5/5</div>
                <div className="text-sm text-gray-400">Valoración</div>
              </div>
            </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={200} className="w-full lg:flex-1">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-5 sm:p-8 border border-white/10 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">ROI Promedio</div>
                    <div className="text-2xl font-bold">+{animatedRoi.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Ganancia Total Alumnos</div>
                    <div className="text-2xl font-bold">€{animatedTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-300">Ganancia Media por Alumno</div>
                    <div className="text-2xl font-bold">€{animatedMedia.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
    </section>
  );
}

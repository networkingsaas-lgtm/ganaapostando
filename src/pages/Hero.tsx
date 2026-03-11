import PageReveal from '../components/shared/PageReveal';
import CasasCarrusel from '../components/hero/CasasCarrusel';
import HeaderTitle from '../components/ui/HeaderTitle';

interface Props {
  onVerResultados: () => void;
}

export default function Hero({ onVerResultados }: Props) {
  return (
    <section className="hero-startup-bg startup-font relative overflow-hidden text-white pt-10 sm:pt-16 pb-12 sm:pb-16 section-padding">
      <div
        className="pointer-events-none absolute inset-0 bg-center bg-cover opacity-[0.09]"
        style={{
          backgroundImage: "url('/estudiante-bg.png')",
          transform: 'scaleX(-1)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10">
          <PageReveal delay={100}>
            <HeaderTitle as="h1" className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95]">
              CONVIERTE LAS <span className="text-white">APUESTAS</span> DEPORTIVAS EN <span className="title-span-highlight title-span-highlight-reverse-green">INGESOS REALES</span>
            </HeaderTitle>
          </PageReveal>

          <PageReveal delay={180}>
            <p className="body-text text-white/90 max-w-3xl mx-auto">
              Aprende <span className="rebel-underline"> El método.</span>
            </p>
          </PageReveal>

          <PageReveal delay={340}>
            <div className="inline-grid grid-cols-1 sm:flex sm:flex-row justify-center gap-4 pt-1">
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-white text-blue-700 hover:bg-blue-50 border border-white/90 transform hover:scale-105 transition-all shadow-xl"
              >
                Ver Cursos Disponibles
              </button>
              <button
                onClick={onVerResultados}
                className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-white/20 hover:bg-white/30 text-white border-2 border-white/80 transform hover:scale-105 transition-all shadow-lg"
              >
                Ver Todos Los Casos Reales
              </button>
            </div>
          </PageReveal>
        </div>

        <PageReveal delay={420}>
          <CasasCarrusel />
        </PageReveal>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
    </section>
  );
}

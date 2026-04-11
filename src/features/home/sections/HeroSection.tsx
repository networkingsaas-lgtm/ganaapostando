import PageReveal from '../../../shared/components/PageReveal';
import CasasCarrusel from '../components/CasasCarrusel';

interface Props {
  onVerResultados: () => void;
}
export default function HeroSection({ onVerResultados }: Props) {

  return (
    <section className="heroSection hero-startup-bg startup-font relative overflow-hidden pb-12 text-white sm:pb-16 section-padding">
      <div
        className="pointer-events-none absolute inset-0 bg-center bg-cover opacity-[0.30]"
        style={{
          backgroundImage: "url('/estudiante-bg-optimized.jpg')",
          transform: 'scaleX(-1)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl pt-32 sm:pt-40">
        <div className="mx-auto max-w-5xl space-y-5 text-center sm:space-y-6">
          <PageReveal delay={100}>
            <p
              className="mx-auto mb-8 w-fit text-center text-5xl font-normal tracking-tight sm:mb-24 sm:text-8xl"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              <span className="rebel-underline-lg font-bold">El Método.</span>
            </p>
          </PageReveal>

          <PageReveal delay={180}>
            <p className="body-text mx-auto max-w-3xl text-white/90">
              Convierte las apuestas deportivas en ingresos mensuales.
            </p>
          </PageReveal>

          <PageReveal delay={340}>
            <div className="inline-grid grid-cols-1 justify-center gap-4 pt-1 sm:flex sm:flex-row sm:pt-2">
              <button
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full border border-white/90 bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-xl transition-all transform hover:scale-105 hover:bg-blue-50 sm:px-7 sm:py-3.5 sm:text-base"
              >
                Ver Precios Disponibles
              </button>
              <button
                onClick={onVerResultados}
                className="rounded-full border-2 border-white/80 bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all transform hover:scale-105 hover:bg-white/30 sm:px-7 sm:py-3.5 sm:text-base"
              >
                Ver Resultados Alumnos
              </button>
            </div>
          </PageReveal>
        </div>

        <PageReveal delay={420}>
          <CasasCarrusel />
        </PageReveal>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </section>
  );
}

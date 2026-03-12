import { useEffect, useRef, useState } from 'react';
import HeroStatsCards from '../components/hero/HeroStatsCards';
import HeaderTitle from '../components/ui/HeaderTitle';
import TitleHighlightReverse from '../components/ui/TitleHighlightReverse';
import { useCountUp } from '../hooks/useCountUp';
import { usuarios } from '../features/resultados/data';

const roiMedio = usuarios.reduce((acc, u) => acc + (u.beneficioTotal / u.inversion) * 100, 0) / usuarios.length;
const gananciaTotal = usuarios.reduce((acc, u) => acc + u.beneficioTotal, 0);
const gananciaMedia = gananciaTotal / usuarios.length;

interface Props {
  onVerResultados: () => void;
}

export default function MetodoStats({ onVerResultados }: Props) {
  const statsRef = useRef<HTMLDivElement>(null);
  const [startCountUp, setStartCountUp] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const animatedRoi = useCountUp(roiMedio, 1800, startCountUp);
  const animatedTotal = useCountUp(gananciaTotal, 1800, startCountUp);
  const animatedMedia = useCountUp(gananciaMedia, 1800, startCountUp);
  const backgroundImage = isSmallScreen ? '/metodostats-bg.jpg' : '/tenis.jpg';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)');
    const syncScreenSize = () => setIsSmallScreen(mediaQuery.matches);

    syncScreenSize();
    mediaQuery.addEventListener('change', syncScreenSize);

    return () => mediaQuery.removeEventListener('change', syncScreenSize);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCardsVisible(true);
        setStartCountUp(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="startup-font relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 section-padding text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={backgroundImage}
          alt=""
          className={`h-full w-full scale-x-[-1] object-cover opacity-[0.09] ${
            isSmallScreen ? 'origin-center scale-[1.28] object-center' : 'object-center'
          }`}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-5xl ml-auto text-right">
          <HeaderTitle
            as="h2"
            lineHeightClass="leading-[1.16] sm:leading-[1.1]"
            className="text-3xl sm:text-5xl font-bold mb-4"
          >
            Aquí no <TitleHighlightReverse inverted>incentivamos</TitleHighlightReverse> el juego, sino <TitleHighlightReverse inverted>el aprendizaje</TitleHighlightReverse>
          </HeaderTitle>
          <p className="text-base sm:text-xl text-white/85">
              Cuando conoces los trucos y artimañas que utilizan los apostadores profesionales, entiendes que apostar sin estrategia es perder. Por eso queremos enseñarte a ganar, igual que a nuestros alumnos.          </p>
        </div>

        <div ref={statsRef} className="mt-8 sm:mt-12">
          <HeroStatsCards
            roi={animatedRoi}
            total={animatedTotal}
            media={animatedMedia}
            visible={cardsVisible}
            onVerResultados={onVerResultados}
          />
        </div>

      </div>

      <p className="absolute inset-x-0 bottom-4 z-10 px-4 text-center text-[11px] sm:text-xs text-white/70">
        La identidad de los alumnos es privada, pero no sus ganancias.
      </p>
    </section>
  );
}

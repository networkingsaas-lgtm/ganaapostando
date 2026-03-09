import { useState } from 'react';
import HeroStatsCards from '../components/hero/HeroStatsCards';
import HeaderTitle from '../components/ui/HeaderTitle';
import ScrollReveal from '../components/shared/ScrollReveal';
import TitleHighlightReverse from '../components/ui/TitleHighlightReverse';
import { useCountUp } from '../hooks/useCountUp';
import { usuarios } from '../features/resultados/data';

const roiMedio = usuarios.reduce((acc, u) => acc + (u.beneficioTotal / u.inversion) * 100, 0) / usuarios.length;
const gananciaTotal = usuarios.reduce((acc, u) => acc + u.beneficioTotal, 0);
const gananciaMedia = gananciaTotal / usuarios.length;

export default function MetodoStats() {
  const [startCountUp, setStartCountUp] = useState(false);
  const animatedRoi = useCountUp(roiMedio, 1800, startCountUp);
  const animatedTotal = useCountUp(gananciaTotal, 1800, startCountUp);
  const animatedMedia = useCountUp(gananciaMedia, 1800, startCountUp);

  return (
    <section className="startup-font py-12 sm:py-20 section-padding text-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-5xl ml-auto text-right">
          <HeaderTitle
            as="h2"
            lineHeightClass="leading-[1.08] sm:leading-[1.02]"
            className="text-3xl sm:text-5xl font-bold mb-4"
          >
            <TitleHighlightReverse inverted>Deja de pensar</TitleHighlightReverse> "si sale 3 veces seguidas negro <TitleHighlightReverse inverted>la siguiente saldrá rojo </TitleHighlightReverse>"
          </HeaderTitle>
          <p className="text-base sm:text-xl text-white/85">
            por algo nuestros alumnos han ganado tanto dinero, no hay truco, es El método.
          </p>
        </div>

        <ScrollReveal
          className="mt-8 sm:mt-12"
          onReveal={() => setStartCountUp(true)}
        >
          <HeroStatsCards roi={animatedRoi} total={animatedTotal} media={animatedMedia} />
        </ScrollReveal>
      </div>
    </section>
  );
}

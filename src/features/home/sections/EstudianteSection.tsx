import MedievalBannerCards from '../../estudiante/components/MedievalBannerCards';
import { estudianteCards } from '../../estudiante/cards';
import HeaderTitle from '../../../shared/components/HeaderTitle';

export default function EstudianteSection() {
  return (
    <section className="bg-white py-12 sm:py-20 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl text-left">
          <HeaderTitle
            as="h2"
            lineHeightClass="leading-[1.16] sm:leading-[1.1]"
            className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4"
          >
            Te gustaría <span className="title-span-highlight">generar</span> dinero <span className="title-span-highlight">desde casa</span>?
          </HeaderTitle>
          <p className="text-base sm:text-xl text-slate-600">
            Puedes aprender <span className="rebel-underline"> El Método.</span> para generar ingresos sin depender del azar.
          </p>
        </div>

        <MedievalBannerCards cards={estudianteCards} />
      </div>
    </section>
  );
}

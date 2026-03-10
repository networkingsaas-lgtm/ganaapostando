import HeaderTitle from '../components/ui/HeaderTitle';
import MedievalBannerCards from '../components/estudiante/MedievalBannerCards';
import { estudianteCards } from '../features/estudiante/cards';

export default function Estudiante() {
  return (
    <section className="bg-white py-12 sm:py-20 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl text-left">
          <HeaderTitle
            as="h2"
            lineHeightClass="leading-[1.16] sm:leading-[1.1]"
            className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4"
          >
            <span className="title-span-highlight">Eres estudiante</span> y no te llega ni para gasolina?
          </HeaderTitle>
          <p className="text-base sm:text-xl text-slate-600">
            Si te organizas bien, puedes aprender <span className="rebel-underline"> El método.</span> real para generar ingresos sin depender del azar.
          </p>
        </div>

        <MedievalBannerCards cards={estudianteCards} />
      </div>
    </section>
  );
}

import HeaderTitle from '../components/ui/HeaderTitle';
import MedievalBannerCards, { type MedievalBannerCard } from '../components/estudiante/MedievalBannerCards';

export default function Estudiante() {
  const cards: MedievalBannerCard[] = [
    {
      step: '01',
      title: 'Aprende a hacer MATCHED BETTING',
      text: 'Empiezas por una estrategia guiada para sacar rentabilidad controlada desde el primer bloque.',
    },
    {
      step: '02',
      title: 'Aprende a hacer VALUEBETS',
      text: 'Aprendes a detectar apuestas con valor esperado positivo y a evitar tiros emocionales.',
    },
    {
      step: '03',
      title: 'Aprende a entender este VOCABULARIO FRIKI',
      text: 'Te traducimos cada termino tecnico a lenguaje simple para que lo apliques sin perderte.',
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-20 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl text-left">
          <HeaderTitle
            as="h2"
            lineHeightClass="leading-[1.08] sm:leading-[1.02]"
            className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4"
          >
            <span className="title-span-highlight">Eres estudiante</span> y no te llega ni para gasolina?
          </HeaderTitle>
          <p className="text-base sm:text-xl text-slate-600">
            Si te organizas bien, puedes aprender un metodo real para generar ingresos sin depender del azar.
          </p>
        </div>

        <MedievalBannerCards cards={cards} />
      </div>
    </section>
  );
}

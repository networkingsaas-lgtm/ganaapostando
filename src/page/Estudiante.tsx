import HeaderTitle from '../components/ui/HeaderTitle';

export default function Estudiante() {
  const cards = [
    {
      step: '01',
      title: 'Aprende a hacer machedbetting',
      text: 'Empiezas por una estrategia guiada para sacar rentabilidad controlada desde el primer bloque.',
    },
    {
      step: '02',
      title: 'Aprende a hacer valuebets',
      text: 'Aprendes a detectar apuestas con valor esperado positivo y a evitar tiros emocionales.',
    },
    {
      step: '03',
      title: 'Aprende a entender este vocabulario de friki',
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

        <div className="mt-8 sm:mt-12 flex md:grid md:grid-cols-3 gap-3 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0">
          {cards.map((card, index) => (
            <article
              key={index}
              className="min-w-[260px] max-w-[260px] md:min-w-0 md:max-w-none snap-start rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-sm"
            >
              <p className="text-xs font-semibold tracking-widest text-blue-600 mb-2">{card.step}</p>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">{card.title}</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{card.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

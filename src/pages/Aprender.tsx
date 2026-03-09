import HeaderTitle from '../components/ui/HeaderTitle';

export default function Aprender() {
  const cards = [
    {
      title: 'Sin saber que es el fuera de juego',
      text: 'Puedes aprender este sistema aunque no entiendas terminos tecnicos del futbol.',
      imageUrl: 'https://images3.memedroid.com/images/UPLOADED443/6682bb455a2e2.jpeg',
    },
    {
      title: 'Sin corazonadas ni apuestas locas',
      text: 'Aqui no dependes de combinadas soñadoras: sigues reglas claras y decisiones con logica.',
      imageUrl: 'https://images7.memedroid.com/images/UPLOADED329/66083cafe0f5c.jpeg',
    },
    {
      title: 'Metodo por encima del deporte',
      text: 'No necesitas ser experto en ligas o jugadores. Necesitas aplicar bien El método.',
      underlinedText: 'El método.',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXaSqfX1XC4uNm9_sEgUcdXcZPbko46HN43g&s',
    },
    {
      title: 'No soy un tipster j*der',
      text: 'No tengo una bola magica en mi casa (ni yo ni nadie). Juego con la metodologia sin riesgo ,no se puede perder empatando perdidas.',
      imageUrl: 'https://lh3.googleusercontent.com/proxy/hR2ZF-AXEnv3Ew4DfIxn2v5BfggJfQS5TL-h07Ne1fpE6j20DLCM0kTDtRWtb-SHeIjjV3SrePDZEH8uXQKNbyMgQ1zeC3qwA6PSw9w5w2SHI0Y',
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
            Quieres aprender a <span className="title-span-highlight">apostar con cabeza</span> en vez de meter combinadas soñadoras??
          </HeaderTitle>
          <p className="text-base sm:text-xl text-slate-600">
            No hace falta saber de futbol, solo saber <span className="rebel-underline"> El método.</span>
          </p>
        </div>

        <div className="mt-8 sm:mt-12 flex md:grid md:grid-cols-4 gap-3 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0">
          {cards.map((card, index) => (
            <article
              key={index}
              className="min-w-[260px] max-w-[260px] md:min-w-0 md:max-w-none snap-start rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-sm"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">{card.title}</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {card.underlinedText ? (
                  <>
                    {card.text.split(card.underlinedText)[0]}
                    <span className="rebel-underline"> {card.underlinedText}</span>
                    {card.text.split(card.underlinedText)[1]}
                  </>
                ) : (
                  card.text
                )}
              </p>
              <img
                src={card.imageUrl}
                alt={card.title}
                className="mt-3 sm:mt-4 w-full h-40 sm:h-64 object-contain bg-white rounded-lg sm:rounded-xl border border-slate-200"
                loading="lazy"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

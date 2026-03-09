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
      text: 'Aqui no dependes de combinadas sonadoras: sigues reglas claras y decisiones con logica.',
      imageUrl: 'https://images7.memedroid.com/images/UPLOADED329/66083cafe0f5c.jpeg',
    },
    {
      title: 'Metodo por encima del deporte',
      text: 'No necesitas ser experto en ligas o jugadores. Necesitas aplicar bien el metodo.',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXaSqfX1XC4uNm9_sEgUcdXcZPbko46HN43g&s',
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
            No hace falta saber de futbol, solo saber El método
          </p>
        </div>

        <div className="mt-8 sm:mt-12 flex md:grid md:grid-cols-3 gap-3 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0">
          {cards.map((card, index) => (
            <article
              key={index}
              className="min-w-[260px] max-w-[260px] md:min-w-0 md:max-w-none snap-start rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-sm"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">{card.title}</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{card.text}</p>
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

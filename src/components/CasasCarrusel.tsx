const casas = [
  { nombre: 'Bet365',       logo: 'https://logo.clearbit.com/bet365.com',       url: 'https://www.bet365.es' },
  { nombre: 'Betfair',      logo: 'https://logo.clearbit.com/betfair.com',      url: 'https://www.betfair.es' },
  { nombre: 'Pinnacle',     logo: 'https://logo.clearbit.com/pinnacle.com',     url: 'https://www.pinnacle.com' },
  { nombre: 'William Hill', logo: 'https://logo.clearbit.com/williamhill.com',  url: 'https://www.williamhill.es' },
  { nombre: 'Unibet',       logo: 'https://logo.clearbit.com/unibet.com',       url: 'https://www.unibet.es' },
  { nombre: 'Bwin',         logo: 'https://logo.clearbit.com/bwin.com',         url: 'https://www.bwin.es' },
  { nombre: 'Codere',       logo: 'https://logo.clearbit.com/codere.es',        url: 'https://www.codere.es' },
  { nombre: 'Sportium',     logo: 'https://logo.clearbit.com/sportium.es',      url: 'https://www.sportium.es' },
  { nombre: 'Betsson',      logo: 'https://logo.clearbit.com/betsson.com',      url: 'https://www.betsson.es' },
  { nombre: '888sport',     logo: 'https://logo.clearbit.com/888sport.com',     url: 'https://www.888sport.es' },
  { nombre: 'Marathonbet',  logo: 'https://logo.clearbit.com/marathonbet.com',  url: 'https://www.marathonbet.es' },
  { nombre: 'Betway',       logo: 'https://logo.clearbit.com/betway.com',       url: 'https://www.betway.es' },
];

export default function CasasCarrusel() {
  return (
    <div className="mt-10 sm:mt-16 overflow-x-hidden py-3 sm:py-4">
      <p className="text-center text-[11px] sm:text-sm text-gray-400 mb-4 sm:mb-6 tracking-[0.16em] uppercase">Casas que usamos</p>
      <div className="carousel-track">
        {[...casas, ...casas].map((casa, i) => (
          <a
            key={i}
            href={casa.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 mx-1.5 sm:mx-3 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2.5 sm:py-4 w-28 h-16 sm:w-40 sm:h-24 transition-all hover:scale-105"
          >
            <img
              src={casa.logo}
              alt={casa.nombre}
              className="max-h-8 sm:max-h-14 max-w-full object-contain brightness-0 invert"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
              }}
            />
            <span className="hidden text-white font-bold text-xs sm:text-sm text-center">{casa.nombre}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

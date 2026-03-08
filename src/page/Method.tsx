import { AlertCircle, CheckCircle2 } from 'lucide-react';

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

export default function Method() {
  const wrong = [
    'Apostar por tu equipo favorito',
    'Seguir "corazonadas" o intuición',
    'Perseguir pérdidas (martingala)',
    'Apostar sin calcular probabilidades',
    'Decisiones basadas en emociones'
  ];

  const right = [
    'Matched Betting: Elimina riesgo usando bonos',
    'Value Bets: Solo apostar cuando EV > 0',
    'Arbitraje: Explotar diferencias entre casas',
    'Modelos estadísticos y datos reales',
    'Gestión científica del bankroll'
  ];

  return (
    <section className="py-12 sm:py-20 section-padding bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="heading-lg sm:heading-xl font-bold mb-4">
             La Ludopatía vs El Método Correcto
          </h2>
          <p className="body-text text-gray-300 max-w-3xl mx-auto">
            La diferencia entre perder dinero y tener una ventaja real está en el enfoque científico.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="heading-md font-bold">Forma INCORRECTA</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {wrong.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="bg-red-500/20 rounded-full p-1 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
              <p className="text-sm text-red-200">
                Este camino lleva a la ludopatía y pérdidas garantizadas. Las casas de apuestas siempre ganan con jugadores emocionales.
              </p>
            </div>
          </div>

          <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-5 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="heading-md font-bold">Forma CORRECTA</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {right.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-200">
                Con este método tienes una ventaja matemática real. Es inversión basada en análisis, no juego.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 sm:p-8 text-center">
          <h3 className="heading-md font-bold mb-4">Nuestro Compromiso</h3>
          <p className="body-text text-gray-300 max-w-3xl mx-auto">
            No enseñamos a "apostar más". Enseñamos a identificar situaciones donde las matemáticas están de tu lado.
            Si no hay valor esperado positivo, no hay apuesta. Simple y directo.
          </p>
        </div>
      </div>

      {/* Carrusel de casas de apuestas */}
      <div className="mt-16 overflow-x-hidden py-4">
        <p className="text-center text-sm text-gray-400 mb-6 tracking-widest uppercase">Casas que nos aprovechamos</p>
        <div className="carousel-track">
          {[...casas, ...casas].map((casa, i) => (
            <a
              key={i}
              href={casa.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 mx-3 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-2xl px-6 py-4 w-40 h-24 transition-all hover:scale-105"
            >
              <img
                src={casa.logo}
                alt={casa.nombre}
                className="max-h-14 max-w-full object-contain brightness-0 invert"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'block';
                }}
              />
              <span className="hidden text-white font-bold text-sm text-center">{casa.nombre}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

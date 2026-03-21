import { useEffect, useState } from 'react';

export interface AprenderCardData {
  title: string;
  text: string;
  underlinedText?: string;
}

export const aprenderCards: AprenderCardData[] = [
  {
    title: 'La estadística es tu mejor aliada',
    text: 'Dejar de apostar por intuición lo cambia todo. Cuando entiendes los números, las probabilidades y el valor real de una cuota, empiezas a tomar decisiones con criterio y no por impulso.',
    underlinedText: '',
  },
  {
    title: 'Sigue las reglas, no las corazonadas',
    text: 'La diferencia entre perder y ganar está en la disciplina. Tener una estrategia clara y respetarla siempre es lo que te aleja del juego impulsivo y te acerca a resultados consistentes.',
  },
  {
    title: 'La ludopatía no es un juego',
    text: 'Apostar sin control puede tener consecuencias muy serias. Por eso aquí enseñamos un método basado en estrategia, gestión y responsabilidad. Nunca apuestes a ciegas.',
  },
  {
    title: 'Los tipsters no son tus amigos',
    text: 'Muchos viven de vender ilusión, no de hacerte ganar. Si dependes de las apuestas de otros, nunca entenderás realmente lo que haces ni tendrás el control de tus decisiones.',
    underlinedText: '',
  },
];

interface Props {
  card: AprenderCardData;
  index: number;
  shouldAutoFlip?: boolean;
}

export function CartaDisenoCard({ card, index, shouldAutoFlip = false }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasAutoFlipped, setHasAutoFlipped] = useState(false);
  const isOddCard = (index + 1) % 2 !== 0;
  const cardIndexImage = isOddCard ? '/cartaindicenegro.png' : '/cartaindice.png';

  useEffect(() => {
    if (!shouldAutoFlip || hasAutoFlipped) return;

    let frameId: number | null = null;
    frameId = window.requestAnimationFrame(() => {
      setIsFlipped(true);
      setHasAutoFlipped(true);
    });

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [hasAutoFlipped, shouldAutoFlip]);

  const toggleCard = () => {
    setIsFlipped((current) => !current);
  };

  return (
    <button
      type="button"
      className={`dealer-card relative block w-full min-w-[270px] max-w-[270px] snap-start overflow-hidden rounded-[28px] border-0 bg-transparent p-0 text-left shadow-[0_10px_24px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/70 md:min-w-0 md:max-w-none ${
        isFlipped ? 'is-flipped' : 'dealer-card--tap-hint'
      }`}
      aria-pressed={isFlipped}
      onClick={toggleCard}
    >
      <div className="dealer-card__inner relative min-h-[384px] sm:min-h-[400px]">
        <div className="dealer-card__face dealer-card__face--back border border-slate-300">
          <div className="absolute inset-6 overflow-hidden rounded-[22px] border border-slate-300 sm:inset-7">
            <img
              src="/fondo_carta_card.jpg"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="dealer-card__face dealer-card__face--front border border-slate-300 bg-[#f4f4f2] p-9 sm:p-10">
          <img
            src={cardIndexImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 h-14 w-14 object-contain sm:left-4 sm:top-4 sm:h-16 sm:w-16"
          />
          <img
            src={cardIndexImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 h-14 w-14 rotate-180 object-contain sm:bottom-4 sm:right-4 sm:h-16 sm:w-16"
          />
          <div className="flex min-h-[312px] flex-col items-center justify-center rounded-[22px] px-5 py-7 text-center sm:min-h-[320px] sm:px-6 sm:py-7">
            <h3 className="mb-3 text-lg font-semibold tracking-wide text-slate-900 sm:text-xl">
              {card.title}
            </h3>

            <p className="startup-font max-w-[22ch] text-sm leading-relaxed text-slate-700 sm:text-base">
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
          </div>
        </div>
      </div>
    </button>
  );
}

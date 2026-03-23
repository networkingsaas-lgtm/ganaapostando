import type { EstudianteCard } from '../types';
import ScrollReveal from '../../../shared/components/ScrollReveal';

interface Props {
  cards: EstudianteCard[];
}

const CARD_OFFSET_CLASSES = ['lg:ml-0', 'lg:ml-12', 'lg:ml-24'];
const CARD_WIDTH_CLASSES = ['lg:max-w-2xl', 'lg:max-w-3xl', 'lg:max-w-[53rem]'];
const CONNECTOR_CLASSES = ['w-12 sm:w-16 lg:w-20', 'w-12 sm:w-20 lg:w-28', 'w-12 sm:w-24 lg:w-36'];

export default function TimelineLearningCards({ cards }: Props) {
  return (
    <div className="relative mt-10 sm:mt-12">
      <div aria-hidden="true" className="pointer-events-none absolute bottom-5 left-2 top-5 w-0 sm:left-3">
        <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-100 via-blue-500 to-blue-900 shadow-[0_0_22px_rgba(37,99,235,0.35)]" />
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.46),rgba(255,255,255,0.46)_5px,transparent_5px,transparent_12px)] opacity-70" />
      </div>

      <div className="space-y-6 sm:space-y-8 lg:space-y-9">
        {cards.map((card, index) => {
          const offsetClass = CARD_OFFSET_CLASSES[Math.min(index, CARD_OFFSET_CLASSES.length - 1)];
          const widthClass = CARD_WIDTH_CLASSES[Math.min(index, CARD_WIDTH_CLASSES.length - 1)];
          const connectorClass = CONNECTOR_CLASSES[Math.min(index, CONNECTOR_CLASSES.length - 1)];
          const block = String(index + 1).padStart(2, '0');

          return (
            <ScrollReveal key={`${card.title}-${index}`} delay={index * 130} className="w-full sr-from-right">
              <article className="relative pl-12 sm:pl-20">
                <span
                  aria-hidden="true"
                  className="absolute left-2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-100 bg-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.22)] sm:left-3"
                />
                <span
                  aria-hidden="true"
                  className={`absolute left-2 top-1/2 block -translate-y-1/2 sm:left-3 ${connectorClass}`}
                >
                  <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-blue-500 via-blue-300 to-blue-200" />
                  <span className="absolute -right-0.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-r-2 border-t-2 border-blue-200/95" />
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute left-2 top-1/2 block h-[8px] -translate-y-1/2 rounded-full bg-blue-500/25 blur-[2px] sm:left-3 ${connectorClass}`}
                />

                <div
                  className={[
                    'group relative w-full overflow-hidden rounded-[26px] border border-blue-300/35',
                    'bg-[linear-gradient(145deg,#09163f_0%,#112a70_58%,#1d4ed8_100%)] text-white',
                    'px-5 py-5 shadow-[0_20px_44px_rgba(7,18,60,0.42)] ring-1 ring-white/10 sm:px-7 sm:py-6',
                    'transition-transform duration-300 hover:-translate-y-0.5',
                    offsetClass,
                    widthClass,
                  ].join(' ')}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.14),transparent_45%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-10 bottom-[-72px] h-40 w-40 rounded-full border border-white/10"
                  />

                  <div className="relative z-10">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full border border-blue-200/40 bg-blue-400/18 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-blue-100">
                        BLOQUE {block}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.22em] text-white/55">Plan de juego</span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {card.highlightText ?? card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-blue-100/92 sm:text-base">{card.text}</p>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}

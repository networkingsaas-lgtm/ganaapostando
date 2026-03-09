import type { EstudianteCard } from '../../features/estudiante/types';
import ScrollReveal from '../shared/ScrollReveal';

interface Props {
  cards: EstudianteCard[];
}

export default function MedievalBannerCards({ cards }: Props) {
  return (
    <div className="mt-7 sm:mt-10 space-y-2.5 sm:space-y-3">
      {cards.map((card, index) => (
        <ScrollReveal key={card.step} delay={index * 120} className="w-full">
          <div
            className="w-full"
            style={{
              marginLeft: `${index * 4}%`,
              width: '82%',
            }}
          >
            <article className="group [clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%)] bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 p-[2px] shadow-[0_14px_26px_rgba(127,29,29,0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(127,29,29,0.45)]">
              <div className="[clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%)] bg-gradient-to-br from-red-900 via-red-800 to-red-700 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex items-stretch gap-3 sm:gap-4">
                  <p className="hero-impact-font flex items-center text-[clamp(3.4rem,11vw,6rem)] leading-none text-amber-300/90 transition-transform duration-500 group-hover:scale-[1.02]">
                    #{index + 1}
                  </p>

                  <div className="py-0.5">
                    <p className="text-[11px] font-semibold tracking-widest text-amber-200 mb-1.5">{card.step}</p>
                    <h3 className="text-base sm:text-lg font-semibold text-rose-50 mb-1.5 sm:mb-2">{card.title}</h3>
                    <p className="text-xs sm:text-sm text-red-100 leading-relaxed">{card.text}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

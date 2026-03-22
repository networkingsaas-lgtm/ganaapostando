import type { EstudianteCard } from '../types';
import HeaderTitle from '../../../shared/components/HeaderTitle';
import ScrollReveal from '../../../shared/components/ScrollReveal';

interface Props {
  cards: EstudianteCard[];
}

function renderTitleWithHighlight(title: string, highlightText?: string) {
  if (!highlightText) return title;

  const start = title.indexOf(highlightText);
  if (start === -1) return title;

  const end = start + highlightText.length;
  return (
    <>
      {title.slice(0, start)}
      <span className="font-black">{highlightText}</span>
      {title.slice(end)}
    </>
  );
}

export default function MedievalBannerCards({ cards }: Props) {
  const cardRedDark = '#0a3b91';
  const cardRedLight = '#1d5fd1';
  const cardGold = '#ffff';
  const cardIndexGold = '#ffff';

  return (
    <div className="mt-7 sm:mt-10 space-y-2.5 sm:space-y-3">
      {cards.map((card, index) => (
        <ScrollReveal key={`${card.title}-${index}`} delay={index * 120} className="w-full sr-from-right">
          <div
            className="w-full"
            style={{
              marginLeft: `${index * 6.4}%`,
              width: '82%',
            }}
          >
            <article
              className="[clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%)] p-[12px] shadow-[0_18px_32px_rgba(127,0,14,0.28),0_0_0_4px_rgba(242,169,0,0.18)]"
              style={{ background: `linear-gradient(135deg, ${cardRedDark} 0%, ${cardRedLight} 100%)` }}
            >
              <div
                className="relative isolate overflow-hidden [clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%)] border-4 px-4 py-3 sm:px-5 sm:py-4"
                style={{
                  background: `linear-gradient(135deg, ${cardRedDark} 0%, ${cardRedLight} 100%)`,
                  borderColor: cardGold,
                }}
              >
                {card.backgroundImage ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-0"
                    style={{ backgroundImage: `url(${card.backgroundImage})` }}
                  />
                ) : null}

                <div className="relative z-10 flex items-stretch gap-2.5 sm:gap-4">
                  <p
                    className="hero-impact-font flex shrink-0 items-center self-start text-[clamp(2.7rem,10vw,6rem)] leading-[0.9]"
                    style={{ color: cardIndexGold }}
                  >
                    #{index + 1}
                  </p>

                  <div className="min-w-0 flex-1 py-0.5">
                    <HeaderTitle
                      as="h3"
                      uppercase={false}
                      lineHeightClass="leading-[1.06] sm:leading-[1.02]"
                      className="mb-1.5 text-[clamp(1rem,2.3vw,2rem)] font-bold sm:mb-2"
                      style={{ color: '#ffffff' }}
                    >
                      {renderTitleWithHighlight(card.title, card.highlightText)}
                    </HeaderTitle>
                    <p className="text-[clamp(0.84rem,1.55vw,1.1rem)] font-bold leading-[1.45] text-white">
                      {card.text}
                    </p>
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

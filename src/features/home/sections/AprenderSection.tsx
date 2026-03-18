import { useEffect, useRef, useState } from 'react';
import { CartaDisenoCard, aprenderCards } from '../../aprender/cards';
import HeaderTitle from '../../../shared/components/HeaderTitle';
import ScrollReveal from '../../../shared/components/ScrollReveal';

export default function AprenderSection() {
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedSequenceRef = useRef(false);

  const markCardAsRevealed = (index: number) => {
    setRevealedCards((current) => (current.includes(index) ? current : [...current, index]));
  };

  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    const revealStepDelay = 800;
    const timeoutIds: number[] = [];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStartedSequenceRef.current) return;

        hasStartedSequenceRef.current = true;

        aprenderCards.forEach((_, index) => {
          const timeoutId = window.setTimeout(() => {
            markCardAsRevealed(index);
          }, index * revealStepDelay);

          timeoutIds.push(timeoutId);
        });

        observer.unobserve(container);
      },
      { threshold: 0.2 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  return (
    <section className="bg-white py-12 sm:py-20 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl text-left">
          <HeaderTitle
            as="h2"
            lineHeightClass="leading-[1.16] sm:leading-[1.1]"
            className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4"
          >
            <span className="title-span-highlight">Deja de pensar</span> "si sale 3 veces seguidas negro, <span className="title-span-highlight">la siguiente saldrá rojo</span>"
          </HeaderTitle>
          <p className="text-base sm:text-xl text-slate-600">
            La estadística es una parte importante de <span className="rebel-underline"> El Método,</span> NO te dejes llevar por las emociones.
          </p>
        </div>

        <div
          ref={cardsContainerRef}
          className="mt-8 sm:mt-12 flex md:grid md:grid-cols-4 gap-3 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory px-1 pb-5 md:px-0 md:pb-0"
        >
          {aprenderCards.map((card, index) => (
            <ScrollReveal
              key={`${card.title}-${index}`}
              delay={0}
              observeOnly
              className="w-full min-w-[270px] max-w-[270px] snap-start md:min-w-0 md:max-w-none"
            >
              <CartaDisenoCard
                card={card}
                index={index}
                shouldAutoFlip={revealedCards.includes(index)}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

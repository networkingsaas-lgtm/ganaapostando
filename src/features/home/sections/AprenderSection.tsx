import { useEffect, useRef, useState } from 'react';
import { CartaDisenoCard } from '../../aprender/cards';
import { aprenderCards } from '../../aprender/cards.data';
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

        [0, 2].forEach((index, sequenceIndex) => {
          const timeoutId = window.setTimeout(() => {
            markCardAsRevealed(index);
          }, sequenceIndex * revealStepDelay);
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
    <section className="bg-white py-16 sm:py-20 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl text-left">
          <p className="text-4xl sm:text-6xl font-normal mb-8 tracking-tight " style={{ fontFamily: "'Sora', sans-serif" }}>
            La <span className="font-bold tracking-tight">rentabilidad</span> no nace de la intuición, sino del <span className="font-bold tracking-tight">análisis</span>.
          </p>
          
          <p className="text-base sm:text-xl text-slate-600"style={{ fontFamily: "'Sora', sans-serif" }}>
            La estadística es una parte importante de <span className="rebel-underline"> El Método,</span> NO te dejes llevar por las emociones.
          </p>
        </div>

        <div
          ref={cardsContainerRef}
          className="mt-10 sm:mt-12 flex md:grid md:grid-cols-4 gap-3 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-proximity md:snap-none px-2 pt-4 pb-10 md:px-0 md:pt-0 md:pb-0"
        >
          {aprenderCards.map((card, index) => (
            <ScrollReveal
              key={`${card.title}-${index}`}
              delay={0}
              observeOnly
              className="w-full min-w-[270px] max-w-[270px] snap-start py-2 md:min-w-0 md:max-w-none md:py-0"
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

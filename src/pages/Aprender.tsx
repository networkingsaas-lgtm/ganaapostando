import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import HeaderTitle from '../components/ui/HeaderTitle';

export default function Aprender() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCardsVisible(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.18 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cards = [
    {
      title: 'Método por encima del deporte',
      text: 'No necesitas ser experto en ligas o jugadores. Necesitas aplicar bien El Método.',
      underlinedText: 'El Método.',
      imageUrl: '/images.jpg',
    },
    {
      title: 'Sin saber qué es el fuera de juego',
      text: 'Puedes aprender este sistema aunque no entiendas términos técnicos del fútbol.',
      imageUrl: 'https://images3.memedroid.com/images/UPLOADED443/6682bb455a2e2.jpeg',
    },
    {
      title: 'Sin corazonadas ni apuestas locas',
      text: 'Aquí no dependes de combinadas soñadoras: sigues reglas claras y decisiones con lógica.',
      imageUrl: 'https://images7.memedroid.com/images/UPLOADED329/66083cafe0f5c.jpeg',
    },
    
    {
      title: 'Pd: No soy un tipster',
      text: 'No te voy a dar pronósticos ni consejos de apuestas. Te voy a enseñar un sistema para que tú mismo puedas generar ingresos de forma consistente.',
      imageUrl: 'https://lh3.googleusercontent.com/proxy/hR2ZF-AXEnv3Ew4DfIxn2v5BfggJfQS5TL-h07Ne1fpE6j20DLCM0kTDtRWtb-SHeIjjV3SrePDZEH8uXQKNbyMgQ1zeC3qwA6PSw9w5w2SHI0Y',
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-20 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl text-left">
          <HeaderTitle
            as="h2"
            lineHeightClass="leading-[1.16] sm:leading-[1.1]"
            className="text-3xl sm:text-5xl font-bold text-slate-900 mb-4"
          >
            Quieres <span className="title-span-highlight">ganar dinero</span>  pero el fútbol no <span className="title-span-highlight">es lo tuyo</span>?
          </HeaderTitle>
          <p className="text-base sm:text-xl text-slate-600">
            No hace falta saber de fútbol, hace falta entender el mercado.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="mt-8 sm:mt-12 flex md:grid md:grid-cols-4 gap-3 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2 md:pb-0"
        >
          {cards.map((card, index) => {
            const isRedCard = index % 2 !== 0;
            const cardStyle = {
              '--dealer-delay': `${index * 140}ms`,
              '--dealer-shift': `${-124 - index * 18}px`,
              '--dealer-tilt': `${-14 + index * 2}deg`,
            } as CSSProperties;

            return (
              <article
                key={index}
                className={`dealer-card relative min-w-[260px] max-w-[260px] md:min-w-0 md:max-w-none snap-start overflow-hidden rounded-xl sm:rounded-2xl border p-4 sm:p-5 shadow-[0_8px_20px_rgba(15,23,42,0.08)] ${
                  cardsVisible ? 'is-visible' : ''
                } ${
                  isRedCard
                    ? 'border-amber-400/70 bg-gradient-to-br from-red-900 via-red-800 to-red-700'
                    : 'border-slate-300 bg-white'
                }`}
                style={cardStyle}
              >
                <div className="flex flex-col h-full">
                  <h3 className={`text-lg sm:text-xl font-semibold tracking-wide mb-2 sm:mb-3 ${isRedCard ? 'text-amber-100' : 'text-slate-900'}`}>
                    {card.title}
                  </h3>

                  <p className={`startup-font text-sm sm:text-base leading-relaxed ${isRedCard ? 'text-slate-100' : 'text-slate-700'}`}>
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

                  <div className={`mt-3 sm:mt-4 overflow-hidden rounded-lg sm:rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${
                    isRedCard ? 'border-amber-400/60 bg-red-950' : 'border-slate-300 bg-white'
                  }`}>
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-40 sm:h-64 object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

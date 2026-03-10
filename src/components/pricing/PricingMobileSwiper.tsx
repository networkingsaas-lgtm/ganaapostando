import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PricingPlan } from '../../features/pricing/types';
import ScrollReveal from '../shared/ScrollReveal';

interface Props {
  plans: PricingPlan[];
  animClass: string;
  onOpenPlan: (plan: { name: string; content: string[] }) => void;
}

const MAX_AUTO_SWIPES = 3;

export default function PricingMobileSwiper({ plans, animClass, onOpenPlan }: Props) {
  const [activeCard, setActiveCard] = useState(0);
  const [autoSwipeCount, setAutoSwipeCount] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (x: number) => {
    setTouchEndX(null);
    setTouchStartX(x);
  };

  const onTouchMove = (x: number) => {
    setTouchEndX(x);
  };

  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null || plans.length === 0) return;
    const delta = touchStartX - touchEndX;
    const isSwipeLeft = delta > minSwipeDistance;
    const isSwipeRight = delta < -minSwipeDistance;

    if (isSwipeLeft) {
      setActiveCard((prev) => (prev + 1) % plans.length);
    }
    if (isSwipeRight) {
      setActiveCard((prev) => (prev - 1 + plans.length) % plans.length);
    }
  };

  useEffect(() => {
    setAutoSwipeCount(0);
    setActiveCard(0);
    setAutoplayEnabled(false);
  }, [plans.length]);

  useEffect(() => {
    if (!autoplayEnabled || plans.length <= 1) return;

    let swipeCount = 0;

    const intervalId = window.setInterval(() => {
      swipeCount += 1;
      setAutoSwipeCount(swipeCount);

      if (swipeCount >= MAX_AUTO_SWIPES) {
        setActiveCard(0);
        window.clearInterval(intervalId);
        return;
      }

      setActiveCard((prev) => (prev + 1) % plans.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [autoplayEnabled, plans.length]);

  return (
    <>
      <div className="mt-3 mb-5 sm:mb-6 flex items-center justify-center gap-2 md:hidden">
        {plans.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveCard(idx)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              idx === activeCard ? 'bg-white scale-110' : 'bg-white/40'
            }`}
            aria-label={`Ir a tarjeta ${idx + 1}`}
          />
        ))}
      </div>

      <div className="mb-4 text-center text-xs font-semibold tracking-wide text-white/80 md:hidden">
        Auto swipe: {Math.min(autoSwipeCount, MAX_AUTO_SWIPES)}/{MAX_AUTO_SWIPES}
      </div>

      <div className="md:hidden overflow-hidden pt-3 sm:pt-4 pb-2">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeCard * 100}%)` }}
          onTouchStart={(e) => onTouchStart(e.targetTouches[0].clientX)}
          onTouchMove={(e) => onTouchMove(e.targetTouches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          {plans.map((plan, index) => (
            <div key={index} className="w-full flex-shrink-0 px-1">
              <ScrollReveal
                delay={index * 120}
                className="w-full"
                onReveal={index === 0 ? () => setAutoplayEnabled(true) : undefined}
              >
                <div
                  className={`relative rounded-2xl p-5 transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl border-4 border-blue-400'
                      : 'bg-white border-4 border-gray-200 hover:border-blue-300 hover:shadow-xl'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                      MÁS POPULAR
                    </div>
                  )}
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                      RECOMENDADO
                    </div>
                  )}

                  <h3 className={`heading-md font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name.includes('El Método') ? (
                      <>
                        {plan.name.split('El Método')[0]}
                        <span className="rebel-underline">El Método</span>
                        {plan.name.split('El Método')[1]}
                      </>
                    ) : (
                      plan.name
                    )}
                  </h3>

                  <div className="mb-6">
                    {plan.name === 'El Método, plus' ? (
                      <>
                        <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                          €***
                        </span>
                        <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}> / pago único</span>
                      </>
                    ) : /^\d+(?:[.,]\d+)?$/.test(plan.price) ? (
                      <>
                        <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                          €{plan.price}
                        </span>
                        <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}> / pago único</span>
                      </>
                    ) : (
                      <span className={`text-2xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                        {plan.price}
                      </span>
                    )}
                  </div>

                  <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  {plan.content && (
                    <button
                      onClick={() => onOpenPlan({ name: plan.name, content: plan.content! })}
                      className={`w-full mb-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                        plan.highlighted
                          ? 'border-white text-white hover:bg-white/10'
                          : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Ver contenido del curso
                    </button>
                  )}

                  <a
                    href="https://buy.stripe.com/test_14AcN5fLB0ftgjF6OrcIE00"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-4 rounded-lg font-semibold transition-all mb-8 text-center ${
                      plan.highlighted
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } ${animClass}`}
                    style={animClass ? { animationDelay: `${0.9 + index * 0.15}s` } : undefined}
                  >
                    Comenzar Ahora
                  </a>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => {
                      const isNegative = feature.startsWith('❌');
                      const text = isNegative ? feature.replace('❌', '').trim() : feature;
                      const Icon = isNegative ? X : Check;
                      const iconColor = isNegative ? 'text-red-500' : plan.highlighted ? 'text-white' : 'text-green-500';
                      return (
                        <div key={idx} className="flex gap-3 items-start">
                          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                          <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>{text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

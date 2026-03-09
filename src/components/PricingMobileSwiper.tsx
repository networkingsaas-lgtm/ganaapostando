import { Check, X } from 'lucide-react';
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';

export interface PricingPlan {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  price: string;
  description: string;
  features: string[];
  content?: string[];
  highlighted: boolean;
  recommended: boolean;
}

interface Props {
  plans: PricingPlan[];
  animClass: string;
  onOpenPlan: (plan: { name: string; content: string[] }) => void;
}

export default function PricingMobileSwiper({ plans, animClass, onOpenPlan }: Props) {
  const [activeCard, setActiveCard] = useState(0);
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
    if (touchStartX === null || touchEndX === null) return;
    const delta = touchStartX - touchEndX;
    const isSwipeLeft = delta > minSwipeDistance;
    const isSwipeRight = delta < -minSwipeDistance;

    if (isSwipeLeft && activeCard < plans.length - 1) {
      setActiveCard((prev) => prev + 1);
    }
    if (isSwipeRight && activeCard > 0) {
      setActiveCard((prev) => prev - 1);
    }
  };

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
              <ScrollReveal delay={index * 120} className="w-full">
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

                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    plan.highlighted ? 'bg-white/20' : 'bg-blue-100'
                  }`}>
                    <plan.icon className={`w-7 h-7 ${plan.highlighted ? 'text-white' : 'text-blue-500'}`} />
                  </div>

                  <h3 className={`heading-md font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>

                  <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      €{plan.price}
                    </span>
                    <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}> / pago único</span>
                  </div>

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

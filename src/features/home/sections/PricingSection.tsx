import { Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PricingMobileSwiper from '../../pricing/components/PricingMobileSwiper';
import { pricingPlans } from '../../pricing/plans';
import HeaderTitle from '../../../shared/components/HeaderTitle';
import ScrollReveal from '../../../shared/components/ScrollReveal';

const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_14AcN5fLB0ftgjF6OrcIE00';

interface Props {
  flashButtonsKey?: number;
  startMode?: 'register' | 'stripe';
  theme?: 'dark' | 'light';
}

export default function PricingSection({
  flashButtonsKey = 0,
  startMode = 'register',
  theme = 'dark',
}: Props) {
  const navigate = useNavigate();
  const [planModal, setPlanModal] = useState<null | { name: string; content: string[] }>(null);
  const [animClass, setAnimClass] = useState('');
  const isLightTheme = theme === 'light';

  useEffect(() => {
    if (flashButtonsKey === 0) return;
    setAnimClass('');
    const t1 = setTimeout(() => setAnimClass('btn-pulse-gold'), 10);
    const t2 = setTimeout(() => setAnimClass(''), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [flashButtonsKey]);
  const plans = pricingPlans;

  const handleStartNow = () => {
    if (startMode === 'stripe') {
      window.open(STRIPE_CHECKOUT_URL, '_blank', 'noopener,noreferrer');
      return;
    }

    navigate('/registro');
  };

  return (
    <section id="pricing" className="relative overflow-hidden py-12 sm:py-20 section-padding">
      {!isLightTheme && (
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-cover opacity-20"
          style={{ backgroundImage: "url('/pricing-bg.png')" }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <HeaderTitle
            as="h2"
            uppercase={true}
            lineHeightClass="leading-[1.12] sm:leading-[1.06]"
            className={`heading-lg sm:heading-xl font-bold mb-4 ${
              isLightTheme ? 'text-slate-900' : 'text-white'
            }`}
          >
            Invierte en Tu Educación Financiera
          </HeaderTitle>
          <p className={`body-text max-w-3xl mx-auto ${isLightTheme ? 'text-slate-600' : 'text-white/85'}`}>
            Elige el nivel que mejor se adapte a tus objetivos.
          </p>
        </div>

        <PricingMobileSwiper
          plans={plans}
          animClass={animClass}
          onOpenPlan={setPlanModal}
          onStartNow={handleStartNow}
          theme={theme}
        />

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 pt-6 sm:pt-7 pb-0">
          {plans.map((plan, index) => (
            <ScrollReveal key={index} delay={index * 150} className="w-full">
              <div
                className={`relative rounded-2xl p-5 sm:p-8 transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl lg:scale-105 border-4 border-blue-400'
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
                      <span className={`text-3xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                        €***
                      </span>
                      <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}> / pago único</span>
                    </>
                  ) : /^\d+(?:[.,]\d+)?$/.test(plan.price) ? (
                    <>
                      <span className={`text-3xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                        €{plan.price}
                      </span>
                      <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}> / pago único</span>
                    </>
                  ) : (
                    <span className={`text-2xl sm:text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                  )}
                </div>

                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                {'content' in plan && (
                  <button
                    onClick={() => setPlanModal(plan as { name: string; content: string[] })}
                    className={`w-full mb-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                      plan.highlighted
                        ? 'border-white text-white hover:bg-white/10'
                        : 'border-blue-500 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Ver contenido del curso
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleStartNow}
                  className={`block w-full py-4 rounded-lg font-semibold transition-all mb-8 text-center ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } ${animClass}`}
                  style={animClass ? { animationDelay: `${0.9 + index * 0.15}s` } : undefined}
                >
                  Comenzar Ahora
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, idx) => {
                    const isNegative = feature.startsWith('❌');
                    const text = isNegative ? feature.replace('❌', '').trim() : feature;
                    const Icon = isNegative ? X : Check;
                    const iconColor = isNegative ? 'text-red-500' : plan.highlighted ? 'text-white' : 'text-green-500';
                    return (
                      <div key={idx} className="flex gap-3 items-start">
                        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
                        <span className={plan.highlighted ? 'text-blue-50' : 'text-gray-700'}>
                          {text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className={`mb-4 ${isLightTheme ? 'text-slate-600' : 'text-white/80'}`}>
            ¿No estás seguro? Mira casos de éxito reales y testimonios de estudiantes antes de decidir. Tu inversión en educación es la mejor apuesta que puedes hacer.
          </p>
        </div>
      </div>

      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setPlanModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPlanModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{planModal.name}</h3>
            <p className="text-sm text-gray-500 mb-6">Contenido del curso</p>
            <div className="space-y-3">
              {planModal.content.map((item, i) => (
                item.startsWith('—')
                  ? <p key={i} className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-2">{item}</p>
                  : <div key={i} className="flex gap-3 items-start">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

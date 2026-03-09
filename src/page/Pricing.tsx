import { Check, Zap, BookOpen, FileSpreadsheet, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import HeaderTitle from '../components/ui/HeaderTitle';
import PricingMobileSwiper, { type PricingPlan } from '../components/PricingMobileSwiper';

export default function Pricing({ flashButtonsKey = 0 }: { flashButtonsKey?: number }) {
  const [planModal, setPlanModal] = useState<null | { name: string; content: string[] }>(null);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (flashButtonsKey === 0) return;
    setAnimClass('');
    const t1 = setTimeout(() => setAnimClass('btn-pulse-gold'), 10);
    const t2 = setTimeout(() => setAnimClass(''), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [flashButtonsKey]);
  const plans: PricingPlan[] = [
    {
      name: 'Plan Autodidacta',
      icon: FileSpreadsheet,
      price: '79',
      description: '⚠️ Sin clases ni soporte. Recibes los recursos y operas completamente por tu cuenta.',
      features: [
        'Excel de seguimiento de apuestas (el mismo que usan nuestros alumnos)',
        'Calculadora de cálculo de value bets y EV esperado',
        'Calculadora de stake y gestión de bankroll',
        'Lista de casas de apuestas recomendadas y cuáles evitar',
        'Lista de herramientas y escáneres de cuotas que debes usar',
        '❌ Sin clases ni formación',
        '❌ Sin soporte ni ayuda personalizada',
        '❌ Trabajas completamente solo',
      ],
      highlighted: false,
      recommended: false,
    },
    {
      name: 'Plan Activo',
      icon: BookOpen,
      price: '197',
      description: 'Aprende nuestra metodología de inversión en apuestas deportivas.',
      features: [
        '+ Todo lo incluido en Autodidacta',
        '🎥 10 horas de contenido formativo (vídeos + materiales)',
        '📅 2 clases online en directo para dudas y cuestiones',
        '📚 Acceso a todas las guías y materiales del curso',
        
      ],
      content: [
        'Fundamentos del Matched Betting desde cero',
        'Cómo identificar y aprovechar los bonos de bienvenida',
        'Matched betting con apuestas free bet y reembolsos',
        'Value Betting: qué es y cómo detectar cuotas con valor',
        'Cómo calcular el EV (valor esperado) de una apuesta',
        'Qué casas de apuestas usar y cuáles evitar',
        'Mejores herramientas y escáneres de cuotas del mercado',
        'Gestión de bankroll y control de varianza',
        'Estrategia de apuestas a largo plazo',
        'Errores más comunes y cómo evitarlos',
      ],
      highlighted: false,
      recommended: true,
    },
    {
      name: 'Plan Profesional',
      icon: Zap,
      price: '297',
      description: 'Dominio avanzado de Value Betting, Trading Deportivo y nuevas técnicas. Para quien quiere llevar las apuestas al siguiente nivel.',
      features: [
        '+ Todo lo incluido en Metodología Activa',
        '🎥 20 horas de contenido avanzado (vídeos + materiales)',
        '📅 4 clases online en directo para dudas y casos reales',
        'Apuesta con nosotros en directo cada semana',
      ],
      content: [
        '— VALUE BETTING AVANZADO —',
        'Modelo matemático de detección de value bets',
        'Cómo construir tu propio modelo de probabilidades',
        'Comparación de cuotas entre bookmakers: herramientas profesionales',
        'Análisis de mercados líquidos vs ilíquidos',
        'Gestión de stakes según Kelly Criterion',
        'Control de varianza y drawdown a largo plazo',
        'Cómo leer el movimiento de líneas y qué señala',
        'Seguimiento y análisis de resultados con estadística real',
        '— TRADING DEPORTIVO —',
        'Qué es el trading deportivo y en qué se diferencia del betting',
        'Plataformas de trading: Betfair, Smarkets y cómo usarlas',
        'Estrategias de trading en mercados pre-partido',
        'Trading en directo (in-play): oportunidades y riesgos',
        'Scalping y swing trading en apuestas deportivas',
        'Gestión de posiciones abiertas y cómo cerrar con beneficio',
        '— NUEVAS TÉCNICAS —',
        'Arbitraje deportivo: cómo detectar y ejecutar arbs',
        'Bonus abuse avanzado y técnicas de reload',
        'Apuestas a mercados alternativos de alto valor',
        'Automatización y uso de bots de forma legal',
        'Construcción de un sistema de apuestas sostenible',
      ],
      highlighted: true,
      recommended: false,
    },
  ];

  return (
    <section id="pricing" className="py-12 sm:py-20 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <HeaderTitle
            as="h2"
            uppercase={true}
            lineHeightClass="leading-tight"
            className="heading-lg sm:heading-xl font-bold text-white mb-4"
          >
            Invierte en Tu Educación
          </HeaderTitle>
          <p className="body-text text-white/85 max-w-3xl mx-auto">
            Elige el nivel que mejor se adapte a tus objetivos.
          </p>
        </div>

        <PricingMobileSwiper plans={plans} animClass={animClass} onOpenPlan={setPlanModal} />

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
                <span className={`text-3xl sm:text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  €{plan.price}
                </span>
                <span className={plan.highlighted ? 'text-blue-100' : 'text-gray-600'}> / pago único</span>
              </div>

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
          <p className="text-white/80 mb-4">
            ¿No estás seguro? Mira casos de éxito reales y testimonios de estudiantes antes de decidir. Tu inversión en educación es la mejor apuesta que puedes hacer.
          </p>
        </div>
      </div>

      {/* Modal contenido */}
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

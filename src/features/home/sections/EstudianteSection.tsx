import ScrollReveal from '../../../shared/components/ScrollReveal';

const ESTUDIANTE_SCREEN = '/mapacapa1-lite.jpg';
const METODO_CARDS = [
  {
    number: '01',
    title: 'Fundamentos de las casas de apuestas',
    description: 'Aprendes cómo funcionan las cuotas, los márgenes y la estructura real del mercado.',
  },
  {
    number: '02',
    title: 'Apuestas sin riesgo',
    description: 'Te mostramos enfoques para reducir la exposición al riesgo y proteger tu banca.',
  },
  {
    number: '03',
    title: 'Apuestas con valor esperado',
    description: 'Entrenamos la detección de oportunidades con valor positivo para decisiones más rentables.',
  },
];

export default function EstudianteSection() {
  return (
    <section className="bg-white py-12 sm:py-20 section-padding">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl text-left">
          <p className="mb-8 text-4xl font-normal tracking-tight sm:text-6xl" style={{ fontFamily: "'Sora', sans-serif" }}>
            <span className="font-bold tracking-tight">Genera ingresos</span> de forma independiente.
          </p>
          <p className="text-base text-slate-600 sm:text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
            Una formación paso a paso para entender el mercado, reducir errores y construir un criterio rentable.
          </p>
        </div>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="flex flex-col gap-4">
              {METODO_CARDS.map((card, index) => (
                <ScrollReveal key={card.number} delay={index * 120} className="w-full sr-from-right">
                  <article className="relative isolate w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 pr-24 shadow-[0_40px_90px_rgba(15,23,42,0.42)]">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 right-3 z-0 flex items-center text-[6rem] font-black leading-none text-slate-100"
                    >
                      {card.number}
                    </span>
                    <h3 className="relative z-10 mt-2 text-base font-bold leading-tight text-slate-900">{card.title}</h3>
                    <p className="relative z-10 mt-2 text-sm leading-relaxed text-slate-700">{card.description}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="flex w-full max-w-[22rem] items-center justify-center gap-3 sm:max-w-[24rem] sm:gap-4 lg:max-w-[28rem]">
              <div className="w-full max-w-[9.4rem] sm:max-w-[10.8rem] lg:max-w-[12.4rem]">
                <div className="relative aspect-[1359/2736] w-full">
                  <div className="absolute inset-x-[6.3%] inset-y-[3.2%] overflow-hidden rounded-[11%] bg-slate-900">
                    <img
                      src="/pantallacarga-lite.jpg"
                      alt="Pantalla de carga"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <img
                    src="/iphone.png"
                    alt="Marco de iPhone con pantalla de carga"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="w-full max-w-[9.4rem] sm:max-w-[10.8rem] lg:max-w-[12.4rem]">
                <div className="relative aspect-[1359/2736] w-full">
                  <div className="absolute inset-x-[6.3%] inset-y-[3.2%] overflow-hidden rounded-[11%] bg-slate-900">
                    <img
                      src={ESTUDIANTE_SCREEN}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-105 object-cover opacity-20 blur-sm"
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      src={ESTUDIANTE_SCREEN}
                      alt="Captura del método"
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="absolute inset-x-[6.3%] inset-y-[3.2%] overflow-hidden rounded-[11%]">
                    <img
                      src={ESTUDIANTE_SCREEN}
                      alt="Captura del método"
                      className="absolute inset-0 h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <img
                    src="/iphone.png"
                    alt="Marco de iPhone"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { ArrowRight, Check, Flame, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageReveal from '../shared/components/PageReveal';
import ScrollReveal from '../shared/components/ScrollReveal';

interface Props {
  onRegistrarse: () => void;
  onVerResultados: () => void;
}

const pricingPlans = [
  {
    name: 'Plan Mensual',
    price: '15 EUR',
    period: '/mes',
    highlight: true,
    features: ['Picks diarios en Telegram', 'Gestión de stake recomendada', 'Acceso inmediato al grupo'],
  },
  {
    name: 'Plan Trimestral',
    price: '39 EUR',
    period: '/3 meses',
    highlight: false,
    features: ['Ahorro frente al mensual', 'Misma estrategia y flujo diario', 'Seguimiento continuo de resultados'],
  },
  {
    name: 'Plan Anual',
    price: '129 EUR',
    period: '/12 meses',
    highlight: false,
    features: ['Mejor precio por mes', 'Acceso completo todo el año', 'Prioridad en nuevas mejoras'],
  },
];

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);

const formatNumber = (amount: number) =>
  new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 2,
  }).format(amount);

const parseNumericInput = (value: string) => {
  const normalized = value.replace(',', '.').trim();

  if (normalized === '') {
    return 0;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
};

export default function GrupoLandingPage({
  onRegistrarse,
  onVerResultados,
}: Props) {
  const [bankValue, setBankValue] = useState('300');
  const [cuotaValue, setCuotaValue] = useState('2.10');
  const [evValue, setEvValue] = useState('6.5');
  const [kellyValue, setKellyValue] = useState('0.5');
  const [marketLimitValue, setMarketLimitValue] = useState('10');

  const bank = parseNumericInput(bankValue);
  const cuotaDecimal = parseNumericInput(cuotaValue);
  const evPercent = parseNumericInput(evValue);
  const kellyFactor = parseNumericInput(kellyValue);
  const marketLimit = parseNumericInput(marketLimitValue);
  const evDecimal = evPercent / 100;
  const rawStake = cuotaDecimal > 1 ? bank * (evDecimal / (cuotaDecimal - 1)) * kellyFactor : 0;
  const stakeFinal = Math.min(Math.max(rawStake, 0), marketLimit);
  const stakePercent = bank > 0 ? (stakeFinal / bank) * 100 : 0;
  const calculatorFields = [
    {
      label: 'Bank',
      helper: 'Saldo disponible para la apuesta.',
      value: bankValue,
      onChange: setBankValue,
      prefix: 'EUR',
      placeholder: '300',
    },
    {
      label: 'Cuota decimal',
      helper: 'La cuota de la apuesta en formato decimal.',
      value: cuotaValue,
      onChange: setCuotaValue,
      placeholder: '2.10',
    },
    {
      label: 'EV %',
      helper: 'Tu porcentaje de valor esperado.',
      value: evValue,
      onChange: setEvValue,
      suffix: '%',
      placeholder: '6.5',
    },
    {
      label: 'Kelly factor',
      helper: 'Número de Kelly que quieres aplicar.',
      value: kellyValue,
      onChange: setKellyValue,
      placeholder: '0.5',
    },
    {
      label: 'Límite de mercado',
      helper: 'Tope máximo que permite la casa.',
      value: marketLimitValue,
      onChange: setMarketLimitValue,
      prefix: 'EUR',
      placeholder: '10',
    },
  ] as const;

  return (
    <div
      className="relative min-h-screen cara-b-landing-bg overflow-x-hidden text-white"
      style={{
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <section className="relative overflow-hidden bg-white pb-18 pt-28 text-slate-900 sm:pb-24 sm:pt-32 section-padding">
        <div
          className="grupoapuestas-hero-overlay pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <PageReveal delay={170}>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div className="relative h-28 w-[11.6rem] shrink-0 sm:h-40 sm:w-[16.2rem] lg:h-52 lg:w-[21.2rem]">
                <div className="absolute left-0 top-1/2 z-20 h-28 w-28 -translate-y-1/2 overflow-hidden rounded-full bg-white shadow-[0_12px_28px_rgba(15,23,42,0.24)] sm:h-40 sm:w-40 lg:h-52 lg:w-52">
                  <img
                    src="/logo.png"
                    alt="Logo de El Método"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <img
                  src="/telegramiconoperfil2.png"
                  alt="Perfil de Telegram del grupo"
                  className="absolute right-0 top-1/2 z-0 h-28 w-28 -translate-y-1/2 object-contain sm:h-40 sm:w-40 lg:h-52 lg:w-52"
                  loading="lazy"
                />
              </div>
              <h1 className="text-center text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
                Grupo Telegram
              </h1>
            </div>
          </PageReveal>

          <PageReveal delay={260}>
            <p className="mx-auto mt-8 max-w-3xl text-center text-base text-slate-600 sm:text-xl">
              No somos tipsters, ni vendemos pronósticos. Compartimos apuestas de valor esperado positivo (EV+) con una gestión de stake recomendada. Nuestra metodología se basa en el análisis estadístico y la búsqueda de oportunidades de apuesta que ofrezcan un retorno esperado positivo a largo plazo.
            </p>
          </PageReveal>

          <PageReveal delay={350}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={onRegistrarse}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-700 bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(0,0,0,0.16)] transition hover:translate-y-[-1px] hover:bg-blue-800 sm:text-base"
              >
                Entrar al grupo Ahora
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onVerResultados}
                className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:text-base"
              >
                Ver resultados reales
              </button>
            </div>
          </PageReveal>

          <PageReveal delay={430}>
            <div className="mt-12 grid gap-3 text-sm text-slate-700 sm:grid-cols-3 sm:text-base">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <Flame className="h-5 w-5 shrink-0 text-orange-600" />
                 <span>Informamos del EV+ por apuesta</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600" />
                 <span>Gestión por stake</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <img
                  src="/telegramicono.avif"
                  alt="Icono de Telegram"
                  className="h-5 w-5 shrink-0 object-contain"
                  loading="lazy"
                />
                <span>Acceso desde Telegram en segundos</span>
              </div>
            </div>
          </PageReveal>
        </div>
      </section>

      <section className="startup-font relative overflow-hidden pb-16 pt-12 text-white section-padding sm:pb-24 sm:pt-20">
        <div className="hero-startup-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mr-auto max-w-5xl text-left">
            <p className="mb-8 text-4xl font-normal tracking-tight sm:text-6xl" style={{ fontFamily: "'Sora', sans-serif" }}>
              Calcula tu stake recomendado para nuestras <span className="font-bold tracking-tight">apuestas de valor</span>
            </p>
            <p className="text-base text-white/85 sm:text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
                Introduce el bank, la cuota decimal, el porcentaje de EV, tu número de Kelly y el límite de mercado. La salida se ajusta al tope disponible.
            </p>
          </div>

          <div className="mt-10 mx-auto w-full max-w-7xl space-y-6">

            <ScrollReveal
              delay={120}
              className="rounded-[2rem] border border-white/45 bg-white/78 p-5 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-md sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  
                  <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: "'Sora', sans-serif" }}>
                    Calcula tu stake
                  </h3>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-white/60 bg-white/45">
                <div className="grid gap-3 p-3 lg:hidden">
                  {calculatorFields.map((field) => (
                    <div key={`mobile-${field.label}`} className="rounded-2xl border border-white/70 bg-white/75 p-4">
                      <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{field.helper}</p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        <span>{'prefix' in field && field.prefix ? field.prefix : 'Dato'}</span>
                        {'suffix' in field && field.suffix ? <span>{field.suffix}</span> : null}
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder={field.placeholder}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  ))}

                  <div className="rounded-2xl border border-blue-900 bg-blue-950 p-4 text-white">
                    <p className="text-sm font-semibold text-blue-100">Resultado</p>
                    <p className="mt-1 text-xs leading-5 text-blue-200/85">Muestra el stake final de la operación.</p>
                    <div className="mt-3 rounded-xl border border-blue-300/25 bg-white/10 px-4 py-3 text-base font-semibold text-white">
                      {formatMoney(stakeFinal)}
                    </div>
                    <p className="mt-2 text-sm text-blue-100/90">{formatNumber(stakePercent)}% del bank</p>
                  </div>
                </div>

                <div className="hidden lg:grid lg:grid-cols-6">
                  {calculatorFields.map((field, index) => (
                    <div
                      key={`head-${field.label}`}
                       className={`border-b border-slate-200 bg-white/45 px-4 py-4 ${index < calculatorFields.length ? 'border-r' : ''}`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{field.helper}</p>
                    </div>
                  ))}
                  <div className="border-b border-blue-900 bg-blue-950 px-4 py-4 text-white">
                    <p className="text-sm font-semibold text-blue-100">Resultado</p>
                    <p className="mt-1 text-xs leading-5 text-blue-200/85">
                      Muestra el stake final de la operación.
                    </p>
                  </div>

                  {calculatorFields.map((field, index) => (
                    <div
                      key={`input-${field.label}`}
                       className={`bg-white/68 px-4 py-4 ${index < calculatorFields.length ? 'border-r border-slate-200' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        <span>{'prefix' in field && field.prefix ? field.prefix : 'Dato'}</span>
                        {'suffix' in field && field.suffix ? <span>{field.suffix}</span> : null}
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder={field.placeholder}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  ))}
                  <div className="bg-blue-950 px-4 py-4 text-white">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-200/85">
                      <span>Resultado</span>
                      <Target className="h-3.5 w-3.5 text-blue-200/85" />
                    </div>
                    <div className="mt-3 rounded-xl border border-blue-300/25 bg-white/10 px-4 py-3 text-base font-semibold text-white">
                      {formatMoney(stakeFinal)}
                    </div>
                    <p className="mt-2 text-sm text-blue-100/90">
                      {formatNumber(stakePercent)}% del bank
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  stakeFinal = min(bank * (EV / (cuota - 1)) * Kelly, límite de mercado)
                </p>
                
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white pb-14 pt-12 text-slate-900 section-padding sm:pb-20 sm:pt-16">
        <div
          className="grupoapuestas-hero-overlay pointer-events-none absolute inset-0"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <ScrollReveal className="text-center">
            <h2 className="text-3xl font-bold sm:text-5xl" style={{ fontFamily: "'Sora', sans-serif" }}>
              Pricing del grupo
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-slate-600 sm:text-lg">
              Elige el plan que mejor se adapte a tu ritmo. Acceso directo al grupo y a la metodología desde el primer día.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pricingPlans.map(({ name, price, period, features, highlight }, index) => (
              <ScrollReveal
                key={name}
                delay={index * 110}
                className={`rounded-[2rem] border p-6 shadow-[0_14px_34px_rgba(2,8,23,0.24)] ${
                  highlight
                    ? 'border-blue-300/60 bg-gradient-to-b from-white to-blue-50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                {highlight ? (
                  <p className="inline-flex rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                    Más elegido
                  </p>
                ) : null}
                <h3 className={`mt-4 text-2xl font-semibold ${highlight ? 'text-slate-900' : 'text-slate-900'}`}>{name}</h3>
                <p className={`mt-3 flex items-end gap-1 ${highlight ? 'text-slate-900' : 'text-slate-900'}`}>
                  <span className="text-4xl font-bold leading-none">{price}</span>
                  <span className={`pb-1 text-sm ${highlight ? 'text-slate-600' : 'text-slate-600'}`}>{period}</span>
                </p>

                <ul className="mt-6 space-y-3">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2 text-sm sm:text-base ${highlight ? 'text-slate-700' : 'text-slate-700'}`}
                    >
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? 'text-blue-600' : 'text-emerald-300'}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={onRegistrarse}
                  className={`mt-7 w-full rounded-2xl px-5 py-3.5 text-sm font-semibold transition sm:text-base ${
                    highlight
                      ? 'bg-blue-700 text-white hover:bg-blue-800'
                      : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Empezar con este plan
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden section-padding pb-10">
        <div className="hero-startup-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/20 pt-6 text-sm text-white/70 sm:flex-row">
          <p>El Método · GrupoApuestas</p>
          <div className="flex items-center gap-5">
            <Link to="/terminos-del-servicio" className="transition hover:text-white">
              Términos del servicio
            </Link>
            <Link to="/politica-de-privacidad" className="transition hover:text-white">
              Política de privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

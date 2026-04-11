import {
  ArrowRight,
  Check,
  Flame,
  Send,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageReveal from '../../shared/components/PageReveal';
import ScrollReveal from '../../shared/components/ScrollReveal';

interface Props {
  onRegistrarse: () => void;
  onVerResultados: () => void;
}

const instructionsToFollow = [
  {
    title: 'Suscríbete por 15€',
    icon: Send,
  },
  {
    title: 'Apuesta 10€ por apuesta',
    icon: Flame,
  },
  {
    title: 'Gana dinero cada mes',
    icon: TrendingUp,
  },
];

const pricingPlans = [
  {
    name: 'Plan Mensual',
    price: '15€',
    period: '/mes',
    highlight: true,
    features: ['Picks diarios en Telegram', 'Gestión de stake recomendada', 'Acceso inmediato al grupo'],
  },
  {
    name: 'Plan Trimestral',
    price: '39€',
    period: '/3 meses',
    highlight: false,
    features: ['Ahorro frente al mensual', 'Misma estrategia y flujo diario', 'Seguimiento continuo de resultados'],
  },
  {
    name: 'Plan Anual',
    price: '129€',
    period: '/12 meses',
    highlight: false,
    features: ['Mejor precio por mes', 'Acceso completo todo el año', 'Prioridad en nuevas mejoras'],
  },
];

export default function GrupoApuestasLandingPage({
  onRegistrarse,
  onVerResultados,
}: Props) {
  return (
    <div
      className="min-h-screen hero-startup-bg startup-fixed-bg overflow-x-hidden text-white"
      style={{
        fontFamily: "'Sora', sans-serif",
        backgroundImage: "url('/landing2.jpg')",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
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
              Apuestas de Valor buscadas con nuestra metodología, entregadas directo a tu Telegram cada día.
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
                <span>Picks diarios con contexto</span>
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
              Instrucciones para seguir <span className="font-bold tracking-tight">el plan diario</span>.
            </p>
            <p className="text-base text-white/85 sm:text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
              Sigue estos pasos de forma ordenada para ejecutar mejor, evitar errores comunes y mantener constancia.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:mt-12 md:grid-cols-3 md:[&>*:nth-child(2)]:translate-y-6 md:[&>*:nth-child(3)]:translate-y-12">
            {instructionsToFollow.map(({ title, icon: Icon }, index) => (
              <ScrollReveal
                key={title}
                delay={index * 120}
                className="flex items-center gap-3 rounded-3xl border border-slate-300/90 bg-white/88 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.10)]"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="min-w-0 flex-1 text-base font-semibold leading-tight text-slate-900 sm:text-lg">{index + 1}. {title}</h3>
              </ScrollReveal>
            ))}
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
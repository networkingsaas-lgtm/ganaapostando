import { type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageReveal from '../../../shared/components/PageReveal';
import ScrollReveal from '../../../shared/components/ScrollReveal';

interface LegalSummaryCard {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface LegalContentSection {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalPageTemplateProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  summaryCards: LegalSummaryCard[];
  sections: LegalContentSection[];
  complementaryLink: {
    href: string;
    label: string;
  };
}

export default function LegalPageTemplate({
  title,
  subtitle,
  lastUpdated,
  summaryCards,
  sections,
  complementaryLink,
}: LegalPageTemplateProps) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <section className="border-b border-slate-200 bg-white pb-12 section-padding sm:pb-16">
        <div className="relative z-10 mx-auto max-w-7xl pt-28 sm:pt-32">
          <div className="mx-auto max-w-5xl text-center">
            <PageReveal delay={90}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600">
                Última actualización: {lastUpdated}
              </p>
            </PageReveal>

            <PageReveal delay={170}>
              <h1 className="mt-5 heading-xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
            </PageReveal>

            <PageReveal delay={250}>
              <p className="body-text mx-auto mt-5 max-w-3xl text-slate-600">
                {subtitle}
              </p>
            </PageReveal>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <PageReveal key={card.title} delay={330 + (index * 120)}>
                  <article className="h-full rounded-[2rem] border border-slate-200 bg-white p-6 text-left shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="mt-5 text-xl font-bold text-slate-900">{card.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                  </article>
                </PageReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden hero-startup-bg startup-fixed-bg py-12 section-padding sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-cover opacity-[0.20]"
          style={{ backgroundImage: "url('/fondoTyC.avif')" }}
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          {sections.map((section, index) => (
            <ScrollReveal key={section.title} delay={index * 110} className="w-full">
              <article className="h-full rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_28px_70px_rgba(15,23,42,0.10)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                  {section.eyebrow}
                </p>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                  {section.title}
                </h2>

                <div className="mt-5 space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-slate-600 sm:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 flex-none rounded-full bg-blue-600" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-12 section-padding sm:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
              Acceso rápido
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Consulta también el otro documento legal</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Estas páginas son una base funcional para la web. Antes de publicarlas, conviene revisar
              los datos reales del titular, el email de contacto y las condiciones comerciales finales.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={complementaryLink.href}
              className="rounded-full border border-blue-100 bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {complementaryLink.label}
            </Link>
            <Link
              to="/"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Volver a home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

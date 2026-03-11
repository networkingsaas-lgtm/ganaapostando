import { TrendingUp } from 'lucide-react';

interface Props {
  roi: number;
  total: number;
  media: number;
  visible?: boolean;
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function HeroStatsCards({ roi, total, media, visible = false }: Props) {
  const cards = [
    {
      label: 'ROI Promedio',
      value: `+${roi.toFixed(2)}%`,
      delay: '0ms',
      spanClass: '',
    },
    {
      label: 'Ganancia Total Alumnos',
      value: formatCurrency(total),
      delay: '110ms',
      spanClass: '',
    },
    {
      label: 'Ganancia Media por Alumno',
      value: formatCurrency(media),
      delay: '220ms',
      spanClass: 'sm:col-span-2 lg:col-span-1',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className={[
            'group relative overflow-hidden rounded-[28px] border border-white/18',
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)]',
            'p-5 text-left shadow-[0_18px_60px_rgba(2,11,74,0.18)] ring-1 ring-white/6',
            'transition-[transform,opacity,box-shadow] duration-700 ease-out',
            'hover:-translate-y-1 hover:shadow-[0_22px_68px_rgba(2,11,74,0.24)]',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            card.spanClass,
          ].join(' ')}
          style={{ transitionDelay: card.delay }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_48%)]" />

          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/88 text-blue-700 shadow-[0_12px_24px_rgba(255,255,255,0.18)]">
              <TrendingUp className="h-5 w-5" />
            </div>

            <p className="text-sm text-white/80">{card.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-[2rem]">{card.value}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

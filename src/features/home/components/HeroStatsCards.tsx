import { Euro, TrendingUp } from 'lucide-react';

interface Props {
  roi: number;
  total: number;
  media: number;
  visible?: boolean;
  onVerResultados: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function HeroStatsCards({ roi, total, media, visible = false, onVerResultados }: Props) {
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
      {cards.map((card, index) => {
        const Icon = index >= 1 ? Euro : TrendingUp;

        return (
        <button
          type="button"
          key={card.label}
          onClick={onVerResultados}
          className={[
            'group relative overflow-hidden rounded-[28px] border border-white/18',
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.08)_100%)]',
            'w-full p-4 text-left shadow-[0_18px_60px_rgba(2,11,74,0.18)] ring-1 ring-white/6 sm:p-5',
            'transition-[transform,opacity,box-shadow] duration-700 ease-out',
            'hover:-translate-y-1 hover:shadow-[0_22px_68px_rgba(2,11,74,0.24)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            card.spanClass,
          ].join(' ')}
          style={{ transitionDelay: card.delay }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_48%)]" />

          <div className="relative">
            <div className="grid min-h-[112px] grid-cols-[4rem_minmax(0,1fr)] gap-3 sm:grid-cols-[4.75rem_minmax(0,1fr)] sm:gap-4">
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/25 bg-white/70 p-3 text-blue-700 shadow-[0_12px_24px_rgba(255,255,255,0.18)]">
                <Icon className="h-full w-full" />
              </div>

              <div className="flex h-full min-w-0 flex-col justify-center gap-2 py-1 pr-1">
                <p className="text-[1.05rem] leading-tight text-white/80">{card.label}</p>
                <p className="text-[2.05rem] font-bold leading-none tracking-tight text-white">{card.value}</p>
              </div>
            </div>
          </div>
        </button>
      );
      })}
    </div>
  );
}

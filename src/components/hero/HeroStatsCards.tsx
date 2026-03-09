import { TrendingUp } from 'lucide-react';

interface Props {
  roi: number;
  total: number;
  media: number;
}

export default function HeroStatsCards({ roi, total, media }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="rounded-2xl border border-white/40 bg-white/20 backdrop-blur-xl p-5 text-left shadow-[0_10px_40px_rgba(255,255,255,0.16)]">
        <div className="w-11 h-11 rounded-xl bg-white text-blue-700 flex items-center justify-center mb-3 shadow-md">
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-sm text-white/80">ROI Promedio</p>
        <p className="text-2xl font-bold text-white">+{roi.toFixed(2)}%</p>
      </div>

      <div className="rounded-2xl border border-white/40 bg-white/20 backdrop-blur-xl p-5 text-left shadow-[0_10px_40px_rgba(255,255,255,0.16)]">
        <div className="w-11 h-11 rounded-xl bg-white text-blue-700 flex items-center justify-center mb-3 shadow-md">
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-sm text-white/80">Ganancia Total Alumnos</p>
        <p className="text-2xl font-bold text-white">
          €{total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="rounded-2xl border border-white/40 bg-white/20 backdrop-blur-xl p-5 text-left shadow-[0_10px_40px_rgba(255,255,255,0.16)] sm:col-span-2 lg:col-span-1">
        <div className="w-11 h-11 rounded-xl bg-white text-blue-700 flex items-center justify-center mb-3 shadow-md">
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-sm text-white/80">Ganancia Media por Alumno</p>
        <p className="text-2xl font-bold text-white">
          €{media.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

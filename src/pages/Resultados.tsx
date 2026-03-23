import { useState } from 'react';
import PageReveal from '../shared/components/PageReveal';
import { TrendingUp, BarChart2, DollarSign, ArrowLeft, Building2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import type { Usuario } from '../features/resultados/types';
import { usuarios } from '../features/resultados/data';

type EjeX = 'tiempo' | 'apuestas';

interface Props {
  onVolver: () => void;
  onVerPricing: () => void;
}

export default function Resultados({ onVolver, onVerPricing }: Props) {
  const [seleccionado, setSeleccionado] = useState<Usuario>(usuarios[0]);
  const [ejeX, setEjeX] = useState<EjeX>('tiempo');
  const [panelAbierto, setPanelAbierto] = useState(true);

  const formatMoney = (amount: number) =>
    `€${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const datosGrafico = seleccionado.beneficioValues.map((b, i) => ({
    label:
      ejeX === 'tiempo'
        ? seleccionado.tiempoLabels[i]
        : seleccionado.apuestasValues[i].toString(),
    beneficio: b,
    diferencia: i === 0 ? null : b - seleccionado.beneficioValues[i - 1],
  }));

  const renderTooltipContent = (props: any) => {
    const { active, payload, label } = props;
    if (!active || !payload || payload.length === 0) return null;

    const point = payload[0];
    const current = typeof point.value === 'number' ? point.value : Number(point.value);
    const diff = point.payload.diferencia;
    const diffText = diff === null ? '--' : `${diff >= 0 ? '+' : '-'}${formatMoney(Math.abs(diff))}`;
    const diffColor = diff === null ? '#6b7280' : diff >= 0 ? '#16a34a' : '#dc2626';
    const labelText = ejeX === 'tiempo' ? `Mes: ${label}` : `Apuestas: ${label}`;

    return (
      <div
        style={{
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          background: '#ffffff',
          padding: '10px 12px',
        }}
      >
        <div style={{ color: '#111827', fontSize: '16px', lineHeight: 1.1 }}>{labelText}</div>
        <div style={{ color: diffColor, fontSize: '24px', fontWeight: 800, lineHeight: 1.05 }}>{diffText}</div>
        <div style={{ color: '#6b7280', fontSize: '13px', lineHeight: 1.2 }}>Beneficio: {formatMoney(current)}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "'Sora', sans-serif" }}>
      {/* Header */}
      <PageReveal
        direction="down"
        delay={30}
        className="hero-startup-bg relative overflow-hidden text-white py-10 sm:py-16 section-padding"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-cover opacity-[0.20]"
          style={{
            backgroundImage: "url('/basket-bg.jpg')",
            transform: 'scaleX(-1)',
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-7xl mx-auto">
          <button
            onClick={onVolver}
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          
          <p className="mb-8 text-4xl font-normal sm:text-6xl tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Resultados <span className="font-bold tracking-tight">verificados</span>.
          </p>
          <p className="body-text text-gray-300 max-w-2xl">
            Evolución real de beneficios de nuestros alumnos aplicando <span className="rebel-underline"> El Método.</span>
          </p>
        </div>
      </PageReveal>

      {/* Contenido principal */}
      <PageReveal direction="down" delay={200} className="max-w-7xl mx-auto section-padding py-8 sm:py-12">

        {/* Layout: lista + gráfico + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] gap-6">

          {/* Lista de usuarios */}
          <div className="flex flex-col">
            {/* Header del panel con toggle en móvil */}
            <button
              className="flex items-center justify-between lg:cursor-default mb-3"
              onClick={() => setPanelAbierto(o => !o)}
            >
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {panelAbierto ? 'Alumnos' : `Alumno: ${seleccionado.nombre}`}
              </h2>
              <span className={`lg:hidden text-gray-400 transition-transform duration-300 ${panelAbierto ? 'rotate-180' : ''}`}>
                ▲
              </span>
            </button>
            <div className={`space-y-2 overflow-y-auto pr-1 transition-all duration-300 ${
              panelAbierto ? 'max-h-[300px] lg:max-h-[600px] opacity-100' : 'max-h-0 lg:max-h-[600px] opacity-0 lg:opacity-100 overflow-hidden'
            }`}>
              {usuarios.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSeleccionado(u);
                    // En móvil, plegar el panel al seleccionar
                    if (window.innerWidth < 1024) setPanelAbierto(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                    seleccionado.id === u.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src="/sin_foto.png"
                      alt={`Foto de perfil de ${u.nombre}`}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute inset-0 ${u.genero === 'chica' ? 'bg-red-500/35' : 'bg-blue-500/35'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${seleccionado.id === u.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {u.nombre}
                    </p>
                    <p className="text-xs text-gray-400">{u.edad} años</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats + Gráfico */}
          <div className="flex-1 flex flex-col gap-6">

          {/* Stats del usuario seleccionado */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                label: 'Inversión',
                value: `€${seleccionado.inversion.toLocaleString()}`,
                icon: DollarSign,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
                mobileVisible: false,
              },
              {
                label: 'Nº Apuestas',
                value: seleccionado.apuestasValues[seleccionado.apuestasValues.length - 1],
                icon: BarChart2,
                color: 'text-purple-500',
                bg: 'bg-purple-50',
                mobileVisible: true,
              },
              {
                label: 'ROI',
                value: `${((seleccionado.beneficioTotal / seleccionado.inversion) * 100).toFixed(2)}%`,
                icon: TrendingUp,
                color: 'text-green-500',
                bg: 'bg-green-50',
                mobileVisible: false,
              },
              {
                label: 'Beneficio',
                value: `€${seleccionado.beneficioTotal.toLocaleString()}`,
                icon: TrendingUp,
                color: 'text-yellow-500',
                bg: 'bg-yellow-50',
                mobileVisible: true,
              },
              {
                label: 'Casas de Apuestas',
                value: seleccionado.nCasasApuestas,
                icon: Building2,
                color: 'text-orange-500',
                bg: 'bg-orange-50',
                mobileVisible: false,
              },
            ].map((stat, i) => (
              <div key={i} className={`bg-white rounded-2xl p-5 border border-gray-200 shadow-sm ${stat.mobileVisible ? '' : 'hidden sm:block'}`}>
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Gráfico */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">{seleccionado.nombre}</h2>
                <p className="text-sm text-gray-500 break-words">Evolución de beneficios</p>
              </div>
              {/* Controles: Ver Excel + Toggle eje X */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={onVerPricing}
                  className="py-2 px-4 sm:px-5 rounded-lg text-sm sm:text-base font-semibold bg-yellow-400 hover:bg-yellow-500 text-yellow-900 transition-all shadow whitespace-nowrap"
                >
                  Ver Excel
                </button>
                <div className="flex items-center bg-gray-100 rounded-lg p-1.5 gap-1 w-36 sm:w-48">
                  <button
                    onClick={() => setEjeX('tiempo')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      ejeX === 'tiempo' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Tiempo
                  </button>
                  <button
                    onClick={() => setEjeX('apuestas')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                      ejeX === 'apuestas' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Apuestas
                  </button>
                </div>
              </div>
            </div>

            <div
              className="chart-interaction-lock"
              onMouseDown={(e) => e.preventDefault()}
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={datosGrafico} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  label={{
                    value: ejeX === 'tiempo' ? 'Tiempo' : 'Nº Apuestas',
                    position: 'insideBottomRight',
                    offset: -10,
                    fontSize: 12,
                    fill: '#6b7280',
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(v) => `€${v}`}
                  label={{
                    value: 'Beneficio (€)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fontSize: 12,
                    fill: '#6b7280',
                  }}
                />
                <Tooltip
                  cursor={{
                    stroke: '#9ca3af',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                  content={renderTooltipContent}
                />
                <Line
                  type="monotone"
                  dataKey="beneficio"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  name={seleccionado.nombre}
                />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          </div>
        </div>
      </PageReveal>
    </div>
  );
}


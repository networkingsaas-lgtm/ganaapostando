import { useState } from 'react';
import PageReveal from '../components/PageReveal';
import HeaderTitle from '../components/ui/HeaderTitle';
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

interface Usuario {
  id: number;
  nombre: string;
  edad: number;
  avatarUrl: string;
  tiempoLabels: string[];
  beneficioValues: number[];
  apuestasValues: number[];
  beneficioTotal: number;
  inversion: number;
  nCasasApuestas: number;
}

export const usuarios: Usuario[] = [
  {
    id: 1,
    nombre: 'Alvaro',
    edad: 21,
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    tiempoLabels: ['5dic', '8dic', '10dic', '15dic', '19dic', '22dic', '26dic', '29dic', '30dic', '31dic', '4ene', '6ene', '10ene', '17ene', '21ene', '22ene','24ene','26ene', '30ene', '31ene', '6feb', '11feb', '18feb', '25feb', '28feb'],
    beneficioValues: [0, 69.61, 104.53, 129.94, 368.09, 354.18, 402, 388.96,455.59,521.37,519.15,491.33,489.94,540,515,761,811.12,973.35,1015.57,1003.43, 1040.95,1088.02,1101.35,1158.01,1200.66],
    apuestasValues: [1, 10, 19, 28, 37, 46, 55, 64, 73, 82, 91, 100, 109, 118, 127, 136, 145, 154, 163, 172, 181, 190, 201, 212, 223],
    beneficioTotal: 1200.66,
    inversion: 1200,
    nCasasApuestas: 15,
  },
  {
    id: 2,
    nombre: 'Alicia',
    edad: 22,
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    tiempoLabels: ['4mar', '9mar', '12mar', '13mar', '14mar', '16mar', '17mar', '21mar', '22mar', '23mar', '24mar', '27mar', '31mar', '1abr', '2abr','3abr','6abr','7abr','9abr','12abr','13abr','16abr','19abr','21abr','29abr','2may','3may'],
    beneficioValues: [0, 162.19, 169.37, 189.37, 232.04, 304.76,315.76,404.96,484.96,507.46,581.66,576.66,595.25,605.43,743.65,733.65,703.65,713.65,720.90,785.57,802.51,872.88,936.61,1121.66,1090.95,1208.70,1868.70],
    apuestasValues: [1, 5, 10, 14, 19, 23, 28, 32, 37, 41, 46, 50, 55, 59, 64, 68, 73, 77, 82, 86, 91, 95, 100, 104, 109, 113,118],
    beneficioTotal: 1868.70,
    inversion: 1200,
    nCasasApuestas: 15,
  },
  {
  id: 3,
  nombre: 'Alejandro',
  edad: 21,
  avatarUrl: 'https://i.pravatar.cc/150?img=11',
  tiempoLabels: ['2dic', '6dic', '9dic', '13dic', '16dic', '20dic', '23dic', '27dic', '30dic', '2ene', '5ene', '9ene', '12ene', '16ene', '19ene', '23ene', '26ene', '29ene', '1feb', '5feb', '8feb', '12feb', '16feb', '22feb', '27feb'] ,
  beneficioValues: [0, 58.42, 96.15, 143.77, 221.34, 287.90, 331.48, 379.25, 442.86, 498.13, 536.92, 521.40, 548.73, 601.55, 667.21, 702.18, 759.66, 845.37, 903.52, 952.08, 1011.44, 1076.39, 1132.75, 1189.63, 1210.18],
  apuestasValues: [1, 13, 24, 36, 48, 59, 71, 83, 94, 106, 117, 129, 141, 152, 164, 176, 187, 199, 210, 222, 234, 245, 257, 268, 280],
  beneficioTotal: 1210.18,
  inversion: 1200,
  nCasasApuestas: 15,
  },
  {
    id: 4,
    nombre: 'Luis',
    edad: 23,
    avatarUrl: 'https://i.pravatar.cc/150?img=23',
    tiempoLabels: ['13feb', '14feb', '16feb', '18feb', '20feb', '22feb', '23feb', '25feb', '26feb','2 mar','6mar','7mar','8mar','10mar','13mar','14mar','15mar','16mar','18mar','21mar','22mar','28mar','30mar','2abr','3abr','5abr'],
    beneficioValues: [0, -33, 53.89, 104.89, 128.69, 131.93, 399.14, 390, 1278.90,1273,1301.07,1291.07,1282.06,1246.51,1341.40,1440.55,1487.57,1476.87,1698.36,1719.36,1749.36,1791.40,1785,1862.92,1852.92,2025.30],
    apuestasValues: [1, 8, 15, 22, 29, 36, 43, 50, 57, 64, 71, 78, 85, 92, 99, 106, 113, 120, 127, 134, 141, 148, 155, 162, 171, 180],
    beneficioTotal: 2025.30,
    inversion: 1400,
    nCasasApuestas: 14,
  },
  {
  id: 5,
  nombre: 'Mateo',
  edad: 20,
  avatarUrl: 'https://i.pravatar.cc/150?img=12',
  tiempoLabels: [
    '6feb','12feb', '14feb', '16feb', '18feb', '19feb',
    '22feb', '23feb', '24feb', '28feb', '2mar',
    '4mar', '6mar', '12mar', '13mar', '18mar',
    '22mar', '24mar', '25mar', '27mar', '31mar'
  ],
  beneficioValues: [
    0, 65.60, 29.69, 274.55, 324.55,
    402.65, 367.95, 468.43, 574.20, 537.50,
    529.16, 544.41, 671.19, 763.53, 783.53,
    781.82, 786.82, 804.06, 819.34, 806.45,
    874.03
  ],
  apuestasValues: [
    0,1, 6, 12, 17, 23,
    28, 34, 39, 44, 50,
    55, 61, 66, 71, 77,
    82, 88, 93, 99, 104
  ],
  beneficioTotal: 874.03,
  inversion: 1200,
  nCasasApuestas: 14,
},
  {
  id: 6,
  nombre: 'Diego',
  edad: 19,
  avatarUrl: 'https://i.pravatar.cc/150?img=32',
  tiempoLabels: [
    '24abr', '26abr', '28abr', '30abr',
    '2may', '4may', '6may', '8may', '10may', '12may', '14may', '16may', '18may', '20may', '22may',
    '2jun', '5jun', '8jun',
    '12ago', '14ago', '16ago', '18ago', '20ago', '22ago', '24ago', '26ago', '28ago', '30ago',
    '2sep', '5sep'
  ],
  beneficioValues: [
  0, 42.18, 76.94, 71.83, 128.46, 123.27, 205.91, 198.64, 278.52, 346.11,
  334.89, 392.47, 386.22, 468.35, 459.71, 548.93, 541.26, 748.84, 803.17, 789.42,
  772.58, 857.91, 851.64, 936.28, 924.57, 1018.33, 1072.48, 1056.91, 1184.66, 1091.24
],
  apuestasValues: [1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127, 133, 139, 145, 151, 157, 163, 168, 173],
  beneficioTotal: 1091.24,
  inversion: 1400,
  nCasasApuestas: 11,
},
{
  id: 7,
  nombre: 'Isaac',
  edad: 22,
  avatarUrl: 'https://i.pravatar.cc/150?img=15',
  tiempoLabels: [
    '19abr', '24abr', '25abr', '29abr',
    '5may', '8may', '10may', '12may',
    '21may', '25may', '26may', '28may',
    '29may', '30may', '1jun', '6jun',
    '9jun', '11jun', '16jun', '17jun',
    '18jun', '20ago', '24ago', '26ago',
    '1sep', '3sep', '4sep', '6sep',
    '7sep', '8sep'
  ],
  beneficioValues: [
    0, 64.06, 61.22, 54.02,
    70.82, 69.00, 176.07, 372.07,
    352.91, 1216.46, 1224.04, 1278.38,
    1377.89, 1397.07, 1410.00, 1451.48,
    1470.48, 1523.64, 1449.64, 1433.04,
    1527.86, 1498.23, 1581.82, 1576.27,
    1727.85, 1707.85, 1700.67, 1694.67,
    1828.39, 1837.39
  ],
  apuestasValues: [
    1, 7, 13, 19,
    24, 30, 36, 42,
    48, 54, 59, 65,
    71, 77, 83, 89,
    95, 100, 106, 112,
    118, 124, 130, 136,
    142, 148, 154, 160,
    165, 170
  ],
  beneficioTotal: 1837.39,
  inversion: 1350,
  nCasasApuestas: 0,
},{
  id: 8,
  nombre: 'Daniel',
  edad: 30,
  avatarUrl: 'https://i.pravatar.cc/150?img=15',
  tiempoLabels: [
    '9may', '12may', '17may', '24may', '28may',
    '29may', '7jun', '12jun', '14jun', '16jun',
    '17jun', '23jun', '14ago', '17ago', '26ago',
    '30ago', '31ago', '6sep', '8sep', '9sep'
  ],
  beneficioValues: [
    0, -10, 0, 11, 57.34,
    56.36, 13.67, 112.42, 161.66, 151.66,
    285.06, 400.04, 412.54, 411.42, 402.70,
    356.51, 405.47, 616.58, 606.58, 736.56
  ],
  apuestasValues: [
    1, 5, 9, 12, 16,
    20, 24, 27, 31, 35,
    39, 42, 46, 50, 54,
    57, 61, 65, 68, 72
  ],
  beneficioTotal: 736.56,
  inversion: 1333,
  nCasasApuestas: 9,
},
{
  id: 9,
  nombre: 'Guille',
  edad: 18,
  avatarUrl: 'https://i.pravatar.cc/150?img=16',
  tiempoLabels: [
    '25sep', '26sep', '28sep', '11oct'
  ],
  beneficioValues: [
    -48.14, 8.62, 470.96, 470.96
  ],
  apuestasValues: [
    1, 7, 14, 21
  ],
  beneficioTotal: 470.96,
  inversion: 800,
  nCasasApuestas: 3,
},{
  id: 10,
  nombre: 'Nacho',
  edad: 21,
  avatarUrl: 'https://i.pravatar.cc/150?img=17',
  tiempoLabels: [
    '27sep', '29sep', '3oct', '6oct', '11oct', '14oct',
    '16oct', '19oct', '20oct', '21oct', '22oct', '23oct',
    '26oct', '31oct', '1nov', '3nov'
  ],
  beneficioValues: [
    0, -10.54, 81.43, 135.60, 210.23, 206.22,
    271.00, 223.12, 164.57, 181.18, 261.12, 373.99,
    586.50, 578.65, 724.30, 758.31
  ],
  apuestasValues: [
    1, 7, 12, 18, 24, 30,
    35, 41, 47, 52, 58, 64,
    70, 76, 81, 87
  ],
  beneficioTotal: 758.31,
  inversion: 1333,
  nCasasApuestas: 8,
},{
  id: 11,
  nombre: 'Alba',
  edad: 26,
  avatarUrl: 'https://i.pravatar.cc/150?img=19',
  tiempoLabels: [
    '4oct', '5oct', '12oct', '16oct', '18oct', '19oct',
    '20oct', '21oct', '22oct', '23oct', '26oct', '27oct',
    '29oct', '1nov', '2nov', '3nov', '7nov', '8nov', '10nov'
  ],
  beneficioValues: [
    0, -1.42, 43.28, -2.77, 29.62, 167.61,
    243.63, 333.95, 323.95, 384.14, 366.40, 505.26,
    597.26, 676.72, 998.61, 1162.09, 1135.15, 1093.68, 1415.56
  ],
  apuestasValues: [
    1, 6, 11, 16, 21, 26,
    31, 36, 42, 47, 52, 57,
    62, 67, 72, 78, 83, 88, 93
  ],
  beneficioTotal: 1415.56,
  inversion: 1333,
  nCasasApuestas: 11,
},{
  id: 12,
  nombre: 'Sergi',
  edad: 20,
  avatarUrl: 'https://i.pravatar.cc/150?img=40',
  tiempoLabels: [
    '29sep', '2oct', '15oct', '17oct', '19oct', '20oct',
    '21oct', '22oct', '23oct', '28oct', '2nov', '7nov',
    '11nov', '16nov', '17nov', '22nov', '23nov', '25nov', '27nov'
  ],
  beneficioValues: [
    0, 62.82, 15.50, 32.14, 40.76, 124.47,
    141.69, 177.13, 364.42, 393.06, 418.56, 471.06,
    550.49, 537.74, 548.74, 915.46, 1050.93, 1024.53, 1172.15
  ],
  apuestasValues: [
    1, 5, 9, 13, 17, 21,
    25, 29, 33, 37, 41, 45,
    49, 53, 57, 61, 65, 69, 72
  ],
  beneficioTotal: 1172.15,
  inversion: 1333,
  nCasasApuestas: 13,
},{
  id: 13,
  nombre: 'Pau',
  edad: 23,
  avatarUrl: 'https://i.pravatar.cc/150?img=19',
  tiempoLabels: [
    '24sep', '25sep', '26sep', '29sep', '1oct', '2oct',
    '3oct', '6oct', '7oct', '9oct', '13oct', '18oct',
    '19oct', '24oct', '26oct', '27oct', '28oct', '29oct',
    '31oct', '2nov', '7nov', '16nov', '17nov', '21nov',
    '23nov', '26nov', '27nov', '30nov', '1dic', '9dic'
  ],
  beneficioValues: [
    0, -33.54, 16.46, 92.97, 141.42, 242.29,
    259.17, 250.77, 335.05, 333.47, 341.87, 349.37,
    486.55, 479.46, 557.68, 567.68, 582.84, 622.66,
    656.14, 692.36, 726.63, 721.70, 736.70, 712.70,
    662.83, 711.30, 812.38, 809.88, 936.97, 975.44
  ],
  apuestasValues: [
    1, 4, 8, 11, 14, 18,
    21, 24, 28, 31, 35, 38,
    41, 45, 48, 52, 55, 58,
    62, 65, 68, 72, 75, 79,
    82, 85, 89, 92, 96, 100
  ],
  beneficioTotal: 975.44,
  inversion: 1333,
  nCasasApuestas: 14,
}
];

type EjeX = 'tiempo' | 'apuestas';

interface Props {
  onVolver: () => void;
  onVerPricing: () => void;
}

export default function Resultados({ onVolver, onVerPricing }: Props) {
  const [seleccionado, setSeleccionado] = useState<Usuario>(usuarios[0]);
  const [ejeX, setEjeX] = useState<EjeX>('tiempo');
  const [panelAbierto, setPanelAbierto] = useState(true);

  const datosGrafico = seleccionado.beneficioValues.map((b, i) => ({
    label:
      ejeX === 'tiempo'
        ? seleccionado.tiempoLabels[i]
        : seleccionado.apuestasValues[i].toString(),
    beneficio: b,
  }));

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <PageReveal direction="down" delay={30} className="hero-startup-bg text-white py-10 sm:py-16 section-padding">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onVolver}
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          
          <HeaderTitle as="h1" className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] mb-3">
            Resultados <span className="text-blue-400">Verificados</span>
          </HeaderTitle>
          <p className="body-text text-gray-300 max-w-2xl">
            Evolución real de beneficios de nuestros alumnos aplicando el método matemático.
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
                  <img
                    src={u.avatarUrl}
                    alt={u.nombre}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
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
                mobileVisible: true,
              },
              {
                label: 'Nº Apuestas',
                value: seleccionado.apuestasValues[seleccionado.apuestasValues.length - 1],
                icon: BarChart2,
                color: 'text-purple-500',
                bg: 'bg-purple-50',
                mobileVisible: false,
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
                label: 'Beneficio Total',
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
                  formatter={(value) => [`€${value}`, 'Beneficio']}
                  labelFormatter={(label) =>
                    ejeX === 'tiempo' ? `Mes: ${label}` : `Apuestas: ${label}`
                  }
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="beneficio"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name={seleccionado.nombre}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          </div>
        </div>
      </PageReveal>
    </div>
  );
}

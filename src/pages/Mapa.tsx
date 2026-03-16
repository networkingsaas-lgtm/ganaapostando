import {
  ArrowLeft,
  CircleAlert,
  Compass,
  LoaderCircle,
  Map,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageReveal from '../components/shared/PageReveal';
import HeaderTitle from '../components/ui/HeaderTitle';

type SidebarView = 'mapa';

interface BackendLevel {
  id: string | number;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  status?: string;
  progress?: number;
  order?: number;
}

interface Props {
  onVolver: () => void;
}

const MAP_LEVELS_ENDPOINT = import.meta.env.VITE_MAP_LEVELS_ENDPOINT ?? '/api/mapa';

const normalizeLevels = (payload: unknown): BackendLevel[] => {
  if (Array.isArray(payload)) {
    return payload as BackendLevel[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.levels)) {
      return record.levels as BackendLevel[];
    }

    if (Array.isArray(record.data)) {
      return record.data as BackendLevel[];
    }
  }

  return [];
};

const getLevelTitle = (level: BackendLevel, fallbackIndex: number) =>
  level.title?.trim() || level.name?.trim() || `Nivel ${fallbackIndex + 1}`;

const getLevelSubtitle = (level: BackendLevel) =>
  level.subtitle?.trim() || level.description?.trim() || 'Contenido pendiente de cargar desde backend.';

const getStatusLabel = (status?: string) => {
  if (!status) {
    return 'Disponible';
  }

  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === 'completed' || normalizedStatus === 'completado') {
    return 'Completado';
  }

  if (normalizedStatus === 'current' || normalizedStatus === 'activo') {
    return 'Activo';
  }

  if (normalizedStatus === 'locked' || normalizedStatus === 'bloqueado') {
    return 'Bloqueado';
  }

  return status;
};

export default function Mapa({ onVolver }: Props) {
  const [activeView, setActiveView] = useState<SidebarView>('mapa');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [levels, setLevels] = useState<BackendLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadLevels = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(MAP_LEVELS_ENDPOINT, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const payload = await response.json();
        setLevels(normalizeLevels(payload));
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return;
        }

        setLevels([]);
        setError('No se pudieron cargar los niveles.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadLevels();

    return () => {
      controller.abort();
    };
  }, []);

  const orderedLevels = useMemo(
    () =>
      [...levels].sort((left, right) => {
        const leftOrder = typeof left.order === 'number' ? left.order : Number(left.id);
        const rightOrder = typeof right.order === 'number' ? right.order : Number(right.id);

        if (Number.isNaN(leftOrder) || Number.isNaN(rightOrder)) {
          return 0;
        }

        return leftOrder - rightOrder;
      }),
    [levels],
  );

  return (
    <div className="hero-startup-bg min-h-screen overflow-hidden text-white">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(91,194,255,0.18),_transparent_24%)]">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú lateral"
            className="fixed left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-[#03124a]/92 text-white shadow-[0_18px_44px_rgba(2,8,35,0.32)] backdrop-blur-xl transition-all duration-300 lg:hidden"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {sidebarOpen && (
            <button
              type="button"
              aria-label="Cerrar menú lateral"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-30 bg-[#020817]/55 backdrop-blur-sm lg:hidden"
            />
          )}

          <aside
            className={`fixed inset-y-0 left-0 z-40 w-[300px] max-w-[86vw] border-r border-white/12 bg-[#03124a]/92 backdrop-blur-xl transition-transform duration-300 lg:static lg:min-h-screen lg:w-[300px] lg:max-w-none lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex h-full flex-col px-5 py-5 sm:px-6 lg:px-7 lg:py-7">
              <div className="flex items-center justify-between gap-3 lg:block">
                <span className="text-lg font-extrabold text-white lg:mt-6 lg:block">
                  <span className="rebel-underline">El Método.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Cerrar menú lateral"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white transition hover:bg-white/12 lg:hidden"
                >
                  <PanelLeft className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-8 grid gap-3 lg:grid-cols-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('mapa');
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    activeView === 'mapa'
                      ? 'border-white/18 bg-white text-[#041a78] shadow-[0_18px_48px_rgba(255,255,255,0.18)]'
                      : 'border-white/12 bg-white/8 text-white/86 hover:bg-white/12'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      activeView === 'mapa' ? 'bg-[#e6efff] text-[#0a2f9f]' : 'bg-white/10 text-white'
                    }`}
                  >
                    <Map className="h-5 w-5" />
                  </span>
                  <span className="text-base font-semibold">Mapa</span>
                </button>
              </nav>

              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  onVolver();
                }}
                className="mt-6 flex w-full items-center gap-3 rounded-[1.4rem] border border-red-300/24 bg-red-500/14 px-4 py-4 text-left text-red-100 transition hover:bg-red-500/20"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/18 text-red-100">
                  <ArrowLeft className="h-5 w-5" />
                </span>
                <span className="text-base font-semibold">Cerrar sesión</span>
              </button>
            </div>
          </aside>

          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
            {activeView === 'mapa' && (
              <PageReveal className="flex min-h-full flex-col">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white/75">
                      <Compass className="h-3.5 w-3.5" />
                      Mapa dinámico
                    </span>
                    <HeaderTitle
                      as="h1"
                      uppercase={false}
                      lineHeightClass="leading-[0.95]"
                      className="mt-4 text-4xl sm:text-5xl lg:text-6xl"
                    >
                      Tu recorrido de niveles vive aquí.
                    </HeaderTitle>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
                      El fondo, la estructura y el espacio de niveles ya siguen la estética principal de la web. Los niveles
                      se renderizan a partir de la respuesta del backend en cuanto esté conectada.
                    </p>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/14 bg-[#081a63]/60 px-5 py-4 backdrop-blur-md">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">Estado</p>
                    <p className="mt-2 text-3xl font-black">{isLoading ? '...' : orderedLevels.length}</p>
                    <p className="text-sm text-white/68">niveles recibidos</p>
                  </div>
                </div>

                <div className="relative mt-8 overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#061857]/68 p-5 shadow-[0_28px_80px_rgba(2,8,35,0.28)] sm:p-6 lg:min-h-[560px] lg:p-8">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(91,194,255,0.18),_transparent_28%)]" />
                  <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:16px_16px]" />

                  <div className="relative">
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">Superficie principal</p>
                        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Mapa</h2>
                      </div>
                      <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/70">
                        Endpoint: {MAP_LEVELS_ENDPOINT}
                      </div>
                    </div>

                    {isLoading && (
                      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-white/14 bg-white/5 text-center">
                        <LoaderCircle className="h-10 w-10 animate-spin text-white/70" />
                        <p className="mt-4 text-lg font-semibold">Cargando niveles...</p>
                        <p className="mt-2 max-w-md text-sm text-white/62">
                          En cuanto el backend responda, este espacio construirá la lista de niveles automáticamente.
                        </p>
                      </div>
                    )}

                    {!isLoading && error && (
                      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-red-300/35 bg-red-500/10 px-6 text-center">
                        <CircleAlert className="h-10 w-10 text-red-200" />
                        <p className="mt-4 text-lg font-semibold">{error}</p>
                        <p className="mt-2 max-w-md text-sm text-white/68">
                          He dejado el contenedor preparado para que, cuando exista el endpoint real, pinte aquí el mapa con sus niveles.
                        </p>
                      </div>
                    )}

                    {!isLoading && !error && orderedLevels.length === 0 && (
                      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-white/14 bg-white/5 px-6 text-center">
                        <Sparkles className="h-10 w-10 text-sky-200" />
                        <p className="mt-4 text-lg font-semibold">Todavía no hay niveles disponibles.</p>
                        <p className="mt-2 max-w-lg text-sm leading-6 text-white/68">
                          El espacio del mapa ya está listo. Cuando el backend envíe niveles, aparecerán aquí con el diseño de la web principal.
                        </p>
                      </div>
                    )}

                    {!isLoading && !error && orderedLevels.length > 0 && (
                      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {orderedLevels.map((level, index) => (
                          <article
                            key={String(level.id)}
                            className="rounded-[1.6rem] border border-white/12 bg-white/10 p-5 shadow-[0_18px_48px_rgba(2,8,35,0.18)] backdrop-blur-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/55">
                                  Nivel {index + 1}
                                </p>
                                <h3 className="mt-2 text-xl font-black text-white">
                                  {getLevelTitle(level, index)}
                                </h3>
                              </div>
                              <span className="rounded-full border border-white/12 bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/78">
                                {getStatusLabel(level.status)}
                              </span>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-white/72">
                              {getLevelSubtitle(level)}
                            </p>

                            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,#5bc2ff,#87b3ff,#ffffff)]"
                                style={{ width: `${Math.max(0, Math.min(100, level.progress ?? 0))}%` }}
                              />
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </PageReveal>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

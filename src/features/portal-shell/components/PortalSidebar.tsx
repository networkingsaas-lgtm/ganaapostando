import { ArrowLeft, PanelLeft } from 'lucide-react';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { SIDEBAR_ITEMS, SIDEBAR_WIDTH_CLASS } from '../constants';
import { useDashboardCatalog } from '../context/DashboardCatalogContext';

const lessonHasPaidAccess = (reason: string | null | undefined, canAccess: boolean | undefined) =>
  reason === 'entitled' || Boolean(canAccess);

interface Props {
  sidebarOpen: boolean;
  currentSubRoute: string;
  authUserLabel: string;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  onNavigate: (subRoute: string) => void;
  onOpenLogout: () => void;
}

export default function PortalSidebar({
  sidebarOpen,
  currentSubRoute,
  authUserLabel,
  onOpenSidebar,
  onCloseSidebar,
  onNavigate,
  onOpenLogout,
}: Props) {
  const { isLoading: isCoursesLoading, layers } = useDashboardCatalog();
  const mobileSidebarItems = useMemo(() => {
    const mapItem = SIDEBAR_ITEMS.find((item) => item.path === 'mapa');
    if (!mapItem) {
      return SIDEBAR_ITEMS;
    }

    const remainingItems = SIDEBAR_ITEMS.filter((item) => item.path !== 'mapa');
    const centeredItems = [...remainingItems];
    centeredItems.splice(Math.floor(centeredItems.length / 2), 0, mapItem);

    return centeredItems;
  }, []);
  const activeNavIndex = useMemo(() => {
    const foundIndex = mobileSidebarItems.findIndex((item) => item.path === currentSubRoute);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [currentSubRoute, mobileSidebarItems]);
  const purchasedLayersCount = useMemo(
    () =>
      layers.filter((section) =>
        section.lessons.some(
          (lessonNode) => lessonHasPaidAccess(lessonNode.reason, lessonNode.access?.canAccess),
        ),
      ).length,
    [layers],
  );
  const isPremium = purchasedLayersCount > 0;
  const mobileLoupeCount = mobileSidebarItems.length;
  const loupeNavRef = useRef<HTMLElement | null>(null);
  const previousLoupeIndexRef = useRef(activeNavIndex);

  useLayoutEffect(() => {
    const nav = loupeNavRef.current;
    if (!nav) {
      return;
    }

    nav.dataset.loupeDirection =
      activeNavIndex >= previousLoupeIndexRef.current ? 'right' : 'left';
    previousLoupeIndexRef.current = activeNavIndex;
  }, [activeNavIndex]);

  const loupeVariables = {
    '--loupe-count': mobileLoupeCount,
    '--loupe-index': activeNavIndex,
    '--loupe-pad': '8px',
  } as CSSProperties & Record<string, string | number>;

  return (
    <>
      <nav
        ref={loupeNavRef}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[300] px-4 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden"
        data-loupe-direction="right"
      >
        <div
          className="pointer-events-auto relative mx-auto w-full max-w-[430px] rounded-[1.65rem] border border-black/10 bg-slate-100/90 p-2 shadow-[0_22px_44px_rgba(2,8,35,0.28)] backdrop-blur-[2px]"
          style={loupeVariables}
        >
          <span
            className="sidebar-loupe-slider pointer-events-none absolute top-1/2 h-[74px] -translate-y-1/2 rounded-[1rem] border border-white bg-white shadow-[0_12px_24px_rgba(2,8,35,0.18)]"
            aria-hidden="true"
          />
          <div
            className="relative z-10 grid items-center"
            style={{ gridTemplateColumns: `repeat(${mobileSidebarItems.length}, minmax(0, 1fr))` }}
          >
            {mobileSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSubRoute === item.path;
              const isDisabled = Boolean(item.disabled);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    onNavigate(item.path);
                  }}
                  aria-label={item.label}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  className={`flex min-h-[74px] min-w-0 items-center justify-center rounded-[1rem] px-1.5 py-2 transition ${
                    isDisabled
                      ? 'cursor-not-allowed opacity-45'
                      : isActive
                      ? 'text-black'
                      : 'text-black/88 hover:bg-white/14'
                  }`}
                >
                  <Icon className="h-7 w-7" />
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Abrir menu lateral"
        className={`fixed left-4 top-4 z-[300] hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-[#03124a]/92 text-white shadow-[0_18px_44px_rgba(2,8,35,0.32)] backdrop-blur-xl transition-all duration-300 lg:flex ${
          sidebarOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menu lateral"
          onClick={onCloseSidebar}
          className="fixed inset-0 z-[290] bg-[#020817]/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[300] hidden w-[300px] max-w-[86vw] border-r border-white/12 bg-[#03124a]/92 backdrop-blur-xl transition-transform duration-300 lg:block ${SIDEBAR_WIDTH_CLASS} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'var(--hero-startup-bg)' }}
      >
        <div className="flex h-full flex-col overflow-hidden px-5 py-5 sm:px-6 lg:px-7 lg:py-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 p-0">
              <div
                className="rounded-[1.1rem] border border-white/20 bg-white/10 p-3"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-4 ${
                      isPremium ? 'border-[#2563eb] shadow-[0_8px_18px_rgba(37,99,235,0.34)]' : 'border-white/35'
                    }`}
                  >
                    <img
                      src="/sin_foto.png"
                      alt={`Avatar de ${authUserLabel}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[1.08rem] font-semibold tracking-[-0.02em] text-white">
                      {authUserLabel}
                    </p>
                    {isCoursesLoading ? (
                      <p className="mt-0.5 text-xs font-medium text-white/72">Comprobando plan...</p>
                    ) : isPremium ? (
                      <p className="mt-0.5 text-xs font-semibold text-[#8ec5ff]">Plan premium</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCloseSidebar}
              aria-label="Cerrar menu lateral"
              className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white transition hover:bg-white/12"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 grid gap-3 lg:grid-cols-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentSubRoute === item.path;
              const isDisabled = Boolean(item.disabled);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    onNavigate(item.path);
                  }}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  className={`flex items-center gap-3 rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    isDisabled
                      ? 'cursor-not-allowed border-white/10 bg-white/[0.06] text-white/45'
                      : isActive
                      ? 'border-white/18 bg-white text-[#041a78] shadow-[0_18px_48px_rgba(255,255,255,0.18)]'
                      : 'border-white/12 bg-white/8 text-white/86 hover:bg-white/12'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      isDisabled
                        ? 'bg-white/[0.08] text-white/45'
                        : isActive
                        ? 'bg-[#e6efff] text-[#0a2f9f]'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-base font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onOpenLogout}
            className="mt-6 flex w-full items-center gap-3 rounded-[1.4rem] border border-red-300/24 bg-red-500/14 px-4 py-4 text-left text-red-100 transition hover:bg-red-500/20"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/18 text-red-100">
              <ArrowLeft className="h-5 w-5" />
            </span>
            <span className="text-base font-semibold">Cerrar sesión</span>
          </button>

          <div className="mt-auto pt-8 text-center">
            <span className="text-xl font-extrabold text-white">
              <span className="rebel-underline">El Método.</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

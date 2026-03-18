import { ArrowLeft, PanelLeft } from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { SIDEBAR_ITEMS, SIDEBAR_WIDTH_CLASS } from '../constants';
import HeaderTitle from '../../../shared/components/HeaderTitle';
import TitleHighlightReverse from '../../../shared/components/TitleHighlightReverse';

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
  const activeNavIndex = useMemo(() => {
    const foundIndex = SIDEBAR_ITEMS.findIndex((item) => item.path === currentSubRoute);
    return foundIndex >= 0 ? foundIndex : 0;
  }, [currentSubRoute]);
  const mobileLoupeCount = SIDEBAR_ITEMS.length + 1;
  const [loupeIndex, setLoupeIndex] = useState(activeNavIndex);
  const [loupePrev, setLoupePrev] = useState(activeNavIndex);
  const [loupeDirection, setLoupeDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    setLoupeIndex((current) => {
      if (current === activeNavIndex) {
        return current;
      }

      setLoupePrev(current);
      setLoupeDirection(activeNavIndex > current ? 'right' : 'left');
      return activeNavIndex;
    });
  }, [activeNavIndex]);

  const loupeVariables = {
    '--loupe-count': mobileLoupeCount,
    '--loupe-index': loupeIndex,
    '--loupe-prev': loupePrev,
    '--loupe-pad': '12px',
  } as CSSProperties & Record<string, string | number>;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/12 bg-[#03124a]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div
          className="relative mx-auto grid h-[84px] max-w-[560px] grid-cols-3 items-center px-3"
          style={loupeVariables}
          data-loupe-direction={loupeDirection}
        >
          <span
            className="sidebar-loupe-slider pointer-events-none absolute top-1/2 h-14 -translate-y-1/2 rounded-[1.1rem] bg-white shadow-[0_12px_30px_rgba(255,255,255,0.18)]"
            aria-hidden="true"
          />

          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentSubRoute === item.path;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onNavigate(item.path)}
                aria-label={item.label}
                className="justify-self-center flex h-full w-full items-center justify-center rounded-2xl transition"
              >
                <span
                  className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-[1.1rem] transition-colors duration-300 ${
                    isActive
                      ? 'text-[#041a78]'
                      : 'text-white/86'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onOpenLogout}
            aria-label="Cerrar sesion"
            className="justify-self-center flex h-full w-full items-center justify-center rounded-2xl transition"
          >
            <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-[1.1rem] text-red-100/92">
              <ArrowLeft className="h-6 w-6" />
            </span>
          </button>
        </div>
      </nav>

      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Abrir menu lateral"
        className={`fixed left-4 top-4 z-20 hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/14 bg-[#03124a]/92 text-white shadow-[0_18px_44px_rgba(2,8,35,0.32)] backdrop-blur-xl transition-all duration-300 lg:flex ${
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
          className="fixed inset-0 z-30 bg-[#020817]/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden w-[300px] max-w-[86vw] border-r border-white/12 bg-[#03124a]/92 backdrop-blur-xl transition-transform duration-300 lg:block ${SIDEBAR_WIDTH_CLASS} ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden px-5 py-5 sm:px-6 lg:px-7 lg:py-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 p-0">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                  <img
                    src="/sin_foto.png"
                    alt={`Avatar de ${authUserLabel}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <HeaderTitle
                            as="h2"
                            lineHeightClass="leading-[1.16] sm:leading-[1.1]"
                            className="text-3xl sm:text-3xl font-bold mb-4"
                          >
                           <TitleHighlightReverse inverted>{authUserLabel}</TitleHighlightReverse>
                </HeaderTitle>
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

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`flex items-center gap-3 rounded-[1.4rem] border px-4 py-4 text-left transition ${
                    isActive
                      ? 'border-white/18 bg-white text-[#041a78] shadow-[0_18px_48px_rgba(255,255,255,0.18)]'
                      : 'border-white/12 bg-white/8 text-white/86 hover:bg-white/12'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      isActive ? 'bg-[#e6efff] text-[#0a2f9f]' : 'bg-white/10 text-white'
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
            <span className="text-base font-semibold">Cerrar sesion</span>
          </button>

          <div className="mt-auto pt-8 text-center">
            <span className="text-xl font-extrabold text-white">
              <span className="rebel-underline">El Metodo.</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { LOGOUT_MODAL_CLOSE_MS } from '../features/portal-shell/constants';
import PortalSidebar from '../features/portal-shell/components/PortalSidebar';
import { getAuthenticatedUserLabel } from '../features/portal-shell/utils';
import RoadmapPage from './RoadmapPage';
import UserSettingsPage from './UserSettingsPage';
import GrupoApuestasPage from './GrupoApuestasPage';
import AppModal from '../shared/components/AppModal';
import { useAuthSession } from '../shared/auth/AuthSessionContext';
import { RoadmapDataProvider } from '../features/roadmap/context/RoadmapDataContext';

interface Props {
  onVolver: () => void;
}

const getIsDesktopViewport = () => (
  typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
);

export default function PortalLayout({ onVolver }: Props) {
  const [isDesktopViewport, setIsDesktopViewport] = useState(getIsDesktopViewport);
  const [sidebarOpen, setSidebarOpen] = useState(getIsDesktopViewport);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutConfirmClosing, setLogoutConfirmClosing] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const logoutModalTimeoutRef = useRef<number | null>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser } = useAuthSession();
  const authUserLabel = getAuthenticatedUserLabel(authUser);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');

    const syncDesktopSidebar = () => {
      const nextIsDesktop = mediaQuery.matches;
      setIsDesktopViewport(nextIsDesktop);
      setSidebarOpen(nextIsDesktop);
    };

    syncDesktopSidebar();
    mediaQuery.addEventListener('change', syncDesktopSidebar);

    return () => {
      mediaQuery.removeEventListener('change', syncDesktopSidebar);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (logoutModalTimeoutRef.current !== null) {
        window.clearTimeout(logoutModalTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  const currentSubRoute = (location.pathname.replace(/^\/dashboard\/?/, '') || 'mapa').split('/')[0];
  const isMapView = currentSubRoute === 'mapa';
  const isSettingsView = currentSubRoute === 'ajustes';
  const usesLightSurface = isMapView || isSettingsView;
  const portalSurfaceClass = isSettingsView
    ? 'bg-[#f2f2f7] text-slate-900'
    : usesLightSurface
      ? 'bg-white text-slate-900'
      : 'bg-[#071724] text-white';

  const openLogoutConfirm = () => {
    if (logoutModalTimeoutRef.current !== null) {
      window.clearTimeout(logoutModalTimeoutRef.current);
      logoutModalTimeoutRef.current = null;
    }

    setLogoutConfirmClosing(false);
    setLogoutConfirmOpen(true);
  };

  const closeLogoutConfirm = () => {
    if (logoutSubmitting) {
      return;
    }

    setLogoutConfirmClosing(true);
    logoutModalTimeoutRef.current = window.setTimeout(() => {
      setLogoutConfirmOpen(false);
      setLogoutConfirmClosing(false);
      logoutModalTimeoutRef.current = null;
    }, LOGOUT_MODAL_CLOSE_MS);
  };

  const handleConfirmLogout = () => {
    setLogoutSubmitting(true);
    onVolver();
  };

  return (
    <div className={`min-h-screen overflow-hidden ${portalSurfaceClass}`}>
      {!usesLightSurface && (
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(91,194,255,0.18),_transparent_24%)]" />
      )}
      <RoadmapDataProvider>
        <div className="relative mx-auto h-screen max-w-[1600px]">
          <PortalSidebar
            sidebarOpen={sidebarOpen}
            currentSubRoute={currentSubRoute}
            authUserLabel={authUserLabel}
            onOpenSidebar={() => {
              if (!isDesktopViewport) {
                setSidebarOpen(true);
              }
            }}
            onCloseSidebar={() => {
              if (!isDesktopViewport) {
                setSidebarOpen(false);
              }
            }}
            onNavigate={(subRoute) => {
              if (!isDesktopViewport) {
                setSidebarOpen(false);
              }
              navigate(`/dashboard/${subRoute}`);
            }}
            onOpenLogout={() => {
              if (!isDesktopViewport) {
                setSidebarOpen(false);
              }
              openLogoutConfirm();
            }}
          />

          <main
            ref={mainScrollRef}
            className={
              isMapView
                ? 'h-screen min-w-0 overflow-y-auto p-0 pb-28 lg:pb-0 lg:pl-[360px] xl:pl-[400px]'
                : 'h-screen min-w-0 overflow-y-auto px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:py-8 lg:pr-10 lg:pl-[400px] xl:pl-[440px]'
            }
          >
            <Routes>
              <Route index element={<Navigate to="mapa" replace />} />
              <Route path="mapa" element={<RoadmapPage />} />
              <Route path="grupo-apuestas" element={<GrupoApuestasPage />} />
              <Route path="ajustes" element={<UserSettingsPage onOpenLogout={openLogoutConfirm} />} />
              <Route path="*" element={<Navigate to="mapa" replace />} />
            </Routes>
          </main>
        </div>
      </RoadmapDataProvider>

      <AppModal
        open={logoutConfirmOpen}
        isClosing={logoutConfirmClosing}
        onRequestClose={closeLogoutConfirm}
        disableClose={logoutSubmitting}
        showCloseButton={false}
        panelClassName="bg-white/95"
      >
        <h3 className="text-center text-2xl font-bold">Cerrar sesion</h3>
        <p className="mt-3 text-center text-sm text-slate-600">
          Vas a salir de tu sesion actual. Quieres continuar?
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={closeLogoutConfirm}
            disabled={logoutSubmitting}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={logoutSubmitting}
            className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {logoutSubmitting ? 'Cerrando...' : 'Si, cerrar sesion'}
          </button>
        </div>
      </AppModal>
    </div>
  );
}

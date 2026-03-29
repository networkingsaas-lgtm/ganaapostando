import { Suspense, lazy, useEffect, useState, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HeroSection from './features/home/sections/HeroSection';
import AprenderSection from './features/home/sections/AprenderSection';
import MetodoStatsSection from './features/home/sections/MetodoStatsSection';
import EstudianteSection from './features/home/sections/EstudianteSection';
import PricingSection from './features/home/sections/PricingSection';
import CTASection from './features/home/sections/CTASection';
import RouteSwiper from './shared/components/RouteSwiper';
import {
  getCurrentSession,
  signOutFromSession,
  watchAuthSession,
} from './api/services/sessionService';

const Resultados = lazy(() => import('./pages/Resultados'));
const PortalLayout = lazy(() => import('./pages/PortalLayout'));
const Registro = lazy(() => import('./pages/Registro'));

type AppRoute = '/' | '/resultados' | '/dashboard' | '/registro';

interface RouteState {
  scrollToPricing?: boolean;
}

const REGISTRO_SWIPE_DURATION_MS = 520;
const routeFallback = (
  <div className="flex min-h-screen w-full items-center justify-center bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
  </div>
);

const getAppRoute = (pathname: string): AppRoute | null => {
  if (pathname === '/' || pathname === '/resultados' || pathname === '/registro') {
    return pathname;
  }

  if (
    pathname === '/dashboard'
    || pathname.startsWith('/dashboard/')
    || pathname === '/mapa'
    || pathname.startsWith('/mapa/')
  ) {
    return '/dashboard';
  }

  return null;
};

const getDashboardAliasPath = (pathname: string) => (
  pathname === '/mapa' ? '/dashboard/mapa' : pathname.replace(/^\/mapa/, '/dashboard')
);

function LandingPage({
  flashButtonsKey,
  onLoginSuccess,
  onVerResultados,
  onRegistrarse,
}: {
  flashButtonsKey: number;
  onLoginSuccess: () => void;
  onVerResultados: () => void;
  onRegistrarse: () => void;
}) {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as RouteState | null;

    if (!state?.scrollToPricing) {
      return;
    }

    const scrollTimeout = window.setTimeout(() => {
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    return () => {
      window.clearTimeout(scrollTimeout);
    };
  }, [location]);

  return (
    <div
      className="min-h-screen hero-startup-bg startup-fixed-bg overflow-x-hidden"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <HeroSection
        onLoginSuccess={onLoginSuccess}
        onVerResultados={onVerResultados}
        onRegistrarse={onRegistrarse}
      />
      <EstudianteSection />
      <MetodoStatsSection onVerResultados={onVerResultados} />
      <AprenderSection />
      <PricingSection flashButtonsKey={flashButtonsKey} />
      <CTASection onVerResultados={onVerResultados} />
    </div>
  );
}

function ProtectedRoute({
  authReady,
  isAuthenticated,
  children,
}: {
  authReady: boolean;
  isAuthenticated: boolean;
  children: ReactElement;
}) {
  if (!authReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const [flashButtonsKey, setFlashButtonsKey] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedRoute = getAppRoute(location.pathname);
  const currentRoute: AppRoute = resolvedRoute ?? '/';

  const syncAuthFromSession = async () => {
    const hasSession = Boolean(await getCurrentSession());
    setIsAuthenticated(hasSession);
    setAuthReady(true);
    return hasSession;
  };

  const handleLogout = async () => {
    try {
      await signOutFromSession();
    } catch (error) {
      console.error('No se pudo cerrar sesion en Supabase.', error);
    } finally {
      navigate('/');
    }
  };

  useEffect(() => {
    const unsubscribe = watchAuthSession((session) => {
      setIsAuthenticated(Boolean(session));
      setAuthReady(true);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <RouteSwiper<AppRoute>
      currentRoute={currentRoute}
      onNavigate={(nextRoute) => navigate(nextRoute)}
      transitions={[
        {
          from: '/',
          to: '/registro',
          leaveClass: 'route-swiper-leave-left',
          enterClass: 'route-swiper-enter-right',
          durationMs: REGISTRO_SWIPE_DURATION_MS,
        },
        {
          from: '/registro',
          to: '/',
          leaveClass: 'route-swiper-leave-right',
          enterClass: 'route-swiper-enter-left',
          durationMs: REGISTRO_SWIPE_DURATION_MS,
        },
      ]}
      renderRoute={(sceneRoute, goTo) => (
        <Suspense fallback={routeFallback}>
          <Routes location={sceneRoute === currentRoute ? location : sceneRoute}>
            <Route
              path="/"
              element={
                <LandingPage
                  flashButtonsKey={flashButtonsKey}
                  onLoginSuccess={() => {
                    void syncAuthFromSession().then((hasSession) => {
                      if (hasSession) {
                        navigate('/dashboard/mapa');
                      }
                    });
                  }}
                  onVerResultados={() => navigate('/resultados')}
                  onRegistrarse={() => goTo('/registro')}
                />
              }
            />
            <Route
              path="/resultados"
              element={
                <Resultados
                  onVolver={() => navigate('/')}
                  onVerPricing={() => {
                    setFlashButtonsKey((currentKey) => currentKey + 1);
                    navigate('/', { state: { scrollToPricing: true } satisfies RouteState });
                  }}
                />
              }
            />
            <Route
              path="/dashboard/*"
              element={(
                <ProtectedRoute authReady={authReady} isAuthenticated={isAuthenticated}>
                  <PortalLayout onVolver={() => { void handleLogout(); }} />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/mapa/*"
              element={(
                <Navigate
                  to={{
                    pathname: getDashboardAliasPath(location.pathname),
                    search: location.search,
                    hash: location.hash,
                  }}
                  replace
                />
              )}
            />
            <Route
              path="/registro"
              element={(
                <Registro
                  onVolver={() => goTo('/')}
                  onRegistroExitoso={() => {
                    void syncAuthFromSession().then((hasSession) => {
                      if (hasSession) {
                        navigate('/dashboard/ajustes');
                      }
                    });
                  }}
                />
              )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
    />
  );
}

export default App;

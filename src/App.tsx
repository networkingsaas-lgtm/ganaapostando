import { useEffect, useState, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HeroSection from './features/home/sections/HeroSection';
import AprenderSection from './features/home/sections/AprenderSection';
import MetodoStatsSection from './features/home/sections/MetodoStatsSection';
import EstudianteSection from './features/home/sections/EstudianteSection';
import PricingSection from './features/home/sections/PricingSection';
import CTASection from './features/home/sections/CTASection';
import Resultados from './pages/Resultados';
import PortalLayout from './pages/PortalLayout';
import Registro from './pages/Registro';
import RouteSwiper from './shared/components/RouteSwiper';
import { logoutFromSupabase } from './lib/auth';
import { getSupabaseClient } from './lib/supabase';

type AppRoute = '/' | '/resultados' | '/mapa' | '/registro';

interface RouteState {
  scrollToPricing?: boolean;
}

const REGISTRO_SWIPE_DURATION_MS = 520;

const getAppRoute = (pathname: string): AppRoute | null => {
  if (pathname === '/' || pathname === '/resultados' || pathname === '/registro') {
    return pathname;
  }

  if (pathname === '/mapa' || pathname.startsWith('/mapa/')) {
    return '/mapa';
  }

  return null;
};

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
    <div className="min-h-screen hero-startup-bg startup-fixed-bg overflow-x-hidden">
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
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const hasSession = Boolean(data.session);
    setIsAuthenticated(hasSession);
    setAuthReady(true);
    return hasSession;
  };

  const handleLogout = async () => {
    try {
      await logoutFromSupabase();
    } catch (error) {
      console.error('No se pudo cerrar sesion en Supabase.', error);
    } finally {
      navigate('/');
    }
  };

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setIsAuthenticated(Boolean(data.session));
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (resolvedRoute) {
      return;
    }

    navigate('/', { replace: true });
  }, [location.pathname, navigate, resolvedRoute]);

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
        <Routes location={sceneRoute === currentRoute ? location : sceneRoute}>
          <Route
            path="/"
            element={
              <LandingPage
                flashButtonsKey={flashButtonsKey}
                onLoginSuccess={() => {
                  void syncAuthFromSession().then((hasSession) => {
                    if (hasSession) {
                      navigate('/mapa');
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
            path="/mapa/*"
            element={(
              <ProtectedRoute authReady={authReady} isAuthenticated={isAuthenticated}>
                <PortalLayout onVolver={() => { void handleLogout(); }} />
              </ProtectedRoute>
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
                      navigate('/mapa/ajustes');
                    }
                  });
                }}
              />
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    />
  );
}

export default App;

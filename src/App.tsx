import { Suspense, lazy, useEffect, useState, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import HeroSection from './features/home/sections/HeroSection';
import AprenderSection from './features/home/sections/AprenderSection';
import MetodoStatsSection from './features/home/sections/MetodoStatsSection';
import EstudianteSection from './features/home/sections/EstudianteSection';
import PricingSection from './features/home/sections/PricingSection';
import CTASection from './features/home/sections/CTASection';
import GrupoApuestasLandingPage from './features/cara-b/CaraBLandingPage';
import Resultados from './pages/Resultados';
import PublicTopBar from './shared/components/PublicTopBar';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import {
  signOutFromSession,
} from './api/services/sessionService';
import { AuthSessionProvider, useAuthSession } from './shared/auth/AuthSessionContext';

const preloadRegistroPage = () => import('./pages/Registro');

const PortalLayout = lazy(() => import('./pages/PortalLayout'));
const Registro = lazy(preloadRegistroPage);

type AppRoute =
  | '/'
  | '/grupoapuestas'
  | '/resultados'
  | '/dashboard'
  | '/registro'
  | '/terminos-del-servicio'
  | '/politica-de-privacidad';

interface RouteState {
  scrollToPricing?: boolean;
}

const routeFallback = (
  <div className="flex min-h-screen w-full items-center justify-center bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
  </div>
);

const getDashboardAliasPath = (pathname: string) => (
  pathname === '/mapa' ? '/dashboard/mapa' : pathname.replace(/^\/mapa/, '/dashboard')
);

function LandingPage({
  flashButtonsKey,
  onVerResultados,
  onRegistrarse,
}: {
  flashButtonsKey: number;
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
        onVerResultados={onVerResultados}
      />
      <EstudianteSection />
      <MetodoStatsSection onVerResultados={onVerResultados} />
      <AprenderSection />
      <PricingSection flashButtonsKey={flashButtonsKey} onRegistrarse={onRegistrarse} />
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
  return (
    <AuthSessionProvider>
      <AppRoutes />
    </AuthSessionProvider>
  );
}

function AppRoutes() {
  const [flashButtonsKey, setFlashButtonsKey] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { authReady, isAuthenticated } = useAuthSession();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  const handleLogout = async () => {
    try {
      await signOutFromSession();
    } catch (error) {
      console.error('No se pudo cerrar sesión en Supabase.', error);
    } finally {
      navigate('/');
    }
  };

  useEffect(() => {
    void preloadRegistroPage();

    const imageHints: Array<{
      id: string;
      href: string;
      rel: 'preload' | 'prefetch';
    }> = [
      { id: 'registro-bg', href: '/registro-bg.png', rel: 'prefetch' },
      { id: 'grupoapuestas-logo', href: '/logo.png', rel: 'preload' },
      { id: 'grupoapuestas-telegram-profile', href: '/telegramiconoperfil2.png', rel: 'preload' },
    ];

    imageHints.forEach(({ id, href, rel }) => {
      const existingHint = document.head.querySelector(`link[data-app-image-hint="${id}"]`);

      if (existingHint) {
        return;
      }

      const imageHintLink = document.createElement('link');
      imageHintLink.rel = rel;
      imageHintLink.as = 'image';
      imageHintLink.href = href;
      imageHintLink.setAttribute('data-app-image-hint', id);
      document.head.appendChild(imageHintLink);
    });
  }, []);

  const navigateBackOrHome = (fallbackRoute: AppRoute = '/') => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackRoute);
  };

  const renderPublicPage = (content: ReactElement) => (
    <>
      <PublicTopBar
        onLoginSuccess={() => {
          navigate('/dashboard/grupo-apuestas');
        }}
        onRegistrarse={() => navigate('/registro')}
      />
      {content}
    </>
  );

  return (
    <Suspense fallback={routeFallback}>
      <Routes>
        <Route
          path="/"
          element={renderPublicPage(
            <LandingPage
              flashButtonsKey={flashButtonsKey}
              onVerResultados={() => navigate('/resultados')}
              onRegistrarse={() => navigate('/registro')}
            />
          )}
        />
        <Route
          path="/grupoapuestas"
          element={renderPublicPage(
            <GrupoApuestasLandingPage
              onRegistrarse={() => navigate('/registro')}
              onVerResultados={() => navigate('/resultados')}
            />
          )}
        />
        <Route
          path="/resultados"
          element={renderPublicPage(
            <Resultados
              onVerPricing={() => {
                setFlashButtonsKey((currentKey) => currentKey + 1);
                navigate('/', { state: { scrollToPricing: true } satisfies RouteState });
              }}
            />
          )}
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
              onVolver={() => navigateBackOrHome('/')}
              onRegistroExitoso={() => {
                navigate('/dashboard/grupo-apuestas');
              }}
            />
          )}
        />
        <Route path="/terminos-del-servicio" element={renderPublicPage(<TermsOfServicePage />)} />
        <Route path="/politica-de-privacidad" element={renderPublicPage(<PrivacyPolicyPage />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

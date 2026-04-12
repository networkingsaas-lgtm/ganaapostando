import { Suspense, lazy, useEffect, type ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import PublicTopBar from './shared/components/PublicTopBar';
import {
  signOutFromSession,
} from './api/services/sessionService';
import { AuthSessionProvider, useAuthSession } from './shared/auth/AuthSessionContext';

const PortalLayout = lazy(() => import('./pages/PortalLayout'));
const Registro = lazy(() => import('./pages/Registro'));
const GrupoLandingPage = lazy(() => import('./pages/GrupoLandingPage'));
const FormacionLandingPage = lazy(() => import('./pages/FormacionLandingPage'));
const Resultados = lazy(() => import('./pages/Resultados'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));

type AppRoute =
  | '/'
  | '/formacion'
  | '/grupoapuestas'
  | '/resultados'
  | '/dashboard'
  | '/registro'
  | '/terminos-del-servicio'
  | '/politica-de-privacidad';

const routeFallback = (
  <div className="flex min-h-screen w-full items-center justify-center bg-[linear-gradient(180deg,#f2f2f7_0%,#eef1f6_100%)]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
  </div>
);

const getDashboardAliasPath = (pathname: string) => (
  pathname === '/mapa' ? '/dashboard/mapa' : pathname.replace(/^\/mapa/, '/dashboard')
);

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
            <GrupoLandingPage
              onRegistrarse={() => navigate('/registro')}
              onVerResultados={() => navigate('/resultados')}
            />
          )}
        />
        <Route
          path="/grupoapuestas"
          element={renderPublicPage(
            <GrupoLandingPage
              onRegistrarse={() => navigate('/registro')}
              onVerResultados={() => navigate('/resultados')}
            />
          )}
        />
        <Route
          path="/formacion"
          element={renderPublicPage(
            <FormacionLandingPage
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
                navigate('/formacion', { state: { scrollToPricing: true } });
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

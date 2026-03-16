import { useState } from 'react';
import RouteSwiper from './components/shared/RouteSwiper';
import Hero from './pages/Hero';
import Aprender from './pages/Aprender';
import MetodoStats from './pages/MetodoStats';
import Estudiante from './pages/Estudiante';
import Pricing from './pages/Pricing';
import CTA from './pages/CTA';
import Resultados from './pages/Resultados';
import Mapa from './pages/Mapa';
import Registro from './pages/Registro';

type Route = 'home' | 'resultados' | 'mapa' | 'registro';

const REGISTRO_SWIPE_DURATION_MS = 520;

const getRouteFromPath = (pathname: string): Route => {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/resultados') {
    return 'resultados';
  }

  if (normalizedPath === '/mapa') {
    return 'mapa';
  }

  if (normalizedPath === '/registro') {
    return 'registro';
  }

  return 'home';
};

const getPathFromRoute = (route: Route) => {
  if (route === 'home') {
    return '/';
  }

  return `/${route}`;
};

function App() {
  const [flashButtonsKey, setFlashButtonsKey] = useState(0);
  const initialRoute = getRouteFromPath(window.location.pathname);

  return (
    <RouteSwiper<Route>
      initialRoute={initialRoute}
      getRouteFromPath={getRouteFromPath}
      getPathFromRoute={getPathFromRoute}
      transitions={[
        {
          from: 'home',
          to: 'registro',
          leaveClass: 'route-swiper-leave-left',
          enterClass: 'route-swiper-enter-right',
          durationMs: REGISTRO_SWIPE_DURATION_MS,
        },
        {
          from: 'registro',
          to: 'home',
          leaveClass: 'route-swiper-leave-right',
          enterClass: 'route-swiper-enter-left',
          durationMs: REGISTRO_SWIPE_DURATION_MS,
        },
      ]}
      renderRoute={(route, navigate) => {
        if (route === 'mapa') {
          return <Mapa onVolver={() => navigate('home')} />;
        }

        if (route === 'resultados') {
          return (
            <Resultados
              onVolver={() => navigate('home')}
              onVerPricing={() => {
                setFlashButtonsKey((k) => k + 1);
                navigate('home');
                setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
            />
          );
        }

        if (route === 'registro') {
          return <Registro onVolver={() => navigate('home')} />;
        }

        return (
          <div className="min-h-screen hero-startup-bg startup-fixed-bg overflow-x-hidden">
            <Hero
              onVerResultados={() => navigate('resultados')}
              onRegistrarse={() => navigate('registro')}
            />
            <Estudiante />
            <MetodoStats onVerResultados={() => navigate('resultados')} />
            <Aprender />
            <Pricing flashButtonsKey={flashButtonsKey} />
            <CTA onVerResultados={() => navigate('resultados')} />
          </div>
        );
      }}
    />
  );
}

export default App;

import { useEffect, useRef, useState } from 'react';

interface RouteScene<T extends string> {
  id: number;
  route: T;
  animationClass?: string;
}

interface SwipeTransition<T extends string> {
  from: T;
  to: T;
  leaveClass: string;
  enterClass: string;
  durationMs: number;
}

interface RouteSwiperProps<T extends string> {
  initialRoute: T;
  getRouteFromPath: (pathname: string) => T;
  getPathFromRoute: (route: T) => string;
  transitions: SwipeTransition<T>[];
  renderRoute: (route: T, navigate: (route: T) => void) => React.ReactNode;
}

export default function RouteSwiper<T extends string>({
  initialRoute,
  getRouteFromPath,
  getPathFromRoute,
  transitions,
  renderRoute,
}: RouteSwiperProps<T>) {
  const [route, setRoute] = useState<T>(initialRoute);
  const [scenes, setScenes] = useState<RouteScene<T>[]>([{ id: 1, route: initialRoute }]);
  const sceneIdRef = useRef(1);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }

      const nextRoute = getRouteFromPath(window.location.pathname);
      const nextSceneId = sceneIdRef.current + 1;
      sceneIdRef.current = nextSceneId;

      setRoute(nextRoute);
      setScenes([{ id: nextSceneId, route: nextRoute }]);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [getRouteFromPath]);

  const finalizarTransicion = (sceneId: number, nextRoute: T, durationMs: number) => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      setScenes([{ id: sceneId, route: nextRoute }]);
      transitionTimeoutRef.current = null;
    }, durationMs);
  };

  const navigate = (nextRoute: T) => {
    if (scenes.length > 1) {
      return;
    }

    const nextPath = getPathFromRoute(nextRoute);
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';

    if (currentPath !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    if (route === nextRoute) {
      return;
    }

    const transition = transitions.find(
      (candidate) => candidate.from === route && candidate.to === nextRoute,
    );

    const nextSceneId = sceneIdRef.current + 1;
    sceneIdRef.current = nextSceneId;

    if (!transition) {
      setRoute(nextRoute);
      setScenes([{ id: nextSceneId, route: nextRoute }]);
      return;
    }

    const currentScene = scenes[0];

    setRoute(nextRoute);
    setScenes([
      { ...currentScene, animationClass: transition.leaveClass },
      { id: nextSceneId, route: nextRoute, animationClass: transition.enterClass },
    ]);
    finalizarTransicion(nextSceneId, nextRoute, transition.durationMs);
  };

  const isTransitioning = scenes.length > 1;

  return (
    <div className={`relative min-h-screen ${isTransitioning ? 'overflow-hidden' : ''}`}>
      {scenes.map((scene) => (
        <div
          key={scene.id}
          className={`${isTransitioning ? `absolute inset-0 ${scene.animationClass ?? ''}` : 'relative min-h-screen'}`}
        >
          {renderRoute(scene.route, navigate)}
        </div>
      ))}
    </div>
  );
}

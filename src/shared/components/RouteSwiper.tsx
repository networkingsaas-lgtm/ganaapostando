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
  currentRoute: T;
  onNavigate: (route: T) => void;
  transitions: SwipeTransition<T>[];
  renderRoute: (route: T, navigate: (route: T) => void) => React.ReactNode;
}

export default function RouteSwiper<T extends string>({
  currentRoute,
  onNavigate,
  transitions,
  renderRoute,
}: RouteSwiperProps<T>) {
  const [scenes, setScenes] = useState<RouteScene<T>[]>([{ id: 1, route: currentRoute }]);
  const sceneIdRef = useRef(1);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scenes.length > 1) {
      return;
    }

    if (scenes[0]?.route === currentRoute) {
      return;
    }

    const nextSceneId = sceneIdRef.current + 1;
    sceneIdRef.current = nextSceneId;
    setScenes([{ id: nextSceneId, route: currentRoute }]);
  }, [currentRoute, scenes]);

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
    if (scenes.length > 1 || currentRoute === nextRoute) {
      return;
    }

    const transition = transitions.find(
      (candidate) => candidate.from === currentRoute && candidate.to === nextRoute,
    );

    if (!transition) {
      onNavigate(nextRoute);
      return;
    }

    const currentScene = scenes[0];
    const nextSceneId = sceneIdRef.current + 1;
    sceneIdRef.current = nextSceneId;

    setScenes([
      { ...currentScene, animationClass: transition.leaveClass },
      { id: nextSceneId, route: nextRoute, animationClass: transition.enterClass },
    ]);
    onNavigate(nextRoute);
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

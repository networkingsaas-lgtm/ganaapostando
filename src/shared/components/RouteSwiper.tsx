import { useEffect, useState } from 'react';

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
  const [pendingTransition, setPendingTransition] = useState<{
    sceneId: number;
    nextRoute: T;
    durationMs: number;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

  useEffect(() => {
    if (!pendingTransition) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setScenes([{ id: pendingTransition.sceneId, route: pendingTransition.nextRoute }]);
      setPendingTransition(null);
    }, pendingTransition.durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [pendingTransition]);

  useEffect(() => {
    if (pendingTransition || scenes.length > 1) {
      return;
    }

    if (scenes[0]?.route === currentRoute) {
      return;
    }

    const nextSceneId = (scenes[0]?.id ?? 0) + 1;
    const frameId = window.requestAnimationFrame(() => {
      setScenes([{ id: nextSceneId, route: currentRoute }]);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [currentRoute, pendingTransition, scenes]);

  const navigate = (nextRoute: T) => {
    if (pendingTransition || scenes.length > 1 || currentRoute === nextRoute) {
      return;
    }

    const transition = transitions.find(
      (candidate) => candidate.from === currentRoute && candidate.to === nextRoute,
    );

    if (!transition) {
      onNavigate(nextRoute);
      return;
    }

    const currentScene = scenes[0] ?? { id: 0, route: currentRoute };
    const nextSceneId = currentScene.id + 1;

    setScenes([
      { ...currentScene, animationClass: transition.leaveClass },
      { id: nextSceneId, route: nextRoute, animationClass: transition.enterClass },
    ]);
    setPendingTransition({
      sceneId: nextSceneId,
      nextRoute,
      durationMs: transition.durationMs,
    });
    onNavigate(nextRoute);
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

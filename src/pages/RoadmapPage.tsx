import RoadmapContent from '../features/roadmap/components/RoadmapContent';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSharedRoadmapData } from '../features/roadmap/context/RoadmapDataContext';

interface RoadmapRouteState {
  focusLessonId?: number;
  focusLayerId?: number;
  forceRoadmapRefresh?: boolean;
}

export default function RoadmapPage() {
  const location = useLocation();
  const routeState = location.state as RoadmapRouteState | null;
  const { isLoading, error, layers, refreshRoadmap } = useSharedRoadmapData();

  useEffect(() => {
    if (routeState?.forceRoadmapRefresh) {
      refreshRoadmap();
    }
  }, [refreshRoadmap, routeState?.forceRoadmapRefresh]);

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      <RoadmapContent
        isLoading={isLoading}
        error={error}
        layers={layers}
        focusLessonId={routeState?.focusLessonId}
        focusLayerId={routeState?.focusLayerId}
        isFullscreen
      />
    </div>
  );
}

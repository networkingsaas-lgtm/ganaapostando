import RoadmapContent from '../features/roadmap/components/RoadmapContent';
import { useRoadmapData } from '../features/roadmap/hooks/useRoadmapData';
import { useLocation } from 'react-router-dom';

interface RoadmapRouteState {
  focusLessonId?: number;
  focusLayerId?: number;
  forceRoadmapRefresh?: boolean;
}

export default function RoadmapPage() {
  const location = useLocation();
  const routeState = location.state as RoadmapRouteState | null;
  const refreshKey = routeState?.forceRoadmapRefresh ? 1 : 0;
  const { isLoading, error, layers } = useRoadmapData(refreshKey);

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

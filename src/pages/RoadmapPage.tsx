import RoadmapContent from '../features/roadmap/components/RoadmapContent';
import { useLocation } from 'react-router-dom';
import { useDashboardCatalog } from '../features/portal-shell/context/DashboardCatalogContext';

interface RoadmapRouteState {
  focusLessonId?: number;
  focusLayerId?: number;
}

export default function RoadmapPage() {
  const location = useLocation();
  const routeState = location.state as RoadmapRouteState | null;
  const { isLoading, error, layers } = useDashboardCatalog();

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

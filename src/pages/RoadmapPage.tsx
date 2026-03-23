import RoadmapContent from '../features/roadmap/components/RoadmapContent';
import { useRoadmapData } from '../features/roadmap/hooks/useRoadmapData';

export default function RoadmapPage() {
  const { isLoading, error, layers } = useRoadmapData();

  return (
    <div style={{ fontFamily: "'Sora', sans-serif" }}>
      <RoadmapContent
        isLoading={isLoading}
        error={error}
        layers={layers}
        isFullscreen
      />
    </div>
  );
}

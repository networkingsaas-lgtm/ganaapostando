import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useRoadmapData } from '../hooks/useRoadmapData';

interface RoadmapDataContextValue {
  layers: ReturnType<typeof useRoadmapData>['layers'];
  productsCount: number;
  isLoading: boolean;
  error: string | null;
  refreshRoadmap: () => void;
}

const RoadmapDataContext = createContext<RoadmapDataContextValue | null>(null);

export function RoadmapDataProvider({ children }: PropsWithChildren) {
  const [refreshKey, setRefreshKey] = useState(0);
  const roadmapState = useRoadmapData(refreshKey);

  const refreshRoadmap = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const value = useMemo<RoadmapDataContextValue>(
    () => ({
      ...roadmapState,
      refreshRoadmap,
    }),
    [refreshRoadmap, roadmapState],
  );

  return <RoadmapDataContext.Provider value={value}>{children}</RoadmapDataContext.Provider>;
}

export const useSharedRoadmapData = () => {
  const context = useContext(RoadmapDataContext);

  if (!context) {
    throw new Error('useSharedRoadmapData debe usarse dentro de RoadmapDataProvider.');
  }

  return context;
};

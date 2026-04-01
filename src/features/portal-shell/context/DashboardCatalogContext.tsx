import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useDashboardCatalogData } from '../hooks/useDashboardCatalogData';

interface DashboardCatalogContextValue {
  layers: ReturnType<typeof useDashboardCatalogData>['layers'];
  products: ReturnType<typeof useDashboardCatalogData>['products'];
  productsCount: number;
  isLoading: boolean;
  error: string | null;
  refreshDashboardCatalog: () => void;
}

const DashboardCatalogContext = createContext<DashboardCatalogContextValue | null>(null);

export function DashboardCatalogProvider({ children }: PropsWithChildren) {
  const [refreshKey, setRefreshKey] = useState(0);
  const dashboardCatalogState = useDashboardCatalogData(refreshKey);

  const refreshDashboardCatalog = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  const value = useMemo<DashboardCatalogContextValue>(
    () => ({
      ...dashboardCatalogState,
      refreshDashboardCatalog,
    }),
    [dashboardCatalogState, refreshDashboardCatalog],
  );

  return <DashboardCatalogContext.Provider value={value}>{children}</DashboardCatalogContext.Provider>;
}

export const useDashboardCatalog = () => {
  const context = useContext(DashboardCatalogContext);

  if (!context) {
    throw new Error('useDashboardCatalog debe usarse dentro de DashboardCatalogProvider.');
  }

  return context;
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useDashboardCatalogData } from '../hooks/useDashboardCatalogData';

const DASHBOARD_REFRESH_MIN_INTERVAL_MS = 1200;

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
  const isLoadingRef = useRef(dashboardCatalogState.isLoading);
  const pendingRefreshRef = useRef(false);
  const refreshTimeoutRef = useRef<number | null>(null);
  const lastRefreshAtRef = useRef(0);

  const flushPendingRefresh = useCallback(() => {
    if (!pendingRefreshRef.current || isLoadingRef.current || refreshTimeoutRef.current !== null) {
      return;
    }

    if (typeof window === 'undefined') {
      pendingRefreshRef.current = false;
      lastRefreshAtRef.current = Date.now();
      setRefreshKey((current) => current + 1);
      return;
    }

    const elapsed = Date.now() - lastRefreshAtRef.current;
    const delayMs = Math.max(0, DASHBOARD_REFRESH_MIN_INTERVAL_MS - elapsed);

    refreshTimeoutRef.current = window.setTimeout(() => {
      refreshTimeoutRef.current = null;

      if (!pendingRefreshRef.current || isLoadingRef.current) {
        return;
      }

      pendingRefreshRef.current = false;
      lastRefreshAtRef.current = Date.now();
      setRefreshKey((current) => current + 1);
    }, delayMs);
  }, []);

  useEffect(() => {
    isLoadingRef.current = dashboardCatalogState.isLoading;

    if (!dashboardCatalogState.isLoading) {
      flushPendingRefresh();
    }
  }, [dashboardCatalogState.isLoading, flushPendingRefresh]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const refreshDashboardCatalog = useCallback(() => {
    pendingRefreshRef.current = true;
    flushPendingRefresh();
  }, [flushPendingRefresh]);

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

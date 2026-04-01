import { useEffect, useState } from 'react';
import {
  getBackendApiBaseUrl,
  getFriendlyRequestErrorMessage,
} from '../../../api/core/backendClient';
import {
  ROADMAP_CACHE_TTL_MS,
  ROADMAP_CACHE_VERSION,
} from '../../roadmap/constants';
import type { RoadmapDataState } from '../../roadmap/types';
import {
  getDashboardCatalogAccessContext,
  loadDashboardCatalogData,
  type DashboardCatalogSnapshot,
} from '../../../api/services/dashboardCatalogService';

const INITIAL_DASHBOARD_CATALOG_STATE: RoadmapDataState = {
  layers: [],
  products: [],
  productsCount: 0,
  isLoading: true,
  error: null,
};

const DASHBOARD_CATALOG_CACHE_KEY_PREFIX = 'dashboard-catalog-cache';

type DashboardCatalogCacheSnapshot = Pick<DashboardCatalogSnapshot, 'layers' | 'products' | 'productsCount'>;

interface DashboardCatalogCachePayload extends DashboardCatalogCacheSnapshot {
  version: number;
  savedAt: number;
}

interface DashboardCatalogCacheLookup {
  snapshot: DashboardCatalogCacheSnapshot | null;
  isFresh: boolean;
}

const dashboardCatalogMemoryCache = new Map<string, DashboardCatalogCachePayload>();

const getDashboardCatalogCacheKey = (backendUrl: string, sessionKey: string) =>
  `${DASHBOARD_CATALOG_CACHE_KEY_PREFIX}:${backendUrl}:${sessionKey}`;

const getLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isValidDashboardCatalogCachePayload = (value: unknown): value is DashboardCatalogCachePayload => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<DashboardCatalogCachePayload>;
  return (
    candidate.version === ROADMAP_CACHE_VERSION &&
    typeof candidate.savedAt === 'number' &&
    Array.isArray(candidate.layers) &&
    Array.isArray(candidate.products) &&
    typeof candidate.productsCount === 'number'
  );
};

const readDashboardCatalogCache = (cacheKey: string): DashboardCatalogCacheLookup => {
  const now = Date.now();
  const cachedInMemory = dashboardCatalogMemoryCache.get(cacheKey);

  if (cachedInMemory) {
    return {
      snapshot: {
        layers: cachedInMemory.layers,
        products: cachedInMemory.products,
        productsCount: cachedInMemory.productsCount,
      },
      isFresh: now - cachedInMemory.savedAt <= ROADMAP_CACHE_TTL_MS,
    };
  }

  const storage = getLocalStorage();

  if (!storage) {
    return {
      snapshot: null,
      isFresh: false,
    };
  }

  const rawValue = storage.getItem(cacheKey);

  if (!rawValue) {
    return {
      snapshot: null,
      isFresh: false,
    };
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isValidDashboardCatalogCachePayload(parsedValue)) {
      storage.removeItem(cacheKey);
      return {
        snapshot: null,
        isFresh: false,
      };
    }

    dashboardCatalogMemoryCache.set(cacheKey, parsedValue);

    return {
      snapshot: {
        layers: parsedValue.layers,
        products: parsedValue.products,
        productsCount: parsedValue.productsCount,
      },
      isFresh: now - parsedValue.savedAt <= ROADMAP_CACHE_TTL_MS,
    };
  } catch {
    storage.removeItem(cacheKey);
    return {
      snapshot: null,
      isFresh: false,
    };
  }
};

const writeDashboardCatalogCache = (cacheKey: string, snapshot: DashboardCatalogCacheSnapshot) => {
  const payload: DashboardCatalogCachePayload = {
    version: ROADMAP_CACHE_VERSION,
    savedAt: Date.now(),
    layers: snapshot.layers,
    products: snapshot.products,
    productsCount: snapshot.productsCount,
  };

  dashboardCatalogMemoryCache.set(cacheKey, payload);

  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    // Ignoramos errores de cuota o permisos de storage.
  }
};

export const useDashboardCatalogData = (refreshKey = 0) => {
  const [state, setState] = useState<RoadmapDataState>(INITIAL_DASHBOARD_CATALOG_STATE);

  useEffect(() => {
    const controller = new AbortController();

    const loadDashboardCatalog = async () => {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));
      let staleSnapshot: DashboardCatalogCacheSnapshot | null = null;

      try {
        const accessContext = await getDashboardCatalogAccessContext();
        const backendUrl = getBackendApiBaseUrl();
        const cacheKey = getDashboardCatalogCacheKey(backendUrl, accessContext.sessionKey);
        const cachedLookup = readDashboardCatalogCache(cacheKey);

        const shouldUseFreshCache = refreshKey === 0;

        if (cachedLookup.snapshot && cachedLookup.isFresh && shouldUseFreshCache) {
          setState({
            layers: cachedLookup.snapshot.layers,
            products: cachedLookup.snapshot.products,
            productsCount: cachedLookup.snapshot.productsCount,
            isLoading: false,
            error: null,
          });
          return;
        }

        staleSnapshot = cachedLookup.snapshot;
        const nextSnapshot = await loadDashboardCatalogData({
          signal: controller.signal,
          accessToken: accessContext.accessToken,
        });

        writeDashboardCatalogCache(cacheKey, nextSnapshot);

        setState({
          layers: nextSnapshot.layers,
          products: nextSnapshot.products,
          productsCount: nextSnapshot.productsCount,
          isLoading: false,
          error: null,
        });
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return;
        }

        if (staleSnapshot) {
          setState({
            layers: staleSnapshot.layers,
            products: staleSnapshot.products,
            productsCount: staleSnapshot.productsCount,
            isLoading: false,
            error: null,
          });
          return;
        }

        const message = getFriendlyRequestErrorMessage(fetchError, 'Error inesperado.');
        setState((current) => ({
          ...current,
          layers: [],
          products: [],
          productsCount: 0,
          isLoading: false,
          error: `No se pudo cargar el mapa. ${message}`,
        }));
      }
    };

    void loadDashboardCatalog();

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  return state;
};

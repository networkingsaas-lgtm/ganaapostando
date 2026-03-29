import { useEffect, useState } from 'react';
import { getBackendApiBaseUrl } from '../../../api/core/backendClient';
import {
  ROADMAP_CACHE_TTL_MS,
  ROADMAP_CACHE_VERSION,
} from '../constants';
import type { RoadmapDataState } from '../types';
import { getRoadmapAccessUserId } from '../../../api/services/accessService';
import { loadRoadmapData, type RoadmapDataSnapshot } from '../../../api/services/roadmapService';

const INITIAL_ROADMAP_STATE: RoadmapDataState = {
  layers: [],
  productsCount: 0,
  isLoading: true,
  error: null,
};

const ROADMAP_CACHE_KEY_PREFIX = 'roadmap-map-cache';

type RoadmapCacheSnapshot = Pick<RoadmapDataSnapshot, 'layers' | 'productsCount'>;

interface RoadmapCachePayload extends RoadmapCacheSnapshot {
  version: number;
  savedAt: number;
}

interface RoadmapCacheLookup {
  snapshot: RoadmapCacheSnapshot | null;
  isFresh: boolean;
}

const roadmapMemoryCache = new Map<string, RoadmapCachePayload>();

const getRoadmapCacheKey = (backendUrl: string, userId: string) =>
  `${ROADMAP_CACHE_KEY_PREFIX}:${backendUrl}:${userId}`;

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

const isValidRoadmapCachePayload = (value: unknown): value is RoadmapCachePayload => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<RoadmapCachePayload>;
  return (
    candidate.version === ROADMAP_CACHE_VERSION &&
    typeof candidate.savedAt === 'number' &&
    Array.isArray(candidate.layers) &&
    typeof candidate.productsCount === 'number'
  );
};

const readRoadmapCache = (cacheKey: string): RoadmapCacheLookup => {
  const now = Date.now();
  const cachedInMemory = roadmapMemoryCache.get(cacheKey);

  if (cachedInMemory) {
    return {
      snapshot: {
        layers: cachedInMemory.layers,
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

    if (!isValidRoadmapCachePayload(parsedValue)) {
      storage.removeItem(cacheKey);
      return {
        snapshot: null,
        isFresh: false,
      };
    }

    roadmapMemoryCache.set(cacheKey, parsedValue);

    return {
      snapshot: {
        layers: parsedValue.layers,
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

const writeRoadmapCache = (cacheKey: string, snapshot: RoadmapCacheSnapshot) => {
  const payload: RoadmapCachePayload = {
    version: ROADMAP_CACHE_VERSION,
    savedAt: Date.now(),
    layers: snapshot.layers,
    productsCount: snapshot.productsCount,
  };

  roadmapMemoryCache.set(cacheKey, payload);

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

export const useRoadmapData = (refreshKey = 0) => {
  const [state, setState] = useState<RoadmapDataState>(INITIAL_ROADMAP_STATE);

  useEffect(() => {
    const controller = new AbortController();

    const loadMap = async () => {
      setState((current) => ({
        ...current,
        isLoading: true,
        error: null,
      }));
      let staleSnapshot: RoadmapCacheSnapshot | null = null;

      try {
        const userIdForAccess = await getRoadmapAccessUserId();
        const backendUrl = getBackendApiBaseUrl();
        const cacheKey = getRoadmapCacheKey(backendUrl, userIdForAccess);
        const cachedLookup = readRoadmapCache(cacheKey);

        const shouldUseFreshCache = refreshKey === 0;

        if (cachedLookup.snapshot && cachedLookup.isFresh && shouldUseFreshCache) {
          setState({
            layers: cachedLookup.snapshot.layers,
            productsCount: cachedLookup.snapshot.productsCount,
            isLoading: false,
            error: null,
          });
          return;
        }

        staleSnapshot = cachedLookup.snapshot;
        const nextSnapshot = await loadRoadmapData({
          signal: controller.signal,
          userId: userIdForAccess,
        });

        writeRoadmapCache(cacheKey, nextSnapshot);

        setState({
          layers: nextSnapshot.layers,
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
            productsCount: staleSnapshot.productsCount,
            isLoading: false,
            error: null,
          });
          return;
        }

        const message = fetchError instanceof Error ? fetchError.message : 'Error inesperado.';
        setState((current) => ({
          ...current,
          layers: [],
          productsCount: 0,
          isLoading: false,
          error: `No se pudo cargar el mapa. ${message}`,
        }));
      }
    };

    void loadMap();

    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  return state;
};

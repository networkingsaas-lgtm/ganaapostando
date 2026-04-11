import { getBackendApiBaseUrl, getJson, postJson } from '../../../api/core/backendClient';
import { ROADMAP_CACHE_TTL_MS, ROADMAP_CACHE_VERSION } from '../../roadmap/constants';
import type {
  TelegramGroupInfo,
  TelegramLinkTokenResponse,
  TelegramMeResponse,
} from '../types';

const buildAuthorizedHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

const TELEGRAM_VIP_STATUS_CACHE_KEY_PREFIX = 'telegram-vip-status-cache';
const TELEGRAM_VIP_STATUS_SESSION_KEY_ANON = 'anon';

interface TelegramVipStatusCachePayload {
  version: number;
  savedAt: number;
  status: TelegramMeResponse;
}

interface TelegramVipStatusCacheLookup {
  status: TelegramMeResponse | null;
  isFresh: boolean;
}

interface LoadTelegramVipStatusOptions {
  sessionKey?: string | null;
  forceRefresh?: boolean;
}

interface LoadTelegramVipStatusResult {
  status: TelegramMeResponse;
  source: 'cache' | 'network' | 'stale-cache';
}

const telegramVipStatusMemoryCache = new Map<string, TelegramVipStatusCachePayload>();
const telegramVipStatusInFlight = new Map<string, Promise<TelegramMeResponse>>();

const getTelegramVipStatusCacheKey = (sessionKey: string | null | undefined) => (
  `${TELEGRAM_VIP_STATUS_CACHE_KEY_PREFIX}:${getBackendApiBaseUrl()}:${sessionKey ?? TELEGRAM_VIP_STATUS_SESSION_KEY_ANON}`
);

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

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isValidTelegramVipStatus = (value: unknown): value is TelegramMeResponse => (
  isRecord(value) && typeof value.activeSubscription === 'boolean'
);

const isValidTelegramVipStatusCachePayload = (
  value: unknown,
): value is TelegramVipStatusCachePayload => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === ROADMAP_CACHE_VERSION
    && typeof value.savedAt === 'number'
    && isValidTelegramVipStatus(value.status)
  );
};

const readTelegramVipStatusCache = (cacheKey: string): TelegramVipStatusCacheLookup => {
  const now = Date.now();
  const cachedInMemory = telegramVipStatusMemoryCache.get(cacheKey);

  if (cachedInMemory) {
    return {
      status: cachedInMemory.status,
      isFresh: now - cachedInMemory.savedAt <= ROADMAP_CACHE_TTL_MS,
    };
  }

  const storage = getLocalStorage();

  if (!storage) {
    return {
      status: null,
      isFresh: false,
    };
  }

  const rawValue = storage.getItem(cacheKey);

  if (!rawValue) {
    return {
      status: null,
      isFresh: false,
    };
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isValidTelegramVipStatusCachePayload(parsedValue)) {
      storage.removeItem(cacheKey);
      return {
        status: null,
        isFresh: false,
      };
    }

    telegramVipStatusMemoryCache.set(cacheKey, parsedValue);

    return {
      status: parsedValue.status,
      isFresh: now - parsedValue.savedAt <= ROADMAP_CACHE_TTL_MS,
    };
  } catch {
    storage.removeItem(cacheKey);
    return {
      status: null,
      isFresh: false,
    };
  }
};

const writeTelegramVipStatusCache = (cacheKey: string, status: TelegramMeResponse) => {
  const payload: TelegramVipStatusCachePayload = {
    version: ROADMAP_CACHE_VERSION,
    savedAt: Date.now(),
    status,
  };

  telegramVipStatusMemoryCache.set(cacheKey, payload);

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

export const fetchTelegramVipStatus = (accessToken: string) =>
  getJson<TelegramMeResponse>('/telegram/me', {
    headers: buildAuthorizedHeaders(accessToken),
  });

export const loadTelegramVipStatus = async (
  accessToken: string,
  { sessionKey, forceRefresh = false }: LoadTelegramVipStatusOptions = {},
): Promise<LoadTelegramVipStatusResult> => {
  const cacheKey = getTelegramVipStatusCacheKey(sessionKey);
  const cachedLookup = readTelegramVipStatusCache(cacheKey);

  if (cachedLookup.status && cachedLookup.isFresh && !forceRefresh) {
    return {
      status: cachedLookup.status,
      source: 'cache',
    };
  }

  const existingInFlightRequest = telegramVipStatusInFlight.get(cacheKey);

  if (existingInFlightRequest) {
    try {
      const status = await existingInFlightRequest;
      return {
        status,
        source: 'network',
      };
    } catch (error) {
      if (cachedLookup.status) {
        return {
          status: cachedLookup.status,
          source: 'stale-cache',
        };
      }

      throw error;
    }
  }

  const requestPromise = fetchTelegramVipStatus(accessToken)
    .then((status) => {
      writeTelegramVipStatusCache(cacheKey, status);
      return status;
    })
    .finally(() => {
      telegramVipStatusInFlight.delete(cacheKey);
    });

  telegramVipStatusInFlight.set(cacheKey, requestPromise);

  try {
    const status = await requestPromise;
    return {
      status,
      source: 'network',
    };
  } catch (error) {
    if (cachedLookup.status) {
      return {
        status: cachedLookup.status,
        source: 'stale-cache',
      };
    }

    throw error;
  }
};

export const fetchTelegramGroupInfo = () =>
  getJson<TelegramGroupInfo>('/telegram/group-info');

export const createTelegramLinkToken = (accessToken: string) =>
  postJson<TelegramLinkTokenResponse, Record<string, never>>(
    '/telegram/link-token',
    {},
    {
      headers: buildAuthorizedHeaders(accessToken),
    },
  );

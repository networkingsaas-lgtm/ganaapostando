import type { User } from '@supabase/supabase-js';
import { getJson } from '../core/backendClient';
import type {
  Entitlement,
  LessonAccessResponse,
  LessonVideoAccess,
  Product,
} from '../../features/roadmap/types';

const ACCESS_POLL_INTERVAL_MS = 1800;
const ACCESS_POLL_MAX_ATTEMPTS = 14;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeLessonAccess = (payload: unknown): LessonAccessResponse | null => {
  if (!isRecord(payload)) {
    return null;
  }

  return {
    lessonId: typeof payload.lessonId === 'number' ? payload.lessonId : Number(payload.lessonId),
    lessonSlug: typeof payload.lessonSlug === 'string' ? payload.lessonSlug : '',
    canAccess: Boolean(payload.canAccess),
    reason: typeof payload.reason === 'string' ? payload.reason : 'missing_entitlement',
    layerId: typeof payload.layerId === 'number' ? payload.layerId : Number(payload.layerId),
    products: Array.isArray(payload.products) ? (payload.products as Product[]) : [],
    entitlement: isRecord(payload.entitlement)
      ? (payload.entitlement as unknown as Entitlement)
      : null,
    videoAccess: isRecord(payload.videoAccess)
      ? (payload.videoAccess as unknown as LessonVideoAccess)
      : null,
  };
};

const getAccessUserId = (user: User) => {
  const candidateValues: unknown[] = [
    user.user_metadata?.userId,
    user.user_metadata?.user_id,
    user.app_metadata?.userId,
    user.app_metadata?.user_id,
    user.id,
  ];

  for (const value of candidateValues) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return user.id;
};

const isProductActivationConfirmed = (productId: number, payload: LessonAccessResponse | null) => {
  if (!payload) {
    return false;
  }

  const hasTargetEntitlement = payload.entitlement?.product_id === productId;
  const hasEntitledState = Boolean(payload.entitlement) || payload.reason === 'entitled';
  const includesTargetProduct = payload.products.some((product) => product.id === productId);

  return hasTargetEntitlement || (hasEntitledState && includesTargetProduct);
};

const sleep = (durationMs: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, durationMs);

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', handleAbort, { once: true });
  });

interface PollLessonAccessActivationParams {
  user: User;
  productId: number;
  candidateLessonIds: number[];
  intervalMs?: number;
  maxAttempts?: number;
  signal?: AbortSignal;
}

export const pollLessonAccessActivation = async ({
  user,
  productId,
  candidateLessonIds,
  intervalMs = ACCESS_POLL_INTERVAL_MS,
  maxAttempts = ACCESS_POLL_MAX_ATTEMPTS,
  signal,
}: PollLessonAccessActivationParams) => {
  const userId = getAccessUserId(user);

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const candidateLessonId of candidateLessonIds) {
      const accessPayload = await getJson<unknown>(
        `/access/lessons/${candidateLessonId}?userId=${encodeURIComponent(userId)}`,
        {
          signal,
          headers: {
            Accept: 'application/json',
          },
        },
      ).then(normalizeLessonAccess).catch((error) => {
        if ((error as Error).name === 'AbortError') {
          throw error;
        }

        return null;
      });

      if (isProductActivationConfirmed(productId, accessPayload)) {
        return candidateLessonId;
      }
    }

    if (attempt < maxAttempts - 1) {
      await sleep(intervalMs, signal);
    }
  }

  return null;
};

import type { User } from '@supabase/supabase-js';
import { fetchRoadmapLessonAccess } from './accessService';
import type { LessonAccessResponse } from '../../features/roadmap/types';

const ACCESS_POLL_INTERVAL_MS = 1800;
const ACCESS_POLL_MAX_ATTEMPTS = 14;

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError';

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
  user: _user,
  productId,
  candidateLessonIds,
  intervalMs = ACCESS_POLL_INTERVAL_MS,
  maxAttempts = ACCESS_POLL_MAX_ATTEMPTS,
  signal,
}: PollLessonAccessActivationParams) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const candidateLessonId of candidateLessonIds) {
      const accessPayload = await fetchRoadmapLessonAccess(candidateLessonId, undefined, signal)
        .catch((error) => {
          if (isAbortError(error)) {
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

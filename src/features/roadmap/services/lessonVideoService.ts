import { buildBackendApiUrl, getResponseErrorMessage, ApiError } from '../../../api/core/backendClient';
import { getSupabaseApiClient } from '../../../api/core/supabaseClient';
import { normalizeLessonVideoAccessResponse } from '../utils';
import type { LessonVideoAccessResponse } from '../types';

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isLikelyLessonVideoPayload = (value: unknown) => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    'lessonId' in value ||
    'canAccess' in value ||
    'reason' in value ||
    'layerId' in value ||
    'video' in value
  );
};

const getLessonVideoHeaders = async () => {
  const supabase = getSupabaseApiClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    return {
      Accept: 'application/json',
    } as Record<string, string>;
  }

  return {
    Accept: 'application/json',
    Authorization: `Bearer ${data.session.access_token}`,
  } as Record<string, string>;
};

export const fetchLessonVideoAccess = async (
  lessonId: number,
  signal?: AbortSignal,
): Promise<LessonVideoAccessResponse | null> => {
  try {
    const response = await fetch(buildBackendApiUrl(`/access/lessons/${lessonId}/video`), {
      signal,
      headers: await getLessonVideoHeaders(),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (response.ok || isLikelyLessonVideoPayload(payload)) {
      return normalizeLessonVideoAccessResponse(payload);
    }

    throw new ApiError(await getResponseErrorMessage(response), response.status);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 429) {
        throw error;
      }

      return null;
    }

    return null;
  }
};

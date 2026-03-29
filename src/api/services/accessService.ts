import { getSupabaseApiClient } from '../core/supabaseClient';
import { ApiError, getJson } from '../core/backendClient';
import {
  normalizeLessonAccess,
  normalizeLessonVideoAccessResponse,
} from '../../features/roadmap/utils';
import type {
  LessonAccessResponse,
  LessonVideoAccessResponse,
} from '../../features/roadmap/types';

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError';

const getRoadmapAccessSession = async () => {
  const supabase = getSupabaseApiClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return data.session ?? null;
};

export const getRoadmapAccessToken = async () => {
  const session = await getRoadmapAccessSession();
  return session?.access_token ?? null;
};

export const getRoadmapAccessUserId = async () => {
  const session = await getRoadmapAccessSession();
  return session?.user.id ?? 'anonymous';
};

export const buildAccessAuthHeaders = (accessToken: string | null) =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

export const fetchRoadmapLessonAccess = async (
  lessonId: number,
  _userId?: string,
  signal?: AbortSignal,
): Promise<LessonAccessResponse | null> => {
  try {
    const accessToken = await getRoadmapAccessToken();
    const payload = await getJson<unknown>(`/access/lessons/${lessonId}`, {
      signal,
      headers: buildAccessAuthHeaders(accessToken),
    });

    return normalizeLessonAccess(payload);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      return null;
    }

    return null;
  }
};

export const fetchRoadmapLessonVideoAccess = async (
  lessonId: number,
  signal?: AbortSignal,
): Promise<LessonVideoAccessResponse | null> => {
  try {
    const accessToken = await getRoadmapAccessToken();
    const payload = await getJson<unknown>(`/access/lessons/${lessonId}/video`, {
      signal,
      headers: buildAccessAuthHeaders(accessToken),
    });

    return normalizeLessonVideoAccessResponse(payload);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      return null;
    }

    return null;
  }
};

import { getSupabaseApiClient } from '../core/supabaseClient';
import { ApiError, getJson } from '../core/backendClient';
import { getAccessUserId, normalizeLessonAccess } from '../../features/roadmap/utils';
import type { LessonAccessResponse } from '../../features/roadmap/types';

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError';

export const getRoadmapAccessUserId = async () => {
  const supabase = getSupabaseApiClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('No se pudo obtener el usuario autenticado.');
  }

  return getAccessUserId(userData.user);
};

export const fetchRoadmapLessonAccess = async (
  lessonId: number,
  userId: string,
  signal?: AbortSignal,
): Promise<LessonAccessResponse | null> => {
  try {
    const payload = await getJson<unknown>(
      `/access/lessons/${lessonId}?userId=${encodeURIComponent(userId)}`,
      { signal },
    );

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

import { ACCESS_REQUEST_CONCURRENCY } from '../../features/roadmap/constants';
import { buildLayerSections, getPublishedLessons, runTasksWithConcurrency } from '../../features/roadmap/utils';
import type { LayerSection, LessonAccessResponse, Product } from '../../features/roadmap/types';
import { fetchRoadmapCatalog } from './catalogService';
import { ApiError, getJson } from '../core/backendClient';
import { getSupabaseApiClient } from '../core/supabaseClient';
import { normalizeLessonAccess } from '../../features/roadmap/utils';

export interface DashboardCatalogSnapshot {
  layers: LayerSection[];
  products: Product[];
  productsCount: number;
}

export interface DashboardCatalogAccessContext {
  sessionKey: string;
  accessToken: string | null;
}

interface LoadDashboardCatalogOptions {
  signal?: AbortSignal;
  accessToken?: string | null;
}

const DASHBOARD_SESSION_KEY_ANON = 'anon';

export const getDashboardCatalogAccessContext = async (): Promise<DashboardCatalogAccessContext> => {
  const supabase = getSupabaseApiClient();
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    return {
      sessionKey: DASHBOARD_SESSION_KEY_ANON,
      accessToken: null,
    };
  }

  return {
    sessionKey: data.session.user.id || DASHBOARD_SESSION_KEY_ANON,
    accessToken: data.session.access_token,
  };
};

export const fetchDashboardLessonAccess = async (
  lessonId: number,
  accessToken: string | null,
  signal?: AbortSignal,
): Promise<LessonAccessResponse | null> => {
  try {
    const payload = await getJson<unknown>(`/access/lessons/${lessonId}`, {
      signal,
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });

    return normalizeLessonAccess(payload);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
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

export const loadDashboardCatalogData = async ({
  signal,
  accessToken,
}: LoadDashboardCatalogOptions = {}): Promise<DashboardCatalogSnapshot> => {
  const catalog = await fetchRoadmapCatalog(signal);
  const lessons = getPublishedLessons(catalog);
  const accessByLessonEntries = await runTasksWithConcurrency(
    lessons,
    async (lesson) => [lesson.id, await fetchDashboardLessonAccess(lesson.id, accessToken ?? null, signal)] as const,
    ACCESS_REQUEST_CONCURRENCY,
  );

  const accessByLessonId = new Map<number, LessonAccessResponse | null>(accessByLessonEntries);

  return {
    layers: buildLayerSections(catalog, accessByLessonId),
    products: catalog.products,
    productsCount: catalog.products.length,
  };
};

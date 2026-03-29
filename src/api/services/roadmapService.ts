import { ACCESS_REQUEST_CONCURRENCY } from '../../features/roadmap/constants';
import { buildLayerSections, getPublishedLessons, runTasksWithConcurrency } from '../../features/roadmap/utils';
import type { LayerSection, LessonAccessResponse } from '../../features/roadmap/types';
import { fetchRoadmapCatalog } from './catalogService';
import { fetchRoadmapLessonAccess, getRoadmapAccessUserId } from './accessService';

export interface RoadmapDataSnapshot {
  layers: LayerSection[];
  productsCount: number;
}

interface LoadRoadmapDataOptions {
  signal?: AbortSignal;
  userId?: string;
}

export const loadRoadmapData = async ({
  signal,
  userId,
}: LoadRoadmapDataOptions = {}): Promise<RoadmapDataSnapshot> => {
  const accessUserId = userId ?? (await getRoadmapAccessUserId());
  const catalog = await fetchRoadmapCatalog(signal);
  const lessons = getPublishedLessons(catalog);
  const accessByLessonEntries = await runTasksWithConcurrency(
    lessons,
    async (lesson) => [lesson.id, await fetchRoadmapLessonAccess(lesson.id, accessUserId, signal)] as const,
    ACCESS_REQUEST_CONCURRENCY,
  );

  const accessByLessonId = new Map<number, LessonAccessResponse | null>(accessByLessonEntries);

  return {
    layers: buildLayerSections(catalog, accessByLessonId),
    productsCount: catalog.products.length,
  };
};

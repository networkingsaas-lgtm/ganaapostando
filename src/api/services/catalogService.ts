import { getJson } from '../core/backendClient';
import { normalizeCatalog } from '../../features/roadmap/utils';
import type { CatalogResponse } from '../../features/roadmap/types';

export const fetchRoadmapCatalog = async (signal?: AbortSignal): Promise<CatalogResponse> => {
  const payload = await getJson<unknown>('/catalog', { signal });
  return normalizeCatalog(payload);
};

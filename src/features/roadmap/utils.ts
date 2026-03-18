import { BookOpen, Lock, Sparkles, Star, Unlock, Video } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { getRequiredClientEnv, trimTrailingSlash } from '../../lib/env';
import {
  MAP_PATH_CENTER_X,
  MAP_PATH_OFFSETS,
  MAP_PATH_STEP_Y,
  MAP_PATH_TOP,
} from './constants';
import type {
  CatalogCourse,
  CatalogResponse,
  Entitlement,
  LayerSection,
  LessonAccessResponse,
  LessonNode,
  LessonVideoAccess,
  MapPoint,
  Product,
  ProductLayer,
} from './types';

const getBackendUrl = () => trimTrailingSlash(getRequiredClientEnv('VITE_BACKEND_URL'));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const normalizeCatalog = (payload: unknown): CatalogResponse => {
  if (!isRecord(payload)) {
    return {
      courses: [],
      products: [],
      productLayers: [],
    };
  }

  return {
    courses: Array.isArray(payload.courses) ? (payload.courses as CatalogCourse[]) : [],
    products: Array.isArray(payload.products) ? (payload.products as Product[]) : [],
    productLayers: Array.isArray(payload.productLayers) ? (payload.productLayers as ProductLayer[]) : [],
  };
};

export const normalizeLessonAccess = (payload: unknown): LessonAccessResponse | null => {
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

const getSortValue = (position: number | undefined, fallbackId: number | undefined) => {
  if (typeof position === 'number' && Number.isFinite(position)) {
    return position;
  }

  if (typeof fallbackId === 'number' && Number.isFinite(fallbackId)) {
    return fallbackId;
  }

  return Number.MAX_SAFE_INTEGER;
};

export const getResponseErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();

    if (isRecord(payload)) {
      const message = 'message' in payload ? payload.message : null;
      const error = 'error' in payload ? payload.error : null;

      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      if (typeof error === 'string' && error.trim()) {
        return error;
      }
    }
  } catch {
    return `Error ${response.status}.`;
  }

  return `Error ${response.status}.`;
};

export const getAccessUserId = (user: User) => {
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

export const getReasonLabel = (reason: string) => {
  const normalizedReason = reason.toLowerCase();

  if (normalizedReason === 'preview') {
    return 'Preview';
  }

  if (normalizedReason === 'entitled') {
    return 'Con acceso';
  }

  if (normalizedReason === 'no_product_mapped') {
    return 'Sin producto';
  }

  if (normalizedReason === 'missing_entitlement') {
    return 'Falta acceso';
  }

  return reason;
};

const EUR_PRICE_FORMATTER = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

export const formatPriceEur = (price: number) => EUR_PRICE_FORMATTER.format(price);

const NODE_ICON_SEQUENCE = [Star, Video, BookOpen, Sparkles];

export const getNodeIcon = (lessonNode: LessonNode, lessonIndex: number) => {
  if (!lessonNode.isUnlocked) {
    return Lock;
  }

  if (lessonNode.reason === 'preview') {
    return Unlock;
  }

  return NODE_ICON_SEQUENCE[lessonIndex % NODE_ICON_SEQUENCE.length];
};

export const buildSPathPoints = (lessons: LessonNode[]): MapPoint[] =>
  lessons.map((_lesson, index) => ({
    x: MAP_PATH_CENTER_X + MAP_PATH_OFFSETS[index % MAP_PATH_OFFSETS.length],
    y: MAP_PATH_TOP + index * MAP_PATH_STEP_Y,
  }));

export const buildSPath = (points: MapPoint[]) => {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previousPoint = points[index - 1];
    const currentPoint = points[index];
    const controlY = (previousPoint.y + currentPoint.y) / 2;
    path += ` C ${previousPoint.x} ${controlY}, ${currentPoint.x} ${controlY}, ${currentPoint.x} ${currentPoint.y}`;
  }

  return path;
};

export const getPublishedLessons = (catalog: CatalogResponse) =>
  catalog.courses
    .filter((course) => course.is_published !== false)
    .flatMap((course) =>
      course.course_layers
        .filter((layer) => layer.is_published !== false)
        .flatMap((layer) => layer.lessons),
    );

export const buildLayerSections = (
  catalog: CatalogResponse,
  accessByLessonId: Map<number, LessonAccessResponse | null>,
): LayerSection[] => {
  const productsById = new Map(catalog.products.map((product) => [product.id, product]));
  const productsByLayer = new Map<number, Product[]>();

  for (const relation of catalog.productLayers) {
    const product = productsById.get(relation.product_id);

    if (!product) {
      continue;
    }

    const existingProducts = productsByLayer.get(relation.layer_id) ?? [];
    existingProducts.push(product);
    productsByLayer.set(relation.layer_id, existingProducts);
  }

  const sections: LayerSection[] = [];
  const sortedCourses = [...catalog.courses]
    .filter((course) => course.is_published !== false)
    .sort((left, right) => getSortValue(undefined, left.id) - getSortValue(undefined, right.id));

  for (const course of sortedCourses) {
    const sortedLayers = [...course.course_layers]
      .filter((layer) => layer.is_published !== false)
      .sort(
        (left, right) =>
          getSortValue(left.position, left.id) - getSortValue(right.position, right.id),
      );

    for (const layer of sortedLayers) {
      const sortedLessons = [...layer.lessons].sort(
        (left, right) =>
          getSortValue(left.position, left.id) - getSortValue(right.position, right.id),
      );
      const mappedProducts = (productsByLayer.get(layer.id) ?? []).filter(
        (product) => product.is_active !== false,
      );
      const lessonNodes = sortedLessons.map<LessonNode>((lesson) => {
        const access = accessByLessonId.get(lesson.id) ?? null;
        const isUnlocked = access?.canAccess ?? lesson.is_preview;
        const reason = access?.reason ?? (lesson.is_preview ? 'preview' : 'missing_entitlement');
        const products = access?.products.length ? access.products : mappedProducts;

        return {
          lesson,
          access,
          products,
          reason,
          isUnlocked,
          isCurrent: false,
        };
      });
      const firstLockedIndex = lessonNodes.findIndex((lesson) => !lesson.isUnlocked);
      const currentIndex =
        firstLockedIndex > 0
          ? firstLockedIndex - 1
          : firstLockedIndex === -1
            ? lessonNodes.length - 1
            : -1;
      const lessonsWithCurrent = lessonNodes.map((lesson, index) => ({
        ...lesson,
        isCurrent: index === currentIndex,
      }));
      const unlockedCount = lessonsWithCurrent.filter((lesson) => lesson.isUnlocked).length;

      sections.push({
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        layer,
        lessons: lessonsWithCurrent,
        mappedProducts,
        unlockedCount,
      });
    }
  }

  return sections;
};

export const runTasksWithConcurrency = async <T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
  concurrency: number,
) => {
  const results = new Array<R>(items.length);
  let currentIndex = 0;

  const workerLoop = async () => {
    while (currentIndex < items.length) {
      const itemIndex = currentIndex;
      currentIndex += 1;
      results[itemIndex] = await worker(items[itemIndex]);
    }
  };

  const workerCount = Math.min(concurrency, Math.max(items.length, 1));
  await Promise.all(Array.from({ length: workerCount }, () => workerLoop()));
  return results;
};

export { getBackendUrl };

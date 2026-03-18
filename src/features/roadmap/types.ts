export interface CatalogLesson {
  id: number;
  layer_id: number;
  slug: string;
  title: string;
  summary: string | null;
  position: number;
  is_preview: boolean;
  video_provider: string | null;
  video_asset_id: string | null;
  created_at: string;
}

export interface CatalogLayer {
  id: number;
  course_id: number;
  slug: string;
  title: string;
  description: string | null;
  teaser_text: string | null;
  position: number;
  price_eur: number;
  is_published: boolean;
  lessons: CatalogLesson[];
}

export interface CatalogCourse {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  course_layers: CatalogLayer[];
}

export interface Product {
  id: number;
  code: string;
  name: string;
  product_type: string;
  price_eur: number;
  is_active: boolean;
}

export interface ProductLayer {
  product_id: number;
  layer_id: number;
}

export interface CatalogResponse {
  courses: CatalogCourse[];
  products: Product[];
  productLayers: ProductLayer[];
}

export interface Entitlement {
  id: number;
  product_id: number;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  source: string | null;
}

export interface LessonVideoAccess {
  provider: string | null;
  assetId: string | null;
}

export interface LessonAccessResponse {
  lessonId: number;
  lessonSlug: string;
  canAccess: boolean;
  reason: string;
  layerId: number;
  products: Product[];
  entitlement: Entitlement | null;
  videoAccess: LessonVideoAccess | null;
}

export interface LessonNode {
  lesson: CatalogLesson;
  access: LessonAccessResponse | null;
  products: Product[];
  reason: string;
  isUnlocked: boolean;
  isCurrent: boolean;
}

export interface LayerSection {
  courseId: number;
  courseSlug: string;
  courseTitle: string;
  layer: CatalogLayer;
  lessons: LessonNode[];
  mappedProducts: Product[];
  unlockedCount: number;
}

export interface MapPoint {
  x: number;
  y: number;
}

export interface RoadmapDataState {
  layers: LayerSection[];
  productsCount: number;
  isLoading: boolean;
  error: string | null;
}

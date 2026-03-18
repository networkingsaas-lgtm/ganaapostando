import type { User } from '@supabase/supabase-js';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PricingSection from '../features/home/sections/PricingSection';
import { getAuthenticatedUserLabel } from '../features/portal-shell/utils';
import type { LayerSection } from '../features/roadmap/types';
import { useRoadmapData } from '../features/roadmap/hooks/useRoadmapData';
import { getSupabaseClient } from '../lib/supabase';
import HeaderTitle from '../shared/components/HeaderTitle';

interface PurchasedCourseSummary {
  courseId: number;
  courseTitle: string;
  totalLayers: number;
  purchasedLayers: string[];
  unlockedLessons: number;
  totalLessons: number;
}

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatDateTime = (value: string | null) => {
  if (!value) {
    return 'No disponible';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No disponible';
  }

  return DATE_TIME_FORMATTER.format(parsedDate);
};

const toPurchasedCourses = (layers: LayerSection[]): PurchasedCourseSummary[] => {
  const byCourseId = new Map<
    number,
    {
      courseTitle: string;
      totalLayers: number;
      totalLessons: number;
      unlockedLessons: number;
      purchasedLayerSet: Set<string>;
    }
  >();

  for (const section of layers) {
    const hasPurchasedLayer = section.lessons.some((lessonNode) =>
      Boolean(lessonNode.access?.entitlement),
    );
    const unlockedLessonsInLayer = section.lessons.filter(
      (lessonNode) => lessonNode.isUnlocked && lessonNode.reason !== 'preview',
    ).length;
    const existingCourse = byCourseId.get(section.courseId) ?? {
      courseTitle: section.courseTitle,
      totalLayers: 0,
      totalLessons: 0,
      unlockedLessons: 0,
      purchasedLayerSet: new Set<string>(),
    };

    existingCourse.totalLayers += 1;
    existingCourse.totalLessons += section.lessons.length;
    existingCourse.unlockedLessons += unlockedLessonsInLayer;

    if (hasPurchasedLayer) {
      existingCourse.purchasedLayerSet.add(section.layer.title);
    }

    byCourseId.set(section.courseId, existingCourse);
  }

  return Array.from(byCourseId.entries())
    .map(([courseId, course]) => ({
      courseId,
      courseTitle: course.courseTitle,
      totalLayers: course.totalLayers,
      purchasedLayers: Array.from(course.purchasedLayerSet),
      unlockedLessons: course.unlockedLessons,
      totalLessons: course.totalLessons,
    }))
    .filter((course) => course.purchasedLayers.length > 0)
    .sort(
      (left, right) =>
        right.purchasedLayers.length - left.purchasedLayers.length ||
        left.courseTitle.localeCompare(right.courseTitle, 'es'),
    );
};

export default function UserSettingsPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const {
    isLoading: isCoursesLoading,
    error: coursesError,
    layers,
  } = useRoadmapData();

  useEffect(() => {
    let isMounted = true;

    const loadAuthenticatedUser = async () => {
      setIsUserLoading(true);
      setUserError(null);

      try {
        const supabase = getSupabaseClient();
        const { data: userData, error: userLoadError } = await supabase.auth.getUser();

        if (userLoadError || !userData.user) {
          throw new Error('No se pudo cargar el usuario autenticado.');
        }

        if (!isMounted) {
          return;
        }

        setAuthUser(userData.user);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Error inesperado.';
        setUserError(message);
      } finally {
        if (isMounted) {
          setIsUserLoading(false);
        }
      }
    };

    void loadAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const userLabel = useMemo(() => getAuthenticatedUserLabel(authUser), [authUser]);
  const purchasedCourses = useMemo(() => toPurchasedCourses(layers), [layers]);

  return (
    <div className="space-y-6 bg-white text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <HeaderTitle
          as="h1"
          uppercase={false}
          lineHeightClass="leading-[1.1]"
          className="text-2xl font-black text-slate-900 sm:text-4xl"
        >
          Ajustes de Usuario
        </HeaderTitle>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Consulta tus datos de inicio de sesion y el estado de tu cuenta autenticada.
        </p>

        {isUserLoading && (
          <div className="mt-6 flex items-center gap-3 text-slate-600">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <span>Cargando datos del usuario...</span>
          </div>
        )}

        {!isUserLoading && userError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {userError}
          </div>
        )}

        {!isUserLoading && !userError && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Usuario</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{userLabel}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Email</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{authUser?.email ?? 'No disponible'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Ultimo acceso</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {formatDateTime(authUser?.last_sign_in_at ?? null)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Cuenta creada</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {formatDateTime(authUser?.created_at ?? null)}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <HeaderTitle
          as="h2"
          uppercase={false}
          lineHeightClass="leading-[1.1]"
          className="text-xl font-black text-slate-900 sm:text-3xl"
        >
          Cursos Comprados
        </HeaderTitle>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Aqui puedes ver los cursos y capas que tu cuenta tiene desbloqueados.
        </p>

        {isCoursesLoading && (
          <div className="mt-6 flex items-center gap-3 text-slate-600">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <span>Cargando cursos comprados...</span>
          </div>
        )}

        {!isCoursesLoading && coursesError && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{coursesError}</span>
          </div>
        )}

        {!isCoursesLoading && !coursesError && purchasedCourses.length === 0 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            No se detectaron cursos comprados para este usuario.
          </div>
        )}

        {!isCoursesLoading && !coursesError && purchasedCourses.length > 0 && (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {purchasedCourses.map((course) => (
              <article key={course.courseId} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-base font-bold text-slate-900">{course.courseTitle}</p>
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {course.purchasedLayers.length}/{course.totalLayers} capas
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Lecciones desbloqueadas:</span>{' '}
                  {course.unlockedLessons} de {course.totalLessons}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-700">Capas compradas:</span>{' '}
                  {course.purchasedLayers.join(' | ')}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <PricingSection startMode="stripe" theme="light" />
      </section>
    </div>
  );
}

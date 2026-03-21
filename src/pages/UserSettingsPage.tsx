import type { User } from '@supabase/supabase-js';
import { CircleAlert, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PricingSection from '../features/home/sections/PricingSection';
import { getRoadmapLayerTheme } from '../features/roadmap/constants';
import { getAuthenticatedUserLabel } from '../features/portal-shell/utils';
import type { LayerSection } from '../features/roadmap/types';
import { useRoadmapData } from '../features/roadmap/hooks/useRoadmapData';
import { getSupabaseClient } from '../lib/supabase';
import HeaderTitle from '../shared/components/HeaderTitle';

type BatterySlot = 1 | 2 | 3 | 4 | 5;

interface PurchasedSlotInfo {
  fill: string;
  border: string;
  glow: string;
  layerTitle: string;
}

interface PurchasedCourseSummary {
  courseId: number;
  courseTitle: string;
  purchasedSlotCount: number;
  slotDetails: Partial<Record<BatterySlot, PurchasedSlotInfo>>;
}

interface ActiveBatteryBubble {
  courseId: number;
  slot: BatterySlot;
  anchorX: number;
  anchorY: number;
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

const MAX_BATTERY_SLOTS = 5;

const toPurchasedCourses = (
  layers: LayerSection[],
  layerPaletteById: Map<number, { fill: string; border: string; glow: string }>,
): PurchasedCourseSummary[] => {
  const byCourseId = new Map<
    number,
    {
      courseTitle: string;
      purchasedSlots: Map<BatterySlot, PurchasedSlotInfo>;
      layerCountSeen: number;
    }
  >();

  for (const section of layers) {
    const hasPurchasedLayer = section.lessons.some(
      (lessonNode) => lessonNode.reason === 'entitled' || Boolean(lessonNode.access?.entitlement),
    );

    const existingCourse = byCourseId.get(section.courseId) ?? {
      courseTitle: section.courseTitle,
      purchasedSlots: new Map<BatterySlot, PurchasedSlotInfo>(),
      layerCountSeen: 0,
    };

    const inferredLayerPosition =
      typeof section.layer.position === 'number' && Number.isFinite(section.layer.position)
        ? section.layer.position
        : existingCourse.layerCountSeen + 1;

    const slotNumber = Math.min(
      MAX_BATTERY_SLOTS,
      Math.max(1, Math.trunc(inferredLayerPosition)),
    ) as BatterySlot;

    existingCourse.layerCountSeen += 1;

    if (hasPurchasedLayer) {
      const palette = layerPaletteById.get(section.layer.id);
      existingCourse.purchasedSlots.set(slotNumber, {
        fill:
          palette?.fill ??
          'linear-gradient(180deg,hsl(142 76% 74%) 0%,hsl(142 70% 55%) 100%)',
        border: palette?.border ?? 'hsl(142 68% 34%)',
        glow: palette?.glow ?? '0 8px 16px hsla(142 76% 42% / 0.35)',
        layerTitle: section.layer.title,
      });
    }

    byCourseId.set(section.courseId, existingCourse);
  }

  return Array.from(byCourseId.entries())
    .map(([courseId, course]) => ({
      courseId,
      courseTitle: course.courseTitle,
      purchasedSlotCount: course.purchasedSlots.size,
      slotDetails: Object.fromEntries(course.purchasedSlots.entries()) as Partial<
        Record<BatterySlot, PurchasedSlotInfo>
      >,
    }))
    .filter((course) => course.purchasedSlotCount > 0)
    .sort(
      (left, right) =>
        right.purchasedSlotCount - left.purchasedSlotCount ||
        left.courseTitle.localeCompare(right.courseTitle, 'es'),
    );
};

export default function UserSettingsPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [activeBatteryBubble, setActiveBatteryBubble] = useState<ActiveBatteryBubble | null>(null);
  const [bubbleShift, setBubbleShift] = useState(0);
  const [bubbleArrowOffset, setBubbleArrowOffset] = useState(0);
  const activeBubbleRef = useRef<HTMLDivElement | null>(null);
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

  const recomputeBubblePosition = useCallback(() => {
    const bubbleElement = activeBubbleRef.current;

    if (!bubbleElement) {
      setBubbleShift(0);
      setBubbleArrowOffset(0);
      return;
    }

    const rect = bubbleElement.getBoundingClientRect();
    const viewportPadding = 8;
    const leftBoundary = viewportPadding;
    const rightBoundary = window.innerWidth - viewportPadding;
    const leftOverflow = Math.max(0, leftBoundary - rect.left);
    const rightOverflow = Math.max(0, rect.right - rightBoundary);
    const shift = leftOverflow - rightOverflow;
    const maxArrowOffset = Math.max(0, rect.width / 2 - 18);
    const arrowOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, -shift));

    setBubbleShift(shift);
    setBubbleArrowOffset(arrowOffset);
  }, []);

  useLayoutEffect(() => {
    if (!activeBatteryBubble) {
      setBubbleShift(0);
      setBubbleArrowOffset(0);
      return;
    }

    recomputeBubblePosition();
  }, [activeBatteryBubble, recomputeBubblePosition]);

  useEffect(() => {
    if (!activeBatteryBubble) {
      return;
    }

    const handleResize = () => {
      recomputeBubblePosition();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeBatteryBubble, recomputeBubblePosition]);

  const userLabel = useMemo(() => getAuthenticatedUserLabel(authUser), [authUser]);

  const layerPaletteById = useMemo(() => {
    const nextMap = new Map<number, { fill: string; border: string; glow: string }>();

    layers.forEach((section, sectionIndex) => {
      const theme = getRoadmapLayerTheme(sectionIndex, layers.length);
      nextMap.set(section.layer.id, {
        fill: theme.nodeUnlocked.face,
        border: theme.nodeUnlocked.sideBorder,
        glow: theme.nodeUnlocked.glow,
      });
    });

    return nextMap;
  }, [layers]);

  const purchasedCourses = useMemo(
    () => toPurchasedCourses(layers, layerPaletteById),
    [layers, layerPaletteById],
  );
  const purchasedLayersCount = useMemo(
    () =>
      layers.filter((section) =>
        section.lessons.some(
          (lessonNode) => lessonNode.reason === 'entitled' || Boolean(lessonNode.access?.entitlement),
        ),
      ).length,
    [layers],
  );
  const totalLayersCount = useMemo(
    () => layers.length,
    [layers],
  );
  const activeBubbleCourse = useMemo(
    () =>
      activeBatteryBubble
        ? purchasedCourses.find((course) => course.courseId === activeBatteryBubble.courseId) ?? null
        : null,
    [activeBatteryBubble, purchasedCourses],
  );
  const activeSlotInfo =
    activeBatteryBubble && activeBubbleCourse
      ? activeBubbleCourse.slotDetails[activeBatteryBubble.slot]
      : undefined;

  return (
    <div className="m-0 space-y-6 bg-transparent p-0 text-slate-900" onClick={() => setActiveBatteryBubble(null)}>
      <section className="relative z-30 overflow-visible rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
        <HeaderTitle
          as="h1"
          uppercase={false}
          lineHeightClass="leading-[1.1]"
          className="text-2xl font-black tracking-[-0.015em] text-[#111827] sm:text-4xl"
        >
          Ajustes de <span className="title-span-highlight">Usuarios</span>
        </HeaderTitle>
        <p className="mt-2 text-sm text-[#6b7280] sm:text-base">
          Consulta tus datos de inicio de sesion y el estado de tu cuenta autenticada.
        </p>

        {isUserLoading && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f5f6fa] px-4 py-3 text-[#4b5563]">
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
          <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-[#e5e7eb] bg-white shadow-[0_8px_18px_rgba(17,24,39,0.04)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#eceef2] px-4 py-3">
              <p className="text-sm font-medium text-[#374151]">Usuario</p>
              <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">{userLabel}</p>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[#eceef2] px-4 py-3">
              <p className="text-sm font-medium text-[#374151]">Email</p>
              <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">
                {authUser?.email ?? 'No disponible'}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[#eceef2] px-4 py-3">
              <p className="text-sm font-medium text-[#374151]">Ultimo acceso</p>
              <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">
                {formatDateTime(authUser?.last_sign_in_at ?? null)}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-sm font-medium text-[#374151]">Cuenta creada</p>
              <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">
                {formatDateTime(authUser?.created_at ?? null)}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
        <HeaderTitle
          as="h2"
          uppercase={false}
          lineHeightClass="leading-[1.1]"
          className="text-xl font-black tracking-[-0.015em] text-[#111827] sm:text-3xl"
        >
          Cursos <span className="title-span-highlight">Comprados</span>
        </HeaderTitle>
        <p className="mt-2 text-sm text-[#6b7280] sm:text-base">
          Aqui puedes ver los cursos y capas que tu cuenta tiene desbloqueados.
        </p>
        {!isCoursesLoading && !coursesError && totalLayersCount > 0 && (
          <p className="mt-2 text-right text-xs font-semibold text-[#6b7280] sm:text-sm">
            {purchasedLayersCount}/{totalLayersCount}
          </p>
        )}

        {isCoursesLoading && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f5f6fa] px-4 py-3 text-[#4b5563]">
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
          <div className="mt-6 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#6b7280]">
            No se detectaron cursos comprados para este usuario.
          </div>
        )}

        {!isCoursesLoading && !coursesError && purchasedCourses.length > 0 && (
          <div className="relative z-30 mt-5 space-y-3 overflow-visible">
            {purchasedCourses.map((course) => (
              <div
                key={course.courseId}
                className="relative z-40 overflow-visible"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className="relative rounded-[1.05rem] border-2 border-[#c8ced8] bg-[#f8fafc] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-3.5 sm:py-3.5">
                  <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                    {[1, 2, 3, 4, 5].map((slot) => {
                      const typedSlot = slot as BatterySlot;
                      const slotInfo = course.slotDetails[typedSlot];
                      const isFilled = Boolean(slotInfo);
                      const isActive =
                        activeBatteryBubble?.courseId === course.courseId &&
                        activeBatteryBubble?.slot === typedSlot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={!isFilled}
                          onClick={(event) => {
                            event.stopPropagation();

                            if (!isFilled) {
                              return;
                            }

                            const slotRect = event.currentTarget.getBoundingClientRect();

                            setActiveBatteryBubble((current) => {
                              if (
                                current &&
                                current.courseId === course.courseId &&
                                current.slot === typedSlot
                              ) {
                                return null;
                              }

                              return {
                                courseId: course.courseId,
                                slot: typedSlot,
                                anchorX: slotRect.left + slotRect.width / 2,
                                anchorY: slotRect.bottom,
                              };
                            });
                          }}
                          className={`h-10 rounded-[0.55rem] border transition-all duration-300 sm:h-11 ${
                            isFilled ? 'cursor-pointer' : 'cursor-default'
                          } ${isActive ? 'ring-2 ring-offset-1 ring-[#1d4ed8]/35' : ''}`}
                          style={{
                            background: isFilled ? slotInfo?.fill : '#d1d5db',
                            borderColor: isFilled ? slotInfo?.border : '#c6cbd3',
                            boxShadow: isFilled ? slotInfo?.glow : 'none',
                          }}
                          aria-label={`Slot ${slot} ${isFilled ? 'comprado' : 'sin comprar'}`}
                        />
                      );
                    })}
                  </div>
                </div>
                <span
                  className="pointer-events-none absolute -right-1 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r bg-[#c5cad3] sm:h-8"
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="relative z-10 overflow-hidden rounded-[1.75rem] border border-[#d9d9de] bg-white/90 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur">
        <PricingSection startMode="stripe" theme="light" />
      </section>
      {activeBatteryBubble &&
        activeSlotInfo &&
        createPortal(
          <div
            ref={activeBubbleRef}
            className="fixed z-[2147483647] w-[300px] max-w-[calc(100vw-16px)] rounded-3xl border bg-white p-5 text-left shadow-[0_16px_30px_rgba(15,23,42,0.16)] sm:w-[360px]"
            style={{
              borderColor: '#9cc3ff',
              left: `${activeBatteryBubble.anchorX}px`,
              top: `${activeBatteryBubble.anchorY + 12}px`,
              transform: `translateX(calc(-50% + ${bubbleShift}px))`,
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <span
              className="absolute -top-2 h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t bg-white"
              style={{
                borderColor: '#9cc3ff',
                left: `calc(50% + ${bubbleArrowOffset}px)`,
              }}
            />
            <p className="text-base font-black text-[#111827] sm:text-lg">{activeSlotInfo.layerTitle}</p>
            <p className="mt-1 text-sm text-[#6b7280]">Capa {activeBatteryBubble.slot} comprada</p>
          </div>,
          document.body,
        )}
    </div>
  );
}

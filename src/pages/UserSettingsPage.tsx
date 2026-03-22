import type { User } from '@supabase/supabase-js';
import { LoaderCircle, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthenticatedUserLabel } from '../features/portal-shell/utils';
import { useRoadmapData } from '../features/roadmap/hooks/useRoadmapData';
import { formatPriceEur } from '../features/roadmap/utils';
import { pricingPlans } from '../features/pricing/plans';
import { getSupabaseClient } from '../lib/supabase';

interface Props {
  onOpenLogout?: () => void;
}

interface SettingsRouteState {
  focusLayerId?: number;
  scrollToBilling?: boolean;
}

const BILLING_SCROLL_DURATION_MS = 1300;
const BILLING_SELECTOR_TRANSITION_MS = 320;
const BILLING_PANEL_ANIMATION_CLASS = 'transition-all duration-300';

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

const easeInOutCubic = (value: number) => (
  value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
);

const slowScrollToBottom = (target: HTMLElement, durationMs = 1200) => {
  const scrollContainer = target.closest('main');

  if (!scrollContainer) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    return;
  }

  const startTop = scrollContainer.scrollTop;
  const targetTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 2) {
    return;
  }

  const startedAt = performance.now();

  const step = (now: number) => {
    const progress = Math.min((now - startedAt) / durationMs, 1);
    const eased = easeInOutCubic(progress);
    scrollContainer.scrollTop = startTop + distance * eased;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

const getBillingDeckLayout = () => {
  if (typeof window === 'undefined') {
    return { step: 72, width: 512 };
  }

  const viewportWidth = window.innerWidth;

  if (viewportWidth >= 1536) {
    return { step: 128, width: 792 };
  }

  if (viewportWidth >= 1280) {
    return { step: 112, width: 728 };
  }

  if (viewportWidth >= 1024) {
    return { step: 96, width: 640 };
  }

  if (viewportWidth >= 768) {
    return { step: 84, width: 560 };
  }

  return { step: 72, width: 512 };
};

const UserSettingsPage: FC<Props> = ({ onOpenLogout }) => {
  const location = useLocation();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [activeBillingCard, setActiveBillingCard] = useState<number | null>(null);
  const [showLayerBillingCards, setShowLayerBillingCards] = useState(false);
  const [isBillingSelectorClosing, setIsBillingSelectorClosing] = useState(false);
  const [isBillingSelectorEntering, setIsBillingSelectorEntering] = useState(false);
  const [isLayerCardsEntering, setIsLayerCardsEntering] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  const [billingDeckLayout, setBillingDeckLayout] = useState(getBillingDeckLayout);
  const {
    isLoading: isCoursesLoading,
    layers,
  } = useRoadmapData();
  const handledSettingsLocationKeyRef = useRef<string | null>(null);
  const billingSelectorTimeoutRef = useRef<number | null>(null);

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

  useEffect(() => {
    const syncBillingDeckLayout = () => {
      setBillingDeckLayout(getBillingDeckLayout());
      setIsMobileViewport(window.innerWidth < 768);
    };

    syncBillingDeckLayout();
    window.addEventListener('resize', syncBillingDeckLayout);

    return () => {
      window.removeEventListener('resize', syncBillingDeckLayout);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (billingSelectorTimeoutRef.current !== null) {
        window.clearTimeout(billingSelectorTimeoutRef.current);
      }
    };
  }, []);

  const userLabel = useMemo(() => getAuthenticatedUserLabel(authUser), [authUser]);
  const purchasedLayersCount = useMemo(
    () =>
      layers.filter((section) =>
        section.lessons.some(
          (lessonNode) => lessonNode.reason === 'entitled' || Boolean(lessonNode.access?.entitlement),
        ),
      ).length,
    [layers],
  );
  const isPremium = purchasedLayersCount > 0;
  const layerPricingPlan = pricingPlans[0];
  const methodPricingPlan = pricingPlans[1];
  const billingLayerCards = useMemo(
    () =>
      [...layers]
        .sort((left, right) => left.layer.position - right.layer.position)
        .slice(0, 5),
    [layers],
  );

  const handleGoToBilling = useCallback(() => {
    const billingSection = document.getElementById('billing-capas');

    if (!billingSection) {
      return;
    }

    billingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleOpenLayerBillingCards = useCallback(() => {
    if (showLayerBillingCards) {
      return;
    }

    if (billingSelectorTimeoutRef.current !== null) {
      window.clearTimeout(billingSelectorTimeoutRef.current);
      billingSelectorTimeoutRef.current = null;
    }

    setIsBillingSelectorClosing(true);
    billingSelectorTimeoutRef.current = window.setTimeout(() => {
      setShowLayerBillingCards(true);
      setIsLayerCardsEntering(false);
      window.requestAnimationFrame(() => {
        setIsLayerCardsEntering(true);
      });
      setIsBillingSelectorClosing(false);
      setIsBillingSelectorEntering(false);
      billingSelectorTimeoutRef.current = null;
    }, BILLING_SELECTOR_TRANSITION_MS);
  }, [showLayerBillingCards]);

  const handleBackToBillingSelector = useCallback(() => {
    if (!showLayerBillingCards) {
      return;
    }

    if (billingSelectorTimeoutRef.current !== null) {
      window.clearTimeout(billingSelectorTimeoutRef.current);
      billingSelectorTimeoutRef.current = null;
    }

    setActiveBillingCard(null);
    setIsLayerCardsEntering(false);
    billingSelectorTimeoutRef.current = window.setTimeout(() => {
      setShowLayerBillingCards(false);
      setIsBillingSelectorClosing(false);
      setIsBillingSelectorEntering(true);
      window.requestAnimationFrame(() => {
        setIsBillingSelectorEntering(false);
      });
      billingSelectorTimeoutRef.current = null;
    }, BILLING_SELECTOR_TRANSITION_MS);
  }, [showLayerBillingCards]);

  useEffect(() => {
    if (handledSettingsLocationKeyRef.current === location.key) {
      return;
    }

    const state = location.state as SettingsRouteState | null;
    const shouldScroll = Boolean(state?.scrollToBilling);
    const hasFocusLayer = typeof state?.focusLayerId === 'number';

    if (!shouldScroll && !hasFocusLayer) {
      handledSettingsLocationKeyRef.current = location.key;
      return;
    }

    if (isCoursesLoading) {
      return;
    }

    if (!showLayerBillingCards) {
      setShowLayerBillingCards(true);
      setIsLayerCardsEntering(true);
      setIsBillingSelectorClosing(false);
      setIsBillingSelectorEntering(false);
    }

    handledSettingsLocationKeyRef.current = location.key;

    if (shouldScroll) {
      window.setTimeout(() => {
        const billingSection = document.getElementById('billing-capas');
        if (billingSection) {
          slowScrollToBottom(billingSection, BILLING_SCROLL_DURATION_MS);
        }
      }, 40);
    }

    if (hasFocusLayer) {
      const nextActiveIndex = billingLayerCards.findIndex((layer) => layer.layer.id === state?.focusLayerId);
      if (nextActiveIndex >= 0) {
        if (shouldScroll) {
          window.setTimeout(() => {
            setActiveBillingCard(nextActiveIndex);
          }, BILLING_SCROLL_DURATION_MS + 80);
        } else {
          setActiveBillingCard(nextActiveIndex);
        }
      }
    }
  }, [billingLayerCards, isCoursesLoading, location.key, location.state, showLayerBillingCards]);

  return (
    <div className="m-0 space-y-6 bg-transparent p-0 text-slate-900">
      <section className="relative z-30 overflow-visible rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
        {isUserLoading && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#f5f6fa] px-4 py-3 text-[#4b5563]">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <span>Cargando datos del usuario...</span>
          </div>
        )}

        {!isUserLoading && userError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {userError}
          </div>
        )}

        {!isUserLoading && !userError && (
          <>
            <div className="rounded-[1.35rem] border border-[#e5e7eb] bg-white p-5 shadow-[0_8px_18px_rgba(17,24,39,0.04)] sm:p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`h-16 w-16 overflow-hidden rounded-full border-4 ${
                    isPremium ? 'border-[#2563eb] shadow-[0_8px_18px_rgba(37,99,235,0.34)]' : 'border-[#d1d5db]'
                  }`}
                >
                  <img
                    src="/sin_foto.png"
                    alt={`Avatar de ${userLabel}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                  <div className="min-w-0">
                  <p className="truncate text-[1.35rem] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[1.85rem]">
                    {userLabel}
                  </p>
                  {isCoursesLoading ? (
                    <p className="mt-1 text-sm font-medium text-[#6b7280]">Comprobando plan...</p>
                  ) : isPremium ? (
                    <p className="mt-1 text-sm font-semibold text-[#2563eb]">Plan premium</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleGoToBilling}
                    className="mt-3 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Mejorar plan
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-[#e5e7eb] bg-white shadow-[0_8px_18px_rgba(17,24,39,0.04)]">
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
                <p className="text-sm font-medium text-[#374151]">Último acceso</p>
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
          </>
        )}
      </section>

      <section id="billing-capas" className="relative z-50 overflow-visible rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[1.85rem]">
          Billing de capas
        </h2>
        <p className="mt-2 text-sm text-[#6b7280] sm:text-base">
          Vista previa del billing por capas desbloqueables.
        </p>

        {!showLayerBillingCards && (
          <div
            className={`mt-10 overflow-x-auto pb-2 ${BILLING_PANEL_ANIMATION_CLASS} ${
              isBillingSelectorClosing || isBillingSelectorEntering
                ? 'pointer-events-none translate-y-2 scale-[0.98] opacity-0'
                : 'translate-y-0 scale-100 opacity-100'
            }`}
          >
            <div
              className="relative mx-auto h-[40rem] sm:h-[44rem]"
              style={{ width: `${billingDeckLayout.width}px` }}
            >
              <div className="grid h-full grid-cols-2 gap-5 items-stretch">
                <div className="relative flex h-full flex-col rounded-2xl border-4 border-gray-200 bg-white p-6 shadow-[0_10px_22px_rgba(17,24,39,0.10)] sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    <span className="rebel-underline">El Método</span>.
                  </h3>
                  <div className="mt-5">
                    <span className="text-4xl font-bold text-gray-900 sm:text-5xl">EUR {methodPricingPlan?.price ?? '197'}</span>
                    <span className="ml-1 text-sm text-gray-600">/ pago único</span>
                  </div>
                  <p className="mt-4 text-base text-gray-600">
                    {methodPricingPlan?.description ?? 'Aprende la metodología completa en un solo plan.'}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-gray-700">
                    <li>Acceso completo al programa principal.</li>
                    <li>Sin desbloqueos por etapas.</li>
                    <li>Ideal si quieres todo el contenido desde el inicio.</li>
                  </ul>
                  <button
                    type="button"
                    className="mt-auto w-full rounded-lg border-2 border-gray-300 bg-gray-100 py-3 text-sm font-semibold text-gray-600"
                  >
                    Plan no seleccionado
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenLayerBillingCards}
                  className="relative flex h-full flex-col rounded-2xl border-4 border-blue-300 bg-[linear-gradient(180deg,#ffffff_0%,#f2f7ff_100%)] p-6 text-left shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(37,99,235,0.24)] sm:p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    <span className="rebel-underline">El Método</span>, por capas
                  </h3>
                  <div className="mt-5">
                    <span className="text-4xl font-bold text-gray-900 sm:text-5xl">EUR {layerPricingPlan?.price ?? '1'}</span>
                    <span className="ml-1 text-sm text-gray-600">/ desde</span>
                  </div>
                  <p className="mt-4 text-base text-gray-600">
                    {layerPricingPlan?.description ?? 'Desbloquea contenido por niveles y compra solo lo que necesites.'}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm text-gray-700">
                    <li>Empiezas con un coste bajo.</li>
                    <li>Compras capa a capa según tu avance.</li>
                    <li>Control total del gasto por módulo.</li>
                  </ul>
                  <span className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white">
                    Elegir por capas
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {showLayerBillingCards && (
        <>
          <div className="mt-6 mb-2 flex justify-center">
            <button
              type="button"
              onClick={handleBackToBillingSelector}
              aria-label="Volver atrás"
              className="inline-flex items-center gap-2 px-2 py-1 text-sm font-semibold text-[#334155] transition hover:text-[#0f172a]"
            >
              <Undo2 className="h-5 w-5" />
              <span>Atrás</span>
            </button>
          </div>

        <div
          className={`mt-2 overflow-x-auto pb-2 ${BILLING_PANEL_ANIMATION_CLASS} ${
            isLayerCardsEntering
              ? 'opacity-100'
              : 'pointer-events-none translate-y-2 scale-[0.98] opacity-0'
          }`}
        >
          <div
            className="relative mx-auto h-[36rem] sm:h-[39rem]"
            style={{ width: `${billingDeckLayout.width}px` }}
            onMouseDown={() => setActiveBillingCard(null)}
          >
          {[1, 2, 3, 4, 5].map((slotNumber, slotIndex) => {
            const layerCard = billingLayerCards[slotIndex];
            const isPurchased = Boolean(layerCard?.lessons.some(
              (lessonNode) => lessonNode.reason === 'entitled' || Boolean(lessonNode.access?.entitlement),
            ));
            const isActive = activeBillingCard === slotIndex;
            const useViewportCenter = isActive && isMobileViewport;
            const collapsedOffset = slotIndex * billingDeckLayout.step;

            return (
              <div
                key={slotNumber}
                role="button"
                tabIndex={0}
                onMouseDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (activeBillingCard !== null && !isActive) {
                    return;
                  }
                  setActiveBillingCard((current) => (current === slotIndex ? null : slotIndex));
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    if (activeBillingCard !== null && !isActive) {
                      return;
                    }
                    setActiveBillingCard((current) => (current === slotIndex ? null : slotIndex));
                  }
                }}
                className={`absolute left-0 top-8 flex min-h-[30rem] w-56 flex-col rounded-2xl border-4 border-gray-200 bg-white p-5 ${
                  isMobileViewport
                    ? 'transition-[opacity,box-shadow] duration-700 ease-in-out'
                    : 'transition-all duration-700 ease-in-out'
                } sm:min-h-[33rem] sm:w-64 sm:p-8 ${
                  isActive
                    ? useViewportCenter
                      ? 'billing-card-mobile-fade-in fixed -translate-x-1/2 -translate-y-1/2 scale-[1.02] opacity-100 blur-0 shadow-[0_28px_52px_rgba(15,23,42,0.28)] ring-2 ring-blue-300/60'
                      : '-translate-x-1/2 scale-[1.02] -translate-y-3 opacity-100 blur-0 shadow-[0_28px_52px_rgba(15,23,42,0.28)] ring-2 ring-blue-300/60'
                    : activeBillingCard !== null
                      ? isMobileViewport
                        ? 'scale-[0.99] translate-y-0 opacity-100 blur-0 shadow-[0_12px_20px_rgba(15,23,42,0.14)]'
                        : 'scale-[0.97] translate-y-0 opacity-90 blur-0 shadow-[0_10px_18px_rgba(15,23,42,0.12)]'
                      : 'scale-[0.99] translate-y-0 opacity-100 blur-0 shadow-[0_16px_28px_rgba(15,23,42,0.18)] hover:-translate-y-1'
                }`}
                style={{
                  left: useViewportCenter ? '50%' : isActive ? '50%' : `${collapsedOffset}px`,
                  top: useViewportCenter ? '50dvh' : undefined,
                  zIndex: isActive ? 120 : slotIndex + 1,
                }}
              >
                <span className="absolute left-3 top-3 rounded-lg bg-gray-900 px-2 py-1 text-xs font-black text-white">
                  {slotNumber}
                </span>
                <h3 className="mt-8 line-clamp-5 text-xl font-bold text-gray-900 sm:text-2xl">
                  <span className="rebel-underline">El Método.</span>{' '}
                  {layerCard?.layer.title ?? `Capa ${slotNumber}`}
                </h3>
                <p className="mt-5 whitespace-nowrap text-3xl font-bold leading-none text-gray-900 sm:text-4xl">
                  {layerCard ? formatPriceEur(layerCard.layer.price_eur) : '-'}
                </p>
                <p className={`mt-3 text-sm font-semibold ${isPurchased ? 'text-green-600' : 'text-gray-600'}`}>
                  {isPurchased ? 'Comprada' : 'Disponible'}
                </p>
                <button
                  type="button"
                  className="mt-auto w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Comprar capa
                </button>
              </div>
            );
          })}
          {activeBillingCard !== null && (
            <button
              type="button"
              aria-label="Deseleccionar card activa"
              className="absolute inset-0 z-40 bg-white/10 backdrop-blur-[2px]"
              onClick={(event) => {
                event.stopPropagation();
                setActiveBillingCard(null);
              }}
            />
          )}
          </div>
        </div>
        </>
        )}
      </section>

      <section className="relative z-30 rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
        <button
          type="button"
          onClick={onOpenLogout}
          className="w-full rounded-2xl bg-red-600 px-5 py-4 text-base font-semibold text-white transition hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </section>
    </div>
  );
};

export default UserSettingsPage;

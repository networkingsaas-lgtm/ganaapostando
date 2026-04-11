import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  cancelSubscription,
  createCheckoutSession,
  reactivateSubscription,
} from '../../../api/services/paymentsService';
import { getFriendlyRequestErrorMessage } from '../../../api/core/backendClient';
import { pollLessonAccessActivation } from '../../../api/services/userAccessService';
import { useDashboardCatalog } from '../../portal-shell/context/DashboardCatalogContext';
import { getAuthenticatedUserLabel } from '../../portal-shell/utils';
import type { LayerSection } from '../../roadmap/types';
import { formatPriceEur } from '../../roadmap/utils';
import { pricingPlans } from '../../pricing/plans';
import { useAuthSession } from '../../../shared/auth/AuthSessionContext';
import { loadTelegramVipStatus } from '../../grupo-apuestas/services/telegramVipService';
import type { TelegramMeResponse } from '../../grupo-apuestas/types';

interface SettingsRouteState {
  focusLayerId?: number;
  scrollToBilling?: boolean;
}

const BILLING_SCROLL_DURATION_MS = 1300;
const BILLING_SELECTOR_TRANSITION_MS = 320;
const BILLING_PANEL_ANIMATION_CLASS = 'transition-all duration-300';

const lessonHasPaidAccess = (reason: string | null | undefined, canAccess: boolean | undefined) =>
  reason === 'entitled' || Boolean(canAccess);

interface CheckoutTarget {
  productId: number;
  lessonId: number;
}

export interface ManagedPlanEntry {
  id: string;
  planName: string;
  planType: 'Compra' | 'Suscripcion';
  statusLabel: string;
  activatedAtLabel: string;
  endsAtLabel: string;
  canCancel: boolean;
  canReactivate: boolean;
}

const parsePositiveInteger = (value: string | null) => {
  if (!value) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const getLayerProductId = (layerSection: LayerSection | undefined) => {
  if (!layerSection) {
    return null;
  }

  const mappedProductId = layerSection.mappedProducts[0]?.id;
  if (typeof mappedProductId === 'number') {
    return mappedProductId;
  }

  for (const lessonNode of layerSection.lessons) {
    const lessonProductId = lessonNode.products[0]?.id;
    if (typeof lessonProductId === 'number') {
      return lessonProductId;
    }
  }

  return null;
};

const buildLayerCheckoutTarget = (layerSection: LayerSection | undefined): CheckoutTarget | null => {
  if (!layerSection) {
    return null;
  }

  const productId = getLayerProductId(layerSection);
  const lessonId = layerSection.lessons[0]?.lesson.id;

  if (!productId || !lessonId) {
    return null;
  }

  return {
    productId,
    lessonId,
  };
};

const buildSettingsReturnUrl = (
  checkoutState: 'success' | 'cancel',
  productId: number,
  lessonId: number,
) => {
  const returnUrl = new URL('/dashboard/ajustes', window.location.origin);
  returnUrl.searchParams.set('checkout', checkoutState);
  returnUrl.searchParams.set('productId', String(productId));
  returnUrl.searchParams.set('lessonId', String(lessonId));
  return returnUrl.toString();
};

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

const getLatestDateValue = (values: Array<string | null | undefined>) => {
  let latestValue: string | null = null;
  let latestTime = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    if (!value) {
      continue;
    }

    const parsedTime = Date.parse(value);

    if (!Number.isFinite(parsedTime) || parsedTime <= latestTime) {
      continue;
    }

    latestValue = value;
    latestTime = parsedTime;
  }

  return latestValue;
};

const getEarliestDateValue = (values: Array<string | null | undefined>) => {
  let earliestValue: string | null = null;
  let earliestTime = Number.POSITIVE_INFINITY;

  for (const value of values) {
    if (!value) {
      continue;
    }

    const parsedTime = Date.parse(value);

    if (!Number.isFinite(parsedTime) || parsedTime >= earliestTime) {
      continue;
    }

    earliestValue = value;
    earliestTime = parsedTime;
  }

  return earliestValue;
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const getDateByPriorityKeys = (source: unknown, keys: string[]) => {
  if (!isRecord(source)) {
    return null;
  }

  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
};

const getTelegramSubscriptionStartDate = (status: TelegramMeResponse | null) => {
  if (!status) {
    return null;
  }

  return (
    getDateByPriorityKeys(status.subscription, [
      'startsAt',
      'startAt',
      'startedAt',
      'activatedAt',
      'currentPeriodStart',
      'periodStart',
    ])
    ?? getDateByPriorityKeys(status, [
      'startsAt',
      'startAt',
      'startedAt',
      'activatedAt',
      'currentPeriodStart',
      'periodStart',
    ])
    ?? null
  );
};

const getTelegramSubscriptionEndDate = (status: TelegramMeResponse | null) => {
  if (!status) {
    return null;
  }

  return (
    status.subscriptionExpiresAt
    ?? status.entitlementEndsAt
    ?? status.endsAt
    ?? status.expiresAt
    ?? status.currentPeriodEnd
    ?? status.subscription?.subscriptionExpiresAt
    ?? status.subscription?.entitlementEndsAt
    ?? status.subscription?.endsAt
    ?? status.subscription?.expiresAt
    ?? status.subscription?.currentPeriodEnd
    ?? getDateByPriorityKeys(status.subscription, ['endsAt', 'endAt', 'periodEnd'])
    ?? getDateByPriorityKeys(status, ['endsAt', 'endAt', 'periodEnd'])
    ?? null
  );
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

export const useUserSettingsLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, authReady, session } = useAuthSession();
  const accessToken = session?.access_token ?? null;
  const sessionKey = session?.user.id ?? null;
  const isUserLoading = !authReady;
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [checkoutNoticeTone, setCheckoutNoticeTone] = useState<'info' | 'success' | 'error'>('info');
  const [managedPlansError, setManagedPlansError] = useState<string | null>(null);
  const [managedPlansNotice, setManagedPlansNotice] = useState<string | null>(null);
  const [isManagedPlansLoading, setIsManagedPlansLoading] = useState(false);
  const [isCancellingManagedSubscription, setIsCancellingManagedSubscription] = useState(false);
  const [isReactivatingManagedSubscription, setIsReactivatingManagedSubscription] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<TelegramMeResponse | null>(null);
  const [isStartingCheckoutByLayerId, setIsStartingCheckoutByLayerId] = useState<number | null>(null);
  const [isStartingMethodCheckout, setIsStartingMethodCheckout] = useState(false);
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
    refreshDashboardCatalog,
  } = useDashboardCatalog();
  const handledSettingsLocationKeyRef = useRef<string | null>(null);
  const billingSelectorTimeoutRef = useRef<number | null>(null);

  const loadTelegramStatus = useCallback(async (forceRefresh = false) => {
    if (!accessToken) {
      setTelegramStatus(null);
      setManagedPlansError(null);
      setIsManagedPlansLoading(false);
      return;
    }

    setIsManagedPlansLoading(true);

    try {
      const nextStatus = await loadTelegramVipStatus(accessToken, {
        sessionKey,
        forceRefresh,
      });
      setTelegramStatus(nextStatus.status);
      setManagedPlansError(null);
    } catch (error) {
      setTelegramStatus(null);
      setManagedPlansError(
        getFriendlyRequestErrorMessage(
          error,
          'No se pudo cargar el estado de suscripciones de Telegram.',
        ),
      );
    } finally {
      setIsManagedPlansLoading(false);
    }
  }, [accessToken, sessionKey]);

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

  useEffect(() => {
    if (!authReady) {
      return;
    }

    void loadTelegramStatus();
  }, [authReady, loadTelegramStatus]);

  const userLabel = useMemo(() => getAuthenticatedUserLabel(authUser), [authUser]);
  const purchasedLayersCount = useMemo(
    () =>
      layers.filter((section) =>
        section.lessons.some(
          (lessonNode) => lessonHasPaidAccess(lessonNode.reason, lessonNode.access?.canAccess),
        ),
      ).length,
    [layers],
  );
  const isPremium = purchasedLayersCount > 0;
  const layerPricingPlan = pricingPlans[0];
  const methodPricingPlan = pricingPlans[1];
  const methodCheckoutTarget = useMemo(() => {
    for (const section of layers) {
      const lessonWithProduct = section.lessons.find((lessonNode) =>
        lessonNode.products.some((product) => product.id === 6),
      );

      if (lessonWithProduct) {
        return {
          productId: 6,
          lessonId: lessonWithProduct.lesson.id,
        };
      }

      if (section.mappedProducts.some((product) => product.id === 6)) {
        const fallbackLessonId = section.lessons[0]?.lesson.id;

        if (fallbackLessonId) {
          return {
            productId: 6,
            lessonId: fallbackLessonId,
          };
        }
      }
    }

    return null;
  }, [layers]);
  const isMethodPurchased = useMemo(
    () =>
      layers.some((section) =>
        section.lessons.some(
          (lessonNode) =>
            lessonNode.products.some((product) => product.id === 6)
            && lessonHasPaidAccess(lessonNode.reason, lessonNode.access?.canAccess),
        ),
      ),
    [layers],
  );
  const methodEntitlementExpiresAtLabel = useMemo(() => {
    if (!isMethodPurchased) {
      return null;
    }

    const latestEntitlementEnd = getLatestDateValue(
      layers.flatMap((section) =>
        section.lessons
          .filter(
            (lessonNode) =>
              lessonNode.products.some((product) => product.id === 6)
              && lessonHasPaidAccess(lessonNode.reason, lessonNode.access?.canAccess),
          )
          .map((lessonNode) => lessonNode.access?.entitlement?.ends_at ?? null),
      ),
    );

    return formatDateTime(latestEntitlementEnd);
  }, [isMethodPurchased, layers]);
  const methodProductPriceLabel = useMemo(() => {
    const methodProduct = layers
      .flatMap((section) => [...section.mappedProducts, ...section.lessons.flatMap((lesson) => lesson.products)])
      .find((product) => product.id === 6);

    return methodProduct ? formatPriceEur(methodProduct.price_eur) : `${methodPricingPlan?.price ?? '197'} €`;
  }, [layers, methodPricingPlan?.price]);
  const billingLayerCards = useMemo(
    () =>
      [...layers]
        .sort((left, right) => left.layer.position - right.layer.position)
        .slice(0, 5),
    [layers],
  );
  const layerPlanPrice = useMemo(() => {
    const firstLayer = billingLayerCards[0];

    if (firstLayer) {
      return formatPriceEur(firstLayer.layer.price_eur);
    }

    return `${layerPricingPlan?.price ?? '13.25'} €`;
  }, [billingLayerCards, layerPricingPlan?.price]);
  const hasActiveTelegramSubscription = useMemo(
    () => Boolean(
      telegramStatus?.activeSubscription
      || telegramStatus?.subscriptionStatus === 'active'
      || telegramStatus?.subscription?.status === 'active'
      || telegramStatus?.cancelAtPeriodEnd
      || telegramStatus?.subscription?.cancelAtPeriodEnd,
    ),
    [telegramStatus],
  );
  const hasTelegramCancelAtPeriodEnd = Boolean(
    telegramStatus?.cancelAtPeriodEnd ?? telegramStatus?.subscription?.cancelAtPeriodEnd ?? false,
  );
  const canCancelTelegramSubscription = hasActiveTelegramSubscription && !hasTelegramCancelAtPeriodEnd;
  const managedPlans = useMemo<ManagedPlanEntry[]>(() => {
    const rows: ManagedPlanEntry[] = [];

    if (hasActiveTelegramSubscription) {
      rows.push({
        id: 'telegram-subscription',
        planName: 'Grupo Telegram VIP',
        planType: 'Suscripcion',
        statusLabel: hasTelegramCancelAtPeriodEnd ? 'Activa (renovacion cancelada)' : 'Activa',
        activatedAtLabel: formatDateTime(getTelegramSubscriptionStartDate(telegramStatus)),
        endsAtLabel: formatDateTime(getTelegramSubscriptionEndDate(telegramStatus)),
        canCancel: canCancelTelegramSubscription,
        canReactivate: hasTelegramCancelAtPeriodEnd,
      });
    }

    if (isMethodPurchased) {
      const methodPurchasedLessons = layers.flatMap((section) =>
        section.lessons.filter(
          (lessonNode) =>
            lessonNode.products.some((product) => product.id === 6)
            && lessonHasPaidAccess(lessonNode.reason, lessonNode.access?.canAccess)
            && lessonNode.access?.entitlement?.product_id === 6,
        ),
      );
      const methodActivatedAt = getEarliestDateValue(
        methodPurchasedLessons.map((lessonNode) => lessonNode.access?.entitlement?.starts_at ?? null),
      );
      const methodEndsAt = getLatestDateValue(
        methodPurchasedLessons.map((lessonNode) => lessonNode.access?.entitlement?.ends_at ?? null),
      );

      rows.push({
        id: 'metodo-unico',
        planName: 'El Metodo (pago unico)',
        planType: 'Compra',
        statusLabel: 'Compra activa',
        activatedAtLabel: formatDateTime(methodActivatedAt),
        endsAtLabel: formatDateTime(methodEndsAt),
        canCancel: false,
        canReactivate: false,
      });
    }

    for (const section of layers) {
      const paidLessons = section.lessons.filter((lessonNode) =>
        lessonHasPaidAccess(lessonNode.reason, lessonNode.access?.canAccess)
        && typeof lessonNode.access?.entitlement?.product_id === 'number'
        && lessonNode.access?.entitlement?.product_id !== 6,
      );

      if (paidLessons.length === 0) {
        continue;
      }

      const activatedAt = getEarliestDateValue(
        paidLessons.map((lessonNode) => lessonNode.access?.entitlement?.starts_at ?? null),
      );
      const endsAt = getLatestDateValue(
        paidLessons.map((lessonNode) => lessonNode.access?.entitlement?.ends_at ?? null),
      );

      rows.push({
        id: `layer-${section.layer.id}`,
        planName: `Capa ${section.layer.position}: ${section.layer.title}`,
        planType: 'Compra',
        statusLabel: 'Compra activa',
        activatedAtLabel: formatDateTime(activatedAt),
        endsAtLabel: formatDateTime(endsAt),
        canCancel: false,
        canReactivate: false,
      });
    }

    return rows;
  }, [
    canCancelTelegramSubscription,
    hasActiveTelegramSubscription,
    hasTelegramCancelAtPeriodEnd,
    isMethodPurchased,
    layers,
    telegramStatus,
  ]);
  const getCandidateLessonIdsForProduct = useCallback((productId: number, fallbackLessonId: number) => {
    const lessonIds = new Set<number>([fallbackLessonId]);

    for (const section of layers) {
      const layerHasProduct = section.mappedProducts.some((product) => product.id === productId);

      for (const lessonNode of section.lessons) {
        const lessonHasProduct = lessonNode.products.some((product) => product.id === productId);

        if (layerHasProduct || lessonHasProduct) {
          lessonIds.add(lessonNode.lesson.id);
        }
      }
    }

    return Array.from(lessonIds);
  }, [layers]);

  const startCheckout = useCallback(async ({ productId, lessonId }: CheckoutTarget) => {
    const checkoutUrl = await createCheckoutSession({
      productId,
      successUrl: buildSettingsReturnUrl('success', productId, lessonId),
      cancelUrl: buildSettingsReturnUrl('cancel', productId, lessonId),
    });

    window.location.assign(checkoutUrl);
  }, []);

  const handleCancelManagedSubscription = useCallback(async () => {
    setManagedPlansError(null);
    setManagedPlansNotice(null);

    if (!canCancelTelegramSubscription) {
      setManagedPlansNotice('No hay una suscripcion activa cancelable en este momento.');
      return;
    }

    setIsCancellingManagedSubscription(true);

    try {
      await cancelSubscription();
      setManagedPlansNotice('Suscripcion cancelada correctamente.');
      refreshDashboardCatalog();
      await loadTelegramStatus(true);
    } catch (error) {
      setManagedPlansError(
        error instanceof Error
          ? error.message
          : 'No se pudo cancelar la suscripcion en este momento.',
      );
    } finally {
      setIsCancellingManagedSubscription(false);
    }
  }, [canCancelTelegramSubscription, loadTelegramStatus, refreshDashboardCatalog]);

  const handleReactivateManagedSubscription = useCallback(async () => {
    setManagedPlansError(null);
    setManagedPlansNotice(null);

    if (!hasTelegramCancelAtPeriodEnd) {
      setManagedPlansNotice('No hay una suscripcion pendiente de baja para reactivar.');
      return;
    }

    setIsReactivatingManagedSubscription(true);

    try {
      await reactivateSubscription();
      setManagedPlansNotice('Suscripcion reactivada correctamente.');
      refreshDashboardCatalog();
      await loadTelegramStatus(true);
    } catch (error) {
      setManagedPlansError(
        error instanceof Error
          ? error.message
          : 'No se pudo reactivar la suscripcion en este momento.',
      );
    } finally {
      setIsReactivatingManagedSubscription(false);
    }
  }, [hasTelegramCancelAtPeriodEnd, loadTelegramStatus, refreshDashboardCatalog]);

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

  const handleStartLayerCheckout = useCallback(async (layerSection: LayerSection | undefined) => {
    if (!layerSection) {
      setCheckoutNotice('No encontramos la capa seleccionada para iniciar el pago.');
      setCheckoutNoticeTone('error');
      return;
    }

    const target = buildLayerCheckoutTarget(layerSection);

    if (!target) {
      setCheckoutNotice('Esta capa no tiene producto asociado todavía.');
      setCheckoutNoticeTone('error');
      return;
    }

    setCheckoutNotice(null);
    setIsStartingCheckoutByLayerId(layerSection.layer.id);

    try {
      await startCheckout(target);
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Error inesperado iniciando checkout.';
      setCheckoutNotice(message);
      setCheckoutNoticeTone('error');
      setIsStartingCheckoutByLayerId(null);
    }
  }, [startCheckout]);

  const handleStartMethodCheckout = useCallback(async () => {
    if (!methodCheckoutTarget) {
      setCheckoutNotice('El plan El Método todavía no tiene producto asociado para checkout.');
      setCheckoutNoticeTone('error');
      return;
    }

    const { productId, lessonId } = methodCheckoutTarget;
    setCheckoutNotice(null);
    setIsStartingMethodCheckout(true);

    try {
      await startCheckout({ productId, lessonId });
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Error inesperado iniciando checkout.';
      setCheckoutNotice(message);
      setCheckoutNoticeTone('error');
      setIsStartingMethodCheckout(false);
    }
  }, [methodCheckoutTarget, startCheckout]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const checkoutState = query.get('checkout');

    if (checkoutState !== 'success' && checkoutState !== 'cancel') {
      return;
    }

    if (checkoutState === 'cancel') {
      setCheckoutNotice('Compra cancelada. Puedes intentarlo de nuevo cuando quieras.');
      setCheckoutNoticeTone('info');
      navigate('/dashboard/ajustes', { replace: true });
      return;
    }

    const checkoutLessonId = parsePositiveInteger(query.get('lessonId'));
    const productId = parsePositiveInteger(query.get('productId'));

    if (!checkoutLessonId || !productId) {
      setCheckoutNotice('Pago recibido. Estamos actualizando tus accesos.');
      setCheckoutNoticeTone('info');
      refreshDashboardCatalog();
      void loadTelegramStatus(true);
      navigate('/dashboard/ajustes', { replace: true });
      return;
    }

    if (!authUser) {
      setCheckoutNotice('Pago recibido. Estamos actualizando tus accesos.');
      setCheckoutNoticeTone('info');
      return;
    }

    const controller = new AbortController();

    const waitForAccessActivation = async () => {
      setCheckoutNotice('Pago recibido, activando acceso...');
      setCheckoutNoticeTone('info');

      const candidateLessonIds = getCandidateLessonIdsForProduct(productId, checkoutLessonId);

      try {
        const matchedLessonId = await pollLessonAccessActivation({
          user: authUser,
          productId,
          candidateLessonIds,
          signal: controller.signal,
        });

        if (matchedLessonId !== null) {
          setCheckoutNotice('Acceso activado correctamente.');
          setCheckoutNoticeTone('success');
          refreshDashboardCatalog();
          void loadTelegramStatus(true);
          navigate('/dashboard/mapa', {
            replace: true,
            state: {
              focusLessonId: matchedLessonId,
            },
          });
          return;
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
      }

      if (controller.signal.aborted) {
        return;
      }

      setCheckoutNotice('El pago se registró, pero el acceso tarda más de lo normal. Recarga en unos segundos.');
      setCheckoutNoticeTone('error');
      refreshDashboardCatalog();
      void loadTelegramStatus(true);
      navigate('/dashboard/ajustes', { replace: true });
    };

    void waitForAccessActivation();

    return () => {
      controller.abort();
    };
  }, [authUser, getCandidateLessonIdsForProduct, loadTelegramStatus, location.search, navigate, refreshDashboardCatalog]);

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

  return {
    isUserLoading,
    userError: !authReady ? null : authUser ? null : 'No se pudo cargar el usuario autenticado.',
    isPremium,
    isCoursesLoading,
    userLabel,
    authUserEmail: authUser?.email ?? 'No disponible',
    lastSignInAtLabel: formatDateTime(authUser?.last_sign_in_at ?? null),
    createdAtLabel: formatDateTime(authUser?.created_at ?? null),
    handleGoToBilling,
    managedPlans,
    managedPlansError,
    managedPlansNotice,
    isManagedPlansLoading,
    isCancellingManagedSubscription,
    isReactivatingManagedSubscription,
    handleCancelManagedSubscription,
    handleReactivateManagedSubscription,
    checkoutNotice,
    checkoutNoticeTone,
    showLayerBillingCards,
    billingPanelAnimationClass: BILLING_PANEL_ANIMATION_CLASS,
    isBillingSelectorClosing,
    isBillingSelectorEntering,
    billingDeckLayout,
    methodProductPriceLabel,
    isMethodPurchased,
    methodEntitlementExpiresAtLabel,
    isStartingMethodCheckout,
    methodCheckoutTarget,
    handleStartMethodCheckout,
    methodPlanDescription: methodPricingPlan?.description ?? 'Aprende la metodolog�a completa en un solo plan.',
    handleOpenLayerBillingCards,
    layerPlanPrice,
    layerPlanDescription: layerPricingPlan?.description ?? 'Desbloquea contenido por niveles y compra solo lo que necesites.',
    handleBackToBillingSelector,
    isLayerCardsEntering,
    setActiveBillingCard,
    billingLayerCards,
    isStartingCheckoutByLayerId,
    handleStartLayerCheckout,
    activeBillingCard,
    isMobileViewport,
  };
};

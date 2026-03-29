import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../../../api/services/paymentsService';
import { getCurrentUser } from '../../../api/services/sessionService';
import { pollLessonAccessActivation } from '../../../api/services/userAccessService';
import { getAuthenticatedUserLabel } from '../../portal-shell/utils';
import { useRoadmapData } from '../../roadmap/hooks/useRoadmapData';
import type { LayerSection } from '../../roadmap/types';
import { formatPriceEur } from '../../roadmap/utils';
import { pricingPlans } from '../../pricing/plans';

interface SettingsRouteState {
  focusLayerId?: number;
  scrollToBilling?: boolean;
}

const BILLING_SCROLL_DURATION_MS = 1300;
const BILLING_SELECTOR_TRANSITION_MS = 320;
const BILLING_PANEL_ANIMATION_CLASS = 'transition-all duration-300';

interface CheckoutTarget {
  productId: number;
  lessonId: number;
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
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [roadmapRefreshKey, setRoadmapRefreshKey] = useState(0);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [checkoutNoticeTone, setCheckoutNoticeTone] = useState<'info' | 'success' | 'error'>('info');
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
  } = useRoadmapData(roadmapRefreshKey);
  const handledSettingsLocationKeyRef = useRef<string | null>(null);
  const billingSelectorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAuthenticatedUser = async () => {
      setIsUserLoading(true);
      setUserError(null);

      try {
        const user = await getCurrentUser();

        if (!user) {
          throw new Error('No se pudo cargar el usuario autenticado.');
        }

        if (!isMounted) {
          return;
        }

        setAuthUser(user);
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
            && (lessonNode.reason === 'entitled' || Boolean(lessonNode.access?.entitlement)),
        ),
      ),
    [layers],
  );
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
      setRoadmapRefreshKey((current) => current + 1);
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
          setRoadmapRefreshKey((current) => current + 1);
          navigate('/dashboard/mapa', {
            replace: true,
            state: {
              focusLessonId: matchedLessonId,
              forceRoadmapRefresh: true,
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
      setRoadmapRefreshKey((current) => current + 1);
      navigate('/dashboard/ajustes', { replace: true });
    };

    void waitForAccessActivation();

    return () => {
      controller.abort();
    };
  }, [authUser, getCandidateLessonIdsForProduct, location.search, navigate]);

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
    userError,
    isPremium,
    isCoursesLoading,
    userLabel,
    authUserEmail: authUser?.email ?? 'No disponible',
    lastSignInAtLabel: formatDateTime(authUser?.last_sign_in_at ?? null),
    createdAtLabel: formatDateTime(authUser?.created_at ?? null),
    handleGoToBilling,
    checkoutNotice,
    checkoutNoticeTone,
    showLayerBillingCards,
    billingPanelAnimationClass: BILLING_PANEL_ANIMATION_CLASS,
    isBillingSelectorClosing,
    isBillingSelectorEntering,
    billingDeckLayout,
    methodProductPriceLabel,
    isMethodPurchased,
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

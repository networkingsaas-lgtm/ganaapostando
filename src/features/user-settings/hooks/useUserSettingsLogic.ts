import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthenticatedUserLabel } from '../../portal-shell/utils';
import { useRoadmapData } from '../../roadmap/hooks/useRoadmapData';
import type { LayerSection } from '../../roadmap/types';
import {
  formatPriceEur,
  getAccessUserId,
  getBackendUrl,
  getResponseErrorMessage,
  normalizeLessonAccess,
} from '../../roadmap/utils';
import { pricingPlans } from '../../pricing/plans';
import { getSupabaseClient } from '../../../lib/supabase';

interface SettingsRouteState {
  focusLayerId?: number;
  scrollToBilling?: boolean;
}

const BILLING_SCROLL_DURATION_MS = 1300;
const BILLING_SELECTOR_TRANSITION_MS = 320;
const BILLING_PANEL_ANIMATION_CLASS = 'transition-all duration-300';
const ACCESS_POLL_INTERVAL_MS = 1800;
const ACCESS_POLL_MAX_ATTEMPTS = 14;

interface CheckoutSessionResponse {
  checkoutUrl: string;
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

    const productId = getLayerProductId(layerSection);
    const lessonId = layerSection.lessons[0]?.lesson.id;

    if (!productId || !lessonId) {
      setCheckoutNotice('Esta capa no tiene producto asociado todavía.');
      setCheckoutNoticeTone('error');
      return;
    }

    setCheckoutNotice(null);
    setIsStartingCheckoutByLayerId(layerSection.layer.id);

    try {
      const supabase = getSupabaseClient();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (sessionError || !accessToken) {
        throw new Error('Necesitas iniciar sesión para continuar con el pago.');
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/payments/checkout-session`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId,
          successUrl: buildSettingsReturnUrl('success', productId, lessonId),
          cancelUrl: buildSettingsReturnUrl('cancel', productId, lessonId),
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response));
      }

      const payload = await response.json() as CheckoutSessionResponse;

      if (!payload.checkoutUrl || typeof payload.checkoutUrl !== 'string') {
        throw new Error('La respuesta de checkout no incluyó una URL válida.');
      }

      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Error inesperado iniciando checkout.';
      setCheckoutNotice(message);
      setCheckoutNoticeTone('error');
      setIsStartingCheckoutByLayerId(null);
    }
  }, []);

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
      const supabase = getSupabaseClient();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (sessionError || !accessToken) {
        throw new Error('Necesitas iniciar sesión para continuar con el pago.');
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/payments/checkout-session`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          productId,
          successUrl: buildSettingsReturnUrl('success', productId, lessonId),
          cancelUrl: buildSettingsReturnUrl('cancel', productId, lessonId),
        }),
      });

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response));
      }

      const payload = await response.json() as CheckoutSessionResponse;

      if (!payload.checkoutUrl || typeof payload.checkoutUrl !== 'string') {
        throw new Error('La respuesta de checkout no incluyó una URL válida.');
      }

      window.location.assign(payload.checkoutUrl);
    } catch (checkoutError) {
      const message = checkoutError instanceof Error ? checkoutError.message : 'Error inesperado iniciando checkout.';
      setCheckoutNotice(message);
      setCheckoutNoticeTone('error');
      setIsStartingMethodCheckout(false);
    }
  }, [methodCheckoutTarget]);

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

    const lessonId = parsePositiveInteger(query.get('lessonId'));
    const productId = parsePositiveInteger(query.get('productId'));

    if (!lessonId || !productId || !authUser) {
      setCheckoutNotice('Pago recibido. Estamos actualizando tus accesos.');
      setCheckoutNoticeTone('info');
      setRoadmapRefreshKey((current) => current + 1);
      navigate('/dashboard/ajustes', { replace: true });
      return;
    }

    let isCancelled = false;
    let timerId: number | null = null;

    const waitForAccessActivation = async () => {
      setCheckoutNotice('Pago recibido, activando acceso...');
      setCheckoutNoticeTone('info');

      const backendUrl = getBackendUrl();
      const userId = getAccessUserId(authUser);

      for (let attempt = 0; attempt < ACCESS_POLL_MAX_ATTEMPTS; attempt += 1) {
        try {
          const accessResponse = await fetch(
            `${backendUrl}/access/lessons/${lessonId}?userId=${encodeURIComponent(userId)}`,
            {
              headers: {
                Accept: 'application/json',
              },
            },
          );

          if (accessResponse.ok) {
            const payload = normalizeLessonAccess(await accessResponse.json());
            const hasEntitlement = Boolean(payload?.entitlement) || payload?.reason === 'entitled';
            const matchesProduct = hasEntitlement && payload?.products.some((product) => product.id === productId);

            if (hasEntitlement || matchesProduct) {
              if (isCancelled) {
                return;
              }

              setCheckoutNotice('Acceso activado correctamente.');
              setCheckoutNoticeTone('success');
              setRoadmapRefreshKey((current) => current + 1);
              navigate('/dashboard/ajustes', { replace: true });
              return;
            }
          }
        } catch {
          // Reintentamos en el siguiente ciclo.
        }

        await new Promise<void>((resolve) => {
          timerId = window.setTimeout(() => {
            timerId = null;
            resolve();
          }, ACCESS_POLL_INTERVAL_MS);
        });

        if (isCancelled) {
          return;
        }
      }

      if (isCancelled) {
        return;
      }

      setCheckoutNotice('El pago se registró, pero el acceso tarda más de lo normal. Recarga en unos segundos.');
      setCheckoutNoticeTone('error');
      setRoadmapRefreshKey((current) => current + 1);
      navigate('/dashboard/ajustes', { replace: true });
    };

    void waitForAccessActivation();

    return () => {
      isCancelled = true;
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
    };
  }, [authUser, location.search, navigate]);

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
    layerPlanPrice: `${layerPricingPlan?.price ?? '1'} €`,
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


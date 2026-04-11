import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getFriendlyRequestErrorMessage,
} from '../../../api/core/backendClient';
import {
  cancelSubscription,
  createCheckoutSession,
  reactivateSubscription,
} from '../../../api/services/paymentsService';
import { useAuthSession } from '../../../shared/auth/AuthSessionContext';
import { useDashboardCatalog } from '../../portal-shell/context/DashboardCatalogContext';
import type { Product } from '../../roadmap/types';
import { createTelegramLinkToken, loadTelegramVipStatus } from '../services/telegramVipService';
import type {
  TelegramGroupInfo,
  TelegramInviteStatus,
  TelegramMeResponse,
} from '../types';

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

const getGroupInfoFromStatus = (status: TelegramMeResponse | null): TelegramGroupInfo | null => {
  if (!status) {
    return null;
  }

  return {
    configured: status.group?.configured ?? status.bot.configured ?? false,
    memberCount: status.group?.memberCount ?? status.groupMemberCount ?? null,
    memberCountUpdatedAt: status.group?.memberCountUpdatedAt ?? null,
    recentActivityAt: status.group?.recentActivityAt ?? status.recentActivityAt ?? null,
  };
};

const getInviteStatusLabel = (status: TelegramInviteStatus | null) => {
  if (status === 'joined') {
    return 'Dentro del grupo';
  }

  if (status === 'invited') {
    return 'Invitacion enviada';
  }

  if (status === 'removed') {
    return 'Acceso eliminado';
  }

  if (status === 'left') {
    return 'Saliste del grupo';
  }

  if (status === 'blocked_bot') {
    return 'Bot bloqueado';
  }

  return 'Sin vincular';
};

const getPrimaryMessage = (status: TelegramMeResponse | null) => {
  if (!status) {
    return 'No hemos podido cargar tu estado de Telegram VIP todavia.';
  }

  if (!status.activeSubscription) {
    return 'Tu cuenta de Telegram puede vincularse ahora, pero solo recibiras acceso al grupo cuando actives una suscripcion.';
  }

  if (!status.telegram) {
    return 'Conecta tu Telegram para que el bot te envie la invitacion al grupo privado.';
  }

  if (status.telegram.inviteStatus === 'joined') {
    return 'Ya tienes acceso al grupo privado de Telegram.';
  }

  if (status.telegram.inviteStatus === 'removed' || status.telegram.inviteStatus === 'left') {
    return 'Tu acceso al grupo no esta activo actualmente.';
  }

  return 'Tu Telegram ya esta vinculado. Revisa el mensaje directo del bot.';
};

const getShouldUseDirectNavigation = () => (
  typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
);

export type TelegramPricingPlanKey = 'mensual' | 'trimestral' | 'anual';

interface TelegramPricingPlan {
  key: TelegramPricingPlanKey;
  name: string;
  priceLabel: string;
  periodLabel: string;
  features: string[];
  productId: number | null;
  isAvailable: boolean;
  isHighlight: boolean;
}

interface TelegramPricingPlanDefault {
  key: TelegramPricingPlanKey;
  name: string;
  priceLabel: string;
  periodLabel: string;
  features: string[];
  isHighlight: boolean;
}

const TELEGRAM_PLAN_DEFAULTS: TelegramPricingPlanDefault[] = [
  {
    key: 'mensual',
    name: 'Plan Mensual',
    priceLabel: '15€',
    periodLabel: '/mes',
    features: ['Picks diarios en Telegram', 'Gestion de stake recomendada', 'Acceso inmediato al grupo'],
    isHighlight: true,
  },
  {
    key: 'trimestral',
    name: 'Plan Trimestral',
    priceLabel: '39€',
    periodLabel: '/3 meses',
    features: ['Ahorro frente al mensual', 'Misma estrategia y flujo diario', 'Seguimiento continuo de resultados'],
    isHighlight: false,
  },
  {
    key: 'anual',
    name: 'Plan Anual',
    priceLabel: '129€',
    periodLabel: '/12 meses',
    features: ['Mejor precio por mes', 'Acceso completo todo el ano', 'Prioridad en nuevas mejoras'],
    isHighlight: false,
  },
];

const TELEGRAM_PLAN_PREFERRED_PRODUCT_IDS: Record<TelegramPricingPlanKey, number[]> = {
  mensual: [7],
  trimestral: [10],
  anual: [11],
};

const TELEGRAM_PRODUCT_KEYWORDS = ['telegram', 'grupo', 'vip', 'valuebet', 'valuebets', 'grupoapuestas'];

const TELEGRAM_PLAN_INTERVAL_KEYWORDS: Record<TelegramPricingPlanKey, string[]> = {
  mensual: ['mensual', 'month', 'monthly', '1 mes', '1 month', '1m'],
  trimestral: ['trimestral', 'trimestre', 'quarter', 'quarterly', '3 meses', '3 months', '3m'],
  anual: ['anual', 'year', 'yearly', '12 meses', '12 months', '12m'],
};

const getPlanKeyByProductId = (productId: number | null): TelegramPricingPlanKey | null => {
  if (productId === null) {
    return null;
  }

  for (const [planKey, preferredIds] of Object.entries(TELEGRAM_PLAN_PREFERRED_PRODUCT_IDS) as Array<[TelegramPricingPlanKey, number[]]>) {
    if (preferredIds.includes(productId)) {
      return planKey;
    }
  }

  return null;
};

const getActiveSubscriptionProductId = (status: TelegramMeResponse | null): number | null => {
  if (!status?.activeSubscription) {
    return null;
  }

  const subscriptionProductId = status.subscription?.productId ?? status.subscription?.product_id ?? null;
  const rootProductId = status.productId ?? status.product_id ?? null;
  const rawProductId = subscriptionProductId ?? rootProductId;

  if (typeof rawProductId !== 'number' || !Number.isFinite(rawProductId)) {
    return null;
  }

  return rawProductId;
};

const getActiveSubscriptionPlanKey = (status: TelegramMeResponse | null): TelegramPricingPlanKey | null => {
  const activeSubscriptionProductId = getActiveSubscriptionProductId(status);
  return getPlanKeyByProductId(activeSubscriptionProductId);
};

const normalizeSearchValue = (value: string) => (
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
);

const getProductSearchText = (product: Product) =>
  normalizeSearchValue(`${product.code} ${product.name}`);

const findPreferredProduct = (products: Product[], planKey: TelegramPricingPlanKey) => {
  const preferredIds = TELEGRAM_PLAN_PREFERRED_PRODUCT_IDS[planKey];
  return products.find((product) => preferredIds.includes(product.id)) ?? null;
};

const matchesAnyKeyword = (text: string, keywords: string[]) => (
  keywords.some((keyword) => text.includes(keyword))
);

const buildTelegramPricingPlans = (products: Product[]): TelegramPricingPlan[] => {
  const activeProducts = products.filter((product) => product.is_active);
  const searchableProducts = activeProducts.map((product) => ({
    product,
    searchText: getProductSearchText(product),
  }));

  const telegramTaggedProducts = searchableProducts.filter(({ searchText }) =>
    matchesAnyKeyword(searchText, TELEGRAM_PRODUCT_KEYWORDS),
  );
  const candidateProducts = telegramTaggedProducts.length > 0 ? telegramTaggedProducts : searchableProducts;

  const fallbackProduct =
    findPreferredProduct(activeProducts, 'mensual')
    ?? candidateProducts[0]?.product
    ?? activeProducts[0]
    ?? null;

  return TELEGRAM_PLAN_DEFAULTS.map((planDefault) => {
    const preferredProduct = findPreferredProduct(activeProducts, planDefault.key);
    const keywordMatchedProduct = candidateProducts.find(({ searchText }) =>
      matchesAnyKeyword(searchText, TELEGRAM_PLAN_INTERVAL_KEYWORDS[planDefault.key]),
    )?.product ?? null;

    const planProduct = preferredProduct ?? keywordMatchedProduct ?? fallbackProduct;

    return {
      ...planDefault,
      productId: planProduct?.id ?? null,
      isAvailable: Boolean(planProduct),
    };
  });
};

export const useGrupoApuestasLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authReady, isAuthenticated, session } = useAuthSession();
  const {
    products,
    refreshDashboardCatalog,
    isLoading: isDashboardCatalogLoading,
  } = useDashboardCatalog();
  const [status, setStatus] = useState<TelegramMeResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpeningBot, setIsOpeningBot] = useState(false);
  const [activeCheckoutPlanKey, setActiveCheckoutPlanKey] = useState<TelegramPricingPlanKey | null>(null);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);
  const [isReactivatingSubscription, setIsReactivatingSubscription] = useState(false);

  const accessToken = session?.access_token ?? null;
  const sessionKey = session?.user.id ?? null;

  const loadStatus = useCallback(async (isManualRefresh = false) => {
    if (!accessToken) {
      setStatus(null);
      setStatusError('No se ha encontrado una sesión valida para consultar Telegram VIP.');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setStatusError(null);

    try {
      const nextStatus = await loadTelegramVipStatus(accessToken, {
        sessionKey,
        forceRefresh: isManualRefresh,
      });
      setStatus(nextStatus.status);
    } catch (error) {
      setStatusError(
        getFriendlyRequestErrorMessage(
          error,
          'No se pudo cargar el estado de Telegram VIP.',
        ),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken, sessionKey]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      setStatus(null);
      setStatusError('Necesitas iniciar sesión para gestionar tu vinculacion con Telegram.');
      setIsLoading(false);
      return;
    }

    void loadStatus();
  }, [authReady, isAuthenticated, loadStatus]);

  const subscriptionPricingPlans = useMemo(
    () => buildTelegramPricingPlans(products),
    [products],
  );
  const isStartingSubscriptionCheckout = activeCheckoutPlanKey !== null;
  const isPageLoading = isLoading || isDashboardCatalogLoading;

  const hasActiveSubscription = Boolean(status?.activeSubscription);
  const activeSubscriptionPlanKey = useMemo(
    () => getActiveSubscriptionPlanKey(status),
    [status],
  );
  const isSubscriptionCancelAtPeriodEnd = Boolean(
    status?.cancelAtPeriodEnd ?? status?.subscription?.cancelAtPeriodEnd ?? false,
  );
  const groupInfo = useMemo(() => getGroupInfoFromStatus(status), [status]);
  const isGroupConfigured = groupInfo?.configured ?? false;
  const groupMemberCountLabel = useMemo(() => {
    if (groupInfo?.memberCount === null || groupInfo?.memberCount === undefined) {
      return 'No disponible';
    }

    return groupInfo.memberCount.toLocaleString('es-ES');
  }, [groupInfo]);
  const groupMemberCountUpdatedAtLabel = formatDateTime(groupInfo?.memberCountUpdatedAt ?? null);
  const groupRecentActivityAtLabel = formatDateTime(groupInfo?.recentActivityAt ?? null);
  const isLinked = Boolean(status?.telegram);
  const hasJoinedGroup = status?.telegram?.inviteStatus === 'joined';

  const handleCancelSubscription = useCallback(async () => {
    setActionError(null);
    setActionNotice(null);

    if (!hasActiveSubscription) {
      setActionError('No hay una suscripcion activa para cancelar en este momento.');
      return;
    }

    setIsCancellingSubscription(true);

    try {
      await cancelSubscription();
      setActionNotice('Suscripcion cancelada. Estamos actualizando el estado de tu acceso.');
      refreshDashboardCatalog();
      await loadStatus(true);
    } catch (error) {
      setActionError(
        getFriendlyRequestErrorMessage(error, 'No se pudo cancelar la suscripcion.'),
      );
    } finally {
      setIsCancellingSubscription(false);
    }
  }, [hasActiveSubscription, loadStatus, refreshDashboardCatalog]);

  const handleReactivateSubscription = useCallback(async () => {
    setActionError(null);
    setActionNotice(null);

    if (!hasActiveSubscription) {
      setActionError('No hay una suscripcion activa para reactivar en este momento.');
      return;
    }

    if (!isSubscriptionCancelAtPeriodEnd) {
      setActionNotice('Tu suscripcion ya esta activa y sin baja programada.');
      return;
    }

    setIsReactivatingSubscription(true);

    try {
      await reactivateSubscription();
      setActionNotice('Suscripcion reactivada. Estamos actualizando el estado de tu acceso.');
      refreshDashboardCatalog();
      await loadStatus(true);
    } catch (error) {
      setActionError(
        getFriendlyRequestErrorMessage(error, 'No se pudo reactivar la suscripcion.'),
      );
    } finally {
      setIsReactivatingSubscription(false);
    }
  }, [hasActiveSubscription, isSubscriptionCancelAtPeriodEnd, loadStatus, refreshDashboardCatalog]);

  const handleStartSubscriptionCheckout = useCallback(async (planKey: TelegramPricingPlanKey) => {
    if (hasActiveSubscription) {
      setActionError('Ya tienes una suscripcion activa. Cancela la cuota actual para cambiar de plan.');
      return;
    }

    setActionError(null);
    setActionNotice(null);

    const targetPlan = subscriptionPricingPlans.find((plan) => plan.key === planKey) ?? null;
    const targetProductId = targetPlan?.productId ?? null;

    if (!targetProductId) {
      setActionError('No hemos encontrado el producto de suscripcion para iniciar el checkout.');
      return;
    }

    const returnUrl = new URL('/dashboard/grupo-apuestas', window.location.origin);
    returnUrl.searchParams.set('checkout', 'success');
    returnUrl.searchParams.set('plan', planKey);
    returnUrl.searchParams.set('productId', String(targetProductId));

    const cancelUrl = new URL('/dashboard/grupo-apuestas', window.location.origin);
    cancelUrl.searchParams.set('checkout', 'cancel');
    cancelUrl.searchParams.set('plan', planKey);
    cancelUrl.searchParams.set('productId', String(targetProductId));

    setActiveCheckoutPlanKey(planKey);

    try {
      const checkoutUrl = await createCheckoutSession({
        productId: targetProductId,
        successUrl: returnUrl.toString(),
        cancelUrl: cancelUrl.toString(),
      });

      window.location.assign(checkoutUrl);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'No se pudo iniciar el checkout de la suscripcion.',
      );
      setActiveCheckoutPlanKey(null);
    }
  }, [hasActiveSubscription, subscriptionPricingPlans]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const checkoutState = query.get('checkout');

    if (checkoutState !== 'success' && checkoutState !== 'cancel') {
      return;
    }

    if (checkoutState === 'cancel') {
      setActionNotice('Compra cancelada. Puedes volver a intentarlo cuando quieras.');
      setActiveCheckoutPlanKey(null);
      navigate('/dashboard/grupo-apuestas', { replace: true });
      return;
    }

    setActionNotice('Pago recibido. Actualizando el estado de tu suscripcion...');
    setActiveCheckoutPlanKey(null);
    refreshDashboardCatalog();
    void loadStatus(true);
    navigate('/dashboard/grupo-apuestas', { replace: true });
  }, [location.search, loadStatus, navigate, refreshDashboardCatalog]);

  const handleOpenBot = useCallback(async () => {
    if (!accessToken) {
      setActionError('No se ha encontrado una sesión valida para abrir el bot.');
      return;
    }

    setActionError(null);
    setActionNotice(null);
    setIsOpeningBot(true);

    try {
      const payload = await createTelegramLinkToken(accessToken);

      if (!payload.botStartUrl) {
        setActionError('El bot de Telegram no esta configurado todavia. Intentalo de nuevo mas tarde.');
        return;
      }

      if (getShouldUseDirectNavigation()) {
        window.location.assign(payload.botStartUrl);
        return;
      }

      window.open(payload.botStartUrl, '_blank', 'noopener,noreferrer');
      setActionNotice(payload.note);
      await loadStatus(true);
    } catch (error) {
      setActionError(
        getFriendlyRequestErrorMessage(
          error,
          'No se pudo iniciar la vinculacion con Telegram.',
        ),
      );
    } finally {
      setIsOpeningBot(false);
    }
  }, [accessToken, loadStatus]);

  const primaryButtonLabel = status?.telegram
    ? 'Grupo Abierto'
    : 'Conectar Telegram';

  const primaryMessage = useMemo(() => getPrimaryMessage(status), [status]);

  return {
    isPageLoading,
    isLoading,
    isRefreshing,
    isOpeningBot,
    statusError,
    actionError,
    actionNotice,
    primaryButtonLabel,
    primaryMessage,
    linkedTelegramLabel: status?.telegram
      ? status.telegram.telegramUsername
        ? `@${status.telegram.telegramUsername}`
        : 'Conectado sin username publico'
      : 'No conectado',
    inviteStatusLabel: getInviteStatusLabel(status?.telegram?.inviteStatus ?? null),
    activeSubscriptionLabel: status?.activeSubscription ? 'Activa' : 'Inactiva',
    subscriptionPricingPlans,
    activeCheckoutPlanKey,
    isGroupConfigured,
    groupMemberCountLabel,
    groupMemberCountUpdatedAtLabel,
    groupRecentActivityAtLabel,
    linkedAtLabel: formatDateTime(status?.telegram?.linkedAt ?? null),
    botUsernameLabel: status?.bot.botUsername ? `@${status.bot.botUsername}` : 'No disponible',
    isBotConfigured: status?.bot.configured ?? false,
    isLinked,
    hasActiveSubscription,
    activeSubscriptionPlanKey,
    isSubscriptionCancelAtPeriodEnd,
    hasJoinedGroup,
    isStartingSubscriptionCheckout,
    isCancellingSubscription,
    isReactivatingSubscription,
    shouldShowPendingNotice:
      status?.telegram?.inviteStatus === 'invited'
      || status?.telegram?.inviteStatus === 'blocked_bot',
    shouldShowInactiveAccessNotice:
      status?.telegram?.inviteStatus === 'removed'
      || status?.telegram?.inviteStatus === 'left',
    handleCancelSubscription,
    handleReactivateSubscription,
    handleStartSubscriptionCheckout,
    handleRetryLoad: () => void loadStatus(true),
    handleOpenBot,
  };
};

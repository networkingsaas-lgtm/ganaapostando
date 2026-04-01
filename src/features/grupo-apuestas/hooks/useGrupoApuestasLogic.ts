import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getBackendApiBaseUrl,
  getFriendlyRequestErrorMessage,
} from '../../../api/core/backendClient';
import { cancelSubscription, createCheckoutSession } from '../../../api/services/paymentsService';
import { useAuthSession } from '../../../shared/auth/AuthSessionContext';
import { useDashboardCatalog } from '../../portal-shell/context/DashboardCatalogContext';
import { ROADMAP_CACHE_TTL_MS, ROADMAP_CACHE_VERSION } from '../../roadmap/constants';
import { formatPriceEur } from '../../roadmap/utils';
import { createTelegramLinkToken, fetchTelegramVipStatus } from '../services/telegramVipService';
import type { TelegramInviteStatus, TelegramMeResponse } from '../types';

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

const TELEGRAM_VIP_STATUS_CACHE_KEY_PREFIX = 'telegram-vip-status-cache';
const TELEGRAM_VIP_STATUS_SESSION_KEY_ANON = 'anon';

interface TelegramVipStatusCachePayload {
  version: number;
  savedAt: number;
  status: TelegramMeResponse;
}

interface TelegramVipStatusCacheLookup {
  status: TelegramMeResponse | null;
  isFresh: boolean;
}

const telegramVipStatusMemoryCache = new Map<string, TelegramVipStatusCachePayload>();

const getTelegramVipStatusCacheKey = (backendUrl: string, sessionKey: string) =>
  `${TELEGRAM_VIP_STATUS_CACHE_KEY_PREFIX}:${backendUrl}:${sessionKey}`;

const getLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isValidTelegramVipStatus = (value: unknown): value is TelegramMeResponse => (
  isRecord(value) && typeof value.activeSubscription === 'boolean'
);

const isValidTelegramVipStatusCachePayload = (
  value: unknown,
): value is TelegramVipStatusCachePayload => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === ROADMAP_CACHE_VERSION
    && typeof value.savedAt === 'number'
    && isValidTelegramVipStatus(value.status)
  );
};

const readTelegramVipStatusCache = (cacheKey: string): TelegramVipStatusCacheLookup => {
  const now = Date.now();
  const cachedInMemory = telegramVipStatusMemoryCache.get(cacheKey);

  if (cachedInMemory) {
    return {
      status: cachedInMemory.status,
      isFresh: now - cachedInMemory.savedAt <= ROADMAP_CACHE_TTL_MS,
    };
  }

  const storage = getLocalStorage();

  if (!storage) {
    return {
      status: null,
      isFresh: false,
    };
  }

  const rawValue = storage.getItem(cacheKey);

  if (!rawValue) {
    return {
      status: null,
      isFresh: false,
    };
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isValidTelegramVipStatusCachePayload(parsedValue)) {
      storage.removeItem(cacheKey);
      return {
        status: null,
        isFresh: false,
      };
    }

    telegramVipStatusMemoryCache.set(cacheKey, parsedValue);

    return {
      status: parsedValue.status,
      isFresh: now - parsedValue.savedAt <= ROADMAP_CACHE_TTL_MS,
    };
  } catch {
    storage.removeItem(cacheKey);
    return {
      status: null,
      isFresh: false,
    };
  }
};

const writeTelegramVipStatusCache = (cacheKey: string, status: TelegramMeResponse) => {
  const payload: TelegramVipStatusCachePayload = {
    version: ROADMAP_CACHE_VERSION,
    savedAt: Date.now(),
    status,
  };

  telegramVipStatusMemoryCache.set(cacheKey, payload);

  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(cacheKey, JSON.stringify(payload));
  } catch {
    // Ignoramos errores de cuota o permisos de storage.
  }
};

export const useGrupoApuestasLogic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authReady, isAuthenticated, session } = useAuthSession();
  const { products, refreshDashboardCatalog } = useDashboardCatalog();
  const [status, setStatus] = useState<TelegramMeResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpeningBot, setIsOpeningBot] = useState(false);
  const [isStartingSubscriptionCheckout, setIsStartingSubscriptionCheckout] = useState(false);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);

  const accessToken = session?.access_token ?? null;
  const cacheKey = useMemo(
    () => getTelegramVipStatusCacheKey(
      getBackendApiBaseUrl(),
      session?.user.id ?? TELEGRAM_VIP_STATUS_SESSION_KEY_ANON,
    ),
    [session?.user.id],
  );

  const loadStatus = useCallback(async (isManualRefresh = false) => {
    if (!accessToken) {
      setStatus(null);
      setStatusError('No se ha encontrado una sesion valida para consultar Telegram VIP.');
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
    let staleStatus: TelegramMeResponse | null = null;

    try {
      const cachedLookup = readTelegramVipStatusCache(cacheKey);

      if (cachedLookup.status && cachedLookup.isFresh && !isManualRefresh) {
        setStatus(cachedLookup.status);
        return;
      }

      staleStatus = cachedLookup.status;
      const nextStatus = await fetchTelegramVipStatus(accessToken);
      setStatus(nextStatus);
      writeTelegramVipStatusCache(cacheKey, nextStatus);
    } catch (error) {
      if (staleStatus) {
        setStatus(staleStatus);
        return;
      }

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
  }, [accessToken, cacheKey]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      setStatus(null);
      setStatusError('Necesitas iniciar sesion para gestionar tu vinculacion con Telegram.');
      setIsLoading(false);
      return;
    }

    void loadStatus();
  }, [authReady, isAuthenticated, loadStatus]);

  const subscriptionProduct = useMemo(
    () => products.find((product) => product.id === 7) ?? null,
    [products],
  );

  const subscriptionProductPriceLabel = useMemo(() => {
    return subscriptionProduct ? formatPriceEur(subscriptionProduct.price_eur) : 'No disponible';
  }, [subscriptionProduct]);

  const hasActiveSubscription = Boolean(status?.activeSubscription);
  const subscriptionExpiresAtLabel = useMemo(() => {
    if (!hasActiveSubscription) {
      return null;
    }

    return formatDateTime(
      status?.subscriptionExpiresAt
      ?? status?.entitlementEndsAt
      ?? status?.endsAt
      ?? status?.expiresAt
      ?? null,
    );
  }, [hasActiveSubscription, status]);
  const isLinked = Boolean(status?.telegram);
  const hasJoinedGroup = status?.telegram?.inviteStatus === 'joined';

  const handleSubscriptionAction = useCallback(async () => {
    setActionError(null);
    setActionNotice(null);

    if (hasActiveSubscription) {
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

      return;
    }

    if (!subscriptionProduct) {
      setActionError('No hemos encontrado el producto de suscripcion para iniciar el checkout.');
      return;
    }

    const returnUrl = new URL('/dashboard/grupo-apuestas', window.location.origin);
    returnUrl.searchParams.set('checkout', 'success');

    const cancelUrl = new URL('/dashboard/grupo-apuestas', window.location.origin);
    cancelUrl.searchParams.set('checkout', 'cancel');

    setIsStartingSubscriptionCheckout(true);

    try {
      const checkoutUrl = await createCheckoutSession({
        productId: subscriptionProduct.id,
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
      setIsStartingSubscriptionCheckout(false);
    }
  }, [hasActiveSubscription, loadStatus, refreshDashboardCatalog, subscriptionProduct]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const checkoutState = query.get('checkout');

    if (checkoutState !== 'success' && checkoutState !== 'cancel') {
      return;
    }

    if (checkoutState === 'cancel') {
      setActionNotice('Compra cancelada. Puedes volver a intentarlo cuando quieras.');
      setIsStartingSubscriptionCheckout(false);
      navigate('/dashboard/grupo-apuestas', { replace: true });
      return;
    }

    setActionNotice('Pago recibido. Actualizando el estado de tu suscripcion...');
    setIsStartingSubscriptionCheckout(false);
    refreshDashboardCatalog();
    void loadStatus(true);
    navigate('/dashboard/grupo-apuestas', { replace: true });
  }, [location.search, loadStatus, navigate, refreshDashboardCatalog]);

  const handleOpenBot = useCallback(async () => {
    if (!accessToken) {
      setActionError('No se ha encontrado una sesion valida para abrir el bot.');
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
    subscriptionProductName: subscriptionProduct?.name ?? 'Suscripcion Telegram',
    subscriptionProductPriceLabel,
    subscriptionExpiresAtLabel,
    linkedAtLabel: formatDateTime(status?.telegram?.linkedAt ?? null),
    botUsernameLabel: status?.bot.botUsername ? `@${status.bot.botUsername}` : 'No disponible',
    isBotConfigured: status?.bot.configured ?? false,
    isLinked,
    hasActiveSubscription,
    hasJoinedGroup,
    isStartingSubscriptionCheckout,
    isCancellingSubscription,
    shouldShowPendingNotice:
      status?.telegram?.inviteStatus === 'invited'
      || status?.telegram?.inviteStatus === 'blocked_bot',
    shouldShowInactiveAccessNotice:
      status?.telegram?.inviteStatus === 'removed'
      || status?.telegram?.inviteStatus === 'left',
    handleSubscriptionAction,
    handleRetryLoad: () => void loadStatus(true),
    handleOpenBot,
  };
};

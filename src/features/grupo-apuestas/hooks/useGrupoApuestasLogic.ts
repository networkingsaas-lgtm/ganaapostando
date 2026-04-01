import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../../../api/services/paymentsService';
import { getFriendlyRequestErrorMessage } from '../../../api/core/backendClient';
import { useAuthSession } from '../../../shared/auth/AuthSessionContext';
import { useDashboardCatalog } from '../../portal-shell/context/DashboardCatalogContext';
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
    return 'Tu cuenta de Telegram puede vincularse ahora, pero solo recibirás acceso al grupo cuando actives una suscripción.';
  }

  if (!status.telegram) {
    return 'Conecta tu Telegram para que el bot te envíe la invitación al grupo privado.';
  }

  if (status.telegram.inviteStatus === 'joined') {
    return 'Ya tienes acceso al grupo privado de Telegram.';
  }

  if (status.telegram.inviteStatus === 'removed' || status.telegram.inviteStatus === 'left') {
    return 'Tu acceso al grupo no está activo actualmente.';
  }

  return 'Tu Telegram ya está vinculado. Revisa el mensaje directo del bot.';
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

  const accessToken = session?.access_token ?? null;

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

    try {
      const nextStatus = await fetchTelegramVipStatus(accessToken);
      setStatus(nextStatus);
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
  }, [accessToken]);

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
  const isLinked = Boolean(status?.telegram);
  const hasJoinedGroup = status?.telegram?.inviteStatus === 'joined';

  const handleOpenSubscription = useCallback(async () => {
    if (hasActiveSubscription) {
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

    setActionError(null);
    setActionNotice(null);
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
  }, [hasActiveSubscription, subscriptionProduct]);

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
        setActionError('El bot de Telegram no está configurado todavía. Inténtalo de nuevo más tarde.');
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
    ? 'Volver a abrir bot'
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
    linkedAtLabel: formatDateTime(status?.telegram?.linkedAt ?? null),
    botUsernameLabel: status?.bot.botUsername ? `@${status.bot.botUsername}` : 'No disponible',
    isBotConfigured: status?.bot.configured ?? false,
    isLinked,
    hasActiveSubscription,
    hasJoinedGroup,
    isStartingSubscriptionCheckout,
    shouldShowPendingNotice:
      status?.telegram?.inviteStatus === 'invited'
      || status?.telegram?.inviteStatus === 'blocked_bot',
    shouldShowInactiveAccessNotice:
      status?.telegram?.inviteStatus === 'removed'
      || status?.telegram?.inviteStatus === 'left',
    handleOpenSubscription,
    handleRetryLoad: () => void loadStatus(true),
    handleOpenBot,
  };
};

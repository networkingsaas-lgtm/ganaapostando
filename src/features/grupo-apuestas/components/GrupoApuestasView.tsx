import {
  Check,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Link2,
  Lock,
  LoaderCircle,
  MessageSquare,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';
import AppModal from '../../../shared/components/AppModal';

type SubscriptionPlanKey = 'mensual' | 'trimestral' | 'anual';

interface SubscriptionPricingPlan {
  key: SubscriptionPlanKey;
  name: string;
  priceLabel: string;
  periodLabel: string;
  features: string[];
  productId: number | null;
  isAvailable: boolean;
  isHighlight: boolean;
}

interface Props {
  isLoading: boolean;
  isOpeningBot: boolean;
  isStartingSubscriptionCheckout: boolean;
  activeCheckoutPlanKey: SubscriptionPlanKey | null;
  isCancellingSubscription: boolean;
  isReactivatingSubscription: boolean;
  isSubscriptionCancelAtPeriodEnd: boolean;
  statusError: string | null;
  actionError: string | null;
  actionNotice: string | null;
  primaryButtonLabel: string;
  subscriptionPricingPlans: SubscriptionPricingPlan[];
  isBotConfigured: boolean;
  isGroupConfigured: boolean;
  groupMemberCountLabel: string;
  groupMemberCountUpdatedAtLabel: string;
  groupRecentActivityAtLabel: string;
  isLinked: boolean;
  hasActiveSubscription: boolean;
  activeSubscriptionPlanKey: SubscriptionPlanKey | null;
  hasJoinedGroup: boolean;
  shouldShowPendingNotice: boolean;
  shouldShowInactiveAccessNotice: boolean;
  handleCancelSubscription: () => void;
  handleReactivateSubscription: () => Promise<void>;
  handleStartSubscriptionCheckout: (planKey: SubscriptionPlanKey) => void;
  handleOpenBot: () => void;
}

const CANCEL_CONFIRM_CLOSE_MS = 200;

const WizardArrowButton = ({
  direction,
  disabled,
  onClick,
  className = '',
}: {
  direction: 'back' | 'forward';
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${
      disabled
        ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300'
        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    } ${className}`}
    aria-label={direction === 'back' ? 'Volver al paso anterior' : 'Ir al siguiente paso'}
  >
    {direction === 'back' ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
  </button>
);

const GrupoApuestasView: FC<Props> = ({
  isLoading,
  isOpeningBot,
  isStartingSubscriptionCheckout,
  activeCheckoutPlanKey,
  isCancellingSubscription,
  isReactivatingSubscription,
  isSubscriptionCancelAtPeriodEnd,
  statusError,
  actionError,
  actionNotice,
  primaryButtonLabel,
  subscriptionPricingPlans,
  isBotConfigured,
  groupMemberCountLabel,
  groupMemberCountUpdatedAtLabel,
  groupRecentActivityAtLabel,
  isLinked,
  hasActiveSubscription,
  activeSubscriptionPlanKey,
  hasJoinedGroup,
  shouldShowPendingNotice,
  shouldShowInactiveAccessNotice,
  handleCancelSubscription,
  handleReactivateSubscription,
  handleStartSubscriptionCheckout,
  handleOpenBot,
}) => {
  const isSubscriptionStepDone = hasActiveSubscription;
  const isTelegramStepDone = hasActiveSubscription && hasJoinedGroup;
  const isFullyVerified = hasActiveSubscription && hasJoinedGroup;
  const [showDelayedLoadingNotice, setShowDelayedLoadingNotice] = useState(false);
  const [visibleStep, setVisibleStep] = useState<2 | 3 | 'done'>(
    isFullyVerified ? 'done' : hasActiveSubscription ? 3 : 2,
  );
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelConfirmClosing, setCancelConfirmClosing] = useState(false);
  const cancelConfirmTimeoutRef = useRef<number | null>(null);
  const shouldShowTelegramCard = hasActiveSubscription;
  const shouldShowTelegramSuccess = hasActiveSubscription && hasJoinedGroup;
  const isTelegramButtonDisabled = isLoading || isOpeningBot || isLinked;
  const canGoBack = visibleStep === 3 || visibleStep === 'done';
  const canGoForward =
    (visibleStep === 2 && isSubscriptionStepDone)
    || (visibleStep === 3 && isTelegramStepDone);
  const progressPercentage = visibleStep === 2 ? 33 : visibleStep === 3 ? 66 : 100;
  const recentActivityTimeLabel = groupRecentActivityAtLabel === 'No disponible'
    ? groupRecentActivityAtLabel
    : groupRecentActivityAtLabel.match(/(\d{1,2}:\d{2})/)?.[1] ?? groupRecentActivityAtLabel;

  useEffect(() => {
    return () => {
      if (cancelConfirmTimeoutRef.current !== null) {
        window.clearTimeout(cancelConfirmTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setShowDelayedLoadingNotice(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowDelayedLoadingNotice(true);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  useEffect(() => {
    if (isFullyVerified) {
      setVisibleStep('done');
      return;
    }

    if (hasActiveSubscription) {
      setVisibleStep(3);
      return;
    }

    setVisibleStep(2);
  }, [hasActiveSubscription, isFullyVerified]);

  useEffect(() => {
    if (!hasActiveSubscription && cancelConfirmOpen) {
      setCancelConfirmOpen(false);
      setCancelConfirmClosing(false);
      if (cancelConfirmTimeoutRef.current !== null) {
        window.clearTimeout(cancelConfirmTimeoutRef.current);
        cancelConfirmTimeoutRef.current = null;
      }
    }
  }, [cancelConfirmOpen, hasActiveSubscription]);

  const shouldShowBotConfigNotice = !isBotConfigured && (showDelayedLoadingNotice || Boolean(actionError));

  const openCancelConfirm = () => {
    if (cancelConfirmTimeoutRef.current !== null) {
      window.clearTimeout(cancelConfirmTimeoutRef.current);
      cancelConfirmTimeoutRef.current = null;
    }

    setCancelConfirmClosing(false);
    setCancelConfirmOpen(true);
  };

  const closeCancelConfirm = () => {
    if (isCancellingSubscription) {
      return;
    }

    setCancelConfirmClosing(true);
    cancelConfirmTimeoutRef.current = window.setTimeout(() => {
      setCancelConfirmOpen(false);
      setCancelConfirmClosing(false);
      cancelConfirmTimeoutRef.current = null;
    }, CANCEL_CONFIRM_CLOSE_MS);
  };

  const handleSubscriptionButtonClick = (planKey: SubscriptionPlanKey) => {
    if (hasActiveSubscription) {
      if (activeSubscriptionPlanKey !== planKey) {
        return;
      }

      if (isSubscriptionCancelAtPeriodEnd) {
        void handleReactivateSubscription();
        return;
      }

      openCancelConfirm();
      return;
    }

    handleStartSubscriptionCheckout(planKey);
  };

  const handleConfirmCancellation = () => {
    if (cancelConfirmTimeoutRef.current !== null) {
      window.clearTimeout(cancelConfirmTimeoutRef.current);
      cancelConfirmTimeoutRef.current = null;
    }

    setCancelConfirmOpen(false);
    setCancelConfirmClosing(false);
    handleCancelSubscription();
  };

  const handleGoBack = () => {
    if (visibleStep === 3) {
      setVisibleStep(2);
      return;
    }

    if (visibleStep === 'done') {
      setVisibleStep(3);
    }
  };

  const handleGoForward = () => {
    if (visibleStep === 2 && isSubscriptionStepDone) {
      setVisibleStep(3);
      return;
    }

    if (visibleStep === 3 && isTelegramStepDone) {
      setVisibleStep('done');
    }
  };

  const subscriptionCard = (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {subscriptionPricingPlans.map((plan) => {
          const isPlanCheckoutLoading = isStartingSubscriptionCheckout && activeCheckoutPlanKey === plan.key;
          const isPlanActiveSubscription = hasActiveSubscription
            && activeSubscriptionPlanKey === plan.key;
          const isPlanSubscriptionActionLoading = isPlanActiveSubscription
            && (isCancellingSubscription || isReactivatingSubscription);
          const isPlanDisabled = hasActiveSubscription
            ? (!isPlanActiveSubscription || isPlanSubscriptionActionLoading)
            : isCancellingSubscription
              || isReactivatingSubscription
              || ((isStartingSubscriptionCheckout && !isPlanCheckoutLoading) || !plan.isAvailable);

          return (
            <article
              key={plan.key}
              className={`relative flex h-full flex-col rounded-[1.5rem] border-4 p-5 shadow-[0_10px_22px_rgba(17,24,39,0.10)] sm:p-6 ${
                plan.isHighlight
                  ? 'border-blue-300 bg-[linear-gradient(180deg,#ffffff_0%,#f2f7ff_100%)]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {plan.isHighlight ? (
                <p className="inline-flex w-fit rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                  Más elegido
                </p>
              ) : null}

              <h2 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">{plan.name}</h2>

              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold leading-none text-gray-900 sm:text-4xl">{plan.priceLabel}</span>
                <span className="pb-1 text-sm text-gray-600">{plan.periodLabel}</span>
              </div>

              <ul className="mt-5 space-y-2 text-sm text-gray-700 sm:text-base">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSubscriptionButtonClick(plan.key)}
                disabled={isPlanDisabled}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition ${
                  hasActiveSubscription
                    ? isPlanActiveSubscription
                      ? isSubscriptionCancelAtPeriodEnd
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:text-white'
                        : 'bg-slate-300 text-slate-600 hover:bg-slate-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600'
                      : 'bg-slate-200 text-slate-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600'
                }`}
              >
                {isPlanCheckoutLoading || isPlanSubscriptionActionLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {hasActiveSubscription
                  ? isPlanActiveSubscription
                    ? isSubscriptionCancelAtPeriodEnd
                      ? (isReactivatingSubscription ? 'Reactivando...' : 'Reactivar suscripción')
                      : (isCancellingSubscription ? 'Dando de baja...' : 'Darse de baja')
                    : 'No contratado'
                  : isPlanCheckoutLoading
                    ? 'Redirigiendo...'
                    : plan.isAvailable
                      ? 'Comprar plan'
                      : 'No disponible'}
              </button>
            </article>
          );
        })}
      </div>

    </div>
  );

  const telegramCard = (
    <div className={`flex h-full flex-col rounded-[1.5rem] border-4 p-5 shadow-[0_8px_18px_rgba(17,24,39,0.04)] sm:p-6 ${
      !shouldShowTelegramCard
        ? 'border-[#e5e7eb] bg-white'
        : isLinked
          ? 'border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]'
          : 'border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfd_100%)]'
    }`}
    >
      {!shouldShowTelegramCard ? (
        <div className="flex min-h-[13.5rem] items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <Lock className="h-9 w-9" />
          </div>
        </div>
      ) : shouldShowTelegramSuccess ? (
        <div className="flex min-h-[13.5rem] items-center justify-center">
          <img
            src="/check.avif"
            alt="Telegram vinculado"
            className="h-28 w-28 object-contain sm:h-36 sm:w-36"
          />
        </div>
      ) : (
        <>
          <div className="flex min-h-[6.3rem] items-start justify-between gap-3">
            <div>
              <h2 className="mt-3 text-xl font-black text-slate-900">Vincular Telegram</h2>
              <p className="mt-2  text-sm leading-5 text-slate-600">
                Pulsa el botón y abre la invitación al grupo por Telegram.
              </p>
            </div>
            <div className="flex h-12 w-14 items-center justify-center rounded-2xl bg-white/90 p-2 shadow-[0_12px_28px_rgba(29,143,232,0.16)]">
              <img
                src="/telegramicono.avif"
                alt="Telegram"
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenBot}
            disabled={isTelegramButtonDisabled}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
              isTelegramButtonDisabled
                ? 'bg-slate-300 text-slate-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isOpeningBot ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className={`h-4 w-4 ${isTelegramButtonDisabled ? 'text-slate-600' : 'text-white'}`} />
            )}
            {isOpeningBot ? 'Abriendo bot...' : primaryButtonLabel}
          </button>

          <p className="mt-3 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs leading-5 text-orange-800">
            <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
            <span>
              Solo dispones de 1 intento para generar el enlace del grupo.
              Verifica antes que tu sesión de Telegram está iniciada en el dispositivo donde abrirás el bot. Contacte con soporte si tienes cualquier problema.
            </span>
          </p>
        </>
      )}
    </div>
  );

  const doneCard = (
    <div className="flex flex-col items-center justify-center rounded-[1.75rem] border-4 border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)] p-6 text-center shadow-[0_10px_22px_rgba(17,24,39,0.10)] sm:p-8">
      <img
        src="/check.avif"
        alt="Acceso completado"
        className="h-28 w-28 object-contain sm:h-36 sm:w-36"
      />
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
        Proceso completado
      </p>
      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        Acceso verificado correctamente
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
        Ya tienes activa la cuota y el acceso al grupo. Si necesitas revisar tu suscripción,
        puedes gestionarla desde aquí.
      </p>
      <button
        type="button"
        onClick={() => setVisibleStep(2)}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        <CreditCard className="h-4 w-4" />
        Gestionar cuota
      </button>
    </div>
  );

  const activeCard: ReactNode = visibleStep === 2
    ? subscriptionCard
    : visibleStep === 3
      ? telegramCard
      : doneCard;
  const cardDeckMaxWidthClass = visibleStep === 2 ? 'max-w-6xl' : 'max-w-4xl';

  return (
    <section className="m-0 flex flex-col gap-6 bg-transparent p-0 text-slate-900">
      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
        <div className="relative h-28 w-[11.6rem] shrink-0 sm:h-40 sm:w-[16.2rem] lg:h-52 lg:w-[21.2rem]">
          <div className="absolute left-0 top-1/2 z-20 h-28 w-28 -translate-y-1/2 overflow-hidden rounded-full bg-white shadow-[0_12px_28px_rgba(15,23,42,0.24)] sm:h-40 sm:w-40 lg:h-52 lg:w-52">
            <img
              src="/logo.png"
              alt="Logo de El Método"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <img
            src="/telegramiconoperfil2.png"
            alt="Perfil de Telegram del grupo"
            className="absolute right-0 top-1/2 z-0 h-28 w-28 -translate-y-1/2 object-contain sm:h-40 sm:w-40 lg:h-52 lg:w-52"
            loading="lazy"
          />
        </div>
        <h1 className="text-center text-5xl font-bold leading-[0.95] tracking-tight text-slate-900 sm:text-6xl lg:text-8xl">
          Grupo Telegram
        </h1>
      </div>

      

      <div className="mt-3 space-y-3 sm:mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-sky-100">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {(statusError || actionError || actionNotice || shouldShowBotConfigNotice || (showDelayedLoadingNotice && isLoading) || shouldShowPendingNotice || shouldShowInactiveAccessNotice) && (
        <div className="space-y-3">
          {shouldShowBotConfigNotice && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              El bot de Telegram todavía no está configurado en el sistema.
            </div>
          )}

          {statusError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {statusError}
            </div>
          )}

          {actionError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {actionNotice && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              {actionNotice}
            </div>
          )}

          {hasActiveSubscription && isSubscriptionCancelAtPeriodEnd && !statusError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Tu suscripción está activa con baja programada al final del período. Puedes reactivarla sin crear una nueva.
            </div>
          )}

          {hasActiveSubscription && !activeSubscriptionPlanKey && !statusError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Detectamos una suscripción activa, pero el productId recibido no coincide con ningún plan configurado.
            </div>
          )}

          {showDelayedLoadingNotice && isLoading && !statusError && (
            <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Cargando estado del acceso al grupo...
            </div>
          )}

          {shouldShowPendingNotice && !statusError && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Tu Telegram ya está vinculado. Revisa el mensaje directo del bot para completar el acceso.
            </div>
          )}

          {shouldShowInactiveAccessNotice && !statusError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Tu acceso al grupo no está activo ahora mismo. Revisa tu suscripción y vuelve a intentarlo.
            </div>
          )}
        </div>
      )}

      <div className={`mx-auto w-full ${cardDeckMaxWidthClass} md:mt-6`}>
        <div className="hidden items-center gap-4 xl:flex">
          <WizardArrowButton
            direction="back"
            disabled={!canGoBack}
            onClick={handleGoBack}
          />
          <div className="min-w-0 flex-1">
            {activeCard}
          </div>
          <WizardArrowButton
            direction="forward"
            disabled={!canGoForward}
            onClick={handleGoForward}
          />
        </div>

        <div className="xl:hidden">
          {activeCard}
          <div className="mt-4 flex items-center justify-center gap-4">
            <WizardArrowButton
              direction="back"
              disabled={!canGoBack}
              onClick={handleGoBack}
            />
            <WizardArrowButton
              direction="forward"
              disabled={!canGoForward}
              onClick={handleGoForward}
            />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/90 to-transparent" />
      
      <div className="grid gap-3 sm:grid-cols-2">
        <article
          className="rounded-2xl border border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)] px-4 py-4 shadow-[0_10px_22px_rgba(30,64,175,0.08)]"
          title={`Actualizado: ${groupMemberCountUpdatedAtLabel}`}
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <p className="px-3 py-2 text-sm font-semibold text-blue-800 sm:text-base">
              {groupMemberCountLabel} Suscripciones Activas
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)] px-4 py-4 shadow-[0_10px_22px_rgba(16,185,129,0.08)]">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-emerald-800 sm:text-base">
              {recentActivityTimeLabel === 'No disponible'
                ? 'Nuevo mensaje sin hora disponible'
                : `Nuevo mensaje a las ${recentActivityTimeLabel}`}
            </p>
          </div>
        </article>
      </div>

      <AppModal
        open={cancelConfirmOpen}
        isClosing={cancelConfirmClosing}
        onRequestClose={closeCancelConfirm}
        disableClose={isCancellingSubscription}
        showCloseButton={false}
        panelClassName="bg-white/95"
      >
        <h3 className="text-center text-2xl font-bold">Confirmar baja</h3>
        <p className="mt-3 text-center text-sm text-slate-600">
          Vas a cancelar tu cuota actual del grupo de Telegram. ¿Quieres continuar?
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={closeCancelConfirm}
            disabled={isCancellingSubscription}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Mantener cuota
          </button>
          <button
            type="button"
            onClick={handleConfirmCancellation}
            disabled={isCancellingSubscription}
            className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {isCancellingSubscription ? 'Dando de baja...' : 'Sí, darme de baja'}
          </button>
        </div>
      </AppModal>
    </section>
  );
};

export default GrupoApuestasView;

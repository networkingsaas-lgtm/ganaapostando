import {
  Check,
  CreditCard,
  Link2,
  Lock,
  LoaderCircle,
} from 'lucide-react';
import { useEffect, useState, type FC } from 'react';

interface Props {
  isLoading: boolean;
  isOpeningBot: boolean;
  isStartingSubscriptionCheckout: boolean;
  isCancellingSubscription: boolean;
  statusError: string | null;
  actionError: string | null;
  actionNotice: string | null;
  primaryButtonLabel: string;
  subscriptionProductName: string;
  subscriptionProductPriceLabel: string;
  subscriptionExpiresAtLabel: string | null;
  isBotConfigured: boolean;
  isLinked: boolean;
  hasActiveSubscription: boolean;
  hasJoinedGroup: boolean;
  shouldShowPendingNotice: boolean;
  shouldShowInactiveAccessNotice: boolean;
  handleSubscriptionAction: () => void;
  handleOpenBot: () => void;
}

const ProgressStep = ({
  index,
  title,
  description,
  isDone,
  isCurrent,
}: {
  index: number;
  title: string;
  description: string;
  isDone: boolean;
  isCurrent: boolean;
}) => (
  <div className="flex min-w-0 flex-col items-center text-center">
    <div
      className={`relative flex h-24 w-24 items-center justify-center rounded-full transition ${
        isDone
          ? 'bg-[#1d8fe8] text-white shadow-[0_12px_28px_rgba(29,143,232,0.28)]'
          : isCurrent
            ? 'border-4 border-[#1d8fe8] bg-white text-[#1d8fe8] shadow-[0_0_0_6px_rgba(125,211,252,0.35)]'
            : 'border-2 border-[#bfdbfe] bg-white text-slate-400'
      }`}
    >
      <div className={`absolute inset-[7px] rounded-full ${
        isDone ? 'border border-white/80' : 'border border-[#bfdbfe]'
      }`}
      />
      {isDone ? <Check className="relative z-10 h-12 w-12" /> : <span className="relative z-10 text-4xl font-black">{index}</span>}
    </div>
    <p
      className="mt-5 text-xl font-semibold tracking-tight text-slate-900"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      {title}
    </p>
    <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-600">{description}</p>
  </div>
);

const GrupoApuestasView: FC<Props> = ({
  isLoading,
  isOpeningBot,
  isStartingSubscriptionCheckout,
  isCancellingSubscription,
  statusError,
  actionError,
  actionNotice,
  primaryButtonLabel,
  subscriptionProductName,
  subscriptionProductPriceLabel,
  subscriptionExpiresAtLabel,
  isBotConfigured,
  isLinked,
  hasActiveSubscription,
  hasJoinedGroup,
  shouldShowPendingNotice,
  shouldShowInactiveAccessNotice,
  handleSubscriptionAction,
  handleOpenBot,
}) => {
  const isTelegramStepDone = hasActiveSubscription && hasJoinedGroup;
  const isFullyVerified = hasActiveSubscription && hasJoinedGroup;
  const currentStep = hasActiveSubscription ? (isTelegramStepDone ? 3 : 2) : 1;
  const [showDelayedLoadingNotice, setShowDelayedLoadingNotice] = useState(false);
  const shouldShowTelegramCard = hasActiveSubscription;
  const shouldShowTelegramSuccess = hasActiveSubscription && hasJoinedGroup;
  const shouldShowVerificationSuccess = hasActiveSubscription && hasJoinedGroup;
  const shouldShowVerificationCard = shouldShowVerificationSuccess;
  const isTelegramButtonDisabled = isLoading || isOpeningBot || isLinked;
  const isSubscriptionActionDisabled =
    isStartingSubscriptionCheckout
    || isCancellingSubscription
    || (!hasActiveSubscription && subscriptionProductPriceLabel === 'No disponible');

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

  const shouldShowBotConfigNotice = !isBotConfigured && (showDelayedLoadingNotice || Boolean(actionError));

  return (
    <section className="flex flex-col gap-6 rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-6 text-slate-900 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
      <div className="flex items-center gap-5">
        <img
          src="/telegramiconoperfil2.png"
          alt="Telegram"
          className="h-24 w-24 object-contain sm:h-32 sm:w-32"
        />
        <div
          className="text-4xl font-normal leading-none tracking-tight text-slate-900 sm:text-6xl"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Grupo Telegram
        </div>
      </div>

      <div className="mt-10 hidden md:grid md:grid-cols-3 md:gap-4">
        <div className="relative">
          <div className={`pointer-events-none absolute left-[calc(50%+3rem)] top-12 h-1 w-[calc(100%-6rem)] rounded-full ${
            hasActiveSubscription ? 'bg-sky-500' : 'bg-sky-100'
          }`}
          />
          <ProgressStep
            index={1}
            title="Paga con Stripe"
            description="Activa la suscripcion para habilitar el acceso."
            isDone={hasActiveSubscription}
            isCurrent={currentStep === 1}
          />
        </div>

        <div className="relative">
          <div className={`pointer-events-none absolute left-[calc(50%+3rem)] top-12 h-1 w-[calc(100%-6rem)] rounded-full ${
            isTelegramStepDone ? 'bg-sky-500' : 'bg-sky-100'
          }`}
          />
          <ProgressStep
            index={2}
            title="Vincula Telegram"
            description="Conecta tu cuenta con el bot de Telegram."
            isDone={isTelegramStepDone}
            isCurrent={currentStep === 2}
          />
        </div>

        <div className="relative">
          <ProgressStep
            index={3}
            title="Apuesta con nosotros"
            description="Cuando todo este correcto veras la verificacion final."
            isDone={isFullyVerified}
            isCurrent={currentStep === 3}
          />
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        <div className="h-2 overflow-hidden rounded-full bg-sky-100">
          <div
            className={`h-full rounded-full bg-sky-500 transition-all ${
              isFullyVerified ? 'w-full' : currentStep === 2 ? 'w-2/3' : 'w-1/3'
            }`}
          />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {isFullyVerified ? 'Proceso completado' : `Paso ${currentStep} de 3 en curso`}
        </p>
      </div>

      {(statusError || actionError || actionNotice || shouldShowBotConfigNotice || (showDelayedLoadingNotice && isLoading) || shouldShowPendingNotice || shouldShowInactiveAccessNotice) && (
        <div className="space-y-3">
          {shouldShowBotConfigNotice && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              El bot de Telegram todavia no esta configurado en el sistema.
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

          {showDelayedLoadingNotice && isLoading && !statusError && (
            <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Cargando estado del acceso al grupo...
            </div>
          )}

          {shouldShowPendingNotice && !statusError && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Tu Telegram ya esta vinculado. Revisa el mensaje directo del bot para completar el acceso.
            </div>
          )}

          {shouldShowInactiveAccessNotice && !statusError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Tu acceso al grupo no esta activo ahora mismo. Revisa tu suscripcion y vuelve a intentarlo.
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className={`relative flex h-full flex-col rounded-2xl border-4 p-5 shadow-[0_10px_22px_rgba(17,24,39,0.10)] sm:p-6 ${
          hasActiveSubscription
            ? 'border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]'
            : 'border-blue-300 bg-[linear-gradient(180deg,#ffffff_0%,#f2f7ff_100%)]'
        }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">
                {subscriptionProductName}
              </h2>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{subscriptionProductPriceLabel}</span>
                <span className="ml-1 text-sm text-gray-600">/ cuota</span>
              </div>
            </div>
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
              hasActiveSubscription ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
            }`}
            >
              <CreditCard className="h-6 w-6" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubscriptionAction}
            disabled={isSubscriptionActionDisabled}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition ${
              hasActiveSubscription
                ? 'bg-slate-300 text-slate-600 hover:bg-slate-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600'
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600'
            }`}
          >
            {isStartingSubscriptionCheckout || isCancellingSubscription ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {isCancellingSubscription
              ? 'Dando de baja...'
              : isStartingSubscriptionCheckout
                ? 'Redirigiendo...'
                : hasActiveSubscription
                  ? 'Darse de baja'
                  : 'Comprar plan'}
          </button>

          <p className="mt-3 text-sm text-gray-600 sm:text-base">
            {hasActiveSubscription
              ? 'Tu suscripcion ya esta activa. Si quieres cancelar la renovacion, puedes hacerlo desde aqui.'
              : 'Activa tu cuota para recibir acceso al grupo privado de valuebets.'}
          </p>
          {hasActiveSubscription && (
            <p className="mt-auto pt-4 text-sm font-semibold text-blue-700">
              Caduca: {subscriptionExpiresAtLabel}
            </p>
          )}
        </div>

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
                {isOpeningBot ? <LoaderCircle className="h-4 w-4 animate-spin" /> : (
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${
                    isTelegramButtonDisabled ? 'bg-white/80 text-slate-600' : 'bg-white text-blue-500'
                  }`}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </span>
                )}
                {isOpeningBot ? 'Abriendo bot...' : primaryButtonLabel}
              </button>

              <p className="mt-3 text-sm text-slate-600">
                Conecta tu cuenta con el bot.
              </p>
            </>
          )}
        </div>

        <div className={`rounded-[1.5rem] border-4 p-5 shadow-[0_8px_18px_rgba(17,24,39,0.04)] sm:p-6 ${
          !shouldShowVerificationCard
            ? 'border-[#e5e7eb] bg-white'
            : 'border-blue-200 bg-[linear-gradient(180deg,#ffffff_0%,#eef6ff_100%)]'
        }`}
        >
          {!shouldShowVerificationCard ? (
            <div className="flex min-h-[13.5rem] items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Lock className="h-9 w-9" />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[13.5rem] items-center justify-center">
              <img
                src="/check.avif"
                alt="Verificacion completada"
                className="h-28 w-28 object-contain sm:h-36 sm:w-36"
              />
            </div>
          )}
        </div>
      </div>
      {shouldShowVerificationSuccess && (
        <div className="flex items-center justify-center text-sm font-semibold text-blue-700">
          Acceso verificado correctamente.
        </div>
      )}
    </section>
  );
};

export default GrupoApuestasView;

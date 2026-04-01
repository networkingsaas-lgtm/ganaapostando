import { Undo2 } from 'lucide-react';
import type { Dispatch, FC, SetStateAction } from 'react';
import type { LayerSection } from '../../roadmap/types';
import { formatPriceEur } from '../../roadmap/utils';

const lessonHasPaidAccess = (reason: string | null | undefined, canAccess: boolean | undefined) =>
  reason === 'entitled' || Boolean(canAccess);

const LoadingLine = ({ className }: { className: string }) => (
  <span className={`block animate-pulse rounded-full bg-slate-200/90 ${className}`} />
);

interface Props {
  onOpenLogout?: () => void;
  isUserLoading: boolean;
  userError: string | null;
  isPremium: boolean;
  isCoursesLoading: boolean;
  userLabel: string;
  authUserEmail: string;
  lastSignInAtLabel: string;
  createdAtLabel: string;
  handleGoToBilling: () => void;
  checkoutNotice: string | null;
  checkoutNoticeTone: 'info' | 'success' | 'error';
  showLayerBillingCards: boolean;
  billingPanelAnimationClass: string;
  isBillingSelectorClosing: boolean;
  isBillingSelectorEntering: boolean;
  billingDeckLayout: {
    step: number;
    width: number;
  };
  methodProductPriceLabel: string;
  isMethodPurchased: boolean;
  isStartingMethodCheckout: boolean;
  methodCheckoutTarget: {
    productId: number;
    lessonId: number;
  } | null;
  handleStartMethodCheckout: () => Promise<void>;
  methodPlanDescription: string;
  handleOpenLayerBillingCards: () => void;
  layerPlanPrice: string;
  layerPlanDescription: string;
  handleBackToBillingSelector: () => void;
  isLayerCardsEntering: boolean;
  setActiveBillingCard: Dispatch<SetStateAction<number | null>>;
  billingLayerCards: LayerSection[];
  isStartingCheckoutByLayerId: number | null;
  handleStartLayerCheckout: (layerSection: LayerSection | undefined) => Promise<void>;
  activeBillingCard: number | null;
  isMobileViewport: boolean;
}

const UserSettingsView: FC<Props> = ({
  onOpenLogout,
  isUserLoading,
  userError,
  isPremium,
  isCoursesLoading,
  userLabel,
  authUserEmail,
  lastSignInAtLabel,
  createdAtLabel,
  handleGoToBilling,
  checkoutNotice,
  checkoutNoticeTone,
  showLayerBillingCards,
  billingPanelAnimationClass,
  isBillingSelectorClosing,
  isBillingSelectorEntering,
  billingDeckLayout,
  methodProductPriceLabel,
  isMethodPurchased,
  isStartingMethodCheckout,
  methodCheckoutTarget,
  handleStartMethodCheckout,
  methodPlanDescription,
  handleOpenLayerBillingCards,
  layerPlanPrice,
  layerPlanDescription,
  handleBackToBillingSelector,
  isLayerCardsEntering,
  setActiveBillingCard,
  billingLayerCards,
  isStartingCheckoutByLayerId,
  handleStartLayerCheckout,
  activeBillingCard,
  isMobileViewport,
}) => (
  <div className="m-0 space-y-6 bg-transparent p-0 text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
    <section className="relative z-30 overflow-visible rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
      {userError && !isUserLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {userError}
        </div>
      )}

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
              className={`h-full w-full object-cover transition-opacity ${isUserLoading ? 'opacity-60' : 'opacity-100'}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            {isUserLoading ? (
              <>
                <LoadingLine className="h-7 w-44 sm:h-8 sm:w-56" />
                <LoadingLine className="mt-2 h-4 w-28" />
              </>
            ) : (
              <>
                <p className="truncate text-[1.35rem] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[1.85rem]">
                  {userLabel}
                </p>
                {isCoursesLoading ? (
                  <p className="mt-1 text-sm font-medium text-[#6b7280]">Comprobando plan...</p>
                ) : isPremium ? (
                  <p className="mt-1 text-sm font-semibold text-[#2563eb]">Plan premium</p>
                ) : null}
              </>
            )}
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
          {isUserLoading ? (
            <LoadingLine className="h-4 w-28" />
          ) : (
            <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">{userLabel}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-[#eceef2] px-4 py-3">
          <p className="text-sm font-medium text-[#374151]">Email</p>
          {isUserLoading ? (
            <LoadingLine className="h-4 w-40" />
          ) : (
            <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">
              {authUserEmail}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-[#eceef2] px-4 py-3">
          <p className="text-sm font-medium text-[#374151]">Último acceso</p>
          {isUserLoading ? (
            <LoadingLine className="h-4 w-32" />
          ) : (
            <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">
              {lastSignInAtLabel}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <p className="text-sm font-medium text-[#374151]">Cuenta creada</p>
          {isUserLoading ? (
            <LoadingLine className="h-4 w-32" />
          ) : (
            <p className="max-w-[60%] truncate text-right text-sm font-semibold text-[#111827]">
              {createdAtLabel}
            </p>
          )}
        </div>
      </div>
    </section>

    <section id="billing-capas" className="relative z-50 overflow-visible rounded-[1.75rem] border border-[#d9d9de] bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
      <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[1.85rem]">
        Billing de capas
      </h2>
      <p className="mt-2 text-sm text-[#6b7280] sm:text-base">
        Vista previa del billing por capas desbloqueables.
      </p>
      {checkoutNotice && (
        <div
          className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
            checkoutNoticeTone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : checkoutNoticeTone === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {checkoutNotice}
        </div>
      )}

      {!showLayerBillingCards && (
        <div
          className={`mt-10 overflow-x-auto pb-2 ${billingPanelAnimationClass} ${
            isBillingSelectorClosing || isBillingSelectorEntering
              ? 'pointer-events-none translate-y-2 scale-[0.98] opacity-0'
              : 'translate-y-0 scale-100 opacity-100'
          }`}
        >
          <div
            className={`relative h-[31rem] sm:h-[34rem] ${
              isMobileViewport ? '' : 'mx-auto w-full max-w-[46rem]'
            }`}
            style={isMobileViewport ? { width: '34rem' } : undefined}
          >
            <div className="grid h-full grid-cols-2 items-stretch gap-5">
              <div className="relative flex h-full flex-col rounded-2xl border-4 border-gray-200 bg-white p-5 shadow-[0_10px_22px_rgba(17,24,39,0.10)] sm:p-6">
                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  <span className="rebel-underline">El Método</span>.
                </h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{methodProductPriceLabel}</span>
                  <span className="ml-1 text-sm text-gray-600">/ pago único</span>
                </div>
                <button
                  type="button"
                  disabled={isMethodPurchased || isStartingMethodCheckout || !methodCheckoutTarget}
                  onClick={() => {
                    void handleStartMethodCheckout();
                  }}
                  className="mt-4 w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {isMethodPurchased ? 'Plan comprado' : isStartingMethodCheckout ? 'Redirigiendo...' : 'Comprar plan'}
                </button>
                <p className="mt-3 text-sm text-gray-600 sm:text-base">
                  {methodPlanDescription}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li>Acceso completo al programa principal.</li>
                  <li>Sin desbloqueos por etapas.</li>
                  <li>Ideal si quieres todo el contenido desde el inicio.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleOpenLayerBillingCards}
                className="relative flex h-full flex-col rounded-2xl border-4 border-blue-300 bg-[linear-gradient(180deg,#ffffff_0%,#f2f7ff_100%)] p-5 text-left shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(37,99,235,0.24)] sm:p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  <span className="rebel-underline">El Método</span>, por capas
                </h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{layerPlanPrice}</span>
                  <span className="ml-1 text-sm text-gray-600">/ desde</span>
                </div>
                <span className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white">
                  Elegir por capas
                </span>
                <p className="mt-3 text-sm text-gray-600 sm:text-base">
                  {layerPlanDescription}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700">
                  <li>Empiezas con un coste bajo.</li>
                  <li>Compras capa a capa según tu avance.</li>
                  <li>Control total del gasto por módulo.</li>
                </ul>
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
            className={`mt-2 overflow-x-auto pb-2 ${billingPanelAnimationClass} ${
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
                  (lessonNode) => lessonHasPaidAccess(lessonNode.reason, lessonNode.access?.canAccess),
                ));
                const isStartingCheckout = Boolean(
                  layerCard && isStartingCheckoutByLayerId === layerCard.layer.id,
                );
                const layerDescription = layerCard?.layer.description?.trim()
                  || layerCard?.layer.teaser_text?.trim()
                  || 'Desbloquea esta capa para acceder al contenido de este bloque.';
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
                      if (activeBillingCard === null) {
                        setActiveBillingCard(slotIndex);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        if (activeBillingCard !== null && !isActive) {
                          return;
                        }
                        if (activeBillingCard === null) {
                          setActiveBillingCard(slotIndex);
                        }
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
                      disabled={!layerCard || isPurchased || isStartingCheckout}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleStartLayerCheckout(layerCard);
                      }}
                      className="mt-4 w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                    >
                      {isPurchased ? 'Capa comprada' : isStartingCheckout ? 'Redirigiendo...' : 'Comprar capa'}
                    </button>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {layerDescription}
                    </p>
                  </div>
                );
              })}
              {activeBillingCard !== null && (
                <button
                  type="button"
                  aria-label="Deseleccionar card activa"
                  className="absolute inset-0 z-40 bg-white/30 backdrop-blur-[10px]"
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

export default UserSettingsView;

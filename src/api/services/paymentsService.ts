import {
  buildBackendApiUrl,
  ensureOk,
  getFriendlyRequestErrorMessage,
  postJson,
} from '../core/backendClient';
import { getSupabaseApiClient } from '../core/supabaseClient';
import { getOptionalClientEnv } from '../../lib/env';

interface CheckoutSessionResponse {
  checkoutUrl: string;
}

interface CreateCheckoutSessionParams {
  productId: number;
  successUrl: string;
  cancelUrl: string;
}

const parseAllowedOrigins = (value: string | null) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const getAuthenticatedAccessToken = async () => {
  const supabase = getSupabaseApiClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (sessionError || !accessToken) {
    throw new Error('Necesitas iniciar sesión para continuar con el pago.');
  }

  return accessToken;
};

const assertAllowedCheckoutReturnUrl = (targetUrl: string) => {
  const allowedOrigins = parseAllowedOrigins(getOptionalClientEnv('VITE_CHECKOUT_RETURN_URL_ORIGINS'));

  if (allowedOrigins.length === 0) {
    return;
  }

  const targetOrigin = new URL(targetUrl).origin;

  if (!allowedOrigins.includes(targetOrigin)) {
    throw new Error(
      'La URL de retorno del checkout no esta permitida para este entorno. Revisa VITE_CHECKOUT_RETURN_URL_ORIGINS.',
    );
  }
};

export const createCheckoutSession = async ({
  productId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) => {
  assertAllowedCheckoutReturnUrl(successUrl);
  assertAllowedCheckoutReturnUrl(cancelUrl);

  const accessToken = await getAuthenticatedAccessToken();

  let payload: CheckoutSessionResponse;

  try {
    payload = await postJson<CheckoutSessionResponse, CreateCheckoutSessionParams>(
      '/payments/checkout-session',
      {
        productId,
        successUrl,
        cancelUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch (error) {
    throw new Error(
      getFriendlyRequestErrorMessage(error, 'No se pudo iniciar el checkout en este momento.'),
    );
  }

  if (!payload.checkoutUrl || typeof payload.checkoutUrl !== 'string') {
    throw new Error('La respuesta de checkout no incluyo una URL valida.');
  }

  return payload.checkoutUrl;
};

export const cancelSubscription = async () => {
  const accessToken = await getAuthenticatedAccessToken();

  try {
    const response = await fetch(buildBackendApiUrl('/payments/subscription/cancel'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await ensureOk(response);
  } catch (error) {
    throw new Error(
      getFriendlyRequestErrorMessage(error, 'No se pudo cancelar la suscripcion en este momento.'),
    );
  }
};

export const reactivateSubscription = async () => {
  const accessToken = await getAuthenticatedAccessToken();

  try {
    const response = await fetch(buildBackendApiUrl('/payments/subscription/reactivate'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await ensureOk(response);
  } catch (error) {
    throw new Error(
      getFriendlyRequestErrorMessage(error, 'No se pudo reactivar la suscripcion en este momento.'),
    );
  }
};

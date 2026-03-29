import { postJson } from '../core/backendClient';
import { getSupabaseApiClient } from '../core/supabaseClient';

interface CheckoutSessionResponse {
  checkoutUrl: string;
}

interface CreateCheckoutSessionParams {
  productId: number;
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = async ({
  productId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) => {
  const supabase = getSupabaseApiClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (sessionError || !accessToken) {
    throw new Error('Necesitas iniciar sesión para continuar con el pago.');
  }

  const payload = await postJson<CheckoutSessionResponse, CreateCheckoutSessionParams>(
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

  if (!payload.checkoutUrl || typeof payload.checkoutUrl !== 'string') {
    throw new Error('La respuesta de checkout no incluyó una URL válida.');
  }

  return payload.checkoutUrl;
};

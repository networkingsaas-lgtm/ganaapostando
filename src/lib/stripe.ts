import { loadStripe } from '@stripe/stripe-js';

type StripeEnvKey = 'VITE_STRIPE_PUBLIC_KEY' | 'VITE_STRIPE_CHECKOUT_URL';

const stripeEnv = import.meta.env as ImportMetaEnv & Partial<Record<StripeEnvKey, string>>;

const getOptionalClientEnv = (name: StripeEnvKey) => {
  const value = stripeEnv[name];

  return typeof value === 'string' ? value.trim() : '';
};

const stripePublicKey = getOptionalClientEnv('VITE_STRIPE_PUBLIC_KEY');
const stripeCheckoutUrl = getOptionalClientEnv('VITE_STRIPE_CHECKOUT_URL');

if (!stripePublicKey) {
  console.warn('Stripe public key not found. Please set VITE_STRIPE_PUBLIC_KEY in your frontend env.');
}

if (!stripeCheckoutUrl) {
  console.info('Stripe checkout URL not configured. Set VITE_STRIPE_CHECKOUT_URL to enable checkout buttons.');
}

export const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export const getStripeCheckoutUrl = () => stripeCheckoutUrl || null;

export const openStripeCheckout = () => {
  const checkoutUrl = getStripeCheckoutUrl();

  if (!checkoutUrl) {
    return false;
  }

  window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  return true;
};

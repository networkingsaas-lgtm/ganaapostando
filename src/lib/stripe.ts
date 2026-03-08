import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.warn('⚠️ Stripe public key not found. Please set VITE_STRIPE_PUBLIC_KEY in your .env file.');
}

export const stripePromise = loadStripe(stripePublicKey || '');

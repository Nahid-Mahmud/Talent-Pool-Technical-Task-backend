import Stripe from 'stripe';
import envVariables from '../config/env';

export const stripe = new Stripe(envVariables.STRIPE.STRIPE_SECRET, {
  apiVersion: '2026-01-28.clover',
});

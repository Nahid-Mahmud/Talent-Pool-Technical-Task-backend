import { z } from 'zod';

const createPaymentIntent = z.object({
  body: z.object({
    courseId: z.string(),
  }),
});

const confirmPayment = z.object({
  body: z.object({
    sessionId: z.string(),
  }),
});

export const PaymentValidation = {
  createPaymentIntent,
  confirmPayment,
};

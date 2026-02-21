import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { paymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';

const router: Router = Router();

router.post(
  '/create-checkout-session',
  checkAuth(UserRole.student),
  validateRequest(PaymentValidation.createPaymentIntent),
  paymentController.createCheckoutSession
);

router.post(
  '/confirm-payment',
  checkAuth(UserRole.student),
  validateRequest(PaymentValidation.confirmPayment),
  paymentController.confirmPayment
);

export const paymentRoutes = router;

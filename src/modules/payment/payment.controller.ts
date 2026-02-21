import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { paymentService } from './payment.service';

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const { courseId } = req.body;
    const userId = req.user?.id;

    const result = await paymentService.createCheckoutSession(
      userId as string,
      courseId
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Checkout session created successfully',
      data: result,
    });
  }
);

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.body;

  const result = await paymentService.confirmPayment(sessionId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment confirmed and enrollment successful',
    data: result,
  });
});

export const paymentController = {
  createCheckoutSession,
  confirmPayment,
};

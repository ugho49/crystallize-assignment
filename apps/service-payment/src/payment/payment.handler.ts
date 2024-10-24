import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { type OrderReceived } from '@crystallize/sqs';

import { PaymentService } from './payment.service';
import { OrderStatus } from '@crystallize/common-types';

export const ORDER_RECEIVED_QUEUE_NAME = 'order-received';

@Injectable()
export class PaymentHandler {
  private readonly logger = new Logger(PaymentHandler.name);

  constructor(private readonly paymentService: PaymentService) {}

  @SqsMessageHandler(ORDER_RECEIVED_QUEUE_NAME)
  public async orderReceived(message: Message) {
    const body = JSON.parse(message.Body) as OrderReceived;

    this.logger.log(`Received a new order ${body.orderId}`);

    const paymentResult = await this.paymentService.processPayment(body);
    if (!paymentResult) {
      await this.paymentService.signalPaymentStatus(
        body.orderId,
        OrderStatus.PaymentRejected
      );
      return;
    }

    await this.paymentService.signalPaymentStatus(
      body.orderId,
      OrderStatus.Paid
    );
    await this.paymentService.forwardOrderToShipmentService(body);
  }
}

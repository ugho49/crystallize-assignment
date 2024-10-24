import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type OrderReceived,
  SqsProducerService,
  UpdateOrderStatus,
} from '@crystallize/sqs';
import { ConfigType } from '@nestjs/config';
import { OrderStatus } from '@crystallize/common-types';
import paymentConfig from './payment.config';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly sqsProducerService: SqsProducerService,
    @Inject(paymentConfig.KEY)
    private readonly config: ConfigType<typeof paymentConfig>
  ) {}

  public async processPayment(body: OrderReceived): Promise<boolean> {
    this.logger.log(`Process payment for order ${body.orderId}`);

    // TODO: Implement the payment service logic
    // - In case of payment failure return false
    // - In case of payment success return true and save the payment details in the DB

    // We consider all payments successful
    return true;
  }

  public async forwardOrderToShipmentService(
    body: OrderReceived
  ): Promise<void> {
    this.logger.log(`Forwarding order ${body.orderId} to the shipment service`);

    await this.sqsProducerService.sendObject<OrderReceived>(
      this.config.SHIPMENT_ORDER_RECEIVED_QUEUE_URL,
      body
    );
  }

  public async signalPaymentStatus(
    orderId: string,
    newStatus: OrderStatus.Paid | OrderStatus.PaymentRejected
  ) {
    this.logger.log(`Signal payment status ${newStatus} for order ${orderId}`);

    const message: UpdateOrderStatus = {
      orderId,
      newStatus,
    };

    await this.sqsProducerService.sendObjectFifo<UpdateOrderStatus>(
      this.config.ORDER_UPDATE_STATUS_QUEUE_URL,
      message,
      orderId
    );
  }
}

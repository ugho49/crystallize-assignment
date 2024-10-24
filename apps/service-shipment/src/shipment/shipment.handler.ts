import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { type OrderReceived } from '@crystallize/sqs';

import { ShipmentService } from './shipment.service';

export const ORDER_RECEIVED_QUEUE_NAME = 'order-received';

@Injectable()
export class ShipmentHandler {
  private readonly logger = new Logger(ShipmentHandler.name);

  constructor(private readonly shipmentService: ShipmentService) {}

  @SqsMessageHandler(ORDER_RECEIVED_QUEUE_NAME)
  public async orderReceived(message: Message) {
    const body = JSON.parse(message.Body) as OrderReceived;

    this.logger.log(`Received a new order ${body.orderId}`);

    // TODO: Implement the logic to ship the order
    // - Save the shipment details in the DB

    await this.shipmentService.signalOrderShipped(body.orderId);
  }
}

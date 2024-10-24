import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { type OrderReceived } from '@crystallize/sqs';

import { InventoryService } from './inventory.service';

export const ORDER_RECEIVED_QUEUE_NAME = 'order-received';

@Injectable()
export class InventoryHandler {
  private readonly logger = new Logger(InventoryHandler.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @SqsMessageHandler(ORDER_RECEIVED_QUEUE_NAME)
  public async orderReceived(message: Message) {
    const body = JSON.parse(message.Body) as OrderReceived;

    this.logger.log(`Received a new order ${body.orderId}`);

    const inventoryCheck = await this.inventoryService.inventoryCheck(body);

    if (!inventoryCheck) {
      this.logger.log(`Order ${body.orderId} contains out-of-stock products`);
      await this.inventoryService.signalOutOfStock(body.orderId);
      return;
    }

    await this.inventoryService.updateStockLevels(body);
    await this.inventoryService.forwardOrderToPaymentService(body);
  }
}

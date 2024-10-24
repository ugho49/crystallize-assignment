import { Injectable } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { UpdateOrderStatus } from '@crystallize/sqs';

import { OrdersService } from './orders.service';

export const ORDER_UPDATE_STATUS_QUEUE_NAME = 'order-update-status';

@Injectable()
export class OrdersHandler {
  constructor(private readonly ordersService: OrdersService) {}

  @SqsMessageHandler(ORDER_UPDATE_STATUS_QUEUE_NAME)
  public async updateStatus(message: Message) {
    const body = JSON.parse(message.Body) as UpdateOrderStatus;
    await this.ordersService.updateOrderStatus(body.orderId, body.newStatus);
  }
}

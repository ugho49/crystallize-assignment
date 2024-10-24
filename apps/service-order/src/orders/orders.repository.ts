import { Injectable, Logger } from '@nestjs/common';
import { MongoClientService } from '@crystallize/mongo-client';
import {
  OrderDocument,
  OrderDocumentWithId,
  UpdateOrderDocument,
} from './orders.document';
import { ObjectId } from 'mongodb';

const ORDER_COLLECTION = 'orders';

@Injectable()
export class OrdersRepository {
  private readonly logger = new Logger(OrdersRepository.name);

  constructor(private readonly client: MongoClientService) {}

  async getOrderById(id: string): Promise<OrderDocumentWithId | undefined> {
    this.logger.log(`Getting order by id ${id}`);

    const order = this.client
      .collection<OrderDocument>(ORDER_COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    return order ?? undefined;
  }

  async createOrder(order: OrderDocument) {
    this.logger.log(`Creating order for user ${order.userId}`);

    const result = await this.client
      .collection<OrderDocument>(ORDER_COLLECTION)
      .insertOne(order);

    return result.insertedId.toString();
  }

  async updateOrder(orderId: string, order: UpdateOrderDocument) {
    this.logger.log(`Updating order ${orderId}`);

    await this.client
      .collection(ORDER_COLLECTION)
      .updateOne(
        { _id: new ObjectId(orderId) },
        { $set: order },
        { ignoreUndefined: true }
      );
  }
}

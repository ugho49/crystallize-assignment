import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  EventType,
  OrderReceived,
  SendMail,
  SqsProducerService,
} from '@crystallize/sqs';
import { ConfigType } from '@nestjs/config';

import { OrdersRepository } from './orders.repository';
import { GetOrderDtoOutput, SubmitOrderDto } from './orders.dto';
import { OrderDocument } from './orders.document';
import ordersConfig from './orders.config';
import { mapDocumentToGetOrderDtoOutput } from './orders.mapper';
import { OrderStatus } from '@crystallize/common-types';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly sqsProducerService: SqsProducerService,
    @Inject(ordersConfig.KEY)
    private readonly config: ConfigType<typeof ordersConfig>
  ) {}

  async getOrder(orderId: string): Promise<GetOrderDtoOutput | undefined> {
    const order = await this.ordersRepository.getOrderById(orderId);
    if (!order) return undefined;
    return mapDocumentToGetOrderDtoOutput(order);
  }

  async submitOrder(order: SubmitOrderDto): Promise<string> {
    this.logger.log(`Submitting order for user ${order.user.id}`);

    const orderDocument: OrderDocument = {
      items: order.items.map((item) => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: order.totalAmount,
      payment: {
        cardType: order.payment.cardType,
        cvv: order.payment.cvv,
        cardNumber: order.payment.cardNumber,
        cardHolderName: order.payment.cardHolderName,
        expirationDate: order.payment.expirationDate,
      },
      createdAt: new Date(),
      status: OrderStatus.Created,
      userId: order.user.id,
      shipment: {
        firstname: order.shipment.firstname,
        lastname: order.shipment.lastname,
        address: order.shipment.address,
        postalCode: order.shipment.postalCode,
        city: order.shipment.city,
        country: order.shipment.country,
        phone: order.shipment.phone,
      },
    };

    const orderId = await this.ordersRepository.createOrder(orderDocument);

    await this.sqsProducerService.sendObject<OrderReceived>(
      this.config.INVENTORY_ORDER_RECEIVED_QUEUE_URL,
      {
        orderId,
        userId: orderDocument.userId,
        payment: orderDocument.payment,
        totalAmount: orderDocument.totalAmount,
        createdAt: orderDocument.createdAt,
        items: orderDocument.items,
        shipment: orderDocument.shipment,
      }
    );

    await this.sqsProducerService.sendObject<SendMail>(
      this.config.MAILER_SEND_EMAIL_QUEUE_URL,
      {
        to: order.user.email,
        eventType: EventType.OrderCreated,
        metadata: {
          orderId,
          createdAt: orderDocument.createdAt.toISOString(),
          totalAmount: orderDocument.totalAmount,
          items: orderDocument.items,
        },
      }
    );

    return orderId;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> {
    this.logger.log(`Update status of ${orderId} to ${newStatus}`);

    await this.ordersRepository.updateOrder(orderId, { status: newStatus });
  }
}

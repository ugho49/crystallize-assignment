import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  type OrderReceived,
  SqsProducerService,
  UpdateOrderStatus,
} from '@crystallize/sqs';
import { ConfigType } from '@nestjs/config';
import { OrderStatus } from '@crystallize/common-types';
import inventoryConfig from './inventory.config';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly sqsProducerService: SqsProducerService,
    @Inject(inventoryConfig.KEY)
    private readonly config: ConfigType<typeof inventoryConfig>
  ) {}

  /*
   * Check if the products in the order are in stock
   * @param order The order received from the order service
   * @returns A promise that resolves to true if the inventory check is successful
   */
  public async inventoryCheck(order: OrderReceived): Promise<boolean> {
    // TODO: Check if products are in stock
    // - In case of out-of-stock return false

    // Here we consider the inventory service has enough stock for now
    return true;
  }

  /*
   * Update the stock levels in the database
   * @param body The order received from the order service
   */
  public async updateStockLevels(body: OrderReceived): Promise<void> {
    this.logger.log(
      `Updating stock levels for order ${body.orderId} with ${body.items.length} product(s)`
    );

    // TODO: Update stock levels in the database
  }

  public async forwardOrderToPaymentService(
    body: OrderReceived
  ): Promise<void> {
    this.logger.log(`Forwarding order ${body.orderId} to the payment service`);

    await this.sqsProducerService.sendObject<OrderReceived>(
      this.config.PAYMENT_ORDER_RECEIVED_QUEUE_URL,
      body
    );
  }

  public async signalOutOfStock(orderId: string): Promise<void> {
    this.logger.log(`Out-of-stock for order ${orderId}`);

    const message: UpdateOrderStatus = {
      orderId,
      newStatus: OrderStatus.OutOfStock,
    };

    await this.sqsProducerService.sendObjectFifo<UpdateOrderStatus>(
      this.config.ORDER_UPDATE_STATUS_QUEUE_URL,
      message,
      orderId
    );
  }
}

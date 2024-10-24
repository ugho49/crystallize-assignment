import { Inject, Injectable, Logger } from '@nestjs/common';
import { SqsProducerService, UpdateOrderStatus } from '@crystallize/sqs';
import { ConfigType } from '@nestjs/config';
import { OrderStatus } from '@crystallize/common-types';
import shipmentConfig from './shipment.config';

@Injectable()
export class ShipmentService {
  private readonly logger = new Logger(ShipmentService.name);

  constructor(
    private readonly sqsProducerService: SqsProducerService,
    @Inject(shipmentConfig.KEY)
    private readonly config: ConfigType<typeof shipmentConfig>
  ) {}

  public async signalOrderShipped(orderId: string) {
    this.logger.log(`Signal shipped for order ${orderId}`);

    const message: UpdateOrderStatus = {
      orderId,
      newStatus: OrderStatus.Shipped,
    };

    await this.sqsProducerService.sendObjectFifo<UpdateOrderStatus>(
      this.config.ORDER_UPDATE_STATUS_QUEUE_URL,
      message,
      orderId
    );
  }
}

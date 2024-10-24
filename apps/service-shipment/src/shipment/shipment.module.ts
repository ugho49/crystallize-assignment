import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SqsModule as SqsConsumerModule } from '@ssut/nestjs-sqs';

import { ShipmentService } from './shipment.service';
import shipmentConfig from './shipment.config';
import { ORDER_RECEIVED_QUEUE_NAME, ShipmentHandler } from './shipment.handler';

@Module({
  imports: [
    ConfigModule.forFeature(shipmentConfig),
    SqsConsumerModule.registerAsync({
      imports: [ConfigModule.forFeature(shipmentConfig)],
      inject: [shipmentConfig.KEY],
      useFactory: (config: ConfigType<typeof shipmentConfig>) => ({
        consumers: [
          {
            name: ORDER_RECEIVED_QUEUE_NAME,
            batchSize: 10,
            pollingWaitTimeMs: 1000,
            queueUrl: config.SHIPMENT_ORDER_RECEIVED_QUEUE_URL,
          },
        ],
      }),
    }),
  ],
  providers: [ShipmentService, ShipmentHandler],
})
export class ShipmentModule {}

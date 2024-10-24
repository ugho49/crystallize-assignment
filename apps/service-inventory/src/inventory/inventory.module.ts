import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SqsModule as SqsConsumerModule } from '@ssut/nestjs-sqs';

import { InventoryService } from './inventory.service';
import inventoryConfig from './inventory.config';
import {
  InventoryHandler,
  ORDER_RECEIVED_QUEUE_NAME,
} from './inventory.handler';

@Module({
  imports: [
    ConfigModule.forFeature(inventoryConfig),
    SqsConsumerModule.registerAsync({
      imports: [ConfigModule.forFeature(inventoryConfig)],
      inject: [inventoryConfig.KEY],
      useFactory: (config: ConfigType<typeof inventoryConfig>) => ({
        consumers: [
          {
            name: ORDER_RECEIVED_QUEUE_NAME,
            batchSize: 10,
            pollingWaitTimeMs: 1000,
            queueUrl: config.INVENTORY_ORDER_RECEIVED_QUEUE_URL,
          },
        ],
      }),
    }),
  ],
  providers: [InventoryService, InventoryHandler],
})
export class InventoryModule {}

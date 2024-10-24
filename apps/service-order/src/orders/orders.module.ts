import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SqsModule as SqsConsumerModule } from '@ssut/nestjs-sqs';

import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import {
  ORDER_UPDATE_STATUS_QUEUE_NAME,
  OrdersHandler,
} from './orders.handler';
import ordersConfig from './orders.config';

@Module({
  imports: [
    ConfigModule.forFeature(ordersConfig),
    SqsConsumerModule.registerAsync({
      imports: [ConfigModule.forFeature(ordersConfig)],
      inject: [ordersConfig.KEY],
      useFactory: (config: ConfigType<typeof ordersConfig>) => ({
        consumers: [
          {
            name: ORDER_UPDATE_STATUS_QUEUE_NAME,
            batchSize: 10,
            pollingWaitTimeMs: 1000,
            queueUrl: config.ORDER_UPDATE_STATUS_QUEUE_URL,
          },
        ],
      }),
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrdersHandler],
})
export class OrdersModule {}

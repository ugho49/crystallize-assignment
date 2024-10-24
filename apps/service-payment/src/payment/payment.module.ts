import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SqsModule as SqsConsumerModule } from '@ssut/nestjs-sqs';

import { PaymentService } from './payment.service';
import paymentConfig from './payment.config';
import { ORDER_RECEIVED_QUEUE_NAME, PaymentHandler } from './payment.handler';

@Module({
  imports: [
    ConfigModule.forFeature(paymentConfig),
    SqsConsumerModule.registerAsync({
      imports: [ConfigModule.forFeature(paymentConfig)],
      inject: [paymentConfig.KEY],
      useFactory: (config: ConfigType<typeof paymentConfig>) => ({
        consumers: [
          {
            name: ORDER_RECEIVED_QUEUE_NAME,
            batchSize: 10,
            pollingWaitTimeMs: 1000,
            queueUrl: config.PAYMENT_ORDER_RECEIVED_QUEUE_URL,
          },
        ],
      }),
    }),
  ],
  providers: [PaymentService, PaymentHandler],
})
export class PaymentModule {}

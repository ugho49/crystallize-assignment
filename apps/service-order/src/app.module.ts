import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { MongoClientModule } from '@crystallize/mongo-client';
import { SqsProducerModule } from '@crystallize/sqs';

import { HealthModule } from './health/health.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SqsProducerModule,
    MongoClientModule,
    HealthModule,
    OrdersModule,
  ],
})
export class AppModule {}

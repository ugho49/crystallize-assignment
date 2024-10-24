import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { MongoClientModule } from '@crystallize/mongo-client';
import { SqsProducerModule } from '@crystallize/sqs';

import { HealthModule } from './health/health.module';
import { ShipmentModule } from './shipment/shipment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongoClientModule,
    HealthModule,
    SqsProducerModule,
    ShipmentModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { MongoClientModule } from '@crystallize/mongo-client';
import { SqsProducerModule } from '@crystallize/sqs';

import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SqsProducerModule,
    MongoClientModule,
    HealthModule,
    InventoryModule,
  ],
})
export class AppModule {}

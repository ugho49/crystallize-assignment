import { Global, Module } from '@nestjs/common';

import { MongoClientService } from './mongo-client.service';
import { ConfigModule } from '@nestjs/config';
import mongoClientConfig from './mongo-client.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(mongoClientConfig)],
  providers: [MongoClientService],
  exports: [MongoClientService],
})
export class MongoClientModule {}

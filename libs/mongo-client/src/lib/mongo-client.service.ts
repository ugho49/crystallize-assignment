import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  CollectionOptions,
  Db,
  MongoClient as NativeMongoClient,
  Document,
} from 'mongodb';

import mongoClientConfig from './mongo-client.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class MongoClientService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger: Logger = new Logger(MongoClientService.name);

  private client?: NativeMongoClient;
  private db?: Db;

  constructor(
    @Inject(mongoClientConfig.KEY)
    private readonly config: ConfigType<typeof mongoClientConfig>
  ) {}

  async onModuleInit() {
    this.logger.log('Connecting to MongoDB...');
    this.client = await NativeMongoClient.connect(this.config.MONGO_URL, {
      appName: this.config.APP_NAME,
    });
    this.logger.log('Connected to MongoDB');
    this.db = this.client.db(this.config.DB_NAME);
  }

  async onApplicationShutdown() {
    this.logger.log('Closing MongoDB connection...');
    await this.client?.close();
    this.logger.log('MongoDB connection closed');
  }

  collection<TSchema extends Document = Document>(
    name: string,
    options?: CollectionOptions
  ) {
    if (!this.db) {
      throw new Error('MongoDB connection not initialized');
    }

    return this.db.collection<TSchema>(name, options);
  }

  getDatabase(): Db | undefined {
    return this.db;
  }
}

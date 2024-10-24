import { afterAll, beforeAll, beforeEach } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { bootstrap } from '../../bootstrap';
import { MongoClientService } from '@crystallize/mongo-client';

export type RequestApp = InstanceType<(typeof request)['agent']>;

export function useTestApp() {
  let app: INestApplication;
  let mongoClientService: MongoClientService;

  beforeAll(async () => {
    app = await bootstrap();
    await app.init();
    mongoClientService = app.get<MongoClientService>(MongoClientService);
  });

  beforeEach(async () => {
    await mongoClientService.getDatabase()?.dropDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  return {
    getRequest: (): RequestApp => request.agent(app.getHttpServer()),
    getMongoClient: (): MongoClientService => mongoClientService,
  };
}

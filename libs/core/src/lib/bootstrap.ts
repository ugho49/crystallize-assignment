import {
  DynamicModule,
  INestApplication,
  Logger,
  ModuleMetadata,
  Type,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger, ZodValidationPipe } from 'nestjs-zod';

const globalPrefix = 'api';
const openApiPrefix = 'openapi';

function bootstrapSwagger(nestApp: INestApplication, title: string) {
  // Must be called before setup swagger
  patchNestJsSwagger();

  // Swagger API
  const config = new DocumentBuilder()
    .setTitle(title)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(nestApp, config);

  // The spec is available on url /openapi-json
  SwaggerModule.setup(openApiPrefix, nestApp, document);
}

type NestJsModule = DynamicModule | Type<ModuleMetadata>;

export async function bootstrapApp(module: NestJsModule, title: string) {
  const app = await NestFactory.create(module);
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(new ZodValidationPipe());
  bootstrapSwagger(app, title);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger is available on: http://localhost:${port}/${openApiPrefix}`
  );
  return app;
}

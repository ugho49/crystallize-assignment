import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { HealthModule } from './health/health.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    MailerModule,
  ],
})
export class AppModule {}

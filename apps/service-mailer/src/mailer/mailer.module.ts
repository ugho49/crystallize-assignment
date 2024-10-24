import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { SqsModule as SqsConsumerModule } from '@ssut/nestjs-sqs';

import { MailerService } from './mailer.service';
import { MailerHandler, SEND_MAIL_QUEUE_NAME } from './mailer.handler';
import mailerConfig from './mailer.config';

@Module({
  imports: [
    ConfigModule.forFeature(mailerConfig),
    SqsConsumerModule.registerAsync({
      imports: [ConfigModule.forFeature(mailerConfig)],
      inject: [mailerConfig.KEY],
      useFactory: (config: ConfigType<typeof mailerConfig>) => ({
        consumers: [
          {
            name: SEND_MAIL_QUEUE_NAME,
            batchSize: 10,
            pollingWaitTimeMs: 1000,
            queueUrl: config.MAILER_SEND_EMAIL_QUEUE_URL,
          },
        ],
      }),
    }),
  ],
  providers: [MailerService, MailerHandler],
})
export class MailerModule {}

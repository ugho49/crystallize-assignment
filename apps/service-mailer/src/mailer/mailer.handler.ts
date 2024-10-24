import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@aws-sdk/client-sqs';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { EventType, SendMail } from '@crystallize/sqs';

import { MailerService } from './mailer.service';

export const SEND_MAIL_QUEUE_NAME = 'send-mail';

@Injectable()
export class MailerHandler {
  private readonly logger = new Logger(MailerHandler.name);

  constructor(private readonly mailerService: MailerService) {}

  @SqsMessageHandler(SEND_MAIL_QUEUE_NAME)
  public async sendMail(message: Message) {
    const body = JSON.parse(message.Body) as SendMail;

    this.logger.log(`Send a new mail of type ${body.eventType}`);

    switch (body.eventType) {
      case EventType.OrderCreated:
        await this.mailerService.sendMail({
          to: body.to,
          subject: 'Order created',
          text: `Your order has been created`,
        });
        break;
      case EventType.OrderOutOfStock:
        await this.mailerService.sendMail({
          to: body.to,
          subject: 'Order out of stock',
          text: 'Your order is out of stock',
        });
        break;
      case EventType.OrderShipped:
        await this.mailerService.sendMail({
          to: body.to,
          subject: 'Order shipped',
          text: 'Your order has been shipped',
        });
        break;
      default:
        throw new Error(`Unknown event type: ${body.eventType}`);
    }
  }
}

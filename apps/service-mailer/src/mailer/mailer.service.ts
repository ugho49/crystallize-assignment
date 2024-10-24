import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import type * as SMTPTransport from 'nodemailer/lib/smtp-transport';

import mailerConfig from './mailer.config';

@Injectable()
export class MailerService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    @Inject(mailerConfig.KEY)
    private readonly config: ConfigType<typeof mailerConfig>
  ) {
    this.transporter = createTransport({
      host: config.MAIL_HOST,
      port: config.MAIL_PORT,
      secure: false,
      auth: {
        user: config.MAIL_USERNAME,
        pass: config.MAIL_PASSWORD,
      },
    });
  }

  async sendMail(param: {
    to: string | string[];
    subject: string;
    text: string;
  }) {
    await this.transporter.sendMail({
      from: this.config.SENDER_EMAIL,
      to: param.to,
      subject: param.subject,
      text: param.text,
    });
  }
}

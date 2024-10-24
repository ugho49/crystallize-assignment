import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  MAILER_SEND_EMAIL_QUEUE_URL: z.string(),
  SENDER_EMAIL: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number(),
  MAIL_USERNAME: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
});

export default registerAs('mailer', () => schema.parse(process.env));

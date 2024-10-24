import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  ORDER_UPDATE_STATUS_QUEUE_URL: z.string(),
  INVENTORY_ORDER_RECEIVED_QUEUE_URL: z.string(),
  MAILER_SEND_EMAIL_QUEUE_URL: z.string(),
});

export default registerAs('orders', () => schema.parse(process.env));

import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  PAYMENT_ORDER_RECEIVED_QUEUE_URL: z.string(),
  SHIPMENT_ORDER_RECEIVED_QUEUE_URL: z.string(),
  ORDER_UPDATE_STATUS_QUEUE_URL: z.string(),
});

export default registerAs('payment', () => schema.parse(process.env));

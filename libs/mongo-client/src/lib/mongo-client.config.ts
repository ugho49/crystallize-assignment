import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z.object({
  MONGO_URL: z.string(),
  DB_NAME: z.string(),
  APP_NAME: z.string(),
});

export default registerAs('mongo-client', () => schema.parse(process.env));

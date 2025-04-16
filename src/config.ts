// src/config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
    },
  };
});

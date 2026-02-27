import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const DEFAULT_FRONT_ORIGINS = ['http://localhost:5173'];

const FRONT_ORIGINS = process.env.FRONT_ORIGINS
  ? process.env.FRONT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : DEFAULT_FRONT_ORIGINS;

/**
 * Capa simple para exponer variables de entorno a otras partes del proyecto.
 */
export const environment = {
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,
  DB_NAME: process.env.DB_NAME,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,

  JWT_SECRET: process.env.JWT_SECRET,
  FRONT_ORIGINS,
};

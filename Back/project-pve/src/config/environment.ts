import * as dotenv from 'dotenv';

// Cargar archivo .env según NODE_ENV (por defecto 'development')
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${nodeEnv}` });

// Función para validar variables obligatorias (detecta undefined, null y string vacío)
function requiredEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === null || value.trim() === '') {
    throw new Error(`❌ Variable de entorno requerida: ${name}`);
  }
  return value;
}

// Procesar FRONT_ORIGINS (puede venir como lista separada por comas)
const DEFAULT_FRONT_ORIGINS = ['http://localhost:5173'];
const FRONT_ORIGINS = process.env.FRONT_ORIGINS
  ? process.env.FRONT_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : DEFAULT_FRONT_ORIGINS;

export const environment = {
  HOST: process.env.HOST || 'localhost',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DB_NAME: requiredEnvVar('DB_NAME'),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
  DB_USERNAME: requiredEnvVar('DB_USERNAME'),
  DB_PASSWORD: requiredEnvVar('DB_PASSWORD'),
  JWT_SECRET: requiredEnvVar('JWT_SECRET'),
  FRONT_ORIGINS,
};

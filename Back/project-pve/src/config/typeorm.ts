import { registerAs } from '@nestjs/config';
import { environment } from './environment';

const config = {
  type: 'postgres',
  database: environment.DB_NAME,
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  dropSchema: false,
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
};

export const typeOrmConfig = registerAs('typeorm', () => config);

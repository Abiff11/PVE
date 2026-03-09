import { registerAs } from '@nestjs/config';
import { environment } from './environment';

// Configuración centralizada para TypeORM
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  type: 'postgres',
  database: environment.DB_NAME,
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: !isProduction, // solo en desarrollo
  logging: !isProduction,
  dropSchema: false, // ¡nunca en true!
  migrations: ['dist/migrations/*.js'],
  migrationsRun: isProduction, // ejecutar migraciones automáticamente en producción
};

// Exportamos con registerAs para que ConfigModule pueda cargarlo
export const typeOrmConfig = registerAs('typeorm', () => config);

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { environment } from './config/environment';
import { BitacoraEntry } from './bitacora/entities/bitacora-entry.entity';
import { Encierro } from './encierro/entities/encierro.entity';
import { CatalogoInfraccion } from './infracciones/entities/CatalogoInfraccion.entity';
import { InfraccionDetalle } from './infracciones/entities/InfraccionDetalle.entity';
import { Infractor } from './infracciones/entities/Infractor.entity';
import { Infraccion } from './infracciones/entities/Infraccion.entity';
import { UbicacionInfraccion } from './infracciones/entities/UbicacionInfraccion.entity';
import { Vehiculo } from './infracciones/entities/Vehiculo.entity';
import { User } from './users/entities/user.entity';

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource({
  type: 'postgres',
  host: environment.DB_HOST,
  port: Number(environment.DB_PORT),
  username: environment.DB_USERNAME,
  password: environment.DB_PASSWORD,
  database: environment.DB_NAME,
  entities: [
    User,
    Infraccion,
    Infractor,
    Vehiculo,
    UbicacionInfraccion,
    CatalogoInfraccion,
    InfraccionDetalle,
    Encierro,
    BitacoraEntry,
  ],
  migrations: isProduction
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'],
  synchronize: false,
  logging: !isProduction,
});

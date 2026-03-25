import { Module } from '@nestjs/common';
import { InfraccionesController } from './infracciones.controller';
import { InfraccionesService } from './infracciones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoInfraccion } from './entities/CatalogoInfraccion.entity';
import { Infraccion } from './entities/Infraccion.entity';
import { InfraccionDetalle } from './entities/InfraccionDetalle.entity';
import { Infractor } from './entities/Infractor.entity';
import { UbicacionInfraccion } from './entities/UbicacionInfraccion.entity';
import { Vehiculo } from './entities/Vehiculo.entity';
import { Encierro } from '../encierro/entities/encierro.entity';
import { RolesGuard } from '../auth/roles/roles.guard';
import { UsersModule } from '../users/users.module';
import { BitacoraModule } from '../bitacora/bitacora.module';

/**
 * Modulo encargado de exponer el dominio de infracciones:
 * registra el repositorio, el servicio de negocio y el controller protegido.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Infraccion,
      Infractor,
      Vehiculo,
      UbicacionInfraccion,
      CatalogoInfraccion,
      InfraccionDetalle,
      Encierro,
    ]),
    UsersModule,
    BitacoraModule,
  ],
  controllers: [InfraccionesController],
  providers: [InfraccionesService, RolesGuard],
})
export class InfraccionesModule {}

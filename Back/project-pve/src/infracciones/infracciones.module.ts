import { Module } from '@nestjs/common';
import { InfraccionesController } from './infracciones.controller';
import { InfraccionesService } from './infracciones.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Infraccion } from './entities/Infraccion.entity';
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
    TypeOrmModule.forFeature([Infraccion, Encierro]),
    UsersModule,
    BitacoraModule,
  ],
  controllers: [InfraccionesController],
  providers: [InfraccionesService, RolesGuard],
})
export class InfraccionesModule {}

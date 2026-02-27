// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Infraccion } from '../infracciones/entities/Infraccion.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesGuard } from '../auth/roles/roles.guard';
import { BitacoraModule } from '../bitacora/bitacora.module';

/**
 * Modulo de usuarios. Expone controller, service y repositorio via TypeORM.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, Infraccion]), BitacoraModule],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard],
  exports: [UsersService], // requerido por AuthModule para validar credenciales
})
export class UsersModule {}

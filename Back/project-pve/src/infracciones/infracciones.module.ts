import { Module } from '@nestjs/common';
import { InfraccionesController } from './infracciones.controller';
import { InfraccionesService } from './infracciones.service';

@Module({
  controllers: [InfraccionesController],
  providers: [InfraccionesService],
})
export class InfraccionesModule {}

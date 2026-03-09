import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitacoraModule } from '../bitacora/bitacora.module';
import { Infraccion } from '../infracciones/entities/Infraccion.entity';
import { EncierroController } from './encierro.controller';
import { EncierroService } from './encierro.service';
import { Encierro } from './entities/encierro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Encierro, Infraccion]), BitacoraModule],
  controllers: [EncierroController],
  providers: [EncierroService],
  exports: [EncierroService],
})
export class EncierroModule {}

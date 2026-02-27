import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitacoraEntry } from './entities/bitacora-entry.entity';
import { BitacoraService } from './bitacora.service';
import { BitacoraController } from './bitacora.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BitacoraEntry])],
  controllers: [BitacoraController],
  providers: [BitacoraService],
  exports: [BitacoraService],
})
export class BitacoraModule {}

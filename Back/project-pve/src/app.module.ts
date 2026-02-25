import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraccionesModule } from './infracciones/infracciones.module';

@Module({
  imports: [InfraccionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

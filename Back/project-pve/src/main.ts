import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      //* intercepta el body antes de que llegue al controller.
      whitelist: true, //*→ elimina propiedades que no estén definidas en el DTO.
      forbidNonWhitelisted: true, //*→ en vez de solo eliminarlas, lanza error si alguien manda campos extra
      transform: true, //*permite conversión automática de tipos.
    }),
  );

  await app.listen(process.env.PORT ?? 3000);

  const PORT = environment.PORT;
  const HOST = environment.HOST;

  console.log(`Server listening on http://${HOST}:${PORT}/`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import { ValidationPipe } from '@nestjs/common';

/**
 * Entrypoint de Nest. Registra validaciones globales y levanta el API.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist elimina propiedades no declaradas en el DTO
      whitelist: true,
      // forbid rechaza payloads con campos fuera del DTO
      forbidNonWhitelisted: true,
      // transform convierte strings a los tipos esperados
      transform: true,
    }),
  );

  app.enableCors({
    origin: environment.FRONT_ORIGINS,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);

  const PORT = environment.PORT;
  const HOST = environment.HOST;

  console.log(`Server listening on http://${HOST}:${PORT}/`);
}
bootstrap();

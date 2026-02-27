import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { environment } from './config/environment';
import { ValidationPipe } from '@nestjs/common';
// import * as helmet from 'helmet'; // cuando instales helmet

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.use(helmet()); // opcional, mejora seguridad

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: environment.FRONT_ORIGINS,
    credentials: true,
  });

  await app.listen(environment.PORT); // usamos environment.PORT

  console.log(`🚀 Servidor corriendo en http://${environment.HOST}:${environment.PORT}/`);
}
bootstrap();

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraccionesModule } from './infracciones/infracciones.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

/**
 * Modulo raiz: registra config global, conexion a DB y los modulos de dominio.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = config.get<TypeOrmModuleOptions>('typeorm');

        if (!dbConfig) {
          throw new Error('TypeORM configuration not found');
        }

        return dbConfig;
      },
    }),
    InfraccionesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

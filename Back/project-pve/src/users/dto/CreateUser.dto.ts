// users/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsEnum, MinLength, IsEmpty } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * DTO que valida la carga util recibida al crear nuevos usuarios desde la API.
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsString()
  @IsNotEmpty()
  delegacion: string;

  @IsEnum(UserRole)
  role: UserRole;
}

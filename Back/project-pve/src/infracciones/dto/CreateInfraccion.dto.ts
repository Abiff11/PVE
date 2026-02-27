import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInfraccionDto {
  @IsString()
  @IsNotEmpty()
  folio: string;

  @IsDateString()
  fecha: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  hora: string;

  @IsString()
  @IsNotEmpty()
  nombreInfractor: string;

  @IsString()
  @IsNotEmpty()
  nombreOficial: string;

  @IsString()
  @IsNotEmpty()
  delegacion: string;

  @IsString()
  @IsNotEmpty()
  detalleInfraccion: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  monto: number;

  // ========= NUEVOS CAMPOS =========
  @IsString()
  @IsNotEmpty()
  vehiculo: string;

  @IsString()
  @IsNotEmpty()
  placas: string;

  @IsString()
  @IsNotEmpty()
  servicio: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  vehiculoDetenido: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  motocicletaDetenida: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  consignacionVehiculo: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  consignacionMotocicleta: number;

  @IsBoolean()
  @Type(() => Boolean)
  soloInfraccion: boolean;
}

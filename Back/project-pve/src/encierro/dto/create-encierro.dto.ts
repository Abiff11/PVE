import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ENCIERRO_OPTIONS, SERVICIO_GRUA_OPTIONS } from '../../catalogos';

export class CreateEncierroDto {
  @IsString()
  @IsNotEmpty()
  folioInfraccion: string;

  @IsDateString()
  fechaIngreso: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(ENCIERRO_OPTIONS)
  encierro: string;

  @IsString()
  @IsNotEmpty()
  nombreQuienRecibe: string;

  @IsOptional()
  @IsString()
  @IsIn(SERVICIO_GRUA_OPTIONS)
  servicioGrua?: string;

  @IsOptional()
  @IsDateString()
  fechaLiberacion?: string;

  @IsOptional()
  @IsDateString()
  fechaSalida?: string;

  @IsOptional()
  @IsString()
  nombreQuienEntrega?: string;
}

//*Creamos el dto de infracion esto vamos a recibir del front

import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

/**
 * Define los campos obligatorios para registrar nuevas infracciones desde el front.
 */
export class CreateInfraccionDto {

  
  @IsString()
  @IsNotEmpty()
  folio: string;

  @IsDateString()
  fecha: string;

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

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  hora: string;

  @IsNumber()
  @IsPositive()
  monto: number;
  
}

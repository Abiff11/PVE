//*Creamos el dto de infracion esto vamos a recibir del front

import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class CreateInfraccionDto {
  @IsString()
  @IsNotEmpty()
  folio: string;

  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  nombreOficial: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  hora: string;

  @IsNumber()
  @IsPositive()
  monto: number;
}

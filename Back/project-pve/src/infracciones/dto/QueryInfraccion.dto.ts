import { IsInt, IsOptional, IsPositive, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Parametros de consulta permitidos en GET /infracciones.
 */
export class QueryInfraccionDto {
  @IsOptional()
  @IsString()
  delegacion?: string;

  @IsOptional()
  @IsString()
  nombreOficial?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaInicio?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fechaFin?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  pageSize?: number;
}

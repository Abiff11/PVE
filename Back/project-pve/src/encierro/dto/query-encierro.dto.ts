import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

/**
 * Parametros de consulta permitidos en GET /encierros.
 */
export class QueryEncierroDto {
  @IsOptional()
  @IsString()
  folio?: string;

  @IsOptional()
  @IsString()
  encierro?: string;

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


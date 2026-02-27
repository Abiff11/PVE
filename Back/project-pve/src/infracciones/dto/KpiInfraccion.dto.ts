import { IsDateString, IsOptional, IsString } from 'class-validator';

/**
 * Filtros opcionales para calcular KPIs de infracciones.
 */
export class KpiInfraccionDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  delegacion?: string;
}

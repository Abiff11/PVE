import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateInfraccionDto } from './CreateInfraccion.dto';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { EstatusInfraccion } from '../entities/Infraccion.entity';

export class UpdateInfraccionDto extends PartialType(
  OmitType(CreateInfraccionDto, ['folioInfraccion'] as const),
) {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto?: number;

  @IsOptional()
  @IsEnum(EstatusInfraccion)
  estatus?: EstatusInfraccion;
}

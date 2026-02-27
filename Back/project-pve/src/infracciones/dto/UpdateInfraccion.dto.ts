import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateInfraccionDto } from './CreateInfraccion.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstatusInfraccion } from '../entities/Infraccion.entity';

export class UpdateInfraccionDto extends PartialType(
  OmitType(CreateInfraccionDto, ['folio'] as const),
) {
  @IsOptional()
  @IsEnum(EstatusInfraccion)
  estatus?: EstatusInfraccion;
}

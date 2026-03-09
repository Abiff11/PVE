import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEncierroDto } from './create-encierro.dto';

export class UpdateEncierroDto extends PartialType(
  OmitType(CreateEncierroDto, ['folioInfraccion'] as const),
) {}


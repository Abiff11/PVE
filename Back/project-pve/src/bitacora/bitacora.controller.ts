import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BitacoraService } from './bitacora.service';
import { QueryBitacoraDto } from './dto/query-bitacora.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { UserRole } from '../users/entities/user.entity';

/**
 * Permite a los administradores consultar la bitácora paginada.
 */
@Controller('bitacora')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BitacoraController {
  constructor(private readonly bitacoraService: BitacoraService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@Query() query: QueryBitacoraDto) {
    return this.bitacoraService.findAll(query);
  }
}

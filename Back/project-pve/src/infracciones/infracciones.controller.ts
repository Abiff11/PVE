import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { InfraccionesService } from './infracciones.service';
import { CreateInfraccionDto } from './dto/CreateInfraccion.dto';
import { UpdateInfraccionDto } from './dto/UpdateInfraccion.dto';
import { Infraccion } from './entities/Infraccion.entity';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorators';
import { RolesGuard } from '../auth/roles/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { QueryInfraccionDto } from './dto/QueryInfraccion.dto';
import { KpiInfraccionDto } from './dto/KpiInfraccion.dto';
import type { Request } from 'express';

/**
 * Expone el CRUD de infracciones y aplica los guards de autenticacion/roles.
 * Cada handler delega la logica al servicio y documenta claramente quien puede usarlo.
 */
@Controller('infracciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InfraccionesController {
  constructor(private readonly infraccionesService: InfraccionesService) {}

  /**
   * Crea una infraccion y la asocia al usuario autenticado (solo admin/capturista).
   */
  @Post()
  @Roles(UserRole.ADMIN, UserRole.CAPTURISTA)
  async create(
    @Body() createInfraccionDto: CreateInfraccionDto,
    @Req() req: Request,
  ): Promise<Infraccion> {
    const user = req.user as { id: number } | undefined;

    if (!user?.id) {
      throw new BadRequestException('Usuario no autenticado');
    }

    return await this.infraccionesService.create(createInfraccionDto, user.id);
  }

  /**
   * Devuelve una pagina filtrada de infracciones visible para todos los roles con lectura.
   */
  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.CAPTURISTA,
    UserRole.ACTUALIZADOR,
    UserRole.DIRECTOR,
  )
  async findAll(
    @Query() query: QueryInfraccionDto,
  ): Promise<{ data: Infraccion[]; total: number; page: number; pageSize: number }> {
    return await this.infraccionesService.findAll(query);
  }

  /**
   * KPIs disponibles para director/admin. Muestra totales, montos y top delegaciones.
   */
  @Get('kpis/resumen')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async getKpis(@Query() query: KpiInfraccionDto) {
    return await this.infraccionesService.getKpis(query);
  }

  /**
   * Busca una infraccion puntual por folio para mostrar detalles.
   */
  @Get(':folio')
  @Roles(
    UserRole.ADMIN,
    UserRole.CAPTURISTA,
    UserRole.ACTUALIZADOR,
    UserRole.DIRECTOR,
  )
  async findByFolio(
    @Param('folio') folio: string,
  ): Promise<Infraccion> {
    return await this.infraccionesService.findByFolio(folio);
  }

  /**
   * Permite actualizar monto, estatus o campos editables para admin/actualizador.
   */
  @Patch(':folio')
  @Roles(UserRole.ADMIN, UserRole.ACTUALIZADOR)
  async update(
    @Param('folio') folio: string,
    @Body() updateInfraccionDto: UpdateInfraccionDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { sub?: number; username?: string };
    const infraccion = await this.infraccionesService.update(
      folio,
      updateInfraccionDto,
      { id: actor?.sub, username: actor?.username },
    );

    return {
      message: 'Infracción actualizada',
      data: infraccion,
    };
  }

  /**
   * Permite a admin/director eliminar un registro especifico (accion auditada).
   */
  @Delete(':folio')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async deleteInfra(@Param('folio') folio: string, @Req() req: Request) {
    const actor = req.user as { sub?: number; username?: string };
    const infraccion = await this.infraccionesService.deleteInfra(folio, {
      id: actor?.sub,
      username: actor?.username,
    });

    return {
      message: 'Infracción eliminada con éxito',
      data: infraccion,
    };
  }
}

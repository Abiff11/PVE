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
  UnauthorizedException, // necesario para lanzar 401 cuando el usuario no está autenticado
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

// Interfaz para tipar req.user (opcional, pero recomendado)
interface RequestUser {
  id: number;
  username: string;
  role: UserRole;
}

@Controller('infracciones')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class InfraccionesController {
  constructor(private readonly infraccionesService: InfraccionesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CAPTURISTA)
  async create(
    @Body() createInfraccionDto: CreateInfraccionDto,
    @Req() req: Request,
  ): Promise<Infraccion> {
    const user = req.user as RequestUser;
    if (!user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return await this.infraccionesService.create(createInfraccionDto, user.id);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.CAPTURISTA,
    UserRole.ACTUALIZADOR,
    UserRole.DIRECTOR,
    UserRole.ENCIERRO,
  )
  async findAll(@Query() query: QueryInfraccionDto) {
    return await this.infraccionesService.findAll(query);
  }

  @Get('kpis/resumen')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async getKpis(@Query() query: KpiInfraccionDto) {
    return await this.infraccionesService.getKpis(query);
  }

  @Get(':folio')
  @Roles(
    UserRole.ADMIN,
    UserRole.CAPTURISTA,
    UserRole.ACTUALIZADOR,
    UserRole.DIRECTOR,
    UserRole.ENCIERRO,
  )
  async findByFolio(@Param('folio') folio: string): Promise<Infraccion> {
    return await this.infraccionesService.findByFolio(folio);
  }

  @Patch(':folio')
  @Roles(UserRole.ADMIN, UserRole.ACTUALIZADOR, UserRole.ENCIERRO)
  async update(
    @Param('folio') folio: string,
    @Body() updateInfraccionDto: UpdateInfraccionDto,
    @Req() req: Request,
  ) {
    // Casteamos req.user al tipo esperado del payload JWT
    const user = req.user as RequestUser;

    // Guarda de seguridad: aunque el guard JWT debería garantizar la autenticación,
    // verificamos explícitamente para evitar errores 500 si el payload es inesperado
    if (!user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const infraccion = await this.infraccionesService.update(
      folio,
      updateInfraccionDto,
      // Pasamos id y username del token para registrar quién realizó la actualización
      { id: user.id, username: user.username },
    );
    return {
      message: 'Infracción actualizada',
      data: infraccion,
    };
  }

  @Delete(':folio')
  @Roles(UserRole.ADMIN, UserRole.DIRECTOR)
  async deleteInfra(@Param('folio') folio: string, @Req() req: Request) {
    // Casteamos req.user al tipo esperado del payload JWT
    const user = req.user as RequestUser;

    // Guarda de seguridad: verificamos que el usuario esté presente en el token
    // para evitar errores 500 si el guard falla de forma inesperada
    if (!user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const infraccion = await this.infraccionesService.deleteInfra(folio, {
      // Pasamos id y username del token para registrar quién realizó la eliminación
      id: user.id,
      username: user.username,
    });
    return {
      message: 'Infracción eliminada con éxito',
      data: infraccion,
    };
  }
}

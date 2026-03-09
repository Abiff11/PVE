import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorators';
import { RolesGuard } from '../auth/roles/roles.guard';
import { UserRole } from '../users/entities/user.entity';
import { CreateEncierroDto } from './dto/create-encierro.dto';
import { QueryEncierroDto } from './dto/query-encierro.dto';
import { UpdateEncierroDto } from './dto/update-encierro.dto';
import { EncierroService } from './encierro.service';
import { Encierro } from './entities/encierro.entity';

// Interface for typing req.user that comes from the JWT payload
interface RequestUser {
  id: number;
  username: string;
  role: UserRole;
}

@Controller('encierros')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EncierroController {
  constructor(private readonly encierroService: EncierroService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ENCIERRO)
  async create(
    @Body() dto: CreateEncierroDto,
    @Req() req: Request,
  ): Promise<Encierro> {
    const user = req.user as RequestUser;
    if (!user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    return this.encierroService.create(dto, {
      id: user.id,
      username: user.username,
    });
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.CAPTURISTA,
    UserRole.ACTUALIZADOR,
    UserRole.DIRECTOR,
    UserRole.ENCIERRO,
  )
  async findAll(@Query() query: QueryEncierroDto) {
    return this.encierroService.findAll(query);
  }

  @Get('lookup/:folio')
  @Roles(
    UserRole.ADMIN,
    UserRole.CAPTURISTA,
    UserRole.ACTUALIZADOR,
    UserRole.DIRECTOR,
    UserRole.ENCIERRO,
  )
  async lookupByFolio(@Param('folio') folio: string) {
    return this.encierroService.lookupByFolio(folio);
  }

  @Get(':folio')
  @Roles(
    UserRole.ADMIN,
    UserRole.CAPTURISTA,
    UserRole.ACTUALIZADOR,
    UserRole.DIRECTOR,
    UserRole.ENCIERRO,
  )
  async findByFolio(@Param('folio') folio: string): Promise<Encierro> {
    return this.encierroService.findByFolio(folio);
  }

  @Patch(':folio')
  @Roles(UserRole.ADMIN, UserRole.ENCIERRO)
  async update(
    @Param('folio') folio: string,
    @Body() dto: UpdateEncierroDto,
    @Req() req: Request,
  ) {
    const user = req.user as RequestUser;
    if (!user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const encierro = await this.encierroService.update(folio, dto, {
      id: user.id,
      username: user.username,
    });
    return { message: 'Encierro actualizado', data: encierro };
  }

  @Delete(':folio')
  @Roles(UserRole.ADMIN)
  async remove(@Param('folio') folio: string, @Req() req: Request) {
    const user = req.user as RequestUser;
    if (!user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const encierro = await this.encierroService.remove(folio, {
      id: user.id,
      username: user.username,
    });
    return { message: 'Encierro eliminado', data: encierro };
  }
}

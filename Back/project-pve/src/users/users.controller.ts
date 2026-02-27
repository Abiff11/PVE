// users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/CreateUser.dto';
import { AuthGuard } from '@nestjs/passport'; // Importa el AuthGuard de Passport
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { UserRole } from './entities/user.entity';
import { UpdateUserRoleDto } from './dto/UpdateUserRole.dto';
import type { Request } from 'express';

/**
 * API de administracion de usuarios. Solo accesible para roles con guardia JWT + RolesGuard.
 */
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea nuevos usuarios; requiere token de un administrador.
   */
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const actor = req.user as { sub?: number; username?: string };
    return this.usersService.create(createUserDto, {
      id: actor?.sub,
      username: actor?.username,
    });
  }

  /**
   * Devuelve todos los usuarios existentes para administrarlos desde el dashboard.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * Permite reasignar el rol de un usuario.
   */
  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Req() req: Request,
  ) {
    const actor = req.user as { sub?: number; username?: string };
    return this.usersService.updateRole(id, updateUserRoleDto, {
      id: actor?.sub,
      username: actor?.username,
    });
  }

  /**
   * Elimina a un usuario específico.
   */
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const actor = req.user as { sub?: number; username?: string };
    return this.usersService.remove(id, {
      id: actor?.sub,
      username: actor?.username,
    });
  }
}

// users/users.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/CreateUser.dto';
import { AuthGuard } from '@nestjs/passport'; // Importa el AuthGuard de Passport
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { UserRole } from './entities/user.entity';

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
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Si se agregan mas endpoints, quedaran protegidos por AuthGuard automaticamente.
}

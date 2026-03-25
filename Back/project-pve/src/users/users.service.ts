
// users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Infraccion } from '../infracciones/entities/Infraccion.entity';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserRoleDto } from './dto/UpdateUserRole.dto';
import { BitacoraService } from '../bitacora/bitacora.service';
import * as bcrypt from 'bcrypt';

/**
 * Servicio que centraliza la creacion y consulta de usuarios.
 * Maneja hashing de contrasenas y consultas usadas por autenticacion.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Infraccion)
    private infraccionRepository: Repository<Infraccion>,
    private readonly bitacoraService: BitacoraService,
  ) {}

  /**
   * Crea un usuario nuevo validando duplicados y retornando la entidad sin password.
   */
  async create(
    createUserDto: CreateUserDto,
    actor?: { id?: number; username?: string },
  ): Promise<Omit<User, 'password'>> {
    // Verificar si el username ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Crear nueva instancia de usuario con la contraseña hasheada
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(newUser);
    const { password, ...userWithoutPassword } = savedUser;

    await this.bitacoraService.log('USER_CREATED', {
      description: `Se creó el usuario ${savedUser.username} con rol ${savedUser.role}`,
      userId: actor?.id,
      metadata: { targetUserId: savedUser.id },
    });

    return userWithoutPassword;
  }

  /**
   * Lista todos los usuarios existentes ocultando su contraseña.
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find();
    return users.map(({ password, ...rest }) => rest);
  }

  /**
   * Consulta interna para autenticacion, incluye el campo password para validar credenciales.
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  /**
   * Obtiene un usuario por id, se usa para enlazar infracciones con su creador.
   */
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Cambia el rol de un usuario validando su existencia.
   */
  async updateRole(
    id: number,
    updateDto: UpdateUserRoleDto,
    actor?: { id?: number; username?: string },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.role = updateDto.role;
    const saved = await this.usersRepository.save(user);
    const { password, ...rest } = saved;

    await this.bitacoraService.log('USER_ROLE_UPDATED', {
      description: `Se cambió el rol del usuario ${saved.username} a ${saved.role}`,
      userId: actor?.id,
      metadata: { targetUserId: saved.id },
    });

    return rest;
  }

  /**
   * Elimina al usuario indicado devolviendo su información básica.
   */
  async remove(
    id: number,
    actingAdmin?: { id?: number; username?: string },
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['infracciones'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role === UserRole.ADMIN) {
      const otherAdmins = await this.usersRepository.count({
        where: { role: UserRole.ADMIN, id: Not(id) },
      });
      if (otherAdmins === 0) {
        throw new BadRequestException(
          'Debe existir al menos otro administrador antes de eliminar este usuario',
        );
      }
    }

    if (user.infracciones?.length) {
      let targetAdmin: User | null = null;

      if (actingAdmin?.id && actingAdmin.id !== id) {
        targetAdmin = await this.usersRepository.findOne({
          where: { id: actingAdmin.id },
        });
      }

      if (!targetAdmin || targetAdmin.role !== UserRole.ADMIN) {
        targetAdmin = await this.usersRepository.findOne({
          where: { role: UserRole.ADMIN, id: Not(id) },
        });
      }

      if (!targetAdmin) {
        throw new BadRequestException(
          'No se encontró un administrador válido para reasignar las infracciones',
        );
      }

      await this.infraccionRepository
        .createQueryBuilder()
        .update()
        .set({ createdBy: { id: targetAdmin.id } } as any)
        .where('created_by_id = :userId', { userId: id })
        .execute();
    }

    await this.usersRepository.delete(id);
    const { password, ...rest } = user;

    await this.bitacoraService.log('USER_DELETED', {
      description: `Se eliminó el usuario ${user.username}`,
      userId: actingAdmin?.id,
      metadata: { targetUserId: user.id },
    });

    return rest;
  }
}


// users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/CreateUser.dto';
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
  ) {}

  /**
   * Crea un usuario nuevo validando duplicados y retornando la entidad sin password.
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
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
    return userWithoutPassword;
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
}

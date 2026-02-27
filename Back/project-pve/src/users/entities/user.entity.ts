import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Infraccion } from '../../infracciones/entities/Infraccion.entity';

/**
 * Tipos de rol admitidos en el sistema. Se almacenan como texto en BD.
 */
export enum UserRole {
  ADMIN = 'admin',
  DIRECTOR = 'director',
  CAPTURISTA = 'capturista',
  ACTUALIZADOR = 'actualizador',
  ENCIERRO = 'encierro',
}

/**
 * Representa al usuario del sistema y funge como owner de las infracciones creadas.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column()
  telefono: string;

  @Column()
  delegacion: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @OneToMany(() => Infraccion, (infraccion) => infraccion.createdBy)
  infracciones: Infraccion[];
}

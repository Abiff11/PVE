import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Estados posibles para el ciclo de vida de una infraccion.
 */
export enum EstatusInfraccion {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
}

/**
 * Entity TypeORM que modela la tabla principal de infracciones.
 */
@Entity('infracciones')
export class Infraccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  folio: string;

  @Column()
  nombreInfractor: string;

  @Column()
  nombreOficial: string;

  @Column()
  delegacion: string;

  @Column({ type: 'text' })
  detalleInfraccion: string;

  @Column({ type: 'timestamp' })
  fechaHora: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({
    type: 'enum',
    enum: EstatusInfraccion,
    default: EstatusInfraccion.PENDIENTE,
  })
  estatus: EstatusInfraccion;

  @ManyToOne(() => User, (user) => user.infracciones, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}

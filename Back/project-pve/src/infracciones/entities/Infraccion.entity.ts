import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
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
// folio ya tiene { unique: true }, lo que en PostgreSQL crea un índice B-tree implícito.
// Agregar @Index(['folio']) generaría un índice duplicado, desperdiciando espacio y ralentizando escrituras.
@Index(['delegacion']) // índice para filtros frecuentes por delegación
@Index(['nombreOficial']) // índice para búsquedas por nombre de oficial
@Index(['fechaHora']) // índice para ordenamiento y filtros por rango de fechas
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

  // 🔧 Nuevo campo: vehículo involucrado
  @Column()
  vehiculo: string;

  // 🔧 Nuevo campo: placas del vehículo
  @Column()
  placas: string;

  @Column({ type: 'text' })
  detalleInfraccion: string;

  // 🔧 Servicio operativo o tipo de servicio
  @Column()
  servicio: string;

  @Column({ type: 'timestamp' })
  fechaHora: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  // 🔧 Cantidades numéricas (no booleanos)
  @Column({ type: 'int', default: 0 })
  vehiculoDetenido: number;

  @Column({ type: 'int', default: 0 })
  motocicletaDetenida: number;

  @Column({ type: 'int', default: 0 })
  consignacionVehiculo: number;

  @Column({ type: 'int', default: 0 })
  consignacionMotocicleta: number;

  /**
   * 🔧 Solo infracción:
   * Este campo es derivable. Si decides persistirlo, puede generar inconsistencias.
   * Idealmente debería calcularse dinámicamente.
   */
  @Column({ type: 'boolean', default: true })
  soloInfraccion: boolean;

  @Column({
    type: 'enum',
    enum: EstatusInfraccion,
    default: EstatusInfraccion.PENDIENTE,
  })
  estatus: EstatusInfraccion;

  // Usuario que registró la infracción (FK obligatoria)
  @ManyToOne(() => User, (user) => user.infracciones, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}

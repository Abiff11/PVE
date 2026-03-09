import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Encierro } from '../../encierro/entities/encierro.entity';

/**
 * Estados posibles para el ciclo de vida de una infraccion.
 */
export enum EstatusInfraccion {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
}

/**
 * Situación del vehículo al momento de levantar la infracción.
 */
export enum SituacionVehiculoInfraccion {
  VEHICULO_DETENIDO = 'VEHICULO_DETENIDO',
  SOLO_INFRACCION = 'SOLO_INFRACCION',
}

/**
 * Entity TypeORM que modela la tabla principal de infracciones.
 */
@Entity('infracciones')
@Index(['agencia'])
@Index(['municipio'])
@Index(['claveOficial'])
@Index(['fechaHora'])
export class Infraccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'folio_infraccion', unique: true })
  folioInfraccion: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  hora: string;

  @Column({ type: 'timestamp' })
  fechaHora: Date;

  @Column()
  nombreInfractor: string;

  @Column()
  genero: string;

  @Column()
  numeroLicencia: string;

  @Column()
  servicio: string;

  @Column()
  clase: string;

  @Column()
  tipo: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column()
  color: string;

  @Column()
  placas: string;

  @Column()
  estadoPlacas: string;

  @Column()
  serie: string;

  @Column()
  motor: string;

  @Column()
  municipio: string;

  @Column()
  agencia: string;

  @Column()
  colonia: string;

  @Column()
  calle: string;

  @Column({ nullable: true })
  m1?: string;

  @Column({ nullable: true })
  m2?: string;

  @Column({ nullable: true })
  m3?: string;

  @Column({ nullable: true })
  m4?: string;

  @Column({
    type: 'enum',
    enum: SituacionVehiculoInfraccion,
  })
  situacionVehiculo: SituacionVehiculoInfraccion;

  @Column()
  claveOficial: string;

  @Column({ nullable: true })
  numeroParteInformativo?: string;

  @Column()
  nombreOperativo: string;

  @Column({ nullable: true })
  sitioServicioPublico?: string;

  @Column({ nullable: true })
  encierro?: string;

  @Column({ name: 'servicio_grua', nullable: true })
  servicioGrua?: string;

  @OneToOne(() => Encierro, (encierro) => encierro.infraccion, {
    nullable: true,
  })
  encierroRegistro?: Encierro;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value?: number) => value ?? 0,
      from: (value: string | null) => Number(value ?? 0),
    },
  })
  monto: number;

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

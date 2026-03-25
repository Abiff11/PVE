import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BitacoraEntry } from '../../bitacora/entities/bitacora-entry.entity';
import { Encierro } from '../../encierro/entities/encierro.entity';
import { User } from '../../users/entities/user.entity';
import { Infractor } from './Infractor.entity';
import { InfraccionDetalle } from './InfraccionDetalle.entity';
import { UbicacionInfraccion } from './UbicacionInfraccion.entity';
import { Vehiculo } from './Vehiculo.entity';

export enum EstatusInfraccion {
  PENDIENTE = 'PENDIENTE',
  PAGADA = 'PAGADA',
}

export enum SituacionVehiculoInfraccion {
  VEHICULO_DETENIDO = 'VEHICULO_DETENIDO',
  SOLO_INFRACCION = 'SOLO_INFRACCION',
}

@Entity('infracciones')
@Index(['folioInfraccion'], { unique: true })
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

  @Column({
    type: 'enum',
    enum: SituacionVehiculoInfraccion,
  })
  situacionVehiculo: SituacionVehiculoInfraccion;

  @Column({ nullable: true })
  claveOficial?: string;

  @Column({ nullable: true })
  numeroParteInformativo?: string;

  @Column({ nullable: true })
  nombreOperativo?: string;

  @Column({ nullable: true })
  sitioServicioPublico?: string;

  @Column({ nullable: true })
  encierro?: string;

  @Column({ name: 'servicio_grua', nullable: true })
  servicioGrua?: string;

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

  @ManyToOne(() => Infractor, (infractor) => infractor.infracciones, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'infractor_id' })
  infractor: Infractor;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.infracciones, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;

  @ManyToOne(() => UbicacionInfraccion, (ubicacion) => ubicacion.infracciones, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'ubicacion_id' })
  ubicacion: UbicacionInfraccion;

  @OneToMany(() => InfraccionDetalle, (detalle) => detalle.infraccion, {
    eager: true,
    cascade: true,
  })
  detalles: InfraccionDetalle[];

  @OneToOne(() => Encierro, (encierro) => encierro.infraccion, {
    nullable: true,
  })
  encierroRegistro?: Encierro;

  @ManyToOne(() => User, (user) => user.infracciones, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => BitacoraEntry, (bitacora) => bitacora.infraccion)
  bitacoras: BitacoraEntry[];
}

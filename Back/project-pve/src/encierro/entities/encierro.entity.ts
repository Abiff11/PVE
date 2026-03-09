import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Infraccion } from '../../infracciones/entities/Infraccion.entity';

@Entity('encierros')
@Index(['folioInfraccion'], { unique: true })
export class Encierro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'folio_infraccion' })
  folioInfraccion: string;

  @Column({ name: 'fecha_ingreso', type: 'date' })
  fechaIngreso: string;

  @Column()
  encierro: string;

  @Column({ name: 'nombre_quien_recibe' })
  nombreQuienRecibe: string;

  @Column({ name: 'servicio_grua', nullable: true })
  servicioGrua?: string;

  @Column({ name: 'fecha_liberacion', type: 'date', nullable: true })
  fechaLiberacion?: string;

  @Column({ name: 'fecha_salida', type: 'date', nullable: true })
  fechaSalida?: string;

  @Column({ name: 'nombre_quien_entrega', nullable: true })
  nombreQuienEntrega?: string;

  @OneToOne(() => Infraccion, (infraccion) => infraccion.encierroRegistro, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'folio_infraccion',
    referencedColumnName: 'folioInfraccion',
  })
  infraccion: Infraccion;
}

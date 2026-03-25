import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CatalogoInfraccion } from './CatalogoInfraccion.entity';
import { Infraccion } from './Infraccion.entity';

@Entity('infraccion_detalle')
export class InfraccionDetalle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Infraccion, (infraccion) => infraccion.detalles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'infraccion_id' })
  infraccion: Infraccion;

  @ManyToOne(
    () => CatalogoInfraccion,
    (catalogoInfraccion) => catalogoInfraccion.detalles,
    {
      eager: true,
      nullable: false,
    },
  )
  @JoinColumn({ name: 'catalogo_infraccion_id' })
  catalogoInfraccion: CatalogoInfraccion;

  @Column({ name: 'numero_parte_informativo', nullable: true })
  numeroParteInformativo?: string;

  @Column({ name: 'nombre_operativo' })
  nombreOperativo: string;

  @Column({ name: 'sitio_servicio_publico', nullable: true })
  sitioServicioPublico?: string;
}

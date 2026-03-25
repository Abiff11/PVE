import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InfraccionDetalle } from './InfraccionDetalle.entity';

@Entity('catalogo_infraccion')
@Index(['claveOficial'], { unique: true })
export class CatalogoInfraccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clave_oficial' })
  claveOficial: string;

  @OneToMany(() => InfraccionDetalle, (detalle) => detalle.catalogoInfraccion)
  detalles: InfraccionDetalle[];
}

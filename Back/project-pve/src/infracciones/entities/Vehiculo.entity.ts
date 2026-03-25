import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Infraccion } from './Infraccion.entity';

@Entity('vehiculos')
@Index(['placas'])
@Index(['serie'])
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'estado_placas' })
  estadoPlacas: string;

  @Column()
  serie: string;

  @Column()
  motor: string;

  @OneToMany(() => Infraccion, (infraccion) => infraccion.vehiculo)
  infracciones: Infraccion[];
}

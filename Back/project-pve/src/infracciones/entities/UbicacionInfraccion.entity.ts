import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Infraccion } from './Infraccion.entity';

@Entity('ubicacion_inf')
@Index(['municipio'])
@Index(['agencia'])
export class UbicacionInfraccion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToMany(() => Infraccion, (infraccion) => infraccion.ubicacion)
  infracciones: Infraccion[];
}

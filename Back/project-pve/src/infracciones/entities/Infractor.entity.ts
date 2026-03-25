import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Infraccion } from './Infraccion.entity';

@Entity('infractores')
@Index(['numeroLicencia'])
export class Infractor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  genero: string;

  @Column({ name: 'numero_licencia' })
  numeroLicencia: string;

  @OneToMany(() => Infraccion, (infraccion) => infraccion.infractor)
  infracciones: Infraccion[];
}

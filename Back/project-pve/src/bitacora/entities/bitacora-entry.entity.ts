import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Registro de bitácora. Guarda quién hizo qué acción y un resumen textual/JSON.
 */
@Entity('bitacora')
export class BitacoraEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  userId?: number;

  @Column({ nullable: true })
  username?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}

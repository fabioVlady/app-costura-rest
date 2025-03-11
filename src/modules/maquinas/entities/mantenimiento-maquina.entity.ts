import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseApiEntity } from 'src/common/entities/base-api.entity';
import { Maquina } from './maquina.entity';

@Entity({ schema: 'app', name: 'mantenimiento_maquina' })
export class MantenimientoMaquina extends BaseApiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @ManyToOne(() => Maquina, (maquina) => maquina.id, { onDelete: 'CASCADE' })
  // maquina: Maquina;
  // @ManyToOne(() => Maquina, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'maquina_id' }) // ✅ Indicar manualmente el nombre de la columna
  // maquinaId: string;

  @Column({ type: 'uuid', name: 'maquina_id' })
  maquinaId: string;

  @Column({ type: 'timestamp', name: 'fec_realizado' })
  fecRealizado: Date;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'numeric', precision: 15, scale: 2, nullable: true })
  precio?: number;

  @Column({ type: 'text', nullable: true })
  comentarios?: string;
}

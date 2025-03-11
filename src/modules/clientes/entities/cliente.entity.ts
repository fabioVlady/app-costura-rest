import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseApiEntity } from 'src/common/entities/base-api.entity';

@Entity({ schema: 'app', name: 'cliente' })
export class Cliente extends BaseApiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'fec_nac' })
  fecNac?: Date;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  telefono?: string;
}
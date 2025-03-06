import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseApiEntity } from 'src/common/entities/base-api.entity';
import { MantenimientoMaquina } from './mantenimiento-maquina.entity';

@Entity({ schema: 'app', name: 'maquina' })
export class Maquina extends BaseApiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'tipo_maquina' })
  tipoMaquina: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'int', default: 0 })
  mantenimiento: number;

}
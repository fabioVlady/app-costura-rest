import { BaseEntity as TypeOrmBaseEntity, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseApiEntity extends TypeOrmBaseEntity {
  @Column({ name: 'api_estado', type: 'varchar', length: 30, nullable: false })
  apiEstado: string;

  @Column({ name: 'api_transaccion', type: 'varchar', length: 30, nullable: false })
  apiTransaccion: string;

  @Column({ name: 'usu_cre', type: 'varchar', length: 50, nullable: false })
  usuCre: string;

  @CreateDateColumn({ name: 'fec_cre' })
  fecCre: Date;

  @Column({ name: 'usu_mod', type: 'varchar', length: 50, nullable: true })
  usuMod?: string;

  @UpdateDateColumn({ name: 'fec_mod', nullable: true })
  fecMod?: Date;

  constructor(apiEstado: string, apiTransaccion: string, usuCre: string) {
    super();
    this.apiEstado = apiEstado;
    this.apiTransaccion = apiTransaccion;
    this.usuCre = usuCre;
  }
}

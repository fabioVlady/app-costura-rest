import { Usuario } from 'src/modules/users/entities/usuario.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

@Entity({ schema: 'seguridad', name: 'sesion' })
export class Sesion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' }) // ✅ Eliminamos la referencia inversa
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 500 })
  token: string; // Guardamos el Refresh Token

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip?: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'timestamp', name: 'fec_expira' })
  fecExpira: Date;

  @CreateDateColumn({ name: 'fec_cre' })
  fecCre: Date;

  @Column({ name: 'usu_cre', type: 'varchar', length: 50 })
  usuCre: string;

  constructor(usuario: Usuario, token: string, fecExpira: Date, usuCre: string, ip?: string, userAgent?: string) {
    this.usuario = usuario;
    this.token = token;
    this.fecExpira = fecExpira;
    this.ip = ip;
    this.userAgent = userAgent;
    this.activo = true;
    this.usuCre = usuCre;
  }
}

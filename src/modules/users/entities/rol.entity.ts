import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UsuarioRol } from './usuario-rol.entity';
import { BaseApiEntity } from 'src/common/entities/base-api.entity';

@Entity({ schema: 'seguridad', name: 'rol' })
export class Rol extends BaseApiEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.rol)
  usuarios: UsuarioRol[];

  constructor(nombre: string, descripcion: string, usuCre: string) {
    super('CREADO', 'CREAR', usuCre);
    this.nombre = nombre;
    this.descripcion = descripcion;
  }
}
